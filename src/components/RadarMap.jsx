import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import './RadarMap.css';

export default function RadarMap() {
  const [planes, setPlanes] = useState([]);
  const [selectedPlane, setSelectedPlane] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    fetch(`${API_BASE}/flights/radar`)
      .then((res) => {
        if (!res.ok) throw new Error(`Server returned status: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setPlanes(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Radar tracking link error:", err);
        setError("Failed to stream live transponder matrix.");
        setLoading(false);
      });
  }, []);

  const convertCoordinatesToPercent = (lat, lon) => {
    const minLat = 8.0;
    const maxLat = 30.0;
    const minLon = 70.0;
    const maxLon = 90.0;

    const leftPercent = ((lon - minLon) / (maxLon - minLon)) * 100;
    const topPercent = 100 - (((lat - minLat) / (maxLat - minLat)) * 100);

    return {
      top: `${Math.max(5, Math.min(95, topPercent))}%`,
      left: `${Math.max(5, Math.min(95, leftPercent))}%`
    };
  };

  return (
    <div className="radar-dashboard-container">
      <div className="radar-screen">
        <div className="radar-sweep-line"></div>
        <div className="radar-concentric-ring ring-1"></div>
        <div className="radar-concentric-ring ring-2"></div>
        <div className="radar-concentric-ring ring-3"></div>

        {loading && <div className="radar-status-msg">📡 Establishing connection to ADS-B grid...</div>}
        {error && <div className="radar-status-msg error-msg">⚠️ Link Offline: {error}</div>}
        
        {!loading && !error && planes.length === 0 && (
          <div className="radar-status-msg">🛸 Airspace clear. No live transponders in sector.</div>
        )}

        {!loading && !error && planes.map((plane) => {
          const position = convertCoordinatesToPercent(plane.currentLatitude, plane.currentLongitude);
          const isTargeted = selectedPlane?.flightNumber === plane.flightNumber;

          return (
            <div
              key={plane.flightNumber}
              className={`radar-plane-blip ${isTargeted ? 'targeted' : ''}`}
              style={{ top: position.top, left: position.left }}
              onClick={() => setSelectedPlane(plane)}
            >
              <svg 
                style={{ transform: `rotate(${plane.heading || 0}deg)` }} 
                viewBox="0 0 24 24" 
                className="plane-icon-svg"
              >
                <path d="M21,16V14L13,9V3.5A1.5,1.5 0 0,0 11.5,2A1.5,1.5 0 0,0 10,3.5V9L2,14V16L10,13.5V19L8,20.5V22L11.5,21L15,22V20.5L13,19V13.5L21,16Z" />
              </svg>
              <span className="blip-label">{plane.flightNumber}</span>
            </div>
          );
        })}
      </div>

      <div className="radar-spec-drawer">
        {selectedPlane ? (
          <div className="spec-card">
            <h3>Target Locked: {selectedPlane.flightNumber}</h3>
            <hr className="spec-divider" />
            <div className="spec-row"><strong>Feed Source:</strong> <span className="badge-live">LIVE ADS-B</span></div>
            <div className="spec-row"><strong>Ground Speed:</strong> {Math.round(selectedPlane.speed)} knots</div>
            <div className="spec-row"><strong>Baro Altitude:</strong> {Math.round(selectedPlane.altitude).toLocaleString()} ft</div>
            <div className="spec-row"><strong>True Track Course:</strong> {Math.round(selectedPlane.heading)}°</div>
            <div className="spec-row"><strong>Latitude:</strong> {selectedPlane.currentLatitude?.toFixed(5)}</div>
            <div className="spec-row"><strong>Longitude:</strong> {selectedPlane.currentLongitude?.toFixed(5)}</div>
            <button className="dismiss-btn" onClick={() => setSelectedPlane(null)}>Drop Target</button>
          </div>
        ) : (
          <div className="spec-placeholder">
            <p>📡 System Status: Operational</p>
            <p className="hint">Click any active vector blip on the sweeping tracking screen to stream true telemetry data blocks directly from the aircraft transponder.</p>
          </div>
        )}
      </div>
    </div>
  );
}