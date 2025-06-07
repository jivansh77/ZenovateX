from django.core.management.base import BaseCommand
from events.models import GlobalEvent
from events.utils import fetch_trending_events

class Command(BaseCommand):
    help = 'Fetch trending events from Google Trends and save to database'

    def handle(self, *args, **kwargs):
        # Fetch events for India from Google Trends
        events = fetch_trending_events()

        # Iterate through fetched events and save to the database
        for event in events:
            GlobalEvent.objects.get_or_create(
                title=event['title'],
                description=event['description'],
                location=event['location'],  # Location is now set as India
                trending_score=event['trending_score']
            )

        self.stdout.write(self.style.SUCCESS('Successfully fetched and stored events'))
