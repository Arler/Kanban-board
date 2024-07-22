from django.db import models
from django.conf import settings


class Board(models.Model):
    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    tasks = models.ManyToManyField("Task", blank=True)
    max_tasks = models.IntegerField()
    columns = models.ManyToManyField("Column")


class Task(models.Model):
    title = models.CharField(max_length=255)
    date_created = models.DateField(auto_now_add=True)
    deadline = models.DateField()
    users = models.ForeignKey(settings.AUTH_USER_MODEL, blank=True, on_delete=models.CASCADE)
    comments = models.TextField(blank=True)
    column = models.ForeignKey("Column", on_delete=models.CASCADE)


class Column(models.Model):
    title = models.CharField(max_length=255)