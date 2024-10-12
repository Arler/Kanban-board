from django.urls import path
from .views import board, main, test

urlpatterns = [
    path('', main, name="main_page"),
    path('board/<int:pk>', board, name="board_page"),
    path('test/', test)
]
