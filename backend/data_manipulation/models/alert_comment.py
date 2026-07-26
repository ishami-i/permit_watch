from django.db import models
from .alert import Alert
from .user import User


class AlertComment(models.Model):
    alert = models.ForeignKey(Alert, on_delete=models.CASCADE, related_name="comment_set")
    author = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True, related_name="alert_comments"
    )
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

    def __str__(self):
        return f"Comment on Alert #{self.alert_id}"