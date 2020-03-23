import asyncio
import json
from inspect import isawaitable
from graphene_django.settings import graphene_settings

from django.core import serializers
from django.utils.functional import Promise
from django.conf import settings
from django.contrib.auth import get_user_model

from channels.generic.websocket import AsyncJsonWebsocketConsumer
from channels.db import database_sync_to_async

from graphql.execution.executors.asyncio import AsyncioExecutor
from graphql_ws_django.observable_aiter import setup_observable_extension
from graphql_ws_django.base import (
    BaseConnectionContext,
    BaseSubscriptionServer,
    ConnectionClosedException
)
from graphql_ws_django.constants import (
    GQL_COMPLETE, GQL_CONNECTION_ACK,
    GQL_CONNECTION_ERROR
)


setup_observable_extension()


class JSONPromiseEncoder(json.JSONEncoder):
    def encode(self, *args, **kwargs):
        self.pending_promises = []
        return super(JSONPromiseEncoder, self).encode(*args, **kwargs)

    def default(self, o):
        if isinstance(o, Promise):
            if o.is_pending:
                self.pending_promises.append(o)
            return o.value
        return super(JSONPromiseEncoder, self).default(o)


class ChannelsConnectionContext(BaseConnectionContext):
    async def send(self, data):
        await self.ws.send_json(data)

    async def close(self, code):
        await self.ws.close(code=code)


class ChannelsSubscriptionServer(BaseSubscriptionServer):
    def get_graphql_params(self, connection_context, payload):
        payload["context"] = connection_context.request_context
        params = super(ChannelsSubscriptionServer, self).get_graphql_params(
            connection_context, payload
        )
        return dict(params, return_promise=True, executor=AsyncioExecutor())

    async def handle(self, ws, request_context=None):
        connection_context = ChannelsConnectionContext(ws, request_context)
        await self.on_open(connection_context)
        return connection_context

    async def send_message(
        self, connection_context, op_id=None, op_type=None, payload=None
    ):
        message = {}
        if op_id is not None:
            message["id"] = op_id
        if op_type is not None:
            message["type"] = op_type
        if payload is not None:
            message["payload"] = payload

        assert message, "You need to send at least one thing"
        return await connection_context.send(message)

    async def on_open(self, connection_context):
        pass

    async def on_connect(self, connection_context, payload):
        pass

    async def on_connection_init(self, connection_context, op_id, payload):
        try:
            await self.on_connect(connection_context, payload)
            await self.send_message(connection_context, op_type=GQL_CONNECTION_ACK)
        except Exception as e:
            await self.send_error(connection_context, op_id, e, GQL_CONNECTION_ERROR)
            await connection_context.close(1011)

    async def on_start(self, connection_context, op_id, params):
        execution_result = self.execute(
            connection_context.request_context, params)

        if isawaitable(execution_result):
            execution_result = await execution_result

        if hasattr(execution_result, "__aiter__"):
            iterator = await execution_result.__aiter__()
            connection_context.register_operation(op_id, iterator)
            async for single_result in iterator:
                if not connection_context.has_operation(op_id):
                    break
                await self.send_execution_result(
                    connection_context, op_id, single_result
                )
        else:
            await self.send_execution_result(
                connection_context, op_id, execution_result
            )
        await self.on_operation_complete(connection_context, op_id)

    async def on_close(self, connection_context):
        unsubscribes = [
            self.unsubscribe(connection_context, op_id)
            for op_id in connection_context.operations
        ]
        if unsubscribes:
            await asyncio.wait(unsubscribes)

    async def on_stop(self, connection_context, op_id):
        await self.unsubscribe(connection_context, op_id)

    async def unsubscribe(self, connection_context, op_id):
        if connection_context.has_operation(op_id):
            op = connection_context.get_operation(op_id)
            op.dispose()
            connection_context.remove_operation(op_id)
        await self.on_operation_complete(connection_context, op_id)

    async def on_operation_complete(self, connection_context, op_id):
        await self.send_message(connection_context, op_id, GQL_COMPLETE)


subscription_server = ChannelsSubscriptionServer(
    schema=graphene_settings.SCHEMA
)


class GraphQLSubscriptionConsumer(AsyncJsonWebsocketConsumer):
    async def connect(self):
        """ 
        Authenticate websocket after connection if user is authenticated
        and change his/her status to Online
        """
        await self.accept(subprotocol='graphql-ws')
        await self.channel_layer.group_add("online_users", self.channel_name)

        self.subscription_server = ChannelsSubscriptionServer(
            schema=graphene_settings.SCHEMA
        )
        self.connection_context = await self.subscription_server.handle(
            ws=self, request_context=self.scope
        )

        user = self.scope['user']
        if user.is_authenticated:
            await self.update_user_status(user,True)
            await self.send_status()

    async def disconnect(self, content):
        """ Disconnect user and change his/her status to Offline """
        await self.channel_layer.group_discard("online_users", self.channel_name)
        if self.connection_context:
            await subscription_server.on_close(self.connection_context)
        
        user = self.scope['user']
        if user.is_authenticated:
            await self.update_user_status(user,False)
            await self.send_status()


    async def receive_json(self, content):
        asyncio.ensure_future(
            subscription_server.on_message(self.connection_context, content)
        )


    async def send_status(self):
        """ Send updated info about users' statuses to public Websocket channel """
        users = serializers.serialize('json', get_user_model().objects.all())
        await self.channel_layer.group_send(
            'online_users',
            {
                "type": "user_update",
                "event": "Change Status",
                "users": users
            }
        )

    @classmethod
    async def encode_json(cls, content):
        json_promise_encoder = JSONPromiseEncoder()
        e = json_promise_encoder.encode(content)
        while json_promise_encoder.pending_promises:
            await asyncio.wait(json_promise_encoder.pending_promises)
            e = json_promise_encoder.encode(content)
        return e


    async def user_update(self, event):
        await self.send_json(event)

    @database_sync_to_async
    def update_user_status(self, user,status):
        return get_user_model().objects.filter(pk=user.pk).update(online=status)