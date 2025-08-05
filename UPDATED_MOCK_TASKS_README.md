# Updated Mock Tasks - Documentation

## Огляд

Файл `updated_mock_tasks.json` містить покращені мокові дані завдань для Kanban Board системи. Цей файл замінює попередні версії та надає більш реалістичні та структуровані дані.

## Структура файлу

### Stage Mapping
```json
{
  "stage_mapping": {
    "Created": ["draft", "new", "to_do", "requested", "backlog"],
    "Active": ["in_progress", "in_review", "scheduled", "working", "ongoing", "doing", "assigned"],
    "Paused": ["paused", "waiting", "on_hold", "blocked", "needs_input", "needs_work"],
    "Completed": ["done", "approved", "paid", "completed", "closed", "validated"],
    "Rejected": ["rejected", "declined", "canceled", "terminated"]
  }
}
```

### Структура завдання
```json
{
  "id": "T1",
  "taskId": "BUDG-001",
  "title": "Quarterly Budget Review",
  "category": "Budget",
  "status": "in_review",
  "stage": "Active",
  "priority": "High",
  "assignee": { "name": "Marley Bergson", "initials": "MB", "department": "Finance" },
  "teamMembers": [...],
  "subtasks": [...],
  "tags": ["finance", "budget", "quarterly"],
  "dueDate": "2024-11-30",
  "progress": 75,
  "department": "Finance",
  "type": "Task",
  "clientInfo": "Acme Inc.",
  "description": "...",
  "attachmentCount": 12,
  "commentCount": 18,
  "lastStatusChange": "2024-11-01T10:00:00Z"
}
```

## Особливості

### 1. Розширений Stage Mapping
- **Created**: 5 статусів (draft, new, to_do, requested, backlog)
- **Active**: 7 статусів (in_progress, in_review, scheduled, working, ongoing, doing, assigned)
- **Paused**: 6 статусів (paused, waiting, on_hold, blocked, needs_input, needs_work)
- **Completed**: 6 статусів (done, approved, paid, completed, closed, validated)
- **Rejected**: 4 статуси (rejected, declined, canceled, terminated)

### 2. Різноманітні категорії
- **Budget**: Фінансові завдання
- **Philanthropy**: Благодійні проекти
- **Legal**: Юридичні справи
- **Investment**: Інвестиційні проекти
- **Travel**: Подорожі
- **Food**: Кейтеринг
- **HR**: Кадрові справи
- **Accounting**: Бухгалтерія
- **IT**: ІТ проекти
- **Marketing**: Маркетингові кампанії

### 3. Реалістичні дані
- Різні пріоритети (Emergency, High, Normal, Low)
- Різні рівні прогресу (0-100%)
- Різні кількості вкладень та коментарів
- Реальні дати та описи

## Приклади завдань

### 1. Quarterly Budget Review (T1)
- **Статус**: in_review (Active)
- **Пріоритет**: High
- **Прогрес**: 75%
- **Підзавдання**: 2 (1 завершене, 1 в процесі)

### 2. Annual Charity Gala (T2)
- **Статус**: scheduled (Active)
- **Пріоритет**: Normal
- **Прогрес**: 60%
- **Підзавдання**: 3 (1 завершене, 1 в процесі, 1 в черзі)

### 3. Contract Negotiation (T3)
- **Статус**: waiting (Paused)
- **Пріоритет**: High
- **Прогрес**: 40%
- **Без підзавдань**

### 4. System Security Audit (T9)
- **Статус**: in_progress (Active)
- **Пріоритет**: Emergency
- **Прогрес**: 65%
- **Підзавдання**: 2 (1 завершене, 1 в процесі)

## Використання в коді

### Імпорт
```typescript
import updatedMockTasks from '../updated_mock_tasks.json';
const originalTasks = updatedMockTasks.tasks;
```

### Отримання групи статусу
```typescript
const getStatusGroup = (statusId: string): string => {
  for (const [group, statuses] of Object.entries(updatedMockTasks.stage_mapping)) {
    if ((statuses as string[]).includes(statusId)) {
      return group.toUpperCase();
    }
  }
  return 'CREATED';
};
```

## Переваги

1. **Структурованість**: Чіткий мапінг між статусами та стадіями
2. **Реалістичність**: Дані відповідають реальним бізнес-процесам
3. **Різноманітність**: Різні категорії, пріоритети та статуси
4. **Масштабованість**: Легко додавати нові статуси та категорії
5. **Сумісність**: Повна сумісність з поточною UI системою

## Тестування

Для тестування нових даних:

1. Запустіть проект: `npm run dev`
2. Перевірте відображення всіх 10 завдань
3. Перевірте різні статуси та стадії
4. Перевірте підзавдання та їх статуси
5. Перевірте фільтри та пошук
6. Перевірте drag & drop функціональність

## Майбутні покращення

- Додавання більше категорій завдань
- Розширення правил переходів між статусами
- Додавання більше метаданих (теги, коментарі, історія змін)
- Інтеграція з API для збереження змін 