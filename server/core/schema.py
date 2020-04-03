import graphene
from graphene_django.types import DjangoObjectType

from django.contrib.auth import get_user_model

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
    unviewed_messages = graphene.Int(user_id=graphene.Int())
    messages = graphene.List(
        MessageType,
        first=graphene.Int(),
        skip=graphene.Int(),
        room=graphene.Int(),
        first_user=graphene.ID(),
        second_user=graphene.ID()
    )

    class Meta:
        model = Room

    def resolve_unviewed_messages(self, info, user_id=None):
        # Return count of unread messages
        if user_id:
            user = get_user_model().objects.get(pk=user_id)            
            return self.messages.filter(seen=False, is_deleted=False).exclude(sender=user).count()

    def resolve_messages(self, info, first=None, skip=None, room=None,first_user=None, second_user=None):
        # Return all messages in room
        if room:
            room = Room.objects.get(pk=room)
        else:
            room = Room.objects.filter(users=first_user).filter(users=second_user).first()
        qs = Message.objects.filter(
            room=room, is_deleted=False).order_by('time')
        if skip:
            qs = qs[skip:]
        if first:
            qs = qs[:first]
        return qs


class Query:
    rooms = graphene.List(RoomType, user_id=graphene.Int())
    room = graphene.Field(RoomType, id=graphene.Int(), first_user=graphene.ID(), second_user=graphene.ID())
    type = graphene.Field(RoomType, id=graphene.Int())
    on_focus = graphene.Boolean(focused=graphene.Boolean(), room_id=graphene.ID())

    def resolve_room(self, info, id=None, first_user=None, second_user=None):
        # Return room with provided ID
        if id:
            room = Room.objects.get(id=id)
        if first_user and second_user:
            room = Room.objects.filter(users=first_user).filter(users=second_user).first()            
        if not room:
            room = Room.objects.create()
            user1 = get_user_model().objects.get(pk=first_user)
            user2 = get_user_model().objects.get(pk=second_user)
            room.users.add(user1)
            room.users.add(user2)
            room.save()
        if room.last_message:
            room.typing = False
            room.last_message.save()

        return room

    def resolve_type(self, info, id):
        room = Room.objects.get(id=id)
        room.typing = True
        room.save()

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
