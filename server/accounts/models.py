from django.contrib.auth.base_user import AbstractBaseUser
from django.contrib.auth.models import PermissionsMixin
from django.core.mail import send_mail
from django.db import models
from django.utils.translation import ugettext_lazy as _
from django.dispatch import receiver
from django.db.models.signals import post_save
from django.core import serializers

from accounts.managers import UserManager

from channels.layers import get_channel_layer

from asgiref.sync import async_to_sync


class User(AbstractBaseUser, PermissionsMixin):
    """ Custom User Model """
    email = models.EmailField(_('email address'), unique=True)
    full_name = models.CharField(_('full name'), max_length=64, blank=True)
    date_joined = models.DateTimeField(_('date joined'), auto_now_add=True)
    is_active = models.BooleanField(_('active'), default=True)
    is_staff = models.BooleanField(_('staff'), default=True)
    avatar = models.ImageField(
        upload_to='avatars/', null=True, blank=True
    )
    online = models.BooleanField(default=False)
    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    class Meta:
        verbose_name = _('user')
        verbose_name_plural = _('users')

    def email_user(self, subject, message, from_email=None, **kwargs):
        send_mail(subject, message, from_email, [self.email], **kwargs)


@receiver(post_save, sender=User)
def change_user(sender, instance, *args, **kwargs):
    """ Send message to channel if User's status changed """
    users = serializers.serialize('json', User.objects.all())
    async_to_sync(channel_layer.group_send)(
        "users",
        {
            "type":"user.update",
			"event":"New User",
            "data": users
        }
    )

    