from django.db import models
from django.conf import settings

from accounts.models import User


class Board(models.Model):
    title = models.CharField(max_length=255)
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tasks = models.ManyToManyField("Task", blank=True)
    max_tasks = models.IntegerField()
    columns = models.ManyToManyField("Column")


class Task(models.Model):
    title = models.CharField(max_length=255)
    date_created = models.DateField(auto_now_add=True)
    deadline = models.DateField(blank=True)
    users = models.ManyToManyField(User, blank=True)
    comments = models.TextField(blank=True)
    column = models.ForeignKey("Column", on_delete=models.CASCADE)


class Column(models.Model):
    title = models.CharField(max_length=255)