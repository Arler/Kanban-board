from django.urls import path
from .views import board, main

urlpatterns = [
    path('', main, name="main_page"),
    path('board/<int:pk>', board, name="board_page"),
]
