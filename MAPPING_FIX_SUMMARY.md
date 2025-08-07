# 🔧 ПІДСУМОК ВИПРАВЛЕНЬ МАППІНГУ СТАТУСІВ

## ✅ Проблема
На вкладці "All Tasks" в колонці "Created" відображалися всі завдання, а не тільки ті, які мають статуси, що належать до стейджу "Created".

## 🔍 Причина
1. **Невідповідність конфігурації реальним даним**: `GLOBAL_STAGE_MAPPING` в `config/task-mapping.ts` не відповідав реальним статусам в `updated_mock_tasks.json`
2. **Складена логіка фільтрації**: Функція `getColumnTasks` використовувала зайву логіку з `getStatusGroup` замість прямого маппінгу через `mapStatusToGlobalStage`
3. **Відсутність статусу "draft"**: Статус "draft" був в даних, але не був включений в маппінг

## 🛠️ Виправлення

### 1. Оновлення GLOBAL_STAGE_MAPPING
```typescript
// Було:
"Created": ["draft", "planned", "requested", "backlog", "new"]

// Стало:
"Created": ["new", "to_do", "requested", "backlog", "draft"]
```

### 2. Спрощення логіки фільтрації в getColumnTasks
```typescript
// Було:
const taskGroup = getStatusGroup(t.status);
matches = taskGroup === statusGroup;
const globalStage = mapStatusToGlobalStage(t.status);
const expectedStage = mapStatusToGlobalStage(status);
if (globalStage && expectedStage) {
  matches = globalStage === expectedStage;
}

// Стало:
const globalStage = mapStatusToGlobalStage(t.status);
const expectedStage = mapStatusToGlobalStage(status);
matches = globalStage === expectedStage;
```

### 3. Додавання логування для діагностики
- Додано детальне логування в `mapStatusToGlobalStage`
- Додано логування в `getStatusGroup`
- Додано логування в `getColumnTasks`

### 4. Оновлення категорійних статусів
Оновлено `CATEGORY_STATUS_MAPPING` для відповідності реальним даним та включення статусу "draft".

## 🎯 Результат

### Тепер на вкладці "All Tasks":
- **Колонка "Created"**: відображаються тільки завдання зі статусами `new`, `to_do`, `requested`, `backlog`, `draft`
- **Колонка "Active"**: відображаються тільки завдання зі статусами `in_progress`, `in_review`, `scheduled`, `working`, `ongoing`, `doing`, `assigned`
- **Колонка "Paused"**: відображаються тільки завдання зі статусами `paused`, `waiting`, `on_hold`, `blocked`, `needs_input`, `needs_work`
- **Колонка "Completed"**: відображаються тільки завдання зі статусами `done`, `approved`, `paid`, `completed`, `closed`, `validated`
- **Колонка "Rejected"**: відображаються тільки завдання зі статусами `rejected`, `declined`, `canceled`, `terminated`

### Тестові завдання:
1. **BGT-001** (status="to_do") → колонка "Created" ✅
2. **BGT-002** (status="in_progress") → колонка "Active" ✅
3. **BGT-003** (status="approved") → колонка "Completed" ✅
4. **BGT-004** (status="rejected") → колонка "Rejected" ✅
5. **BGT-005** (status="in_review") → колонка "Active" ✅
6. **BGT-006** (status="completed") → колонка "Completed" ✅
7. **BGT-007** (status="paused") → колонка "Paused" ✅

## 🔍 Діагностика

Для перевірки роботи маппінгу:
1. Відкрити вкладку "All Tasks"
2. Відкрити консоль браузера (F12)
3. Перевірити логи:
   - `mapStatusToGlobalStage called for status: [status]`
   - `Found status [status] in stage [stage]`
   - `Task [id] ([title]): status=[status], globalStage=[stage], expectedStage=[stage], matches=[true/false]`

## 📋 Наступні кроки

1. Протестувати роботу на різних категоріях
2. Перевірити синхронізацію між "All Tasks" та категорійними вкладками
3. Оптимізувати логування (видалити зайві логи після тестування) 