from django.shortcuts import render
from .models import User
from django.views.generic.edit import CreateView


class RegistrationView(CreateView):
    success_url = 'accounts/login/'
    template_name = 'registration/registration.html'
    model = User
    fields = ['username', 'email', 'password', 'send_notifications']

