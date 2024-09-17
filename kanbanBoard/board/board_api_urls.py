from django.urls import path
from .views import task_api, board_api

urlpatterns = [
    path('task/', task_api, name="task_api"),
    path('board/', board_api, name="board_api"),
]