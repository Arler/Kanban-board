from django.urls import path
from .views import registration, profile, profile_api


urlpatterns = [
    path("registration/", registration, name="registration"),
    path('profile/', profile, name="profile_page"),
    path('api/profile', profile_api, name='profile_api')
]
