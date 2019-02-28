import base64

import graphene
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.core.files.base import ContentFile
from serious_django_graphene import FormMutation

from .forms import MessageForm, RoomForm
from .models import Message, Room
from .schema import MessageType, RoomType

channel_layer = get_channel_layer()


class CreateRoomMutation(FormMutation):
    class Meta:
        form_class = RoomForm

    room = graphene.Field(lambda: RoomType)

    @classmethod
    def perform_mutate(cls, form, info):
        room = form.save()
        return cls(room=room)


class MessageMutationDelete(graphene.Mutation):
    class Arguments:
        message_id = graphene.ID()

    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    @staticmethod
    def mutate(root, info, **args):
        message_id = args.get('message_id')
        errors = []
        success = False

        if not message_id:
            errors.message_id('Message must be specified')

        if not errors:
            try:
                room = Room.objects.get(messages__id=message_id)
                prev = Message.objects.exclude(
                    id=message_id).order_by('-id').first()
                room.last_message = prev
                room.typing = False
                room.save()

                Message.objects.get(id=message_id).delete()
                success = True
            except Message.DoesNotExist:
                errors.append('Message with provided ID does not exist')

        return MessageMutationDelete(errors=errors, success=success)


class MessageCreateMutation(FormMutation):
    class Meta:
        form_class = MessageForm

    message = graphene.Field(lambda: MessageType)

    @classmethod
    def perform_mutate(cls, form, info):
        message = form.save()

        form.cleaned_data['room'].last_message = message

        form.cleaned_data['room'].save()

        async_to_sync(channel_layer.group_send)(
            "new_message", {"data": message})

        async_to_sync(channel_layer.group_send)(
            "notify", {"data": form.cleaned_data['room']})

        if form.cleaned_data['file']:
            img_format, img_str = form.cleaned_data.pop(
                'file'
            ).split(';base64,')
            ext = img_format.split('/')[-1]
            file = ContentFile(
                base64.b64decode(img_str), name=str(message.id) + ext
            )
            message.file = file
            message.save()
        else:
            form.cleaned_data.pop('file')

        return cls(message=message)


class MessageUpdateMutation(FormMutation):
    class Meta:
        form_class = MessageForm

    message = graphene.Field(lambda: MessageType)

    @classmethod
    def perform_mutate(cls, form, info):
        message = Message.objects.get(id=form.cleaned_data['message_id'])
        message.text = form.cleaned_data['text']
        message.save()
        return cls(message=message)
