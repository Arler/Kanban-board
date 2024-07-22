from django.shortcuts import render, redirect
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import HttpResponseBadRequest, HttpResponse

from .models import User
from .forms import CustomUserCreationForm

import json

def registration(request):
    if request.method == 'POST':
        user_creation_form = CustomUserCreationForm(request.POST)

        if user_creation_form.is_valid():
            user_creation_form.save()

            return redirect('/accounts/login/')

    else:
        context = {
            'form': CustomUserCreationForm
        }

        return render(request, template_name='registration/registration.html', context=context)

@ensure_csrf_cookie
def profile(request):
    # Рендерит страницу профиля


    return render(request, template_name='board/profile_page.html')

# =================== profile api ===================


def profile_api(request):
    if request.method == 'PUT':
        # Отвечает за изменения настроек профиля пользователя
        request_json = json.loads(request.body)

        if request_json.get('change_notifications', False):
            request.user.send_notifications = request_json.get('notifications_status')

            return HttpResponse()

        elif request_json.get('change_username', False):
            request.user.username = request_json.get('new_username')

            return HttpResponse()

        else:
            return HttpResponseBadRequest('Wrong request')

    elif request.method == 'DELETE':
        # Отвечает за удаление аккаунта пользователя
        user = User.objects.get(pk=json.loads(request.body)['id'])
        if user:
            user.delete()

            return HttpResponse()

        else:
            return HttpResponseBadRequest('Wrong id')