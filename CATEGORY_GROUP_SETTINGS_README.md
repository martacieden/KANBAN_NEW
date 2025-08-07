# Налаштування Груп Статусів для Категорій

## Огляд

Ця функціональність дозволяє налаштовувати порядок та видимість груп статусів для кожної категорії окремо через модальне вікно налаштувань.

## Основні Можливості

### 1. Індивідуальні Налаштування для Кожної Категорії
- Кожна категорія має власні налаштування груп статусів
- Налаштування зберігаються в localStorage
- При переключенні між категоріями завантажуються відповідні налаштування

### 2. Налаштування Порядку Груп
- Кнопки ↑↓ для зміни порядку груп
- Візуальний превью змін в реальному часі
- Збереження порядку для кожної категорії окремо

### 3. Включення/Вимкнення Груп
- Перемикачі для кожної групи статусів
- Можливість приховувати непотрібні групи
- Валідація (хоча б одна група має бути активна)

### 4. Скидання Налаштувань
- Кнопка скидання до дефолтних значень
- Можливість повернутися до початкового стану

## Структура Файлів

### Нові Файли
- `types/category-settings.ts` - типи для налаштувань категорій
- `contexts/CategorySettingsContext.tsx` - контекст для управління налаштуваннями
- `components/CategoryGroupSettingsModal.tsx` - модальне вікно налаштувань

### Оновлені Файли
- `app/page.tsx` - інтеграція контексту та модального вікна
- `components/CategoryKanbanBoard.tsx` - застосування налаштувань

## Використання

### 1. Відкриття Налаштувань
- Перейдіть на будь-яку категорійну сторінку (не "All tasks")
- Натисніть кнопку налаштувань (⚙️)
- Виберіть вкладку "Group settings"

### 2. Налаштування Груп
- Використовуйте кнопки ↑↓ для зміни порядку
- Перемикайте групи для включення/вимкнення
- Натисніть "Зберегти" для застосування змін

### 3. Скидання Налаштувань
- Натисніть кнопку скидання (🔄) для повернення до дефолтних значень
- Або натисніть "Скасувати" для відміни змін

## Дефолтні Групи для Категорій

### Budget
- To Do (Planning & Preparation)
- In Progress (Active Work)
- In Review (Under Review)
- Approved (Approved & Completed)
- Rejected (Rejected or Canceled)

### Legal
- Draft (Initial Draft)
- Review (Legal Review)
- Pending (Pending Approval)
- Finalized (Document Finalized)
- Rejected (Document Rejected)

### HR
- Open (Position Open)
- Screening (Candidate Screening)
- Interviewing (Interview Process)
- Hired (Successfully Hired)
- Rejected (Candidate Rejected)

### Philanthropy
- Proposal (Grant Proposal)
- Evaluation (Under Evaluation)
- Approved (Grant Approved)
- Funded (Funds Disbursed)
- Rejected (Grant Rejected)

### Investment
- Research (Market Research)
- Analysis (Investment Analysis)
- Decision (Investment Decision)
- Executed (Investment Executed)
- Rejected (Investment Rejected)

### Food
- Planning (Menu Planning)
- Preparation (Food Preparation)
- Serving (Food Service)
- Completed (Service Completed)
- Cancelled (Service Cancelled)

### Travel
- Planning (Trip Planning)
- Booking (Making Bookings)
- Confirmed (Travel Confirmed)
- Cancelled (Travel Cancelled)

### Accounting
- Pending (Pending Processing)
- Processing (Under Processing)
- Review (Under Review)
- Completed (Processing Completed)
- Rejected (Processing Rejected)

## Технічна Реалізація

### Контекст Налаштувань
```typescript
interface CategoryGroupSettings {
  enabledGroups: Record<string, boolean>;
  groupOrder: string[];
}
```

### Збереження Даних
- Налаштування зберігаються в localStorage
- Ключ: "category-group-settings"
- Структура: `{ [categoryName]: CategoryGroupSettings }`

### Застосування Налаштувань
- Фільтрація груп на основі `enabledGroups`
- Сортування на основі `groupOrder`
- Автоматичне застосування при зміні категорії

## Переваги

1. **Гнучкість**: Кожна категорія може мати власний порядок груп
2. **Персоналізація**: Користувачі можуть налаштувати інтерфейс під свої потреби
3. **Збереження**: Налаштування зберігаються між сесіями
4. **Простота**: Інтуїтивний інтерфейс налаштувань
5. **Безпека**: Валідація та fallback до дефолтних значень

## Майбутні Покращення

- Експорт/імпорт налаштувань
- Шаблони налаштувань
- Синхронізація між користувачами
- Розширені опції налаштування
- Аналітика використання груп 