from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model, authenticate
from rest_framework.authtoken.models import Token

from .serializers import UserSerializer, UserRegisterSerializer, ProfileSerializer

User = get_user_model()


class CustomObtainAuthToken(APIView):
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if not email or not password:
            return Response({"detail": "Both email and password are required."}, status=status.HTTP_400_BAD_REQUEST)
            
        user = authenticate(request, username=email, password=password)
        if not user:
            return Response({"detail": "Invalid email or password"}, status=status.HTTP_400_BAD_REQUEST)
            
        token, created = Token.objects.get_or_create(user=user)
        user_serializer = UserSerializer(user, context={'request': request})
        return Response({
            "token": token.key,
            "user": user_serializer.data
        }, status=status.HTTP_200_OK)


class RegisterView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = UserRegisterSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user_serializer = UserSerializer(user, context={'request': request})
            return Response({
                "message": "User registered successfully",
                "user": user_serializer.data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user, context={'request': request})
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        profile = getattr(user, 'profile', None)
        
        # Parse data to update both User first_name/last_name and Profile details
        user_serializer = UserSerializer(user, data=request.data, partial=True)
        profile_serializer = ProfileSerializer(profile, data=request.data, partial=True, context={'request': request})
        
        if user_serializer.is_valid() and profile_serializer.is_valid():
            user_serializer.save()
            profile_serializer.save()
            user.refresh_from_db()
            fresh_serializer = UserSerializer(user, context={'request': request})
            return Response(fresh_serializer.data, status=status.HTTP_200_OK)
        
        errors = {}
        errors.update(user_serializer.errors)
        errors.update(profile_serializer.errors)
        return Response(errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            if hasattr(request, 'auth') and request.auth:
                request.auth.delete()
            return Response({"detail": "Logged out successfully"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


