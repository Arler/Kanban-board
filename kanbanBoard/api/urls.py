from django.urls import path
from .views import get_new_board_form, get_board_settings_form, get_task_form

urlpatterns = [
    path('forms/newboard/', get_new_board_form),
    path('forms/boardsettings/', get_board_settings_form),
    path('forms/task/<int:pk>', get_task_form)
]