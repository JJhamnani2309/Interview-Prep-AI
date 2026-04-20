from django.db import models
from django.contrib.auth.models import User


class MCQHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='mcq_history')
    score = models.IntegerField(default=0)
    total = models.IntegerField(default=10)
    skills = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - {self.score}/{self.total}"


class ATSHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ats_history')
    score = models.IntegerField(default=0)
    tips = models.JSONField(default=list)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - ATS {self.score}"


class HRHistory(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hr_history')
    question = models.TextField(default='')
    answer = models.TextField(default='')
    score = models.IntegerField(default=0)
    feedback = models.TextField(default='')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} - HR {self.score}/10"
