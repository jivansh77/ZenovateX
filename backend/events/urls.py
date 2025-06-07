from django.urls import path
from .views import get_trending_events
from . import views

urlpatterns = [
    path('api/trending-events/', get_trending_events, name='get_trending_events'),
    path('api/trending-events/<int:event_id>/', views.get_event, name='get_event'),
    path('api/generate-content/', views.generate_content, name='generate-content'),
]
