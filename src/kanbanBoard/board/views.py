from django.shortcuts import render
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import HttpResponse, JsonResponse, HttpResponseBadRequest
from django.db.models import Count
from django.conf import settings
from django.core.serializers import serialize
from django.contrib.auth.decorators import login_required

from accounts.models import User

from .forms import TaskForm, BoardForm, ColumnForm
from .models import Task, Board, Column

import json
import os


# ==================== board api ====================


def task_api(request):
    data = json.loads(request.body.decode('utf-8'))
    # -------------------- Создание задачи --------------------
    if request.method == 'POST':
        new_task_form = TaskForm(data)

        if new_task_form.is_valid():
            new_task = new_task_form.save()
            board = Board.objects.get(pk=data.get('board-id'))
            board.tasks.add(new_task)
            board.save()
            new_task = json.loads(serialize('json', [new_task]))[0]

            return JsonResponse(new_task, safe=False)
        else:
            return JsonResponse({'errors': new_task_form.errors}, status=400)
    
    # -------------------- Изменение задачи --------------------
    elif request.method == 'PUT':
        task = Task.objects.get(pk=data.get('id', None))
        edit_task_form = TaskForm(data, instance=task)
        if edit_task_form.is_valid():
            updated_task = edit_task_form.save()
            updated_task = json.loads(serialize('json', [updated_task]))[0]

            return JsonResponse(updated_task, safe=False)
        else:
            return JsonResponse({'errors': edit_task_form.errors}, status=400)
    
    # -------------------- Удаление задачи --------------------
    elif request.method == 'DELETE':
        task = Task.objects.get(pk=data.get('id', None))
        if task:
            task.delete()

            return HttpResponse()
        else:
            return HttpResponseBadRequest('Wrong id')

def board_api(request):
    # ---------- Создание новой доски ----------
    if request.method == 'POST':
        data = json.loads(request.body.decode('utf-8'))
        data['owner'] = request.user
        new_board_form = BoardForm(data)

        if new_board_form.is_valid():
            new_board = new_board_form.save()

            for _ in range(3):
                new_column = Column.objects.create(title="New column", row_number=_)
                new_board.columns.add(new_column)

            new_board = json.loads(serialize('json', [new_board]))[0]
            new_board['fields']['total_users'] = User.objects.filter(task__board__id=new_board['pk']).distinct().count()

            return JsonResponse(new_board, safe=False)
        else:
            return JsonResponse({'errors': new_board_form.errors}, status=400)

    # -------------------- Редактирование доски --------------------
    elif request.method == 'PUT':
        data = json.loads(request.body.decode('utf-8'))
        board = Board.objects.get(pk=data.get('id'))

        data['owner'] = request.user
        if not data.get('title', False):
            data['title'] = board.title

        edit_board_form = BoardForm(data, instance=board)
        if edit_board_form.is_valid():
            edit_board_form.save()
            updated_board = json.loads(serialize('json', [board]))[0]

            updated_board['fields']['total_users'] = User.objects.filter(task__board__id=board.pk).distinct().count()

            columns = Column.objects.filter(pk__in=updated_board['fields']['columns'])
            updated_board['fields']['columns'] = json.loads(serialize('json', columns))

            tasks = Task.objects.filter(pk__in=updated_board['fields']['tasks'])
            updated_board['fields']['tasks'] = json.loads(serialize('json', tasks))

            return JsonResponse(updated_board, safe=False)
        else:
            return JsonResponse({'errors': edit_board_form.errors}, status=400)
        
    # -------------------- Удаление доски --------------------
    elif request.method == 'DELETE':
        data = json.loads(request.body.decode('utf-8'))
        board = Board.objects.get(pk=data.get('id', None))
        if board:
            board.delete()

            return HttpResponse()
        else:
            return HttpResponseBadRequest('Wrong id')
        
def column_api(request):
    data = json.loads(request.body.decode('utf-8'))
    if request.method == "POST":
        # Создание новой колонки
        new_column_form = ColumnForm(data)

        if new_column_form.is_valid():
            new_column = new_column_form.save()
            board = Board.objects.get(pk=data.get('board-id', None))
            board.columns.add(new_column)
            new_column = json.loads(serialize('json', [new_column]))[0]

            return JsonResponse(new_column, safe=False)
        else:
            return JsonResponse({'errors': new_column_form.errors}, status=400)
    elif request.method =="PUT":
        # Редактирование существующей колонки
        column = Column.objects.get(pk=data.get('id', None))
        edit_column_form = ColumnForm(data, instance=column)
        if edit_column_form.is_valid():
            updated_column = edit_column_form.save()
            updated_column = json.loads(serialize('json', [updated_column]))[0]

            return JsonResponse(updated_column, safe=False)
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

@login_required
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

@login_required
@ensure_csrf_cookie
def board(request, pk):
    # Рендерит страницу с доской
    board = Board.objects.get(owner=request.user, pk=pk)
    columns = Column.objects.filter(board__id=board.pk)
    task_form = TaskForm()
    task_form.fields['column'].queryset = columns
    
    context = {
        "board": board,
        "tasks": board.tasks.all(),
        "board_form": BoardForm(),
        "task_form": task_form,
        "column_form": ColumnForm(),
    }

    return render(request, template_name='board/board_page.html', context=context)


def test(request):
    return render(request, template_name='Temp/test.html')