from django.urls import path
from . import views

urlpatterns = [
    path('upload/', views.upload_resume, name='upload_resume'),
    path('parsed/', views.get_parsed_resume, name='parsed_resume'),
    path('delete/', views.delete_resume, name='delete_resume'),
]
