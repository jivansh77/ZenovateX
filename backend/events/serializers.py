from rest_framework import serializers
from .models import GlobalEvent

class GlobalEventSerializer(serializers.ModelSerializer):
    class Meta:
        model = GlobalEvent
        fields = ['id', 'title', 'description', 'location', 'event_type', 'date', 'trending_score']
