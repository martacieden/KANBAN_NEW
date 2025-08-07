# Тест іконок Collapse/Expand

## Проблема
Користувач повідомив, що стрілочки в кнопках collapse/expand мають бути повернуті вліво (ChevronLeft), а не вниз (ChevronDown).

## Виправлення

### 1. CategoryKanbanBoard.tsx
- ✅ Додано імпорт `ChevronLeft`
- ✅ Замінено `ChevronDown` на `ChevronLeft` в кнопці collapse/expand

### 2. KanbanBoard.tsx
- ✅ `ChevronLeft` вже імпортований
- ✅ Кнопка collapse вже використовує `ChevronLeft`

## Очікуваний результат
- Кнопки collapse/expand повинні показувати стрілочки, повернуті вліво
- На сторінці "All tasks" кнопка collapse показує `ChevronLeft`
- На категорійних сторінках (наприклад, Budget) кнопка collapse/expand показує `ChevronLeft`

## Тестування
1. Відкрити сторінку "All tasks"
2. Навести курсор на заголовок колонки
3. Перевірити, що кнопка collapse показує стрілочку вліво
4. Перейти на сторінку "Budget"
5. Навести курсор на заголовок колонки
6. Перевірити, що кнопка collapse/expand показує стрілочку вліво 