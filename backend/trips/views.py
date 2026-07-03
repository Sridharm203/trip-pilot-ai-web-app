from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated, AllowAny

from .models import Trip, Expense, JournalEntry
from .serializers import TripDetailSerializer, TripListSerializer, TripCreateInputSerializer, ExpenseSerializer, JournalEntrySerializer
from .gemini_service import generate_trip_itinerary

class TripViewSet(viewsets.ModelViewSet):
    """
    ViewSet to handle CRUD operations on Trips.
    Requires authentication. Overrides create to run Gemini generation.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Trip.objects.filter(user=self.request.user)

    def get_serializer_class(self):
        if self.action == 'list':
            return TripListSerializer
        return TripDetailSerializer

    def create(self, request, *args, **kwargs):
        # Validate incoming planner options
        input_serializer = TripCreateInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        validated_data = input_serializer.validated_data

        # Request Gemini structured itinerary
        ai_data = generate_trip_itinerary(
            destination=validated_data['destination'],
            budget=validated_data['budget'],
            start_date=validated_data['start_date'],
            end_date=validated_data['end_date'],
            num_travelers=validated_data['num_travelers'],
            travel_type=validated_data['travel_type'],
            interests=validated_data['interests']
        )

        # Assemble and persist Trip object
        trip = Trip.objects.create(
            user=request.user,
            destination=validated_data['destination'],
            budget=validated_data['budget'],
            start_date=validated_data['start_date'],
            end_date=validated_data['end_date'],
            num_travelers=validated_data['num_travelers'],
            travel_type=validated_data['travel_type'],
            interests=validated_data['interests'],
            summary=ai_data.get('summary', ''),
            itinerary=ai_data.get('itinerary', []),
            hotels=ai_data.get('hotels', []),
            restaurants=ai_data.get('restaurants', []),
            transport=ai_data.get('transport', []),
            things_to_do=ai_data.get('things_to_do', []),
            travel_tips=ai_data.get('travel_tips', []),
            packing_list=[]
        )

        # Generate custom packing checklist based on destination weather & days
        days = max(1, (trip.end_date - trip.start_date).days + 1)
        from .gemini_service import generate_packing_checklist
        trip.packing_list = generate_packing_checklist(trip.destination, days, trip.travel_type)
        trip.save()

        # Reward users with travel loyalty points!
        profile = getattr(request.user, 'profile', None)
        if profile:
            profile.loyalty_points += 50
            profile.save()

        output_serializer = TripDetailSerializer(trip, context={'request': request})
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='duplicate')
    def duplicate(self, request, pk=None):
        """
        Clones an existing trip and suffixes the destination name.
        """
        original = self.get_object()
        cloned = Trip.objects.create(
            user=request.user,
            destination=f"{original.destination} (Copy)",
            budget=original.budget,
            start_date=original.start_date,
            end_date=original.end_date,
            num_travelers=original.num_travelers,
            travel_type=original.travel_type,
            interests=original.interests,
            summary=original.summary,
            itinerary=original.itinerary,
            hotels=original.hotels,
            restaurants=original.restaurants,
            transport=original.transport,
            things_to_do=original.things_to_do,
            travel_tips=original.travel_tips
        )

        # Add bonus points for duplicating/re-planning!
        profile = getattr(request.user, 'profile', None)
        if profile:
            profile.loyalty_points += 20
            profile.save()

        serializer = TripDetailSerializer(cloned, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='weather', permission_classes=[AllowAny])
    def weather(self, request):
        """
        Retrieves the 7-day weather forecast for a specified city name.
        """
        city = request.query_params.get('city')
        if not city:
            return Response({"detail": "City query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        from .weather_service import get_weather_forecast
        forecast = get_weather_forecast(city)
        return Response(forecast, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='replan')
    def replan(self, request, pk=None):
        """
        Re-plans the trip itinerary and budget in response to a travel disruption.
        """
        trip = self.get_object()
        disruption_type = request.data.get('disruption_type') # heavy_rain, budget_exceeded, place_closed
        details = request.data.get('details', '')

        if not disruption_type:
            return Response({"detail": "Disruption type is required."}, status=status.HTTP_400_BAD_REQUEST)

        from .gemini_service import replan_itinerary
        replanned = replan_itinerary(trip.itinerary, trip.budget, disruption_type, details)

        trip.itinerary = replanned.get('itinerary', trip.itinerary)
        trip.budget = replanned.get('budget', trip.budget)
        trip.save()

        # Award points for flexible replanning!
        profile = getattr(request.user, 'profile', None)
        if profile:
            profile.loyalty_points += 30
            profile.save()

        serializer = TripDetailSerializer(trip, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='packing-update')
    def packing_update(self, request, pk=None):
        """
        Updates the packed status of checklist items.
        """
        trip = self.get_object()
        packing_list = request.data.get('packing_list')
        
        if packing_list is None:
            return Response({"detail": "Packing list array is required."}, status=status.HTTP_400_BAD_REQUEST)

        trip.packing_list = packing_list
        trip.save()
        return Response({"status": "packing list updated", "packing_list": trip.packing_list}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='ask-guide', permission_classes=[AllowAny])
    def ask_guide(self, request, pk=None):
        """
        Submits queries to the AI Local Guide with context of the current trip destination.
        """
        trip = Trip.objects.filter(pk=pk).first()
        if not trip:
            return Response({"detail": "Trip not found."}, status=status.HTTP_404_NOT_FOUND)
        query = request.data.get('query')

        if not query:
            return Response({"detail": "Query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        from .gemini_service import ask_local_guide
        guide_response = ask_local_guide(trip.destination, trip.travel_type, query)
        return Response({"response": guide_response}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='feed', permission_classes=[AllowAny])
    def feed(self, request):
        """
        Retrieves all public itineraries shared with the community.
        """
        trips = Trip.objects.filter(is_public=True).select_related('user').order_by('-created_at')
        
        feed_data = []
        for trip in trips:
            feed_data.append({
                "id": trip.id,
                "destination": trip.destination,
                "budget": float(trip.budget),
                "start_date": trip.start_date,
                "end_date": trip.end_date,
                "travel_type": trip.travel_type,
                "summary": trip.summary,
                "owner_username": trip.user.username,
                "likes_count": trip.likes.count(),
                "liked_by_user": request.user.is_authenticated and trip.likes.filter(id=request.user.id).exists(),
                "share_token": str(trip.share_token)
            })
        return Response(feed_data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='like')
    def like_trip(self, request, pk=None):
        """
        Toggles like votes for shared itineraries and rewards loyalty points to authors.
        """
        # Resolve Trip directly to bypass ownership filter since users like other people's trips
        trip = Trip.objects.filter(pk=pk, is_public=True).first()
        if not trip:
            return Response({"detail": "Public trip not found."}, status=status.HTTP_404_NOT_FOUND)

        user = request.user
        if trip.likes.filter(id=user.id).exists():
            trip.likes.remove(user)
            liked = False
        else:
            trip.likes.add(user)
            liked = True
            
            # Reward authors 10 loyalty points for upvoted itineraries
            author_profile = getattr(trip.user, 'profile', None)
            if author_profile and trip.user != user:
                author_profile.loyalty_points += 10
                author_profile.save()

        return Response({"liked": liked, "likes_count": trip.likes.count()}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='publish')
    def publish_trip(self, request, pk=None):
        """
        Toggles private vs community feed visibility of an itinerary.
        """
        trip = self.get_object()
        trip.is_public = not trip.is_public
        trip.save()

        # Reward users 20 points for publishing itineraries!
        if trip.is_public:
            profile = getattr(request.user, 'profile', None)
            if profile:
                profile.loyalty_points += 20
                profile.save()

        return Response({"is_public": trip.is_public}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='clone')
    def clone_trip(self, request, pk=None):
        """
        Copies community-shared public itineraries directly to the user's dashboard.
        """
        trip = Trip.objects.filter(pk=pk, is_public=True).first()
        if not trip:
            return Response({"detail": "Public trip not found."}, status=status.HTTP_404_NOT_FOUND)

        cloned_trip = Trip.objects.create(
            user=request.user,
            destination=trip.destination,
            budget=trip.budget,
            start_date=trip.start_date,
            end_date=trip.end_date,
            num_travelers=trip.num_travelers,
            travel_type=trip.travel_type,
            interests=trip.interests,
            summary=trip.summary,
            itinerary=trip.itinerary,
            hotels=trip.hotels,
            restaurants=trip.restaurants,
            transport=trip.transport,
            things_to_do=trip.things_to_do,
            travel_tips=trip.travel_tips,
            packing_list=trip.packing_list
        )

        # Reward loyalty points for copying itineraries!
        profile = getattr(request.user, 'profile', None)
        if profile:
            profile.loyalty_points += 15
            profile.save()

        serializer = TripDetailSerializer(cloned_trip, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)


    @action(detail=True, methods=['get'], url_path='analyze-expenses')
    def analyze_expenses(self, request, pk=None):
        """
        Audits all expenses logged for a trip and suggests savings options via Gemini.
        """
        trip = self.get_object()
        expenses = trip.expenses.all()
        expense_list = [{"category": exp.category, "amount": float(exp.amount), "description": exp.description} for exp in expenses]

        from .gemini_service import analyze_budget_expenses
        analysis = analyze_budget_expenses(trip.budget, expense_list)
        return Response({"analysis": analysis}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get', 'post'], url_path='journal')
    def journal(self, request, pk=None):
        """
        Retrieves or creates travel journal entry logs.
        On creation, parses uploaded photos using Gemini multimodal prompting.
        """
        trip = self.get_object()

        if request.method == 'GET':
            entries = trip.journals.all()
            serializer = JournalEntrySerializer(entries, many=True, context={'request': request})
            return Response(serializer.data)

        elif request.method == 'POST':
            title = request.data.get('title')
            image_file = request.FILES.get('image')

            if not title:
                return Response({"detail": "Title is required."}, status=status.HTTP_400_BAD_REQUEST)

            # Extract image bytes for Gemini multimodal vision checks
            image_data = None
            if image_file:
                image_data = image_file.read()
                image_file.seek(0) # reset seek pointer so django file-uploader can save normally

            from .gemini_service import generate_journal_story
            ai_narrative = generate_journal_story(trip.destination, title, image_data)

            # Persist to database
            entry = JournalEntry.objects.create(
                trip=trip,
                title=title,
                image=image_file,
                content=ai_narrative.get('content', ''),
                caption=ai_narrative.get('caption', ''),
                summary=ai_narrative.get('summary', '')
            )

            # Award bonus points for journaling!
            profile = getattr(request.user, 'profile', None)
            if profile:
                profile.loyalty_points += 40
                profile.save()

            serializer = JournalEntrySerializer(entry, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)


class SharedTripView(APIView):
    """
    Public read-only view to retrieve trip details using a share token.
    Authentication is NOT required.
    """
    permission_classes = [AllowAny]

    def get(self, request, share_token):
        try:
            trip = Trip.objects.get(share_token=share_token)
            serializer = TripDetailSerializer(trip, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except (Trip.DoesNotExist, ValueError):
            return Response(
                {"detail": "Trip not found or share link has expired."}, 
                status=status.HTTP_404_NOT_FOUND
            )


class ExpenseViewSet(viewsets.ModelViewSet):
    """
    ModelViewSet to handle CRUD operations on Trip Expenses.
    """
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Expense.objects.filter(trip__user=self.request.user)

