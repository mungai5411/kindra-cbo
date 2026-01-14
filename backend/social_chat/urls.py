from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MessageViewSet

router = DefaultRouter()
router.register(r'messages', MessageViewSet)

urlpatterns = [
    path('messages/users/', MessageViewSet.as_view({'get': 'users'}), name='chat-users'),
    path('', include(router.urls)),
]
