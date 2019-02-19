import graphene
from graphene_django.types import DjangoObjectType

from .models import Message, Room
from .utils import get_paginator


class MessageType(DjangoObjectType):
    class Meta:
        model = Message


class RoomType(DjangoObjectType):
    class Meta:
        model = Room


class MessagePaginatedType(graphene.ObjectType):
    page = graphene.Int()
    pages = graphene.Int()
    has_next = graphene.Boolean()
    has_prev = graphene.Boolean()
    objects = graphene.List(MessageType)


class Query:
    messages = graphene.Field(
        MessagePaginatedType,
        page=graphene.Int(),
        room=graphene.Int()
    )
    rooms = graphene.List(RoomType)
    room = graphene.Field(RoomType, id=graphene.Int())

    def resolve_messages(self, info, page, room):
        page_size = 10
        qs = Message.objects.filter(room_id=room)
        return get_paginator(qs, page_size, page, MessagePaginatedType)

    def resolve_room(self, info, id):
        return Room.objects.get(id=id)

    def resolve_rooms(self, info):
        return Room.objects.all()
