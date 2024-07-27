from django.contrib import admin
from .models import Board, Task, Column

# Register your models here.
admin.site.register(Board)
admin.site.register(Task)
admin.site.register(Column)
