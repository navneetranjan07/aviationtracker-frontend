import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { API_BASE } from '../config';
import 'leaflet/dist/leaflet.css';
import './RadarMap.css';

// Fix default Leaflet marker asset missing routes in web bundles
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Helper component to reposition and pan map view dynamically
function ChangeMapView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, map.getZoom());
      // Invalidate size to guarantee rendering if the screen resized mid-session
      setTimeout(() => map.invalidateSize(), 200);
    }
  }, [center, map]);
  return null;
}

export default function RadarMap() {
  const [planes, setPlanes] = useState([]);
  const [selectedPlane, setSelectedPlane] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Synchronize telemetry array feed via 10-second polling loops
  useEffect(() => {
    const fetchRadarFeeds = () => {
      fetch(`${API_BASE}/flights/radar`)
        .then((res) => {
          if (!res.ok) throw new Error(`Server returned status: ${res.status}`);
          return res.json();
        })
        .then((data) => {
          setPlanes(data);
          setLoading(false);
          
          if (selectedPlane) {
            const updatedMatch = data.find(p => p.flightNumber === selectedPlane.flightNumber);
            if (updatedMatch) setSelectedPlane(updatedMatch);
          }
        })
        .catch((err) => {
          console.error("Radar tracking link error:", err);
          setError("Failed to stream live transponder matrix.");
          setLoading(false);
        });
    };

    fetchRadarFeeds();
    const pollingInterval = setInterval(fetchRadarFeeds, 10000);
    return () => clearInterval(pollingInterval);
  }, [selectedPlane]);

  // Create custom CSS/SVG marker icons rotating dynamically with tracking courses
  const createPlaneIcon = (heading, isTargeted) => {
    return L.divIcon({
      className: 'custom-radar-plane-wrapper',
      html: `
        <div style="transform: rotate(${heading || 0}deg); display: flex; justify-content: center; align-items: center; width: 32px; height: 32px;">
          <svg style="width: 26px; height: 26px; fill: ${isTargeted ? '#ff3366' : '#00ffcc'}; filter: drop-shadow(0px 0px 4px rgba(0,0,0,0.6));" viewBox="0 0 24 24">
            <path d="M21,16V14L13,9V3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5V9L2,14V16L10,13.5V19L8,20.5V22L11.5,21L15,22V20.5L13,19V13.5L21,16Z" />
          </svg>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });
  };

  return (
    <div className="radar-dashboard-container">
      <div className="radar-screen real-map-mode">
        {loading && planes.length === 0 && (
          <div className="radar-status-overlay">📡 Establishing connection to ADS-B grid...</div>
        )}
        {error && <div className="radar-status-overlay error-msg">⚠️ Link Offline: {error}</div>}

        <MapContainer 
          center={[20.5937, 78.9629]} 
          zoom={5} 
          scrollWheelZoom={true}
          className="leaflet-map-viewport"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {selectedPlane && (
            <ChangeMapView center={[selectedPlane.currentLatitude, selectedPlane.currentLongitude]} />
          )}

          {planes.map((plane) => {
            if (!plane.currentLatitude || !plane.currentLongitude) return null;
            const isTargeted = selectedPlane?.flightNumber === plane.flightNumber;

            return (
              <Marker
                key={plane.flightNumber}
                position={[plane.currentLatitude, plane.currentLongitude]}
                icon={createPlaneIcon(plane.heading, isTargeted)}
                eventHandlers={{
                  click: () => setSelectedPlane(plane),
                }}
              >
                <Popup mousedown={false}>
                  <div className="map-tooltip-popup">
                    <strong>Flight: {plane.flightNumber}</strong><br />
                    Altitude: {Math.round(plane.altitude).toLocaleString()} ft<br />
                    Speed: {Math.round(plane.speed)} kts
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      <div className={`radar-spec-drawer ${selectedPlane ? 'drawer-active' : ''}`}>
        {selectedPlane ? (
          <div className="spec-card">
            <h3>Target Locked: {selectedPlane.flightNumber}</h3>
            <hr className="spec-divider" />
            <div className="spec-grid-container">
              <div className="spec-row"><strong>Feed Source:</strong> <span className="badge-live">LIVE ADS-B</span></div>
              <div className="spec-row"><strong>Ground Speed:</strong> {Math.round(selectedPlane.speed)} kts</div>
              <div className="spec-row"><strong>Baro Altitude:</strong> {Math.round(selectedPlane.altitude).toLocaleString()} ft</div>
              <div className="spec-row"><strong>True Course:</strong> {Math.round(selectedPlane.heading)}°</div>
              <div className="spec-row"><strong>Latitude:</strong> {selectedPlane.currentLatitude?.toFixed(4)}</div>
              <div className="spec-row"><strong>Longitude:</strong> {selectedPlane.currentLongitude?.toFixed(4)}</div>
            </div>
            <button className="dismiss-btn" onClick={() => setSelectedPlane(null)}>Drop Target</button>
          </div>
        ) : (
          <div className="spec-placeholder">
            <p>📡 System Status: Operational</p>
            <p className="hint">Select an active aircraft marker vector directly on the tracking map grid to isolate telemetry details.</p>
          </div>
        )}
      </div>
    </div>
  );
}