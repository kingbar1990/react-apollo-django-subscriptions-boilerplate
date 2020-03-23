import graphene
import graphql_jwt
from rx import Observable
import json 
from channels.layers import get_channel_layer

from django.contrib.auth import get_user_model

from accounts.schema import Query as AccountsQuery
from accounts.schema import UserType
from accounts.mutations import (LoginMutation, RegisterMutation,
                                ResetPasswordMutation,
                                SendConfirmationEmailMutation,
                                UserEditMutation)

from core.schema import Query as CoreQuery
from core.schema import MessageType, RoomType
from core.models import Message
from core.mutations import (
    CreateRoomMutation, MessageCreateMutation,
    MessageMutationDelete, MessageUpdateMutation,
    ReadMessagesMutation, UpdateRoomMutation
)


channel_layer = get_channel_layer()


class Query(AccountsQuery, CoreQuery, graphene.ObjectType):
    pass


class Mutation(graphene.ObjectType):
    """ All Mutations """
    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()
    register = RegisterMutation.Field()
    login = LoginMutation.Field()
    edit_user = UserEditMutation.Field()
    delete_message = MessageMutationDelete.Field()
    create_message = MessageCreateMutation.Field()
    update_message = MessageUpdateMutation.Field()
    confirm_email = SendConfirmationEmailMutation.Field()
    reset_password = ResetPasswordMutation.Field()
    create_room = CreateRoomMutation.Field()
    reed_messages = ReadMessagesMutation.Field()
    update_room = UpdateRoomMutation.Field()


class Subscription(graphene.ObjectType):
    """ All Subscriptions """
    new_message = graphene.Field(MessageType, channel_id=graphene.ID())
    notifications = graphene.Field(RoomType, user_id=graphene.Int())
    on_focus = graphene.Boolean(room_id=graphene.ID())
    has_unreaded_messages = graphene.Boolean(user_id=graphene.ID())
    online_users = graphene.List(UserType)

    async def resolve_new_message(root, info, channel_id):
        """ Send new message to room channel over websocket """
        channel_name = await channel_layer.new_channel()
        await channel_layer.group_add("new_message_" + str(channel_id), channel_name)
        try:
            while True:
                message = await channel_layer.receive(channel_name)
                yield message["data"]
        finally:
            await channel_layer.group_discard("new_message_" + str(channel_id), channel_name)

    async def resolve_notifications(root, info, user_id):
        """ Send notification to channel of provided user over websocket """
        channel_name = await channel_layer.new_channel()
        await channel_layer.group_add("notify_" + str(user_id), channel_name)
        try:
            while True:
                room = await channel_layer.receive(channel_name)
                yield room["data"]
        finally:
            await channel_layer.group_discard("notify_" + str(user_id), channel_name)

    async def resolve_on_focus(root, info, room_id):
        """ Send send notification to user if his pen pal is typing message """
        channel_name = await channel_layer.new_channel()
        await channel_layer.group_add("focused_" + str(room_id), channel_name)
        try:
            while True:
                focused = await channel_layer.receive(channel_name)
                yield focused['data']
        finally:
            await channel_layer.group_discard("focused_" + str(room_id), channel_name)

    async def resolve_has_unreaded_messages(root, info, user_id):
        """ Send notification for user if he has new unreaded message or he read messages """
        channel_name = await channel_layer.new_channel()
        await channel_layer.group_add("has_unreaded_messages_" + str(user_id), channel_name)
        try:
            while True:
                data = await channel_layer.receive(channel_name)
                yield data['data']
        finally:
            await channel_layer.group_discard("has_unreaded_messages_" + str(user_id), channel_name)

    async def resolve_online_users(root, info):
        """ Send live-time info about online/offline users to public channel over websockets """
        channel_name = await channel_layer.new_channel()
        await channel_layer.group_add("online_users", channel_name)
        try:
            while True:
                online_users = await channel_layer.receive(channel_name)
                users = get_user_model().objects.only('id', 'email', 'full_name', 'online')
                yield users
        finally:
            await channel_layer.group_discard("online_users", channel_name)

            
schema = graphene.Schema(
    query=Query,
    mutation=Mutation,
    subscription=Subscription
)
