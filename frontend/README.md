# Spotter Route Planner

A full-stack **route planning application** that generates trip schedules and daily ELD (Electronic Logging Device) logs while considering driver Hours of Service (HOS) requirements.

## Live Demo

* **Frontend:** https://spotter-route-planner-rho.vercel.app/
* **GitHub:** https://github.com/Bhargavi-kolhe/spotter-route-planner

## Overview

Spotter Route Planner helps drivers plan trips by calculating route distance, estimated travel time, driving hours, required breaks, fuel stops, and daily duty schedules.

The application also generates a 24-hour ELD log for each day of the trip, making the driver's daily activities easy to visualize.

## Features

* Route planning between current location, pickup location, and drop-off location
* Distance and estimated travel time calculation
* Daily 24-hour ELD log generation
* Driver Hours of Service (HOS) scheduling
* Maximum 11 hours of driving per day
* 14-hour duty window
* 30-minute break after 8 cumulative driving hours
* 10 consecutive hours of off-duty rest
* 70-hour / 8-day cycle tracking
* 1-hour pickup and drop-off activities
* Fuel stop calculation for long trips
* HOS status and trip summary
* Support for multi-day trips

## HOS and ELD Scheduling

The planner generates daily schedules based on the driver's available driving hours and cycle hours.

A daily schedule can include:

* Off Duty / Rest
* Pickup
* Driving
* Required 30-minute break
* Drop-off
* Remaining Off Duty time

The ELD log is displayed as a **24-hour grid** to visualize the driver's activities throughout the day.

## Tech Stack

### Frontend

* React.js
* Vite
* JavaScript
* CSS

### Backend

* Python
* Django
* Django REST Framework

### Deployment

* Frontend: Vercel
* Backend: PythonAnywhere

## Project Structure

```text
spotter-route-planner/
│
├── backend/
│   ├── config/
│   ├── api/
│   ├── manage.py
│   └── ...
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── package.json
│   └── ...
│
└── README.md
```

## Running Locally

### 1. Clone the repository

```bash
git clone https://github.com/Bhargavi-kolhe/spotter-route-planner.git
cd spotter-route-planner
```

### 2. Run the Backend

```bash
cd backend
python manage.py runserver
```

The backend will run at:

```text
http://127.0.0.1:8000/
```

### 3. Run the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local Vite URL shown in the terminal.

## API

The main trip planning endpoint is:

```text
POST /api/trip/
```

The frontend sends trip details to the backend, which returns the calculated route information, HOS summary, and ELD schedule.

## Example Trip

```text
Current Location: Nagpur
Pickup Location: Pune
Drop-off Location: Mumbai
Cycle Used: 34 hours
```

The application returns:

* Route distance
* Estimated trip duration
* Remaining driving hours
* Required breaks
* Fuel stop information
* HOS status
* Daily ELD schedule

## Assessment Requirements

The application considers the following requirements:

* 11-hour maximum driving limit per day
* 14-hour duty window
* 30-minute break after 8 cumulative driving hours
* 10 consecutive hours off duty
* 70-hour / 8-day cycle
* 1-hour pickup and drop-off activities
* Fueling requirements for long-distance trips
* Multi-day ELD schedules
* No adverse-driving-condition extension

## Demo

A Loom walkthrough demonstrates the application, including route planning, HOS information, and daily ELD logs.

## Author

**Bhargavi Kolhe**

```
LinkedIn: https://www.linkedin.com/in/bhargavi-kolhe-50b63a310/
GitHub: https://github.com/Bhargavi-kolhe
```
