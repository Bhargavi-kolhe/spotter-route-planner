from rest_framework.decorators import api_view
from rest_framework.response import Response
from geopy.geocoders import Nominatim
from geopy.distance import geodesic
from datetime import datetime


@api_view(['POST'])
def trip(request):

    current_location = request.data.get("current_location")
    pickup_location = request.data.get("pickup_location")
    dropoff_location = request.data.get("dropoff_location")
    cycle_used = int(request.data.get("cycle_used", 0))

    print("Cycle Used:", cycle_used)

    geolocator = Nominatim(user_agent="spotter")

    try:
        start = geolocator.geocode(current_location)
        end = geolocator.geocode(dropoff_location)

        if start and end:
            distance = round(
                geodesic(
                    (start.latitude, start.longitude),
                    (end.latitude, end.longitude)
                ).miles,
                2
            )

            latitude = end.latitude
            longitude = end.longitude

        else:
            distance = 0
            latitude = 19.076
            longitude = 72.8777

    except Exception as e:
        print("Geocoding Error:", e)
        distance = 0
        latitude = 19.076
        longitude = 72.8777

    duration = round(distance / 55, 2)
    fuel_stops = int(distance // 1000)
    breaks = int(duration // 8)

    cycle_remaining = 70 - cycle_used

    driving_hours_remaining = round(
        max(0, 11 - duration),
        2
    )

    if cycle_remaining <= 0:
        hos_status = "Cycle Limit Reached"
    elif cycle_remaining < 10:
        hos_status = "Near Cycle Limit"
    else:
        hos_status = "Available"

    print("Current:", current_location)
    print("Pickup:", pickup_location)
    print("Dropoff:", dropoff_location)
    print("Distance:", distance)
    print("Latitude:", latitude)
    print("Longitude:", longitude)

    return Response({
        "current_location": current_location,
        "pickup_location": pickup_location,
        "dropoff_location": dropoff_location,
        "distance": distance,
        "duration_hours": duration,
        "fuel_stops": fuel_stops,
        "breaks": breaks,
        "cycle_remaining": cycle_remaining,
        "driving_hours_remaining": driving_hours_remaining,
        "hos_status": hos_status,
        "latitude": latitude,
        "longitude": longitude,
        "generated_at": datetime.now().strftime("%d-%m-%Y %H:%M"),
        

        
    })