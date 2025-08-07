# 🔄 ПЛАН 1: ЛОГІКА МАППІНГУ ЗАВДАНЬ З ДВОСТОРОННЬОЮ СИНХРОНІЗАЦІЄЮ

## 🎯 МЕТА
Реалізувати систему маппінгу завдань з глобальними стейджами для вкладки "All Tasks" та специфічними статусами для категорійних вкладок з повною двосторонньою синхронізацією.

## 📋 ОПИС ЗАДАЧІ

### 🔁 Логіка маппінгу завдань (Task Mapping Logic)

#### 🧩 1. Загальна структура
Усі завдання (tasks) мають бути прив'язані до:
- **Категорії** (напр. Budget, Philanthropy, Legal, IT, General)
- **Статусу** (напр. Planned, In Review, Approved, Terminated, Draft тощо)
- **Глобального стейджу** (тільки для вкладки All Tasks)

#### 🗂️ 2. Маппінг у вкладці All Tasks
На цій вкладці всі завдання з усіх категорій агрегуються і групуються не по статусах напряму, а по глобальних стейджах:

| 🧱 Global Stage | 📥 Mapped Statuses |
|-----------------|-------------------|
| Created | Draft, Planned, Requested, Backlog, New |
| Active | In Review, In Progress, Doing, Assigned |
| Paused | On Hold, Blocked, Needs Input, Needs Work |
| Completed | Approved, Completed, Validated, Done |
| Rejected | Rejected, Canceled, Terminated, Closed |

#### 🔄 Механіка:
При відображенні кожного завдання, його status мапиться до одного зі стейджів, згідно з цією таблицею.

**Приклади:**
- `status = "Planned"` → `stage = "Created"`
- `status = "In Review"` → `stage = "Active"`

#### 🧭 3. Маппінг на вкладках категорій (напр. Budget)
На категорійних вкладках:
- Відображаються тільки завдання з цієї категорії (через фільтр `task.category`)
- Немає глобальних стейджів
- Групування — лише за статусами, специфічними для цієї категорії

**Приклад для Budget:**
```json
[
  "Planned",
  "In Review", 
  "Approved",
  "Terminated"
]
```

**Приклад для Philanthropy:**
```json
[
  "Planned",
  "Seeking Partners",
  "In Progress",
  "On Hold",
  "Completed"
]
```

## ✅ ПОТОЧНИЙ СТАН АНАЛІЗ

### ✅ Що вже реалізовано:
- Базова структура KanbanBoard та CategoryKanbanBoard
- Stage mapping в `updated_mock_tasks.json`
- Категорійні статуси в `CategoryKanbanBoard.tsx`
- Функція `getStatusGroup()` для групування статусів
- Часткова логіка маппінгу (з логів видно, що `rejected` та `canceled` потрапляють в групу `REJECTED`)

### 🔄 Що потрібно покращити:
- Розділення логіки між "All Tasks" (глобальні стейджі) та категоріями (специфічні статуси)
- Уніфікація маппінгу статусів
- Покращення логіки фільтрації та групування
- **Двостороння синхронізація між виглядами**

## 🎯 ДЕТАЛЬНИЙ ПЛАН РЕАЛІЗАЦІЇ

### 1. 📁 СТВОРЕННЯ КОНФІГУРАЦІЙНИХ ФАЙЛІВ

#### 1.1 Файл `config/task-mapping.ts` ✅ СТВОРЕНО
```typescript
// Глобальні стейджі для "All Tasks"
export const GLOBAL_STAGE_MAPPING = {
  "Created": ["draft", "planned", "requested", "backlog", "new"],
  "Active": ["in_review", "in_progress", "doing", "assigned"],
  "Paused": ["on_hold", "blocked", "needs_input", "needs_work"],
  "Completed": ["approved", "completed", "validated", "done"],
  "Rejected": ["rejected", "canceled", "terminated", "closed"]
};

// Категорійні статуси з маппінгом до глобальних
export const CATEGORY_STATUS_MAPPING = {
  "Budget": {
    "Planned": ["draft", "to_do", "new", "backlog"],
    "In Review": ["in_progress", "in_review", "working"],
    "Approved": ["approved", "validated", "done", "completed"],
    "Terminated": ["rejected", "canceled", "terminated", "closed"]
  },
  "Philanthropy": {
    "Planned": ["draft", "to_do", "new", "backlog"],
    "Seeking Partners": ["in_progress", "working", "assigned"],
    "In Progress": ["in_progress", "working", "ongoing", "doing"],
    "On Hold": ["on_hold", "blocked", "needs_input", "paused"],
    "Completed": ["approved", "done", "completed", "validated"]
  },
  // ... інші категорії
};

// Функції для двостороннього маппінгу
export const mapStatusToGlobalStage = (status: string): string => { /* ... */ };
export const mapGlobalStageToStatuses = (stage: string): string[] => { /* ... */ };
export const mapCategoryStatusToGlobalStatuses = (category: string, categoryStatus: string): string[] => { /* ... */ };
export const mapGlobalStatusToCategoryStatus = (category: string, globalStatus: string): string | null => { /* ... */ };
```

### 2. 🔄 ОНОВЛЕННЯ КОМПОНЕНТІВ

#### 2.1 Оновлення `KanbanBoard.tsx` (All Tasks) ✅ ІМПОРТ ДОДАНО
- **Функція**: Відображення з глобальними стейджами
- **Логіка**: Маппінг статусів до стейджів через `GLOBAL_STAGE_MAPPING`
- **Зміни**:
  - ✅ Додано імпорт конфігурації маппінгу
  - [ ] Оновлення `getStatusGroup()` для використання глобальних стейджів
  - [ ] Додавання логіки групування за стейджами
  - [ ] Оновлення drag & drop для роботи зі стейджами

#### 2.2 Оновлення `CategoryKanbanBoard.tsx` (Категорії) ✅ ІМПОРТ ДОДАНО
- **Функція**: Відображення з категорійними статусами
- **Логіка**: Фільтрація за категорією + специфічні статуси
- **Зміни**:
  - ✅ Додано імпорт конфігурації маппінгу
  - [ ] Оновлення `getCategoryStatuses()` для використання `CATEGORY_STATUS_MAPPING`
  - [ ] Додавання логіки маппінгу категорійних статусів до глобальних
  - [ ] Покращення фільтрації завдань

### 3. 🔄 ЛОГІКА СИНХРОНІЗАЦІЇ

#### 3.1 Глобальний маппінг (All Tasks)
```typescript
// Приклад: status = "in_progress" → stage = "Active"
const getGlobalStage = (status: string): string => {
  for (const [stage, statuses] of Object.entries(GLOBAL_STAGE_MAPPING)) {
    if (statuses.includes(status)) {
      return stage;
    }
  }
  return "Created"; // fallback
};
```

#### 3.2 Категорійний маппінг
```typescript
// Приклад: Budget "In Review" → глобальні статуси ["in_progress", "in_review"]
const getCategoryStatusMapping = (category: string, categoryStatus: string) => {
  const mapping = CATEGORY_STATUS_MAPPING[category];
  // Логіка маппінгу категорійного статусу до глобальних
};
```

### 4. 📊 ОНОВЛЕННЯ ДАНИХ

#### 4.1 Оновлення `updated_mock_tasks.json`
- [ ] Додавання поля `stage` до всіх завдань
- [ ] Оновлення `stage_mapping` відповідно до нової логіки
- [ ] Додавання категорійних статусів

#### 4.2 Створення `task-mapping-utils.ts`
```typescript
// Утиліти для маппінгу
export const mapStatusToStage = (status: string): string => { /* ... */ };
export const mapStageToStatuses = (stage: string): string[] => { /* ... */ };
export const getCategoryStatuses = (category: string): string[] => { /* ... */ };
```

### 5. 🎨 ІНТЕРФЕЙС ТА UX

#### 5.1 Оновлення відображення
- [ ] Додавання індикаторів стейджів у "All Tasks"
- [ ] Покращення відображення категорійних статусів
- [ ] Додавання tooltip'ів з поясненнями маппінгу

#### 5.2 Drag & Drop логіка
- [ ] Валідація переходів між стейджами
- [ ] Автоматичний маппінг статусів при переміщенні
- [ ] Відображення дозволених переходів

### 6. 🧪 ТЕСТУВАННЯ

#### 6.1 Unit тести
- [ ] Тестування функцій маппінгу
- [ ] Валідація логіки переходів
- [ ] Перевірка фільтрації завдань

#### 6.2 Integration тести
- [ ] Тестування drag & drop між стейджами
- [ ] Перевірка синхронізації між "All Tasks" та категоріями
- [ ] Валідація відображення завдань

## 🔄 СЦЕНАРІЇ СИНХРОНІЗАЦІЇ

### ✅ **Сценарій 1: Зміна в категорії → Відображення в All Tasks**
```typescript
// Приклад: Budget категорія
// Завдання: "BGT-001" зі статусом "In Review" (категорійний)
// Маппінг: "In Review" → ["in_progress", "in_review"] (глобальні)
// Результат: В All Tasks з'явиться в групі "Active"
```

### ✅ **Сценарій 2: Зміна в All Tasks → Відображення в категорії**
```typescript
// Приклад: All Tasks
// Завдання: "BGT-001" переміщено в "Active" (глобальний стейдж)
// Маппінг: "Active" → ["in_progress", "in_review", "working"] (глобальні статуси)
// Результат: В Budget категорії з'явиться в колонці "In Review"
```

## 📋 ЧЕКЛІСТ РЕАЛІЗАЦІЇ

### ✅ Етап 1: Конфігурація
- [x] Створити `config/task-mapping.ts`
- [x] Додати імпорти в компоненти
- [ ] Оновити логіку `getStatusGroup()` в KanbanBoard
- [ ] Оновити логіку `getCategoryStatuses()` в CategoryKanbanBoard

### ✅ Етап 2: Логіка синхронізації
- [ ] Оновити `onDragEnd` в KanbanBoard для автоматичного маппінгу
- [ ] Оновити `onDragEnd` в CategoryKanbanBoard для синхронізації
- [ ] Додати валідацію переходів між стейджами
- [ ] Реалізувати автоматичне оновлення статусів

### ✅ Етап 3: UI/UX покращення
- [ ] Додати індикатори синхронізації
- [ ] Покращити tooltip'и з поясненнями маппінгу
- [ ] Додати візуальні підказки про зв'язки між статусами

### ✅ Етап 4: Тестування синхронізації
- [ ] Тест: Зміна в категорії → відображення в All Tasks
- [ ] Тест: Зміна в All Tasks → відображення в категорії
- [ ] Тест: Валідація переходів між стейджами
- [ ] Тест: Обробка edge cases

## 🎯 ОЧІКУВАНІ РЕЗУЛЬТАТИ

### ✅ Після реалізації:
1. **All Tasks**: Завдання групуються за глобальними стейджами
2. **Категорії**: Завдання відображаються зі специфічними статусами
3. **Синхронізація**: Зміни в одному вигляді відображаються в іншому
4. **UX**: Зрозуміла логіка переходів та маппінгу
5. **Продуктивність**: Ефективна фільтрація та групування

### 🔄 Переваги нової системи:
- **Чітка логіка**: Розділення між глобальними та категорійними статусами
- **Гнучкість**: Легко додавати нові категорії та статуси
- **Консистентність**: Єдина система маппінгу
- **Масштабованість**: Підготовлено для розширення
- **Двостороння синхронізація**: Повна інтеграція між виглядами

## 🚀 ГАРАНТІЇ СИНХРОНІЗАЦІЇ

### ✅ **Що гарантується:**
1. **Двостороння синхронізація**: Зміни в одному вигляді відображаються в іншому
2. **Консистентність даних**: Один джерело істини для статусів
3. **Автоматичний маппінг**: Система сама визначає відповідні статуси
4. **Валідація переходів**: Перевірка дозволених змін статусів
5. **Візуальна зворотній зв'язок**: Користувач бачить результат змін

### 🔄 **Логіка роботи:**
```typescript
// При зміні статусу в категорії:
const handleCategoryStatusChange = (taskId: string, newCategoryStatus: string) => {
  // 1. Знайти відповідний глобальний статус
  const globalStatuses = mapCategoryStatusToGlobalStatuses(category, newCategoryStatus);
  const newGlobalStatus = globalStatuses[0]; // Перший статус за замовчуванням
  
  // 2. Оновити завдання з новим глобальним статусом
  updateTask(taskId, { status: newGlobalStatus });
  
  // 3. Синхронізувати з All Tasks
  syncWithAllTasks(taskId, newGlobalStatus);
};
```

---

**СТАТУС ПЛАНУ**: ✅ Створено конфігурацію та додано імпорти
**НАСТУПНИЙ КРОК**: Оновлення логіки компонентів для повної синхронізації 