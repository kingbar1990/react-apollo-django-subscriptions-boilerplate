import graphene
from graphene_django.types import DjangoObjectType
from graphql_jwt.decorators import login_required

from django.contrib.auth import get_user_model


class UserType(DjangoObjectType):
    """ UserType object for GraphQL """
    class Meta:
        model = get_user_model()

    has_unreaded_messages = graphene.Boolean()

    def resolve_has_unreaded_messages(self, info):
        """ Return True or False depending on if user has unreaded messages """
        unreaded_rooms = self.rooms.all()
        unreaded_rooms = unreaded_rooms.filter(last_message__seen=False).exclude(
            last_message__sender_id=self.id)
        if len(unreaded_rooms) > 0:
            return True
        else:
            return False


class Query:
    users = graphene.List(UserType)
    me = graphene.Field(UserType)

    def resolve_users(self, info):
        return get_user_model().objects.all()

    @login_required
    def resolve_me(self, info):
        return info.context.user
