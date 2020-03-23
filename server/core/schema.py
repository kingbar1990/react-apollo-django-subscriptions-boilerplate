import graphene
from graphene_django.types import DjangoObjectType

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer

from core.models import Message, Room


channel_layer = get_channel_layer()


class MessageType(DjangoObjectType):
    """ Message object type for GraphQL """
    class Meta:
        model = Message



class RoomType(DjangoObjectType):
    """ Room object type for GraphQL """
    unviewed_messages = graphene.Int()
    messages = graphene.List(
        MessageType,
        first=graphene.Int(),
        skip=graphene.Int(),
        room=graphene.Int()
    )

    class Meta:
        model = Room

    def resolve_unviewed_messages(self, info):
        # Return count of unread messages
        if 'user' in info.context:
            user = info.context.user
            return self.messages.filter(seen=False, is_deleted=False).exclude(sender=user).count()
        return self.messages.filter(seen=False, is_deleted=False).count()

    def resolve_messages(self, info, first=None, skip=None, room=None):
        # Return all messages in room
        qs = Message.objects.filter(
            room_id=room, is_deleted=False).order_by('time')
        if skip:
            qs = qs[skip:]
        if first:
            qs = qs[:first]
        return qs


class Query:
    rooms = graphene.List(RoomType, user_id=graphene.Int())
    room = graphene.Field(RoomType, id=graphene.Int())
    type = graphene.Field(RoomType, id=graphene.Int())
    on_focus = graphene.Boolean(focused=graphene.Boolean(), room_id=graphene.ID())

    def resolve_room(self, info, id):
        # Return room with provided ID
        room = Room.objects.get(id=id)

        if room.last_message:
            room.typing = False
            room.last_message.save()

        async_to_sync(channel_layer.group_send)(
            "notify", {"data": room})

        return room

    def resolve_type(self, info, id):
        room = Room.objects.get(id=id)
        room.typing = True
        room.save()

        async_to_sync(channel_layer.group_send)(
            "notify", {"data": room})

        return room

    def resolve_rooms(self, info, user_id):
        # Return all rooms for provided user ID
        return Room.objects.filter(users__id=user_id)

    def resolve_on_focus(self, info, room_id=None, focused=False):
        # Return True or False depending on if user typing message
        if focused and room_id:
            async_to_sync(channel_layer.group_send)("focused_" + str(room_id), {"data": True})
            return True
        async_to_sync(channel_layer.group_send)("focused_" + str(room_id), {"data": False})
        return False
