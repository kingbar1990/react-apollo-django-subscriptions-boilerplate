import graphene
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from graphene_django.types import DjangoObjectType

from .models import Message, Room

channel_layer = get_channel_layer()


class MessageType(DjangoObjectType):
    class Meta:
        model = Message


class RoomType(DjangoObjectType):
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
        return Room.objects.filter(id=self.id, last_message__seen=False).count()

    def resolve_messages(self, info, first=None, skip=None, room=None):
        qs = Message.objects.filter(room_id=room)

        if skip:
            qs = qs[skip:]

        if first:
            qs = qs[:first]

        return qs


class Query:
    rooms = graphene.List(RoomType, user_id=graphene.Int())
    room = graphene.Field(RoomType, id=graphene.Int())

    def resolve_room(self, info, id):
        room = Room.objects.get(id=id)
        if room.last_message:
            room.last_message.seen = True
            room.last_message.save()

        async_to_sync(channel_layer.group_send)(
            "notify", {"data": room})

        return room

    def resolve_rooms(self, info, user_id):
        return Room.objects.filter(users__id=user_id)
