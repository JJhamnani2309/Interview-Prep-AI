from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from ai_features.models import MCQHistory, HRHistory
from django.db.models import Avg


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_history(request):
    user = request.user

    mcq_entries = MCQHistory.objects.filter(user=user).order_by('-created_at')
    mcq_history = list(mcq_entries.values('id', 'score', 'total', 'skills', 'created_at'))

    hr_entries = HRHistory.objects.filter(user=user).order_by('-created_at')
    hr_history = list(hr_entries.values('id', 'question', 'answer', 'score', 'feedback', 'created_at'))

    mcq_count = mcq_entries.count()
    hr_count = hr_entries.count()

    avg_mcq = mcq_entries.aggregate(avg=Avg('score'))['avg'] or 0
    avg_hr = hr_entries.aggregate(avg=Avg('score'))['avg'] or 0

    stats = {
        'total_sessions': mcq_count + hr_count,
        'average_mcq_score': round(avg_mcq, 2),
        'average_hr_score': round(avg_hr, 2),
    }

    return Response({
        'mcq_history': mcq_history,
        'hr_history': hr_history,
        'stats': stats,
    })
