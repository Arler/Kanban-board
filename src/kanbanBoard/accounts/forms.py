from django import forms
from django.contrib.auth.forms import UserCreationForm

from .models import User


class CustomUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = User


class CustomUserChangeForm(forms.ModelForm):
    class Meta:
        model = User
        fields = ['username', 'send_notifications']
