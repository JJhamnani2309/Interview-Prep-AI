from django.urls import path
from . import views

urlpatterns = [
    path('history/', views.get_history, name='get_history'),
]
