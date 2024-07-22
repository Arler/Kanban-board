from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest

from .forms import TaskForm, BoardForm
from .models import Task, Board

import json


# ==================== board api ====================


def task_api(request):
    if request.method == 'POST':
        new_task_form = TaskForm(request.POST)

        if new_task_form.is_valid():
            new_task_form.save()
            return HttpResponse()
        else:
            return JsonResponse({'errors': new_task_form.errors}, status=400)
        
    elif request.method == 'PUT':
        task = Task.objects.get(pk=request.POST.get('id'))
        edit_task_form = TaskForm(request.POST, instance=task)
        if edit_task_form.is_valid():
            # Проблема с определением объекта который нужно изменить.
            # Можно попробовать получать id из скрытого поля, которое уже будет внутри формы, а при показе формы, javascript код, который будет
            # подставлять id в поле, беря его из атрибута блока самого отображаемого объекта, то есть id уже будет вшит в атрибут блока
            # который содержит в себе сам объект.
            edit_task_form.save()
        else:
            return JsonResponse({'errors': edit_task_form.errors}, status=400)
        
    elif request.method == 'DELETE':
        task = Task.objects.get(pk=json.loads(request.body)['id'])
        if task:
            task.delete()
        else:
            return HttpResponseBadRequest('Wrong id')

def board_api(request):
    if request.method == 'POST':
        new_board_form = BoardForm(request.POST)

        if new_board_form.is_valid():
            new_board_form.save()
            return HttpResponse()
        else:
            return JsonResponse({'errors': new_board_form.errors}, status=400)
    elif request.method == 'PUT':
        board = Board.objects.get(pk=request.POST.get('id'))
        edit_board_form = BoardForm(request.POST, instance=board)
        if edit_board_form.is_valid():
            # Проблема с определением объекта который нужно изменить.
            # Можно попробовать получать id из скрытого поля, которое уже будет внутри формы, а при показе формы, javascript код, который будет
            # подставлять id в поле, беря его из атрибута блока самого отображаемого объекта, то есть id уже будет вшит в атрибут блока
            # который содержит в себе сам объект.
            edit_board_form.save()
        else:
            return JsonResponse({'errors': edit_board_form.errors}, status=400)
    elif request.method == 'DELETE':
        board = Board.objects.get(pk=json.loads(request.body)['id'])
        if board:
            board.delete()
        else:
            return HttpResponseBadRequest('Wrong id')

# =================== other views ===================

@ensure_csrf_cookie
def main(request):
    # Рендерит страницу со списком досок пользователя
    user_board_querydict = Board.objects.filter(owner=request.user)

    context = {
        "boards": user_board_querydict,
        "board_form": BoardForm()
        }

    return render(request, template_name='board/main_page', context=context)

@ensure_csrf_cookie
def board(request):
    # Рендерит страницу с доской
    board = Board.objects.filter(owner=request.user)
    
    context = {
        "tasks": board.tasks,
        "board_form": BoardForm(),
        "task_form": TaskForm(),
    }

    return render(request, template_name='board/board_page.html', context=context)

@ensure_csrf_cookie
def profile(request):
    # Рендерит страницу профиля


    return render(request, template_name='board/profile_page.html')