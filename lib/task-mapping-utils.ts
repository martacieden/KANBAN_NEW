import { 
  GLOBAL_STAGE_MAPPING, 
  CATEGORY_STATUS_MAPPING,
  mapStatusToGlobalStage,
  mapGlobalStageToStatuses,
  mapCategoryStatusToGlobalStatuses,
  mapGlobalStatusToCategoryStatus
} from '../config/task-mapping';

// Утиліти для маппінгу завдань з двосторонньою синхронізацією

/**
 * Маппінг статусу до глобального стейджу
 */
export const mapStatusToStage = (status: string): string => {
  return mapStatusToGlobalStage(status);
};

/**
 * Маппінг стейджу до списку статусів
 */
export const mapStageToStatuses = (stage: string): string[] => {
  return mapGlobalStageToStatuses(stage);
};

/**
 * Отримання категорійних статусів для категорії
 */
export const getCategoryStatuses = (category: string): string[] => {
  const categoryMapping = CATEGORY_STATUS_MAPPING[category as keyof typeof CATEGORY_STATUS_MAPPING];
  if (categoryMapping) {
    return Object.keys(categoryMapping);
  }
  return [];
};

/**
 * Синхронізація зміни статусу в категорії з глобальним станом
 */
export const syncCategoryStatusChange = (
  taskId: string, 
  category: string, 
  newCategoryStatus: string,
  onTaskUpdate: (taskId: string, updates: any) => void
): void => {
  // Знайти відповідний глобальний статус
  const globalStatuses = mapCategoryStatusToGlobalStatuses(category, newCategoryStatus);
  const newGlobalStatus = globalStatuses[0]; // Перший статус за замовчуванням
  
  if (newGlobalStatus) {
    console.log(`🔄 Syncing category status change: ${newCategoryStatus} -> ${newGlobalStatus}`);
    
    // Оновити завдання з новим глобальним статусом
    onTaskUpdate(taskId, { status: newGlobalStatus });
  } else {
    console.warn(`⚠️ No global status mapping found for category status: ${newCategoryStatus}`);
  }
};

/**
 * Синхронізація зміни статусу в глобальному вигляді з категорією
 */
export const syncGlobalStatusChange = (
  taskId: string,
  category: string,
  newGlobalStatus: string,
  onTaskUpdate: (taskId: string, updates: any) => void
): void => {
  // Знайти відповідний категорійний статус
  const categoryStatus = mapGlobalStatusToCategoryStatus(category, newGlobalStatus);
  
  if (categoryStatus) {
    console.log(`🔄 Syncing global status change: ${newGlobalStatus} -> ${categoryStatus}`);
    
    // Оновити завдання з новим категорійним статусом
    onTaskUpdate(taskId, { status: categoryStatus });
  } else {
    console.warn(`⚠️ No category status mapping found for global status: ${newGlobalStatus}`);
  }
};

/**
 * Валідація переходу між статусами
 */
export const validateStatusTransition = (
  fromStatus: string,
  toStatus: string,
  category?: string
): boolean => {
  // Базова валідація
  if (fromStatus === toStatus) {
    return true;
  }
  
  // Валідація для категорійних статусів
  if (category && category !== "All tasks") {
    const categoryMapping = CATEGORY_STATUS_MAPPING[category as keyof typeof CATEGORY_STATUS_MAPPING];
    if (categoryMapping) {
      // Перевірити чи існує такий статус в категорії
      const validStatuses = Object.values(categoryMapping).flat();
      return validStatuses.includes(toStatus);
    }
  }
  
  // Валідація для глобальних стейджів
  const validGlobalStatuses = Object.values(GLOBAL_STAGE_MAPPING).flat();
  return validGlobalStatuses.includes(toStatus);
};

/**
 * Отримання доступних переходів для статусу
 */
export const getAvailableTransitions = (
  currentStatus: string,
  category?: string
): string[] => {
  if (category && category !== "All tasks") {
    const categoryMapping = CATEGORY_STATUS_MAPPING[category as keyof typeof CATEGORY_STATUS_MAPPING];
    if (categoryMapping) {
      // Знайти групу, до якої належить поточний статус
      for (const [groupTitle, statuses] of Object.entries(categoryMapping)) {
        if (statuses.includes(currentStatus)) {
          // Повернути всі статуси з цієї категорії
          return Object.values(categoryMapping).flat();
        }
      }
    }
  }
  
  // Для глобальних стейджів
  const globalStage = mapStatusToGlobalStage(currentStatus);
  if (globalStage) {
    return mapGlobalStageToStatuses(globalStage);
  }
  
  return [];
};

/**
 * Отримання інформації про маппінг для відображення
 */
export const getMappingInfo = (
  status: string,
  category?: string
): {
  globalStage?: string;
  categoryStatus?: string;
  availableTransitions: string[];
} => {
  const globalStage = mapStatusToGlobalStage(status);
  const categoryStatus = category ? mapGlobalStatusToCategoryStatus(category, status) || undefined : undefined;
  const availableTransitions = getAvailableTransitions(status, category);
  
  return {
    globalStage,
    categoryStatus,
    availableTransitions
  };
}; 