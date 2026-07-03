from rest_framework import serializers
from .models import Trip, Expense, JournalEntry

class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = '__all__'


class JournalEntrySerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = JournalEntry
        fields = ['id', 'trip', 'title', 'content', 'image', 'image_url', 'caption', 'summary', 'created_at']
        read_only_fields = ['content', 'caption', 'summary', 'created_at']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class TripListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trip
        fields = [
            'id', 'destination', 'budget', 'start_date', 'end_date', 
            'num_travelers', 'travel_type', 'share_token', 'packing_list', 'created_at'
        ]


class TripDetailSerializer(serializers.ModelSerializer):
    expenses = ExpenseSerializer(many=True, read_only=True)
    journals = JournalEntrySerializer(many=True, read_only=True)

    class Meta:
        model = Trip
        fields = '__all__'
        read_only_fields = ['user', 'share_token', 'created_at', 'updated_at']


class TripCreateInputSerializer(serializers.Serializer):
    destination = serializers.CharField(max_length=255, required=True)
    budget = serializers.DecimalField(max_digits=12, decimal_places=2, required=True)
    start_date = serializers.DateField(required=True)
    end_date = serializers.DateField(required=True)
    num_travelers = serializers.IntegerField(default=1, min_value=1)
    travel_type = serializers.CharField(max_length=100, default='Solo')
    interests = serializers.ListField(child=serializers.CharField(max_length=100), required=False, default=list)

    def validate(self, data):
        if data['start_date'] > data['end_date']:
            raise serializers.ValidationError("End date cannot be earlier than start date.")
        return data
