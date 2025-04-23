FROM python:3.12-slim
WORKDIR /kanbanApp
COPY ./src/ .
COPY ./requirements.txt .
RUN pip install -r requirements.txt
CMD sh -c "cd ./kanbanBoard && \
    python manage.py migrate accounts && \
    python manage.py migrate && \
    python manage.py runserver 0.0.0.0:8000"
EXPOSE 8000