from rest_framework.decorators import api_view
from rest_framework.response import Response

from geopy.geocoders import Nominatim
from geopy.distance import geodesic

from datetime import datetime


def format_time(decimal_hour):
    hour = int(decimal_hour)
    minutes = int(round((decimal_hour - hour) * 60))

    if minutes == 60:
        hour += 1
        minutes = 0

    return f"{hour:02d}:{minutes:02d}"


def generate_eld_days(duration_hours, cycle_remaining):
    """
    Generate multi-day ELD logs.

    Rules:
    - 10 consecutive hours Off Duty before each workday
    - 1 hour pickup on Day 1
    - Maximum 11 driving hours per day
    - 30-minute break after 8 cumulative driving hours
    - Maximum 14-hour duty window
    - 1 hour drop-off on final day
    """

    eld_days = []

    remaining_drive = duration_hours
    day_number = 1
    remaining_cycle = float(cycle_remaining)

    while remaining_drive > 0:

        events = []

        # -------------------------------------------------
        # 10 HOURS OFF DUTY
        # -------------------------------------------------
        events.append({
            "status": "OFF_DUTY",
            "start": "00:00",
            "end": "10:00",
            "remark": "10 hour rest"
        })

        current_time = 10.0

        # -------------------------------------------------
        # PICKUP - ONLY ON DAY 1
        # -------------------------------------------------
        if day_number == 1:

            if remaining_cycle > 0:

               pickup_start = current_time

               pickup_duration = min(
                1.0,
                remaining_cycle
        )

        pickup_end = pickup_start + pickup_duration

        events.append({
                "status": "ON_DUTY",
                "start": format_time(pickup_start),
                "end": format_time(pickup_end),
                "remark": "Pickup"
        })

        current_time = pickup_end
        remaining_cycle -= pickup_duration

        # -------------------------------------------------
        # DAILY DRIVING LIMIT = 11 HOURS
        # -------------------------------------------------
        daily_driving = 0.0
        driving_since_break = 0.0

        while (
            remaining_drive > 0
            and daily_driving < 11.0
        ):

            # Maximum driving possible before:
            # 1. 8-hour break requirement
            # 2. 11-hour daily driving limit
            # 3. Remaining trip driving
            available_drive = min(
                remaining_drive,
                8.0 - driving_since_break,
                11.0 - daily_driving,
                remaining_cycle
            )

            # -------------------------------------------------
            # CHECK 14-HOUR DUTY WINDOW
            # Work window starts at 10:00.
            # It must finish by 24:00.
            # -------------------------------------------------

            remaining_window = 24.0 - current_time

            # We need time available for driving
            available_drive = min(
                available_drive,
                remaining_window
            )

            if available_drive <= 0:
                break

            start_time = current_time
            end_time = current_time + available_drive

            events.append({
                "status": "DRIVING",
                "start": format_time(start_time),
                "end": format_time(end_time),
                "remark": "Driving"
            })

            current_time = end_time

            remaining_drive -= available_drive
            remaining_cycle -= available_drive
            daily_driving += available_drive
            driving_since_break += available_drive

            # -------------------------------------------------
            # 30-MINUTE BREAK AFTER 8 HOURS
            # -------------------------------------------------
            if (
                driving_since_break >= 8.0
                and remaining_drive > 0
                and daily_driving < 11.0
            ):

                break_start = current_time
                break_end = current_time + 0.5

                events.append({
                    "status": "OFF_DUTY",
                    "start": format_time(break_start),
                    "end": format_time(break_end),
                    "remark": "30 minute break"
                })

                current_time = break_end

                driving_since_break = 0.0

        # -------------------------------------------------
        # IF TRIP IS FINISHED → DROP-OFF
        # -------------------------------------------------
        if remaining_drive <= 0 and remaining_cycle >= 1.0:

            dropoff_start = current_time
            dropoff_end = dropoff_start + 1.0

            # Make sure drop-off fits inside 14-hour window
            if dropoff_end <= 24.0:

                events.append({
                    "status": "ON_DUTY",
                    "start": format_time(dropoff_start),
                    "end": format_time(dropoff_end),
                    "remark": "Drop-off"
                })

                current_time = dropoff_end

        # -------------------------------------------------
        # REMAINING TIME → OFF DUTY
        # -------------------------------------------------
        if current_time < 24.0:

            events.append({
                "status": "OFF_DUTY",
                "start": format_time(current_time),
                "end": "24:00",
                "remark": "Rest"
            })

        eld_days.append({
            "day": day_number,
            "events": events
        })

        day_number += 1

    return eld_days

# =========================================================
# TRIP API
# =========================================================
@api_view(['POST'])
def trip(request):

    current_location = request.data.get("current_location")

    pickup_location = request.data.get("pickup_location")

    dropoff_location = request.data.get("dropoff_location")

    cycle_used = int(
        request.data.get("cycle_used", 0)
    )
    cycle_remaining = max(0, 70 - cycle_used)

    print("Cycle Used:", cycle_used)

    # -----------------------------------------------------
    # GEOCODING
    # -----------------------------------------------------

    geolocator = Nominatim(
        user_agent="spotter"
    )

    try:

        start = geolocator.geocode(
            current_location
        )

        end = geolocator.geocode(
            dropoff_location
        )

        if start and end:

            distance = round(
                geodesic(
                    (
                        start.latitude,
                        start.longitude
                    ),
                    (
                        end.latitude,
                        end.longitude
                    )
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

        print(
            "Geocoding Error:",
            e
        )

        distance = 0

        latitude = 19.076

        longitude = 72.8777

    # -----------------------------------------------------
    # TRIP DURATION
    # -----------------------------------------------------

    duration = round(
        distance / 55,
        2
    )

    # =====================================================
    # NEW: GENERATE ELD EVENTS
    # =====================================================

    eld_days = generate_eld_days(
        duration,
        cycle_remaining
    )

    # -----------------------------------------------------
    # FUEL STOPS
    # -----------------------------------------------------

    fuel_stops = int(
        distance // 1000
    )

    # -----------------------------------------------------
    # BREAKS
    # -----------------------------------------------------

    breaks = int(
        duration // 8
    )

    # -----------------------------------------------------
    # CYCLE
    # -----------------------------------------------------

    cycle_remaining = 70 - cycle_used

    # -----------------------------------------------------
    # DRIVING HOURS REMAINING
    # -----------------------------------------------------

    driving_hours_remaining = round(
        max(
            0,
            11 - duration
        ),
        2
    )

    # -----------------------------------------------------
    # HOS STATUS
    # -----------------------------------------------------

    if cycle_remaining <= 0:

        hos_status = "Cycle Limit Reached"

    elif cycle_remaining < 10:

        hos_status = "Near Cycle Limit"

    else:

        hos_status = "Available"

    # -----------------------------------------------------
    # DEBUG PRINTS
    # -----------------------------------------------------

    print(
        "Current:",
        current_location
    )

    print(
        "Pickup:",
        pickup_location
    )

    print(
        "Dropoff:",
        dropoff_location
    )

    print(
        "Distance:",
        distance
    )

    print(
        "Latitude:",
        latitude
    )

    print(
        "Longitude:",
        longitude
    )

    print(
        "ELD Days:",
        eld_days
    )
    trip_cycle_limited = duration > cycle_remaining
    

    # =====================================================
    # RESPONSE
    # =====================================================

    return Response({

        "current_location":
            current_location,

        "pickup_location":
            pickup_location,

        "dropoff_location":
            dropoff_location,

        "distance":
            distance,

        "duration_hours":
            duration,

        "fuel_stops":
            fuel_stops,

        "breaks":
            breaks,

        "cycle_remaining":
            cycle_remaining,

        "driving_hours_remaining":
            driving_hours_remaining,

        "hos_status":
            hos_status,

        "latitude":
            latitude,

        "longitude":
            longitude,

        "trip_cycle_limited":
          trip_cycle_limited,


        # =================================================
        # NEW: ELD DATA
        # =================================================

        "eld_days":
            eld_days,

        "generated_at":
            datetime.now().strftime(
                "%d-%m-%Y %H:%M"
            ),
    })