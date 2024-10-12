from django import forms
from .models import Board, Column, Task


class BoardForm(forms.ModelForm):
    class Meta:
        model = Board
        fields = '__all__'
        exclude = ['columns', 'tasks', 'owner']
        labels = {
            "title": "Название",
            "max_tasks": "Макс кол-во задач",
        }
        widgets = {
            "title": forms.widgets.TextInput(attrs={"value": " "})
        }


class TaskForm(forms.ModelForm):
    class Meta:
        model = Task
        fields = '__all__'
        exclude = ['date_created']
        labels = {
            "title": "Название",
            "deadline": "Дэдлайн",
            "users": "Пользователи",
            "description": "Описание",
            "column": "Столбец",
        }


class ColumnForm(forms.ModelForm):
    class Meta:
        model = Column
        fields = '__all__'
        labels = {
            "title": "Название",
        }
