from django.shortcuts import render, redirect
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import HttpResponseBadRequest, HttpResponse, JsonResponse
from django.core.serializers import serialize

from .models import User
from .forms import CustomUserCreationForm, CustomUserChangeForm

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
        data = json.loads(request.body)
        if data['send_notifications'] == 'false':
            data['send_notifications'] = False
        if not data.get('username', False):
            data['username'] = request.user.username
        changed_user_form = CustomUserChangeForm(data, instance=request.user)

        if changed_user_form.is_valid():
            changed_user_form = changed_user_form.save()
            changed_user_form = json.loads(serialize('json', [changed_user_form]))

            return JsonResponse(changed_user_form, safe=False)
        else:
            return HttpResponseBadRequest(f'Wrong request: {changed_user_form.errors}')

    elif request.method == 'DELETE':
        # Отвечает за удаление аккаунта пользователя
        user = User.objects.get(pk=request.user.id)
        if user:
            user.delete()

            return HttpResponse()

        else:
            return HttpResponseBadRequest('Wrong id')