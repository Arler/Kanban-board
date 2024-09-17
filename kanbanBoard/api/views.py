from django.shortcuts import render

from board.models import Task, Board
from board.forms import TaskForm, BoardForm, ColumnForm

# Create your views here.
def get_new_board_form(request, pk):   
    context = {
    "form": BoardForm(),
    "pk": pk
    }

    return render(request, template_name="board/forms/new_board_form.html", context=context)

def get_board_settings_form(request, pk):
    board = Board.objects.get(pk=pk)
    context = {
        "form": BoardForm(),
        "board": board,
    }

    return render(request, template_name="board/forms/board_settings_form.html", context=context)

def get_task_form(request, pk):
    context = {
        "form": TaskForm(),
        "pk": pk,
    }

    return render(request, template_name='board/task_form.html', context=context)

def get_column_settings_form(request, pk):
    context = {
        "form": ColumnForm(),
        "pk": pk,
    }

    return render(request, template_name="board/forms/column_settings_form.html", context=context)

def get_task_description(request, pk):
    task = Task.objects.get(pk=pk)
    context = {
        "task": task
    }

    return render(request, template_name="board/task_description.html", context=context)