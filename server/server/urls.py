from channels.routing import ProtocolTypeRouter, URLRouter
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import path
from django.views.decorators.csrf import csrf_exempt
from graphene_django.views import GraphQLView

from .django_channels import GraphQLSubscriptionConsumer

urlpatterns = [
    path('admin/', admin.site.urls),
    path('graphql/', csrf_exempt(GraphQLView.as_view(graphiql=True))),
    path('gql/', csrf_exempt(GraphQLView.as_view(batch=True))),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)


websocket_urlpatterns = [path("subscriptions", GraphQLSubscriptionConsumer)]

application = ProtocolTypeRouter(
    {"websocket": URLRouter(websocket_urlpatterns)})
