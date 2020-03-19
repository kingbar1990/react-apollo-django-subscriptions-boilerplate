from accounts.forms import LongCharField
from django import forms
from django.forms import ModelForm
from django.forms.widgets import TextInput

from .models import Message, Room


class MessageForm(ModelForm):
    message_id = forms.IntegerField(required=False)
    file = LongCharField(widget=TextInput, required=False)

    class Meta:
        model = Message
        fields = [
            'text', 'sender', 'room', 'message_id', 'seen'
        ]


    def clean(self):
        cleaned_data = super().clean()
        file = cleaned_data.get('file')
        text = cleaned_data.get('text')
        if not file and not text:
            raise forms.ValidationError("Send file or message!")

class RoomForm(ModelForm):
    class Meta:
        model = Room
        fields = [
            'users'
        ]
