from django.db import models

class GlobalEvent(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(default="No description")
    location = models.CharField(max_length=255, default="Unknown")
    event_type = models.CharField(max_length=255, null=True, blank=True)
    date = models.DateTimeField()
    trending_score = models.FloatField()

    def __str__(self):
        return self.title

    def is_upcoming(self):
        """Check if the event is upcoming in the next 10 days"""
        return self.date >= timezone.now() and self.date <= timezone.now() + timedelta(days=10)

    def get_event_priority_score(self):
        """Return an adjusted score based on event type and proximity."""
        if self.event_type in ['Holiday', 'Weather']:
            # Boost the trending score for holidays and weather-related events
            return self.trending_score + 50
        return self.trending_score
