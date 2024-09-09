from django.shortcuts import render
from django.http import HttpResponse
from django.conf import settings

from board.models import Task
from board.forms import TaskForm

import os

# Create your views here.
def get_new_board_form(request):
    html_file = open(os.path.join(settings.TEMPLATES[0]['DIRS'][0], 'board', 'new_board_form.html'), 'r')
    
    return HttpResponse(html_file.read(), content_type='text/html')

def get_board_settings_form(request):
    html_file = open(os.path.join(settings.TEMPLATES[0]['DIRS'][0], 'board', 'board_settings_form.html'), 'r')
    
    return HttpResponse(html_file.read(), content_type='text/html')

def get_task_form(request, pk):
    task = Task.objects.get(pk=pk)
    context = {
        "form": TaskForm(),
        "pk": task.pk,
    }
    template = render(request, template_name='board/task_form.html', context=context)
    return template