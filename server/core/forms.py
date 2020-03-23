from django import forms
from django.forms import ModelForm
from django.forms.widgets import TextInput

from accounts.forms import LongCharField

from core.models import Message, Room


class MessageForm(ModelForm):
    """ Form for chat messages """
    message_id = forms.IntegerField(required=False)
    file = LongCharField(widget=TextInput, required=False)

    class Meta:
        model = Message
        fields = [
            'text', 'sender', 'room', 'message_id', 'seen'
        ]


    def clean(self):
        """ 
        Check for non-empty file or text fields. 
        If they are empty return Validation Error.
        """
        cleaned_data = super().clean()
        file = cleaned_data.get('file')
        text = cleaned_data.get('text')
        if not file and not text:
            raise forms.ValidationError("Send file or message!")


class RoomForm(ModelForm):
    """ Form for Chat Room """
    class Meta:
        model = Room
        fields = [
            'users'
        ]
