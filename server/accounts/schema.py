import graphene
from graphene_django.types import DjangoObjectType
from graphql_jwt.decorators import login_required

from .models import User


class UserType(DjangoObjectType):
    class Meta:
        model = User

    has_unreaded_messages = graphene.Boolean()

    def resolve_has_unreaded_messages(self, info):
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
        return User.objects.all()

    @login_required
    def resolve_me(self, info):
        return info.context.user
