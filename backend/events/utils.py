import requests

# Example function to fetch global holidays using Calendarific API
def fetch_global_holidays():
    holidays = []
    url = 'https://calendarific.com/api/v2/holidays'
    params = {
        'api_key': 'rh43rV6WUyrGvOpLND4Xgqw60fHtBh4B',
        'country': 'IN',  # India
        'year': '2025'  # Example year
    }
    response = requests.get(url, params=params)
    data = response.json()

    for holiday in data['response']['holidays']:
        holidays.append({
            "title": holiday['name'],
            "description": holiday['description'],
            "location": "India",
            "event_type": "Holiday",
            "trending_score": 85  # Example score for holidays
        })

    return holidays

# Example function to fetch location-specific events (weather changes, local festivals)
def fetch_location_events(location):
    # Example using OpenWeatherMap for significant weather changes
    weather_events = []
    weather_api_key = '6b734670c9afdd12cfce70f6f48d6a08'
    weather_url = f'http://api.openweathermap.org/data/2.5/weather?q={location}&appid={weather_api_key}'
    weather_response = requests.get(weather_url)
    weather_data = weather_response.json()

    if weather_data['weather'][0]['main'] == 'Rain':
        weather_events.append({
            "title": "Heavy Rain Alert",
            "description": f"Heavy rain expected in {location}",
            "location": location,
            "event_type": "Weather Change",
            "trending_score": 90
        })

    # Example for local events like festivals using Eventbrite API (optional)
    # You can fetch events based on the location using the Eventbrite API.

    return weather_events

# Fetch trending events (global and location-specific events)
def fetch_trending_events():
    events = []

    # Global Events: Holidays and Festivals (Example using Calendarific API)
    holidays = fetch_global_holidays()  # Fetch global holidays via an API like Calendarific
    events.extend(holidays)

    # Location-Specific Events (Example using OpenWeatherMap API)
    location_events = fetch_location_events("India")  # Fetch weather changes, local festivals
    events.extend(location_events)

    return events
