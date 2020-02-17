from accounts.models import User
from django.contrib.auth import get_user_model
from django.db import models


class Room(models.Model):
    users = models.ManyToManyField(User, related_name='rooms')
    last_message = models.ForeignKey(
        'Message',
        related_name='last_message',
        blank=True,
        null=True,
        on_delete=models.SET_NULL
    )
    typing = models.BooleanField(default=False)

    def __str__(self):
        return "%s" % (self.id)

    @classmethod
    def exists(cls, user_id_1, user_id_2):
        """ Method that checks if room exists with provided users """
        if Room.objects.filter(users__id=user_id_1).filter(users__id=user_id_2).count() == 1:
            return True
        return False

    @classmethod
    def get_by_users(cls, user_id_1, user_id_2):
        """ Method that gets room by user's id """
        return Room.objects.filter(users__id=user_id_1).filter(users__id=user_id_2).first()


class Message(models.Model):
    text = models.CharField(max_length=255)
    sender = models.ForeignKey(
        User,
        related_name='sended_messages',
        null=True,
        on_delete=models.SET_NULL
    )
    room = models.ForeignKey(
        Room,
        related_name='messages',
        null=True,
        on_delete=models.SET_NULL
    )
    seen = models.BooleanField(default=True)
    time = models.DateTimeField(auto_now=True)
    file = models.ImageField(
        upload_to='attachment/', null=True, blank=True
    )
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.text
