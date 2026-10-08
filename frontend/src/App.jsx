import { useState } from "react";
import RouteMap from "./components/RouteMap";
import axios from "axios";
import "./App.css";
import DailyELDLog from "./components/DailyELDLog";

function App() {
  const [formData, setFormData] = useState({
    current_location: "",
    pickup_location: "",
    dropoff_location: "",
    cycle_used: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const generateTrip = async () => {
    console.log("Generate Route clicked");
    console.log("Form data:", formData);

    if (
      !formData.current_location ||
      !formData.pickup_location ||
      !formData.dropoff_location ||
      formData.cycle_used === ""
    ) {
      alert("Please fill all fields");
      return;
    }

    if (Number(formData.cycle_used) > 70) {
      alert("Cycle used cannot exceed 70 hours");
      return;
    }

    try {
      setLoading(true);
      setResult(null);

      const response = await axios.post(
        "https://bhargavi14.pythonanywhere.com/api/trip/",
        {
          current_location: formData.current_location,
          pickup_location: formData.pickup_location,
          dropoff_location: formData.dropoff_location,
          cycle_used: Number(formData.cycle_used),
        }
      );

      console.log("Backend response:", response.data);

      setResult(response.data);
    } catch (error) {
      console.error("Route generation error:", error);

      if (error.response) {
        console.error("Backend error:", error.response.data);
        alert(
          `Backend error: ${error.response.status}\nCheck Django terminal.`
        );
      } else if (error.request) {
        alert(
          "Could not connect to Django backend.\nMake sure Django is running on port 8000."
        );
      } else {
        alert("Error generating route.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className="title">Spotter Route Planner</h1>

      <div className="dashboard">

        {/* LEFT PANEL */}
        <div className="left-panel">
          <h2>Trip Details</h2>

          <input
            type="text"
            name="current_location"
            placeholder="Current Location"
            value={formData.current_location}
            onChange={handleChange}
          />

          <input
            type="text"
            name="pickup_location"
            placeholder="Pickup Location"
            value={formData.pickup_location}
            onChange={handleChange}
          />

          <input
            type="text"
            name="dropoff_location"
            placeholder="Dropoff Location"
            value={formData.dropoff_location}
            onChange={handleChange}
          />

          <input
            type="number"
            name="cycle_used"
            placeholder="Cycle Used"
            value={formData.cycle_used}
            onChange={handleChange}
          />

          <button onClick={generateTrip} disabled={loading}>
            {loading ? "Generating..." : "Generate Route"}
          </button>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <h2>Route Summary</h2>

          {result ? (
            <>
              {/* SUMMARY CARDS */}
              <div className="card-grid">

                <div className="card">
                  <h3>Distance</h3>
                  <p>{result.distance} miles</p>
                </div>

                <div className="card">
                  <h3>Duration</h3>
                  <p>{result.duration_hours} hrs</p>
                </div>

                <div className="card">
                  <h3>Fuel Stops</h3>
                  <p>{result.fuel_stops}</p>
                </div>

                <div className="card">
                  <h3>Cycle Remaining</h3>
                  <p>{result.cycle_remaining} hrs</p>
                </div>

              </div>

              {/* TRIP INFORMATION */}
              <div className="trip-info">

                <p>
                  <strong>Current:</strong>{" "}
                  {result.current_location}
                </p>

                <p>
                  <strong>Pickup:</strong>{" "}
                  {result.pickup_location}
                </p>

                <p>
                  <strong>Dropoff:</strong>{" "}
                  {result.dropoff_location}
                </p>

                <p>
                  <strong>Breaks Required:</strong>{" "}
                  {result.breaks}
                </p>

                <p>
                  <strong>Generated At:</strong>{" "}
                  {result.generated_at}
                </p>

              </div>

              {/* HOS STATUS */}
              <div className="hos-card">

                <h3>Driver HOS Status</h3>

                <p>
                  <strong>Cycle Used:</strong>{" "}
                  {formData.cycle_used} hrs
                </p>

                <p>
                  <strong>Cycle Remaining:</strong>{" "}
                  {result.cycle_remaining} hrs
                </p>

                <p>
                  <strong>Driving Hours Remaining:</strong>{" "}
                  {result.driving_hours_remaining} hrs
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  <span
                    className={
                      result.hos_status === "Available"
                        ? "status-green"
                        : result.hos_status === "Near Cycle Limit"
                        ? "status-orange"
                        : "status-red"
                    }
                  >
                    {result.hos_status}
                  </span>
                </p>

              </div>

              {/* DAILY ELD LOGS */}
              {result.eld_days &&
                result.eld_days.map((dayData) => (
                  <DailyELDLog
                    key={dayData.day}
                    day={dayData.day}
                    events={dayData.events}
                  />
                ))}

              {/* ROUTE MAP */}
              <div className="map-section">
                <h3>Route Map</h3>

                <RouteMap
                  lat={result?.latitude}
                  lng={result?.longitude}
                  city={result?.dropoff_location}
                />
              </div>
            </>
          ) : (
            <p>No route generated yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;