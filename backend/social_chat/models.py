from django.db import models
from django.conf import settings

class ChatMessage(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='chat_messages')
    recipient = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='received_messages')
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    is_flagged = models.BooleanField(default=False)
    is_private = models.BooleanField(default=False)

    class Meta:
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.user.username}: {self.content[:20]}"
