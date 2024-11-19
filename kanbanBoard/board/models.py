from django.db import models
from django.conf import settings

from accounts.models import User


class Board(models.Model):
    title = models.CharField(max_length=255, default="Новая доска")
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tasks = models.ManyToManyField("Task", blank=True)
    max_tasks = models.IntegerField()
    columns = models.ManyToManyField("Column", blank=True)


class Task(models.Model):
    title = models.CharField(max_length=255, default="Новая задача")
    date_created = models.DateField(auto_now_add=True)
    deadline = models.DateField(blank=True)
    users = models.ManyToManyField(User, blank=True)
    description = models.TextField(blank=True)
    column = models.ForeignKey("Column", on_delete=models.CASCADE)

    def __str__(self):
        return self.title


class Column(models.Model):
    title = models.CharField(max_length=255)
    row_number = models.IntegerField()

    def __str__(self):
        return self.title