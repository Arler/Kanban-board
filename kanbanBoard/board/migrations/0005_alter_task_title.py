# Generated by Django 5.0.7 on 2024-07-28 19:15

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('board', '0004_board_title_alter_board_columns_alter_task_title'),
    ]

    operations = [
        migrations.AlterField(
            model_name='task',
            name='title',
            field=models.CharField(default='Новая задача', max_length=255),
        ),
    ]
