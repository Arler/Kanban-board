from django.urls import path
from .views import get_new_board_form, get_board_settings_form, get_task_form, get_column_settings_form

urlpatterns = [
    path('forms/newboard/<int:pk>/', get_new_board_form),
    path('forms/boardsettings/<int:pk>/', get_board_settings_form),
    path('forms/task/<int:pk>/', get_task_form),
    path('forms/columnsettings/<int:pk>/', get_column_settings_form),
]