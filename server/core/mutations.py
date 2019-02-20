import graphene
from serious_django_graphene import FormMutation

from .forms import MessageForm
from .models import Message, Room
from .schema import MessageType


class MessageMutationDelete(graphene.Mutation):
    class Arguments:
        message_id = graphene.String()

    success = graphene.Boolean()
    errors = graphene.List(graphene.String)

    @staticmethod
    def mutate(root, info, **args):
        message_id = args.get('message_id')
        errors = []
        success = False

        if not message_id:
            errors.message_id('Message must be specified')

        if not errors:
            try:
                Message.objects.get(id=message_id).delete()
                success = True
            except Message.DoesNotExist:
                errors.append('Message with provided ID does not exist')

        return MessageMutationDelete(errors=errors, success=success)


class MessageCreateMutation(FormMutation):
    class Meta:
        form_class = MessageForm

    message = graphene.Field(lambda: MessageType)

    @classmethod
    def perform_mutate(cls, form, info):
        message = form.save()
        message_id = message.id
        message = Message.objects.get(id=message_id)

        room_id = form.data['room']
        room = Room.objects.get(id=room_id)
        room.last_message = message
        room.save()
        return cls(message=message)


class MessageUpdateMutation(FormMutation):
    class Meta:
        form_class = MessageForm

    message = graphene.Field(lambda: MessageType)

    @classmethod
    def perform_mutate(cls, form, info):
        message = Message.objects.get(id=form.cleaned_data.pop('message_id'))
        for key, value in form.cleaned_data.items():
            setattr(message, key, value)
        message.save()
        return cls(message=message)
