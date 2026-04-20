from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken


def get_tokens_for_user(user):
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }


@api_view(['POST'])
@permission_classes([AllowAny])
def signup(request):
    email = request.data.get('email')
    password = request.data.get('password')
    name = request.data.get('name', '')

    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=400)

    if User.objects.filter(username=email).exists():
        return Response({'error': 'Email already exists'}, status=400)

    user = User.objects.create_user(
        username=email,
        email=email,
        password=password,
        first_name=name,
    )

    tokens = get_tokens_for_user(user)

    return Response({
        'message': 'User created successfully',
        'tokens': tokens,
        'user': {'email': email, 'name': name},
    }, status=201)


@api_view(['POST'])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get('email')
    password = request.data.get('password')

    if not email or not password:
        return Response({'error': 'Email and password are required'}, status=400)

    user = authenticate(username=email, password=password)

    if not user:
        return Response({'error': 'Invalid credentials'}, status=401)

    tokens = get_tokens_for_user(user)

    return Response({
        'message': 'Login successful',
        'tokens': tokens,
        'user': {'email': email, 'name': user.first_name},
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    return Response({
        'email': request.user.email,
        'id': request.user.id,
    })
