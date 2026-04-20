from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/resume/', include('resume.urls')),
    path('api/', include('ai_features.urls')),
    path('api/dashboard/', include('dashboard.urls')),
]
