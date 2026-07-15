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
    Main ViewSet to handle all Trip operations.
    Keeps all original API paths and frontend compatibility intact.
    """
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Explicit query filtering for security
        current_user = self.request.user
        return Trip.objects.filter(user=current_user)

    def get_serializer_class(self):
        # Simplified if-else block to check current view action
        if self.action == 'list':
            return TripListSerializer
        else:
            return TripDetailSerializer

    def create(self, request, *args, **kwargs):
        # Step 1: Validate frontend request data using input serializer
        input_serializer = TripCreateInputSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        validated_data = input_serializer.validated_data

        # Step 2: Call Gemini API wrapper from gemini_service
        ai_data = generate_trip_itinerary(
            destination=validated_data['destination'],
            budget=validated_data['budget'],
            start_date=validated_data['start_date'],
            end_date=validated_data['end_date'],
            num_travelers=validated_data['num_travelers'],
            travel_type=validated_data['travel_type'],
            interests=validated_data['interests']
        )

        # Step 3: Extract fields cleanly with explicit defaults
        trip_summary = ai_data.get('summary', '')
        trip_itinerary = ai_data.get('itinerary', [])
        trip_hotels = ai_data.get('hotels', [])
        trip_restaurants = ai_data.get('restaurants', [])
        trip_transport = ai_data.get('transport', [])
        trip_things = ai_data.get('things_to_do', [])
        trip_tips = ai_data.get('travel_tips', [])

        # Step 4: Create the Trip database object
        trip = Trip.objects.create(
            user=request.user,
            destination=validated_data['destination'],
            budget=validated_data['budget'],
            start_date=validated_data['start_date'],
            end_date=validated_data['end_date'],
            num_travelers=validated_data['num_travelers'],
            travel_type=validated_data['travel_type'],
            interests=validated_data['interests'],
            summary=trip_summary,
            itinerary=trip_itinerary,
            hotels=trip_hotels,
            restaurants=trip_restaurants,
            transport=trip_transport,
            things_to_do=trip_things,
            travel_tips=trip_tips,
            packing_list=[]
        )

        # Step 5: Process packing checklist duration
        time_delta = trip.end_date - trip.start_date
        days = max(1, time_delta.days + 1)
        
        from .gemini_service import generate_packing_checklist
        trip.packing_list = generate_packing_checklist(trip.destination, days, trip.travel_type)
        trip.save()


        # Step 7: Return final response formatted for React
        output_serializer = TripDetailSerializer(trip, context={'request': request})
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'], url_path='duplicate')
    def duplicate(self, request, pk=None):
        original = self.get_object()
        
        # Clone object with basic assignments
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


        serializer = TripDetailSerializer(cloned, context={'request': request})
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], url_path='weather', permission_classes=[AllowAny])
    def weather(self, request):
        city = request.query_params.get('city')
        if not city:
            return Response({"detail": "City query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)
        
        from .weather_service import get_weather_forecast
        forecast = get_weather_forecast(city)
        return Response(forecast, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='replan')
    def replan(self, request, pk=None):
        trip = self.get_object()
        disruption_type = request.data.get('disruption_type')
        details = request.data.get('details', '')

        if not disruption_type:
            return Response({"detail": "Disruption type is required."}, status=status.HTTP_400_BAD_REQUEST)

        from .gemini_service import replan_itinerary
        replanned = replan_itinerary(trip.itinerary, trip.budget, disruption_type, details)

        trip.itinerary = replanned.get('itinerary', trip.itinerary)
        trip.budget = replanned.get('budget', trip.budget)
        trip.save()


        serializer = TripDetailSerializer(trip, context={'request': request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['patch'], url_path='packing-update')
    def packing_update(self, request, pk=None):
        trip = self.get_object()
        packing_list = request.data.get('packing_list')
        
        if packing_list is None:
            return Response({"detail": "Packing list array is required."}, status=status.HTTP_400_BAD_REQUEST)

        trip.packing_list = packing_list
        trip.save()
        return Response({"status": "packing list updated", "packing_list": trip.packing_list}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='ask-guide', permission_classes=[AllowAny])
    def ask_guide(self, request, pk=None):
        trip = Trip.objects.filter(pk=pk).first()
        if not trip:
            return Response({"detail": "Trip not found."}, status=status.HTTP_404_NOT_FOUND)
        
        query = request.data.get('query')
        if not query:
            return Response({"detail": "Query parameter is required."}, status=status.HTTP_400_BAD_REQUEST)

        from .gemini_service import ask_local_guide
        guide_response = ask_local_guide(trip.destination, trip.travel_type, query)
        return Response({"response": guide_response}, status=status.HTTP_200_OK)



    @action(detail=True, methods=['get'], url_path='analyze-expenses')
    def analyze_expenses(self, request, pk=None):
        trip = self.get_object()
        expenses = trip.expenses.all()
        
        expense_list = []
        for exp in expenses:
            expense_list.append({
                "category": exp.category,
                "amount": float(exp.amount),
                "description": exp.description
            })

        from .gemini_service import analyze_budget_expenses
        analysis = analyze_budget_expenses(trip.budget, expense_list)
        return Response({"analysis": analysis}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get', 'post'], url_path='journal')
    def journal(self, request, pk=None):
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

            image_data = None
            if image_file:
                image_data = image_file.read()
                image_file.seek(0)

            from .gemini_service import generate_journal_story
            ai_narrative = generate_journal_story(trip.destination, title, image_data)

            entry = JournalEntry.objects.create(
                trip=trip,
                title=title,
                image=image_file,
                content=ai_narrative.get('content', ''),
                caption=ai_narrative.get('caption', ''),
                summary=ai_narrative.get('summary', '')
            )

            serializer = JournalEntrySerializer(entry, context={'request': request})
            return Response(serializer.data, status=status.HTTP_201_CREATED)


class SharedTripView(APIView):
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
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        current_user = self.request.user
        return Expense.objects.filter(trip__user=current_user)