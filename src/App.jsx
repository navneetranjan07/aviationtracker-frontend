import React, { useState } from 'react';

// ✅ Utility helper to parse and format local airport times directly from the ISO string.
// This bypasses native JavaScript timezone correction, preventing the automatic +5.5 hour shift.
const formatLocalTime = (isoString) => {
  if (!isoString) return '—';
  
  // Example Input: "2026-06-20T12:20:00"
  const parts = isoString.split('T');
  if (parts.length < 2) return isoString;
  
  const datePart = parts[0].split('-').reverse().join('/'); // Converts "2026-06-20" to "20/06/2026"
  const timePart = parts[1].substring(0, 5);                // Extracts "12:20"
  
  return `${datePart} - ${timePart}`; // Resulting Display format
};

export default function App() {
  const [activeTab, setActiveTab] = useState('track'); // 'track' or 'board'
  
  // State for Flight Tracking
  const [flightNumber, setFlightNumber] = useState('');
  const [flightData, setFlightData] = useState(null);
  const [flightLoading, setFlightLoading] = useState(false);
  const [flightError, setFlightError] = useState('');

  // State for Airport Board
  const [airportIata, setAirportIata] = useState('');
  const [boardType, setBoardType] = useState('dep_iata'); // 'dep_iata' or 'arr_iata'
  const [boardData, setBoardData] = useState(null);
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardError, setBoardError] = useState('');

  // API Base URL matching your Spring Boot backend
  const API_BASE = 'http://localhost:7050/api';

  // Handler to search for a specific flight
  const handleTrackFlight = async (e) => {
    e.preventDefault();
    if (!flightNumber.trim()) return;

    setFlightLoading(true);
    setFlightError('');
    setFlightData(null);

    try {
      const response = await fetch(`${API_BASE}/flights/${flightNumber.trim().toUpperCase()}`);
      if (!response.ok) {
        throw new Error('Flight not found or an error occurred.');
      }
      const data = await response.json();
      setFlightData(data);
    } catch (err) {
      setFlightError(err.message || 'Failed to connect to backend.');
    } finally {
      setFlightLoading(false);
    }
  };

  // Handler to search for an airport departure/arrival board
  const handleFetchBoard = async (e) => {
    e.preventDefault();
    if (!airportIata.trim()) return;

    setBoardLoading(true);
    setBoardError('');
    setBoardData(null);

    try {
      const response = await fetch(
        `${API_BASE}/flights/board/${airportIata.trim().toUpperCase()}?type=${boardType}`
      );
      if (!response.ok) {
        throw new Error('Airport data not found or an error occurred.');
      }
      const data = await response.json();
      setBoardData(data);
    } catch (err) {
      setBoardError(err.message || 'Failed to connect to backend.');
    } finally {
      setBoardLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Navigation Header */}
      <header className="bg-slate-800 border-b border-slate-700 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✈️</span>
            <h1 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
              AeroTrack Radar
            </h1>
          </div>
          <nav className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setActiveTab('track')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'track'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Track Flight
            </button>
            <button
              onClick={() => setActiveTab('board')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'board'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Airport Boards
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* TAB 1: FLIGHT TRACKER */}
        {activeTab === 'track' && (
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl max-w-xl mx-auto">
              <h2 className="text-xl font-semibold mb-4 text-sky-400">Live Flight Lookup</h2>
              <form onSubmit={handleTrackFlight} className="flex gap-3">
                <input
                  type="text"
                  placeholder="e.g., AI101, AA2304"
                  value={flightNumber}
                  onChange={(e) => setFlightNumber(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 transition-colors"
                />
                <button
                  type="submit"
                  disabled={flightLoading}
                  className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-white font-medium px-6 py-2 rounded-lg transition-colors shadow-md"
                >
                  {flightLoading ? 'Searching...' : 'Track'}
                </button>
              </form>
              {flightError && (
                <p className="mt-3 text-red-400 text-sm bg-red-950/40 border border-red-900/50 p-2 rounded-lg">
                  ⚠️ {flightError}
                </p>
              )}
            </div>

            {/* Flight Result Card */}
            {flightData && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-2xl max-w-3xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-700 pb-4 mb-6 gap-4">
                  <div>
                    <span className="bg-sky-500/10 text-sky-400 text-xs font-bold uppercase tracking-widest px-2.5 py-1 rounded border border-sky-500/20">
                      {flightData.airline || 'Unknown Airline'}
                    </span>
                    <h3 className="text-3xl font-black text-white mt-2">{flightData.flightNumber}</h3>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${
                      flightData.status?.toLowerCase() === 'active' || flightData.status?.toLowerCase() === 'landed'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                    }`}>
                      ● {flightData.status?.toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                </div>

                {/* Route Visualizer */}
                <div className="grid grid-cols-1 md:grid-cols-3 items-center gap-6 bg-slate-900/50 p-6 rounded-xl border border-slate-700/60 mb-6">
                  <div className="text-center md:text-left">
                    <p className="text-4xl font-extrabold text-sky-400">{flightData.originIata}</p>
                    <p className="text-sm font-semibold text-white mt-1">{flightData.originCity}</p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{flightData.originAirport}</p>
                    <p className="text-xs text-slate-500 mt-3">Scheduled Departure</p>
                    <p className="text-sm font-medium text-slate-300">
                      {formatLocalTime(flightData.scheduledDeparture)}
                    </p>
                  </div>

                  <div className="flex flex-col items-center justify-center text-slate-500">
                    <div className="w-full flex items-center gap-2">
                      <div className="h-[2px] bg-slate-700 flex-1 border-dashed border-t"></div>
                      <span className="text-xl text-sky-500 animate-pulse">✈️</span>
                      <div className="h-[2px] bg-slate-700 flex-1 border-dashed border-t"></div>
                    </div>
                  </div>

                  <div className="text-center md:text-right">
                    <p className="text-4xl font-extrabold text-sky-400">{flightData.destinationIata}</p>
                    <p className="text-sm font-semibold text-white mt-1">{flightData.destinationCity}</p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{flightData.destinationAirport}</p>
                    <p className="text-xs text-slate-500 mt-3">Estimated Arrival</p>
                    <p className="text-sm font-medium text-slate-300">
                      {formatLocalTime(flightData.estimatedArrival)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: AIRPORT BOARD */}
        {activeTab === 'board' && (
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-xl max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold mb-4 text-sky-400">Airport Schedule Boards</h2>
              <form onSubmit={handleFetchBoard} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Enter Airport IATA Code (e.g., DEL, LAX, JFK)"
                  value={airportIata}
                  onChange={(e) => setAirportIata(e.target.value)}
                  maxLength={3}
                  className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white placeholder-slate-500 uppercase focus:outline-none focus:border-sky-500 transition-colors"
                />
                
                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-600">
                  <button
                    type="button"
                    onClick={() => setBoardType('dep_iata')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      boardType === 'dep_iata' ? 'bg-sky-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Departures
                  </button>
                  <button
                    type="button"
                    onClick={() => setBoardType('arr_iata')}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      boardType === 'arr_iata' ? 'bg-sky-600 text-white' : 'text-slate-400'
                    }`}
                  >
                    Arrivals
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={boardLoading}
                  className="bg-sky-600 hover:bg-sky-500 disabled:bg-slate-700 text-white font-medium px-6 py-2 rounded-lg transition-colors shadow-md shrink-0"
                >
                  {boardLoading ? 'Loading Board...' : 'View Board'}
                </button>
              </form>
              {boardError && (
                <p className="mt-3 text-red-400 text-sm bg-red-950/40 border border-red-900/50 p-2 rounded-lg">
                  ⚠️ {boardError}
                </p>
              )}
            </div>

            {/* Flight Board Tables */}
            {boardData && (
              <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden max-w-5xl mx-auto">
                <div className="bg-slate-700/40 px-6 py-4 border-b border-slate-700 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white tracking-wide">
                    Live Schedule for {boardData.airportCode} — {boardType === 'dep_iata' ? '🛫 Departures' : '🛬 Arrivals'}
                  </h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-slate-900/40 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-700">
                      <tr>
                        <th className="px-6 py-3.5">Flight</th>
                        <th className="px-6 py-3.5">Airline</th>
                        <th className="px-6 py-3.5">{boardType === 'dep_iata' ? 'Destination' : 'Origin'}</th>
                        <th className="px-6 py-3.5">Scheduled Time</th>
                        <th className="px-6 py-3.5">Terminal / Gate</th>
                        <th className="px-6 py-3.5 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700/50">
                      {((boardType === 'dep_iata' ? boardData.departures : boardData.arrivals) || []).map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-700/20 transition-colors">
                          <td className="px-6 py-4 font-bold text-white tracking-wide">{item.flightNumber}</td>
                          <td className="px-6 py-4">{item.airline}</td>
                          <td className="px-6 py-4">
                            <span className="font-mono bg-slate-900/60 px-1.5 py-0.5 rounded text-sky-400 mr-2 font-bold">{item.counterCity}</span>
                          </td>
                          <td className="px-6 py-4 font-medium">
                            {formatLocalTime(item.scheduledTime)}
                          </td>
                          <td className="px-6 py-4 font-mono text-xs">
                            {item.terminal ? `T${item.terminal}` : ''} {item.gate ? `| Gate ${item.gate}` : '—'}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded text-xs font-semibold ${
                              item.status === 'scheduled' ? 'bg-sky-500/10 text-sky-400' :
                              item.status === 'landed' || item.status === 'active' ? 'bg-emerald-500/10 text-emerald-400' :
                              'bg-slate-600/20 text-slate-400'
                            }`}>
                              {item.status || 'unknown'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}