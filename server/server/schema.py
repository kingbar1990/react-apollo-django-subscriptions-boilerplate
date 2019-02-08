import graphene
import graphql_jwt
from accounts.mutations import (LoginMutation, RegisterMutation,
                                ResetPasswordMutation,
                                SendConfirmationEmailMutation,
                                UserEditMutation)
from accounts.schema import Query as AccountsQuery
from core.mutations import (TaskCreateMutation, TaskMutationDelete,
                            TaskUpdateMutation)
from core.schema import Query as CoreQuery
from rx import Observable


class Query(AccountsQuery, CoreQuery, graphene.ObjectType):
    pass


class Mutation(graphene.ObjectType):
    token_auth = graphql_jwt.ObtainJSONWebToken.Field()
    verify_token = graphql_jwt.Verify.Field()
    refresh_token = graphql_jwt.Refresh.Field()
    register = RegisterMutation.Field()
    login = LoginMutation.Field()
    edit_user = UserEditMutation.Field()
    delete_task = TaskMutationDelete.Field()
    create_task = TaskCreateMutation.Field()
    update_task = TaskUpdateMutation.Field()
    confirm_email = SendConfirmationEmailMutation.Field()
    reset_password = ResetPasswordMutation.Field()


class Subscription(graphene.ObjectType):
    count_seconds = graphene.Int(up_to=graphene.Int())

    def resolve_count_seconds(root, info, up_to=5):
        return Observable.interval(1000)\
                         .map(lambda i: "{0}".format(i))\
                         .take_while(lambda i: int(i) <= up_to)


schema = graphene.Schema(
    query=Query,
    mutation=Mutation,
    subscription=Subscription
)
