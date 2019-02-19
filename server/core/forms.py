from django import forms
from django.forms import ModelForm

from .models import Message


class MessageForm(ModelForm):
    class Meta:
        model = Message
        fields = [
            'text', 'sender', 'room'
        ]
