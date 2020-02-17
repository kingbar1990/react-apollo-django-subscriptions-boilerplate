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
        room = None
        users = form.cleaned_data['users']

        if Room.exists(users[0].id, users[1].id):
            room = Room.get_by_users(users[0].id, users[1].id)
            return cls(room=room)

        room = form.save()
        return cls(room=room)


class UpdateRoomMutation(graphene.Mutation):
    class Arguments:
        room_id = graphene.ID(required=True)
        is_typing = graphene.Boolean(required=True)

    errors = graphene.List(graphene.String)
    success = graphene.Boolean()

    @staticmethod
    def mutate(root, info, **args):
        errors = list()
        success = True
        room_id = args.pop('room_id', None)
        is_typing = args.pop('is_typing', None)

        room = Room.objects.get(id=room_id)
        room.typing = is_typing
        room.save()

        return UpdateRoomMutation(errors=errors, success=success)


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
                message = Message.objects.get(id=message_id)
                message.is_deleted = True
                message.save()
                success = True
                async_to_sync(channel_layer.group_send)(
                    "new_message", {"data": message})
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

        message.sender_id = info.context.user.id
        message.save()

        form.cleaned_data['room'].last_message = message

        form.cleaned_data['room'].save()

        async_to_sync(channel_layer.group_send)(
            "new_message", {"data": message})

        async_to_sync(channel_layer.group_send)(
            "notify", {"data": form.cleaned_data['room']})

        async_to_sync(channel_layer.group_send)(
            "has_unreaded_messages", {"data": True})

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
        async_to_sync(channel_layer.group_send)(
            "new_message", {"data": message})

        return cls(message=message)


class ReadMessagesMutation(graphene.Mutation):
    class Arguments:
        room_id = graphene.ID(required=True)

    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    @staticmethod
    def mutate(root, info, room_id):
        success = True
        errors = list()
        user = info.context.user

        unread_messages = Message.objects.filter(
            room_id=room_id, seen=False).exclude(sender_id=user.id)

        for message in unread_messages:
            message.seen = True
            message.save()
            async_to_sync(channel_layer.group_send)(
                "new_message", {"data": message})

        async_to_sync(channel_layer.group_send)(
            "notify", {"data": Room.objects.get(id=room_id)})

        unreaded_rooms = user.rooms.all()
        unreaded_rooms = unreaded_rooms.filter(last_message__seen=False).exclude(
            last_message__sender_id=user.id)
        if(len(unreaded_rooms) > 0):
            async_to_sync(channel_layer.group_send)(
                "has_unreaded_messages", {"data": True})
        else:
            async_to_sync(channel_layer.group_send)(
                "has_unreaded_messages", {"data": False})

        return ReadMessagesMutation(success=success, errors=errors)
