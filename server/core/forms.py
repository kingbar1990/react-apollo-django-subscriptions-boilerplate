from accounts.forms import LongCharField
from django import forms
from django.forms import ModelForm
from django.forms.widgets import TextInput

from .models import Message


class MessageForm(ModelForm):
    message_id = forms.IntegerField(required=False)
    file = LongCharField(widget=TextInput, required=False)

    class Meta:
        model = Message
        fields = [
            'text', 'sender', 'room', 'message_id', 'seen'
        ]
