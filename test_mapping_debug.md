# 🔍 ТЕСТ МАППІНГУ СТАТУСІВ

## Перевірка роботи маппінгу для вкладки "All Tasks"

### Очікувані результати:

#### Колонка "Created" повинна містити завдання зі статусами:
- `new`
- `to_do` 
- `requested`
- `backlog`
- `draft`

#### Колонка "Active" повинна містити завдання зі статусами:
- `in_progress`
- `in_review`
- `scheduled`
- `working`
- `ongoing`
- `doing`
- `assigned`

#### Колонка "Paused" повинна містити завдання зі статусами:
- `paused`
- `waiting`
- `on_hold`
- `blocked`
- `needs_input`
- `needs_work`

#### Колонка "Completed" повинна містити завдання зі статусами:
- `done`
- `approved`
- `paid`
- `completed`
- `closed`
- `validated`

#### Колонка "Rejected" повинна містити завдання зі статусами:
- `rejected`
- `declined`
- `canceled`
- `terminated`

### Тестові завдання з updated_mock_tasks.json:

1. **BGT-001**: status="to_do" → повинно бути в колонці "Created"
2. **BGT-002**: status="in_progress" → повинно бути в колонці "Active"
3. **BGT-003**: status="approved" → повинно бути в колонці "Completed"
4. **BGT-004**: status="rejected" → повинно бути в колонці "Rejected"
5. **BGT-005**: status="in_review" → повинно бути в колонці "Active"
6. **BGT-006**: status="completed" → повинно бути в колонці "Completed"
7. **BGT-007**: status="paused" → повинно бути в колонці "Paused"

### Логування для діагностики:

При відкритті вкладки "All Tasks" в консолі повинні з'явитися логи:
- `mapStatusToGlobalStage called for status: [status]`
- `Checking stage [stage] with statuses: [statuses]`
- `Found status [status] in stage [stage]`
- `Task [id] ([title]): status=[status], globalStage=[stage], expectedStage=[stage], matches=[true/false]`

### Якщо завдання не відображаються правильно:

1. Перевірити логи в консолі браузера
2. Переконатися, що статус завдання є в `GLOBAL_STAGE_MAPPING`
3. Перевірити, що функція `mapStatusToGlobalStage` повертає правильний стейдж
4. Перевірити, що функція `getColumnTasks` правильно фільтрує завдання 