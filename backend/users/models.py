from django.contrib.auth.models import AbstractUser
from django.db import models
from django.db.models.signals import post_save
from django.dispatch import receiver

class User(AbstractUser):
    email = models.EmailField(unique=True)
    
    # Use email as the unique identifier for logging in
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.email


class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    bio = models.TextField(max_length=500, blank=True)
    home_city = models.CharField(max_length=100, blank=True)
    travel_preference = models.CharField(max_length=100, blank=True, help_text="e.g. Solo, Couple, Family, Friends")
    loyalty_points = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile of {self.user.email}"

    def get_earned_badges(self):
        badges = []
        user = self.user
        trips = user.trips.all()
        trips_count = trips.count()

        # 1. Global Explorer
        badges.append({
            "id": "explorer",
            "name": "Global Explorer",
            "description": "Created 3 or more travel itineraries.",
            "icon": "🌍",
            "unlocked": trips_count >= 3
        })

        # 2. Budget Master
        has_budget_master = False
        for trip in trips:
            expenses_count = trip.expenses.count()
            total_spent = sum(float(exp.amount) for exp in trip.expenses.all())
            if expenses_count > 0 and total_spent <= float(trip.budget):
                has_budget_master = True
                break
        badges.append({
            "id": "budget_master",
            "name": "Budget Master",
            "description": "Log costs and stay under your total allocated budget.",
            "icon": "💰",
            "unlocked": has_budget_master
        })

        # 3. Flexible Nomad
        badges.append({
            "id": "flexible_replanner",
            "name": "Flexible Nomad",
            "description": "Adapt timelines in response to travel disruptions.",
            "icon": "⚡",
            "unlocked": self.loyalty_points >= 80
        })

        # 4. Memory Maker
        has_journal = False
        for trip in trips:
            if trip.journals.count() > 0:
                has_journal = True
                break
        badges.append({
            "id": "memory_maker",
            "name": "Memory Maker",
            "description": "Upload a photo and draft an AI visual journal story.",
            "icon": "📸",
            "unlocked": has_journal
        })

        return badges



# Signals to automatically create/save profile on user creation
@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    if not hasattr(instance, 'profile'):
        Profile.objects.create(user=instance)
    instance.profile.save()
