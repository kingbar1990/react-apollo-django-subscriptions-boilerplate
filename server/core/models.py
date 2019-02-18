from accounts.models import User
from django.contrib.auth import get_user_model
from django.db import models


class Room(models.Model):
    users = models.ManyToManyField(User)
    last_message = models.ForeignKey(
        'Message',
        related_name='last_message',
        blank=True,
        null=True,
        on_delete=models.CASCADE
    )

    def __str__(self):
        return "%s" % (self.id)


class Message(models.Model):
    text = models.CharField(max_length=255)
    sender = models.ForeignKey(
        User,
        related_name='sended_messages',
        null=True,
        on_delete=models.SET_NULL
    )
    recipient = models.ForeignKey(
        User,
        related_name='recieved_messages',
        null=True,
        on_delete=models.SET_NULL
    )
    room = models.ForeignKey(
        Room, related_name='messages', on_delete=models.CASCADE
    )
    time = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.text
