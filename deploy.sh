#!/bin/bash
# deploy.sh - Автоматичний деплой на GitHub + Vercel

echo "🔄 Початок деплою..."

# Додаємо всі зміни
git add .

# Запитуємо повідомлення коміту або використовуємо за замовчуванням
if [ -z "$1" ]; then
    COMMIT_MSG="Оновлення: $(date '+%Y-%m-%d %H:%M:%S')"
else
    COMMIT_MSG="$1"
fi

# Комітимо зміни
echo "📝 Коміт: $COMMIT_MSG"
git commit -m "$COMMIT_MSG"

# Перевіряємо, чи є нові коміти
if [ $? -eq 0 ]; then
    # Push на GitHub
    echo "📤 Відправка на GitHub..."
    git push origin main
    
    # Деплой на Vercel
    echo "🚀 Деплой на Vercel..."
    vercel --prod --yes
    
    echo "✅ Деплой завершено!"
    echo "🌐 Ваш сайт: https://task-management-chi-jade.vercel.app"
else
    echo "ℹ️ Немає змін для коміту"
fi 