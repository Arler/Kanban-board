from django.shortcuts import render

from board.models import Task
from board.forms import TaskForm

# Create your views here.
def get_new_board_form(request):    
    return render(request, template_name="board/forms/new_board_form.html")

def get_board_settings_form(request):    
    return render(request, template_name="board/forms/board_settings_form.html")

def get_task_form(request, pk):
    task = Task.objects.get(pk=pk)
    context = {
        "form": TaskForm(),
        "pk": task.pk,
    }
    template = render(request, template_name='board/task_form.html', context=context)
    return template