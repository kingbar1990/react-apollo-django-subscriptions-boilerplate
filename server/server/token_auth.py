import re 
from channels.auth import AuthMiddlewareStack

from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from django.db import close_old_connections

from graphql_jwt import utils


class TokenAuthMiddleware:
    """ Middleware to handle user that is connecting to websocket """
    def __init__(self, inner):
        self.inner = inner

    def __call__(self, scope):
        """ Return user(or AnonymousUser) that tries to connect to websockets """
        headers = dict(scope['headers'])
        user = None
        if b'cookie' in headers:
            cookie = headers[b'cookie'].decode("utf-8")
            result = re.search(r'authorization=[\w.-]+', cookie)
            if result:
                token = result.group(0).split('=')[1]
                email = utils.jwt_decode(token)['email']
                user = get_user_model().objects.get(email=email)
        if user:
            scope['user'] = user
        else:
            scope['user'] = AnonymousUser()
        return self.inner(scope)

TokenAuthMiddlewareStack = lambda inner: TokenAuthMiddleware(AuthMiddlewareStack(inner))