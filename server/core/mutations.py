import base64
import graphene
import random

from django.core.files.base import ContentFile
from django.contrib.auth import get_user_model

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from serious_django_graphene import FormMutation

from core.forms import MessageForm, RoomForm
from core.models import Message, Room, MessageFile
from core.schema import MessageType, RoomType


channel_layer = get_channel_layer()


class CreateRoomMutation(FormMutation):
    """ Mutation for creating Chat Room """
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
    """ Mutation for editing Chat Room """
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
    """ Mutation for deleting Chat Message """
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


class MessageCreateMutation(graphene.Mutation):
    """ Mutation to create Chat Message """
    class Arguments:
        files = graphene.List(graphene.String, required=False)
        text = graphene.String(required=False)
        sender = graphene.ID()
        seen = graphene.Boolean()
        room = graphene.ID()

    message = graphene.Field(lambda: MessageType)

    def mutate(root, info, sender, room, seen, files=None, text=None):
        """ Create message if there's file or text or both """
        user = get_user_model().objects.get(pk=info.context.user.id)
        room = Room.objects.get(pk=room)
        if not files and not text:
            return None

        message = Message.objects.create(room=room, text=text, sender=user)

        if files:
            for f in files:
                file_name, f = f.split('#name#')
                img_format, img_str = f.split(';base64,')
                ext = img_format.split('/')[-1]
                file = ContentFile(
                    base64.b64decode(img_str), name=file_name.split('.')[0] + str(random.randint(100000,999999999)) + ext
                )
                mes_file = MessageFile.objects.create(message=message, file=file)
                mes_file.save()

        reciever_id = room.users.exclude(pk=message.sender.pk).first().pk

        room.last_message = message
        room.save()
        
        # Send data over websockets
        async_to_sync(channel_layer.group_send)(
            "new_message_" + str(message.room.id), {"data": message})
        async_to_sync(channel_layer.group_send)(
            "notify_" + str(reciever_id), {"data": room})
        async_to_sync(channel_layer.group_send)(
            "has_unreaded_messages_" + str(reciever_id), {"data": True})

        return MessageCreateMutation(message=message)


class MessageUpdateMutation(FormMutation):
    """ Mutation for editing Chat Message """
    class Meta:
        form_class = MessageForm

    message = graphene.Field(lambda: MessageType)

    @classmethod
    def perform_mutate(cls, form, info):
        message = Message.objects.get(id=form.cleaned_data['message_id'])
        message.text = form.cleaned_data['text']
        message.save()
        
        # Send message over websockets
        async_to_sync(channel_layer.group_send)(
            "new_message_" + str(message.room.id), {"data": message})

        return cls(message=message)


class ReadMessagesMutation(graphene.Mutation):
    """ Mutation to mark Chat Messages as read """
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
                "new_message_" + str(room_id), {"data": message})
        async_to_sync(channel_layer.group_send)(
            "notify_" + str(user.id), {"data": Room.objects.get(id=room_id)})

        unreaded_rooms = user.rooms.all()
        unreaded_rooms = unreaded_rooms.filter(last_message__seen=False).exclude(
            last_message__sender_id=user.id)

        # Send True or False over websocket depending on if user has unreaded messages
        if(len(unreaded_rooms) > 0):
            async_to_sync(channel_layer.group_send)(
                "has_unreaded_messages_" + str(user.id), {"data": True})
        else:
            async_to_sync(channel_layer.group_send)(
                "has_unreaded_messages_" + str(user.id), {"data": False})

        return ReadMessagesMutation(success=success, errors=errors)
