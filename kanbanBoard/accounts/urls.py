from django.urls import path, include
from .views import RegistrationView


urlpatterns = [
    path("registration/", RegistrationView.as_view(), name="registration")
]
