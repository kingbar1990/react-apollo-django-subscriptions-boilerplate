# Generated by Django 2.1.5 on 2020-02-17 11:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='message',
            name='is_deleted',
            field=models.BooleanField(default=False),
        ),
    ]
