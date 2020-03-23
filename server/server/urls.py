from graphene_django.views import GraphQLView

from server.token_auth import TokenAuthMiddleware
from server.channels import GraphQLSubscriptionConsumer

from channels.routing import ProtocolTypeRouter, URLRouter
from channels.http import AsgiHandler
from channels.auth import AuthMiddlewareStack

from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from django.views.decorators.csrf import csrf_exempt


urlpatterns = [
    path('admin/', admin.site.urls),
    path('graphql/', csrf_exempt(GraphQLView.as_view(graphiql=True))),
    path('gql/', csrf_exempt(GraphQLView.as_view(batch=True))),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

application = ProtocolTypeRouter({
"websocket": TokenAuthMiddleware(
    URLRouter([
        path('subscriptions', GraphQLSubscriptionConsumer)
    ]),
),
})
