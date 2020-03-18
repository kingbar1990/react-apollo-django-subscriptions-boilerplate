import graphene
import graphql_jwt
from accounts.mutations import (LoginMutation, RegisterMutation,
                                ResetPasswordMutation,
                                SendConfirmationEmailMutation,
                                UserEditMutation)
from accounts.schema import Query as AccountsQuery
from channels.layers import get_channel_layer
from core.models import Message
from core.mutations import (CreateRoomMutation, MessageCreateMutation,
                            MessageMutationDelete, MessageUpdateMutation, ReadMessagesMutation, UpdateRoomMutation)
from core.schema import Query as CoreQuery
from core.schema import MessageType, RoomType
from rx import Observable

channel_layer = get_channel_layer()


class Query(AccountsQuery, CoreQuery, graphene.ObjectType):
    pass


class Mutation(graphene.ObjectType):
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
    new_message = graphene.Field(MessageType, channel_id=graphene.ID())
    notifications = graphene.Field(RoomType, user_id=graphene.ID())
    on_focus = graphene.Boolean()
    has_unreaded_messages = graphene.Boolean(user_id=graphene.ID())

    async def resolve_new_message(root, info, channel_id):
        channel_name = await channel_layer.new_channel()
        await channel_layer.group_add("new_message_" + str(channel_id), channel_name)
        try:
            while True:
                message = await channel_layer.receive(channel_name)
                yield message["data"]
        finally:
            await channel_layer.group_discard("new_message_" + str(channel_id), channel_name)

    async def resolve_notifications(root, info, user_id):
        channel_name = await channel_layer.new_channel()
        await channel_layer.group_add("notify_" + str(user_id), channel_name)
        try:
            while True:
                room = await channel_layer.receive(channel_name)
                yield room["data"]
        finally:
            await channel_layer.group_discard("notify_" + str(user_id), channel_name)

    async def resolve_on_focus(root, info):
        channel_name = await channel_layer.new_channel()
        await channel_layer.group_add("focused", channel_name)
        try:
            while True:
                focused = await channel_layer.receive(channel_name)
                yield focused['data']
        finally:
            await channel_layer.group_discard("focused", channel_name)

    async def resolve_has_unreaded_messages(root, info, user_id):
        channel_name = await channel_layer.new_channel()
        await channel_layer.group_add("has_unreaded_messages_" + str(user_id), channel_name)
        try:
            while True:
                data = await channel_layer.receive(channel_name)
                yield data['data']
        finally:
            await channel_layer.group_discard("has_unreaded_messages_" + str(user_id), channel_name)


schema = graphene.Schema(
    query=Query,
    mutation=Mutation,
    subscription=Subscription
)
