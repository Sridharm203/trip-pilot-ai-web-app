from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TripViewSet, SharedTripView, ExpenseViewSet

router = DefaultRouter()
router.register(r'expenses', ExpenseViewSet, basename='expense')
router.register(r'', TripViewSet, basename='trip')

urlpatterns = [
    # Public route to fetch shared trips
    path('share/<uuid:share_token>/', SharedTripView.as_view(), name='shared_trip_detail'),
    path('', include(router.urls)),
]
