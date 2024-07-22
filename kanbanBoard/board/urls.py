from django.urls import path
from .views import task_api, board_api, board, main

urlpatterns = [
    path('', main, name="main_page"),
    path('board/', board, name="board_page"),
    path('board/api/task/', task_api, name="task_api"),
    path('board/api/board/', board_api, name="board_api"),
]
