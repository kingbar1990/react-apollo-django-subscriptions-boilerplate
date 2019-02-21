from django import forms
from django.forms import ModelForm

from .models import Message


class MessageForm(ModelForm):
    message_id = forms.IntegerField(required=False)

    class Meta:
        model = Message
        fields = [
            'text', 'sender', 'room', 'message_id'
        ]
