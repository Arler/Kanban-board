from django.db import models
from django.contrib.auth.models import AbstractUser


class User(AbstractUser):
    send_notifications = models.BooleanField(default=True)
