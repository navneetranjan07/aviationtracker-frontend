import React, { useState } from 'react';
import { formatLocalTime } from '../utils/formatTime';
import { API_BASE } from '../config';

export default function AirportBoard() {
  const [airportIata, setAirportIata] = useState('');
  const [boardType, setBoardType] = useState('dep_iata');
  const [boardData, setBoardData] = useState(null);
  const [boardLoading, setBoardLoading] = useState(false);
  const [boardError, setBoardError] = useState('');

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
  );
}