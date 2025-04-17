from django.urls import path
from .views import task_api, board_api, column_api

urlpatterns = [
    path('task/', task_api),
    path('board/', board_api),
    path('column/', column_api),
]