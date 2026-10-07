import { useState } from "react";
import RouteMap from "./components/RouteMap";
import axios from "axios";
import "./App.css";

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
     if (
    !formData.current_location ||
    !formData.pickup_location ||
    !formData.dropoff_location ||
    !formData.cycle_used
  ) {
    alert("Please fill all fields");
    return;
  }

  if (Number(formData.cycle_used) > 70) {
    alert("Cycle used cannot exceed 70 hours");
    return;
  }

  
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/trip/",
        formData
      );

      setResult(response.data);
    } catch (error) {
      console.error(error);
      alert("Backend connection failed");
    }
  };

  return (
    <div className="container">
      <h1 className="title"> Spotter Route Planner</h1>

      <div className="dashboard">
        <div className="left-panel">
          <h2>Trip Details</h2>

          <input
            type="text"
            name="current_location"
            placeholder="Current Location"
            onChange={handleChange}
          />

          <input
            type="text"
            name="pickup_location"
            placeholder="Pickup Location"
            onChange={handleChange}
          />

          <input
            type="text"
            name="dropoff_location"
            placeholder="Dropoff Location"
            onChange={handleChange}
          />

          <input
            type="number"
            name="cycle_used"
            placeholder="Cycle Used"
            onChange={handleChange}
          />

          <button onClick={generateTrip}>
            Generate Route
          </button>
        </div>

        <div className="right-panel">
          <h2>Route Summary</h2>

          {result ? (
            <>
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
                  <p>{result.cycle_remaining}</p>
                </div>
              </div>

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
                <p><strong>Generated At:</strong> {result.generated_at}</p>
              </div>

              <div className="hos-card">
  <h3> Driver HOS Status</h3>

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
    {result.hos_status}
  </p>

  <p>
    <strong>Breaks Required:</strong>{" "}
    {result.breaks}
  </p>
</div>

              <div className="map-section">
                <h3> Route Map</h3>
                  <RouteMap
                  lat={result?.latitude}
                  lng={result?.longitude}
                  city={result?.dropoff_location}
                  />
                  </div>

             <div className="eld-table">
  <h3> Daily ELD Log</h3>

  <table>
    <thead>
      <tr>
        <th>Time</th>
        <th>Status</th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td>00:00 - 06:00</td>
        <td>Off Duty</td>
      </tr>

      <tr>
        <td>06:00 - 14:00</td>
        <td>Driving</td>
      </tr>

      <tr>
        <td>14:00 - 15:00</td>
        <td>Mandatory Break</td>
      </tr>

      <tr>
        <td>15:00 - 18:00</td>
        <td>Driving</td>
      </tr>

      <tr>
        <td>18:00 - 24:00</td>
        <td>Off Duty</td>
      </tr>
    </tbody>
  </table>
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