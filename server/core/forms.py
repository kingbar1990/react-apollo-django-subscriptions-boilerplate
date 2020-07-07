from django import forms
from django.forms import ModelForm
from django.forms.widgets import TextInput

from accounts.forms import LongCharField

from core.models import Message, Room


class MessageForm(ModelForm):
    """ Form for chat messages """
    message_id = forms.IntegerField(required=False)
    
    class Meta:
        model = Message
        fields = [
            'text', 'sender', 'room', 'message_id', 'seen'
        ]


class RoomForm(ModelForm):
    """ Form for Chat Room """
    class Meta:
        model = Room
        fields = [
            'users'
        ]
