from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import UserSerializer, UserRegisterSerializer, ProfileSerializer

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        # Append detailed user info directly to response on login
        user_serializer = UserSerializer(self.user, context=self.context)
        data['user'] = user_serializer.data
        return data


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


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
            refresh_token = request.data.get("refresh")
            if not refresh_token:
                return Response({"detail": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "Logged out successfully"}, status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class LeaderboardView(APIView):
    """
    Public leaderboard view ranking users by accumulated loyalty points.
    """
    permission_classes = [AllowAny]

    def get(self, request):
        from .models import Profile
        from django.db.models import Count
        
        profiles = Profile.objects.select_related('user').annotate(
            trips_count=Count('user__trips')
        ).order_by('-loyalty_points')[:50]
        
        leaderboard_data = []
        for idx, profile in enumerate(profiles):
            avatar_url = None
            if profile.avatar:
                avatar_url = request.build_absolute_uri(profile.avatar.url)
                
            leaderboard_data.append({
                "rank": idx + 1,
                "username": profile.user.username,
                "loyalty_points": profile.loyalty_points,
                "avatar_url": avatar_url,
                "home_city": profile.home_city,
                "trips_count": profile.trips_count
            })
            
        return Response(leaderboard_data, status=status.HTTP_200_OK)

