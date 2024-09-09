from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django.db.models import Count
from django.conf import settings
from django.core.serializers import serialize

from accounts.models import User

from .forms import TaskForm, BoardForm, ColumnForm
from .models import Task, Board, Column

import json
import os


# ==================== board api ====================


def task_api(request):
    data = json.loads(request.body.decode('utf-8'))
    if request.method == 'POST':
        new_task_form = TaskForm(data)

        if new_task_form.is_valid():
            new_task = new_task_form.save()
            new_task = json.loads(serialize('json', [new_task]))

            return JsonResponse(new_task, safe=False)
        else:
            return JsonResponse({'errors': new_task_form.errors}, status=400)
        
    elif request.method == 'PUT':
        task = Task.objects.get(pk=data.get('id', None))

        # Добавление и удаление пользователей на задачу
        if data.get('remove-user', None):
            removed_users = User.objects.filter(task__users=data.get('users', None)) # Должен быть id пользователя
            if removed_users:
                task.users.remove(removed_users)

                return HttpResponse()
            else:
                return HttpResponseBadRequest('Wrong user id')
        elif data.get('add-user', None):
            added_users = User.objects.filter(task__users=data.get('users', None)) # Должен быть id пользователя
            if added_users:
                task.users.add(added_users)

                return HttpResponse()
            else:
                return HttpResponseBadRequest('Wrong user id')

        # Изменение инстанса задачи
        else:
            edit_task_form = TaskForm(data, instance=task)
            if edit_task_form.is_valid():
                updated_task = edit_task_form.save()
                updated_task = json.loads(serialize('json', [updated_task]))

                return JsonResponse(updated_task, safe=False)
            else:
                return JsonResponse({'errors': edit_task_form.errors}, status=400)
        
    elif request.method == 'DELETE':
        task = Task.objects.get(pk=data.get('id', None))
        if task:
            task.delete()

            return HttpResponse()
        else:
            return HttpResponseBadRequest('Wrong id')

def board_api(request):
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        data['owner'] = request.user.id
        new_board_form = BoardForm(data)

        if new_board_form.is_valid():
            new_board = new_board_form.save()
            new_board = json.loads(serialize('json', [new_board]))
            new_board[0]['fields']['total_users'] = User.objects.filter(task__board__id=new_board[0]['pk']).distinct().count()

            return JsonResponse(new_board, safe=False)
        else:
            return JsonResponse({'errors': new_board_form.errors}, status=400)
    elif request.method == 'PUT':
        data = json.loads(request.body.decode('utf-8'))
        board = Board.objects.get(pk=data.get('id'))

        data['owner'] = request.user.id
        if not data.get('title', False):
            data['title'] = board.title

        edit_board_form = BoardForm(data, instance=board)
        if edit_board_form.is_valid():
            edit_board_form.save()
            updated_board = json.loads(serialize('json', [board]))
            updated_board[0]['fields']['total_users'] = User.objects.filter(task__board__id=board.pk).distinct().count()

            return JsonResponse(updated_board, safe=False)
        else:
            return JsonResponse({'errors': edit_board_form.errors}, status=400)
    elif request.method == 'DELETE':
        data = json.loads(request.body.decode('utf-8'))
        board = Board.objects.get(pk=data.get('id', None))
        if board:
            board.delete()

            return HttpResponse()
        else:
            return HttpResponseBadRequest('Wrong id')
        
def colimn_api(request):
    data = json.loads(request.body.decode('utf-8'))
    if request.method == "POST":
        # Создание новой колонки
        new_column_form = ColumnForm(data)

        if new_column_form.is_valid():
            new_column = new_column_form.save()
            new_column = json.loads(serialize('json', [new_column]))
            return JsonResponse(new_column, safe=False)
        else:
            return JsonResponse({'errors': new_column_form.errors}, status=400)
    elif request.method =="PUT":
        # Редактирование существующей колонки
        column = Column.objects.get(pk=data.get('id', None))
        edit_column_form = BoardForm(data, instance=column)
        if edit_column_form.is_valid():
            updated_column = edit_column_form.save()
            updated_column = json.loads(serialize('json', [updated_column]))
        else:
            return JsonResponse({'errors': edit_column_form.errors}, status=400)
    elif request.method == "DELETE":
        # Удаление существующей колонки
        column = Column.objects.get(pk=data.get('id', None))
        if column:
            column.delete()

            return HttpResponse()
        else:
            return HttpResponseBadRequest('Wrong id')

# =================== other views ===================


@ensure_csrf_cookie
def main(request):
    if request.headers.get('X-get-form', None):
        html_file = open(os.path.join(settings.TEMPLATES[0]['DIRS'][0], 'board', 'board_form.html'), 'r')
        
        return HttpResponse(html_file.read(), content_type='text/html')

    # Рендерит страницу со списком досок пользователя
    user_boards_queryset = Board.objects.filter(owner=request.user).annotate(total_users=Count('tasks__users', distinct=True))

    context = {
        "boards": user_boards_queryset,
        "board_form": BoardForm(),
        }

    return render(request, template_name='board/main_page.html', context=context)

@ensure_csrf_cookie
def board(request, pk):
    # Рендерит страницу с доской
    board = Board.objects.filter(owner=request.user, pk=pk)[0]
    
    context = {
        "board": board,
        "tasks": board.tasks.all(),
        "board_form": BoardForm(),
        "task_form": TaskForm(),
        "column_form": ColumnForm(),
    }

    return render(request, template_name='board/board_page.html', context=context)


