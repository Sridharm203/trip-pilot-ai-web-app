import uuid
from django.db import models
from django.conf import settings

class Trip(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='trips')
    destination = models.CharField(max_length=255)
    budget = models.DecimalField(max_digits=12, decimal_places=2)
    start_date = models.DateField()
    end_date = models.DateField()
    num_travelers = models.PositiveIntegerField(default=1)
    travel_type = models.CharField(max_length=100, default='Solo') # Solo, Couple, Friends, Family
    interests = models.JSONField(default=list, blank=True) # e.g. ["Adventure", "Food", "History"]
    
    # AI-Generated Sections
    summary = models.TextField(blank=True)
    itinerary = models.JSONField(default=list, blank=True)
    hotels = models.JSONField(default=list, blank=True)
    restaurants = models.JSONField(default=list, blank=True)
    transport = models.JSONField(default=list, blank=True)
    things_to_do = models.JSONField(default=list, blank=True)
    travel_tips = models.JSONField(default=list, blank=True)
    packing_list = models.JSONField(default=list, blank=True)

    # Sharing UUID Token
    share_token = models.UUIDField(default=uuid.uuid4, unique=True, editable=False)

    is_public = models.BooleanField(default=False)
    likes = models.ManyToManyField(settings.AUTH_USER_MODEL, related_name='liked_trips', blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_date']

    def __str__(self):
        return f"Trip to {self.destination} by {self.user.email}"


class Expense(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='expenses')
    category = models.CharField(max_length=100) # Food, Transport, Hotel, Shopping, Entertainment, Emergency
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    description = models.CharField(max_length=255, blank=True)
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.category}: ${self.amount} for trip {self.trip.id}"


class JournalEntry(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='journals')
    title = models.CharField(max_length=255)
    content = models.TextField(blank=True) # AI-generated Travel Story
    image = models.ImageField(upload_to='journals/', null=True, blank=True)
    caption = models.CharField(max_length=255, blank=True) # AI-generated photo caption
    summary = models.TextField(blank=True) # AI-generated trip summary entry
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Journal entry '{self.title}' for trip {self.trip.id}"

