import graphene
from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from graphene_django.types import DjangoObjectType

from .models import Message, Room
from .utils import get_paginator

channel_layer = get_channel_layer()


class MessageType(DjangoObjectType):
    class Meta:
        model = Message


class RoomType(DjangoObjectType):
    unviewed_messages = graphene.Int()

    class Meta:
        model = Room

    def resolve_unviewed_messages(self, info):
        return Room.objects.filter(id=self.id, last_message__seen=False).count()


class MessagePaginatedType(graphene.ObjectType):
    page = graphene.Int()
    pages = graphene.Int()
    has_next = graphene.Boolean()
    has_prev = graphene.Boolean()
    objects = graphene.List(MessageType)


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
