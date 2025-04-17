## Kanban Board (Django + JS)
Рабочее веб-приложение для управления задачами

### Особенности:
- Drag-and-drop для колонок
- Модальные формы
- Авторизация пользователей

### Подготовка
- Необходимо скомпилировать стили в static/css
- Необходимо скопировать .env.example как .env в /src/kanbanBoard/kanbanBoard/ и вписать нужные значения для подключения к БД. Либо прописать переменные окружения в ОС.

### Запуск:
1. pip install -r requirements.txt
2. python manage.py makemigrations accounts
3. python manage.py makemigrations
4. python manage.py migrate
5. python manage.py runserver
