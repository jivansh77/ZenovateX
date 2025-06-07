from rest_framework.response import Response
from rest_framework.decorators import api_view
from datetime import datetime
from events.models import GlobalEvent
from .serializers import GlobalEventSerializer
import pytz  # To handle timezone
from rest_framework import status
import google.generativeai as genai
from django.conf import settings
import os

@api_view(['GET'])
def get_trending_events(request):
    # Fetch all events
    events = GlobalEvent.objects.all()

    # Sort events by priority score
    sorted_events = sorted(events, key=lambda x: (
        x.get_event_priority_score(),
        # Convert event date to naive datetime (if it's aware, remove tzinfo)
        x.date.replace(tzinfo=None) if x.date.tzinfo else x.date
    ), reverse=True)

    # Serialize the events
    serializer = GlobalEventSerializer(sorted_events, many=True)
    return Response(serializer.data)

@api_view(['POST'])
def generate_content(request):
    try:
        event = request.data.get('event')
        if not event:
            return Response({'error': 'Event data is required'}, status=status.HTTP_400_BAD_REQUEST)

        # Configure Gemini API
        api_key = os.getenv('GEMINI_API_KEY')
        if not api_key:
            return Response(
                {'error': 'GEMINI_API_KEY not configured'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel('gemini-pro')

        try:
            # Generate social media posts
            social_prompt = f"""Create 5 engaging social media posts for the following event:
            Title: {event.get('title', 'No title provided')}
            Description: {event.get('description', 'No description provided')}
            
            For each post:
            1. Include relevant hashtags
            2. Use appropriate emojis
            3. Keep it engaging and concise
            4. Add a call-to-action
            5. Format each post clearly with a number (1-5)
            
            Make the posts diverse - some emotional, some informative, some urgent."""
            
            social_response = model.generate_content(social_prompt)
            if not social_response or not hasattr(social_response, 'text'):
                raise Exception('Failed to generate social media content')

            # Generate video script
            video_prompt = f"""Create a compelling 60-second video script for the following event:
            Title: {event.get('title', 'No title provided')}
            Description: {event.get('description', 'No description provided')}
            
            Include:
            1. Opening hook (5-10 seconds)
            2. Main message and key points (40-45 seconds)
            3. Strong call-to-action (5-10 seconds)
            4. Visual descriptions and transitions
            5. Background music/mood suggestions
            
            Format it with clear sections and timing indicators."""
            
            video_response = model.generate_content(video_prompt)
            if not video_response or not hasattr(video_response, 'text'):
                raise Exception('Failed to generate video script content')

            return Response({
                'socialMedia': social_response.text,
                'videoScript': video_response.text
            })
            
        except Exception as api_error:
            print(f"Gemini API Error: {str(api_error)}")  # Log the specific API error
            return Response(
                {'error': f'Content generation failed: {str(api_error)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    except Exception as e:
        print(f"General Error: {str(e)}")  # Log the general error
        return Response(
            {'error': f'Server error: {str(e)}'}, 
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
def get_event(request, event_id):
    try:
        event = GlobalEvent.objects.get(id=event_id)
        serializer = GlobalEventSerializer(event)
        return Response(serializer.data)
    except GlobalEvent.DoesNotExist:
        return Response(
            {'error': 'Event not found'}, 
            status=status.HTTP_404_NOT_FOUND
        )
