// Глобальні стейджі для "All Tasks" (відповідає реальним даним)
export const GLOBAL_STAGE_MAPPING = {
  "Created": ["new", "to_do", "requested", "backlog", "draft"],
  "Active": ["in_progress", "in_review", "scheduled", "working", "ongoing", "doing", "assigned"],
  "Paused": ["paused", "waiting", "on_hold", "blocked", "needs_input", "needs_work"],
  "Completed": ["done", "approved", "paid", "completed", "closed", "validated"],
  "Rejected": ["rejected", "declined", "canceled", "terminated"]
};

// Категорійні статуси з маппінгом до глобальних (відповідає реальним даним)
export const CATEGORY_STATUS_MAPPING = {
  "Budget": {
    "To Do": ["to_do", "new", "requested", "backlog", "draft"],
    "In Progress": ["in_progress", "working", "ongoing", "doing", "assigned"],
    "In Review": ["in_review", "scheduled"],
    "Approved": ["approved", "done", "completed", "validated"],
    "Terminated": ["rejected", "canceled", "terminated", "declined"]
  },
  "Philanthropy": {
    "To Do": ["to_do", "new", "requested", "backlog", "draft"],
    "Seeking Partners": ["in_progress", "working", "assigned"],
    "In Progress": ["in_progress", "working", "ongoing", "doing"],
    "On Hold": ["on_hold", "blocked", "needs_input", "paused", "waiting"],
    "Completed": ["approved", "done", "completed", "validated"]
  },
  "Legal": {
    "To Do": ["to_do", "new", "requested", "backlog", "draft"],
    "Review": ["in_progress", "in_review", "working"],
    "Pending": ["in_progress", "working", "assigned"],
    "Finalized": ["approved", "done", "completed", "validated"]
  },
  "HR": {
    "Open": ["to_do", "new", "requested", "backlog", "draft"],
    "Screening": ["in_progress", "working", "assigned"],
    "Interviewing": ["in_review", "ongoing", "doing"],
    "Hired": ["approved", "done", "completed"]
  },
  "IT": {
    "Requested": ["to_do", "new", "requested", "backlog", "draft"],
    "In Development": ["in_progress", "working", "assigned"],
    "Testing": ["in_review", "needs_input", "needs_work"],
    "Deployed": ["approved", "done", "completed"]
  },
  "General": {
    "To Do": ["to_do", "new", "requested", "backlog", "draft"],
    "In Progress": ["in_progress", "working", "ongoing", "doing"],
    "Done": ["done", "approved", "completed"],
    "Canceled": ["rejected", "canceled", "terminated"]
  }
};

// Функції для двостороннього маппінгу
export const mapStatusToGlobalStage = (status: string): string => {
  console.log(`mapStatusToGlobalStage called for status: ${status}`);
  
  for (const [stage, statuses] of Object.entries(GLOBAL_STAGE_MAPPING)) {
    console.log(`Checking stage ${stage} with statuses: ${(statuses as string[]).join(', ')}`);
    if ((statuses as string[]).includes(status)) {
      console.log(`Found status ${status} in stage ${stage}`);
      return stage;
    }
  }
  
  console.log(`Status ${status} not found in GLOBAL_STAGE_MAPPING, using fallback Created`);
  return "Created"; // fallback
};

export const mapGlobalStageToStatuses = (stage: string): string[] => {
  return (GLOBAL_STAGE_MAPPING as Record<string, string[]>)[stage] || [];
};

export const mapCategoryStatusToGlobalStatuses = (category: string, categoryStatus: string): string[] => {
  const categoryMapping = (CATEGORY_STATUS_MAPPING as Record<string, Record<string, string[]>>)[category];
  if (!categoryMapping) return [];
  
  return categoryMapping[categoryStatus] || [];
};

export const mapGlobalStatusToCategoryStatus = (category: string, globalStatus: string): string | null => {
  const categoryMapping = (CATEGORY_STATUS_MAPPING as Record<string, Record<string, string[]>>)[category];
  if (!categoryMapping) return null;
  
  for (const [categoryStatus, globalStatuses] of Object.entries(categoryMapping)) {
    if ((globalStatuses as string[]).includes(globalStatus)) {
      return categoryStatus;
    }
  }
  return null;
};

// Функція для отримання всіх категорійних статусів
export const getCategoryStatuses = (category: string): string[] => {
  const categoryMapping = (CATEGORY_STATUS_MAPPING as Record<string, Record<string, string[]>>)[category];
  if (!categoryMapping) return [];
  
  return Object.keys(categoryMapping);
}; 