from django.urls import path
from . import views

urlpatterns = [
    path('mcq/generate/', views.generate_mcqs, name='generate_mcqs'),
    path('mcq/filter-skills/', views.filter_skills, name='filter_skills'),
    path('mcq/submit/', views.submit_mcqs, name='submit_mcqs'),
    path('ats/check/', views.check_ats, name='check_ats'),
    path('hr/question/', views.hr_question, name='hr_question'),
    path('hr/submit/', views.hr_submit, name='hr_submit'),
]
