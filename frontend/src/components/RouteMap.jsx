import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

function RouteMap({ lat, lng, city }) {
  const position = [
    lat || 19.076,
    lng || 72.8777,
  ];

  return (
    <MapContainer
      center={position}
      zoom={6}
      style={{
        height: "300px",
        width: "100%",
        borderRadius: "10px",
      }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={position}>
        <Popup>
          {city || "Selected Location"}
        </Popup>
      </Marker>
    </MapContainer>
  );
}

export default RouteMap;