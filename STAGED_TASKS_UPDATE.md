# Оновлення даних завдань - Staged Tasks Integration

## Огляд змін

Цей документ описує інтеграцію нових даних завдань з `staged_tasks_data.json` до проекту Kanban Board.

## Основні зміни

### 1. Новий файл даних
- **Створено**: `staged_tasks_data_enhanced.json`
- **Замість**: `mock_tasks_updated.json` та `staged_tasks_data.json`
- **Особливості**: 
  - Структуровані дані з мапінгом стадій
  - Покращена структура завдань з усіма необхідними полями
  - Сумісність з поточною системою відображення

### 2. Оновлення KanbanBoard.tsx

#### Імпорт нових даних
```typescript
// Import staged tasks data
import stagedTasksData from '../staged_tasks_data_enhanced.json';

const originalTasks = stagedTasksData.tasks;
```

#### Оновлення функції getStatusGroup
```typescript
const getStatusGroup = (statusId: string): string => {
  // Use stage mapping from staged tasks data
  for (const [group, statuses] of Object.entries(stagedTasksData.stage_mapping)) {
    if (statuses.includes(statusId)) {
      return group.toUpperCase();
    }
  }
  return 'CREATED'; // Default fallback
};
```

### 3. Структура нових даних

#### Stage Mapping
```json
{
  "Created": ["draft", "new", "to_do", "requested"],
  "Active": ["in_progress", "in_review", "scheduled", "working"],
  "Paused": ["paused", "waiting", "on_hold", "blocked"],
  "Completed": ["done", "approved", "paid", "completed", "closed"],
  "Rejected": ["rejected", "declined", "canceled", "terminated"]
}
```

#### Структура завдання
```json
{
  "id": "T1",
  "taskId": "BUDG-001",
  "title": "Budget Planning",
  "category": "Budget",
  "status": "in_review",
  "stage": "Active",
  "priority": "High",
  "assignee": { "name": "Marley Bergson", "initials": "MB", "department": "Finance" },
  "teamMembers": [...],
  "subtasks": [...],
  "tags": ["finance", "planning"],
  "dueDate": "2024-12-15",
  "progress": 75,
  "department": "Finance",
  "type": "Task",
  "clientInfo": "Acme Inc.",
  "description": "...",
  "attachmentCount": 8,
  "commentCount": 15,
  "lastStatusChange": "2024-11-01T10:00:00Z"
}
```

### 4. Видалені файли
- `mock_tasks_updated.json` - старі дані завдань
- `staged_tasks_data.json` - оригінальні дані без покращень

## Переваги нової системи

1. **Структурованість**: Чіткий мапінг між статусами та стадіями
2. **Масштабованість**: Легко додавати нові статуси та стадії
3. **Сумісність**: Повна сумісність з поточною UI системою
4. **Читабельність**: Зрозуміла структура даних
5. **Гнучкість**: Можливість легко модифікувати правила переходів

## Тестування

Для тестування нової системи:

1. Запустіть проект: `npm run dev`
2. Перевірте відображення завдань на Kanban дошці
3. Перевірте функціональність drag & drop
4. Перевірте фільтри та пошук
5. Перевірте відображення підзавдань

## Майбутні покращення

- Додавання нових категорій завдань
- Розширення правил переходів між статусами
- Інтеграція з API для збереження змін
- Додавання аналітики та звітності 