from django import forms
from .models import Board, Column, Task


class BoardForm(forms.ModelForm):
    class Meta:
        model = Board
        fields = '__all__'
        exclude = ['columns']
        labels = {
            "tasks": "Задачи",
            "max_tasks": "Макс кол-во задач"
        }


class TaskForm(forms.ModelForm):
    class Meta:
        model = Task
        fields = '__all__'
        exclude = ['date_created']


class ColumnForm(forms.ModelForm):
    class Meta:
        model = Column
        fields = '__all__'


# class BoardEditForm(forms.Form):
#     max_tasks = forms.IntegerField()


# class TaskEditForm(forms.ModelForm):
#     class Meta:
#         model = Task
#         fields = '__all__'
#         exclude = ['date_created']


# class ColumnEditForm(forms.Form):
#     name = forms.CharField(max_length=255)