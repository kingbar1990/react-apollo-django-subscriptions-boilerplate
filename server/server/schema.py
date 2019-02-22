import graphene
import graphql_jwt
from accounts.mutations import (LoginMutation, RegisterMutation,
                                ResetPasswordMutation,
                                SendConfirmationEmailMutation,
                                UserEditMutation)
from accounts.schema import Query as AccountsQuery
from channels.layers import get_channel_layer
from core.models import Message
from core.mutations import (MessageCreateMutation, MessageMutationDelete,
                            MessageUpdateMutation)
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


class Subscription(graphene.ObjectType):
    count_seconds = graphene.Int(up_to=graphene.Int())
    new_message = graphene.Field(MessageType)
    notifications = graphene.Field(RoomType)

    async def resolve_new_message(root, info):
        channel_name = await channel_layer.new_channel()
        await channel_layer.group_add("new_message", channel_name)
        try:
            while True:
                message = await channel_layer.receive(channel_name)
                yield message["data"]
        finally:
            await channel_layer.group_discard("new_message", channel_name)

    def resolve_count_seconds(root, info, up_to=5):
        return (
            Observable.interval(1000)
            .map(lambda i: "{0}".format(i))
            .take_while(lambda i: int(i) <= up_to)
        )

    async def resolve_notifications(root, info):
        channel_name = await channel_layer.new_channel()
        await channel_layer.group_add("notify", channel_name)
        try:
            while True:
                room = await channel_layer.receive(channel_name)
                yield room["data"]
        finally:
            await channel_layer.group_discard("notify", channel_name)


schema = graphene.Schema(
    query=Query,
    mutation=Mutation,
    subscription=Subscription
)
