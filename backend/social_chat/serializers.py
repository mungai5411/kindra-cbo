from rest_framework import serializers
from .models import ChatMessage
from django.contrib.auth import get_user_model

User = get_user_model()

class ChatUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'role', 'profile_picture']

class ChatMessageSerializer(serializers.ModelSerializer):
    user = ChatUserSerializer(read_only=True)
    recipient_detail = ChatUserSerializer(source='recipient', read_only=True)
    is_sender = serializers.SerializerMethodField()

    class Meta:
        model = ChatMessage
        fields = ['id', 'user', 'recipient', 'recipient_detail', 'content', 'timestamp', 'is_flagged', 'is_sender', 'is_private']
        read_only_fields = ['id', 'user', 'timestamp', 'is_flagged', 'is_sender']

    def get_is_sender(self, obj):
        request = self.context.get('request')
        if request and request.user:
            return obj.user.id == request.user.id
        return False
