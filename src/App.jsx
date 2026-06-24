import React, { useState } from 'react';
import RadarMap from './components/RadarMap';
import AirportBoard from './components/AirportBoard';
import FlightTracker from './components/FlightTracker';

export default function App() {
  // 1. Core State Control
  const [activeTab, setActiveTab] = useState('radar'); // 'radar' | 'boards' | 'track'
  const [globalSelectedFlight, setGlobalSelectedFlight] = useState('');

  // 2. Action handler to redirect from Airport Boards to Flight Tracker smoothly
  const handleTrackFlightFromBoard = (flightNum) => {
    setGlobalSelectedFlight(flightNum); // Hydrates the shared state variable
    setActiveTab('track');              // Switches view focus instantly to Lookup screen
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      
      {/* --- Top Navigation Header --- */}
      <header className="bg-slate-900 border-b border-slate-800 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl text-sky-500 animate-pulse">🛰️</span>
            <div>
              <h1 className="text-xl font-black tracking-wider text-white uppercase">
                AeroGrid <span className="text-sky-400 font-medium text-xs tracking-normal normal-case">Live Core</span>
              </h1>
              <p className="text-xs text-slate-500">ADS-B Matrix & Telemetry Stream Engine</p>
            </div>
          </div>

          {/* Tab Button Controls Layout */}
          <nav className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveTab('radar')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                activeTab === 'radar'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🌌 Live Airspace Radar
            </button>
            <button
              onClick={() => setActiveTab('boards')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                activeTab === 'boards'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🛫 Airport Boards
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${
                activeTab === 'track'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🔍 Track Flight
            </button>
          </nav>
        </div>
      </header>

      {/* --- Main Screen Layout Grid Matrix --- */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6">
        
        {/* Render Live Tracking Radar Canvas */}
        {activeTab === 'radar' && (
          <div className="animate-fadeIn">
            <RadarMap />
          </div>
        )}

        {/* Render Terminal FIDS Schedule Boards */}
        {activeTab === 'boards' && (
          <div className="animate-fadeIn">
            <AirportBoard onTrackFlight={handleTrackFlightFromBoard} />
          </div>
        )}

        {/* Render In-Depth Telemetry Itinerary Dashboard */}
        {activeTab === 'track' && (
          <div className="animate-fadeIn">
            <FlightTracker 
              selectedFlightNumber={globalSelectedFlight} 
              clearSelectedFlight={() => setGlobalSelectedFlight('')} 
            />
          </div>
        )}

      </main>

      {/* --- Global System Status Footer --- */}
      <footer className="bg-slate-900 border-t border-slate-800 text-center py-4 text-xs text-slate-500 mt-auto">
        <p>📡 Grid Interface Status: <span className="text-emerald-400 font-bold">ONLINE</span> | Listening for Raw Mode-S/ADS-B Transponder Matrices</p>
      </footer>

    </div>
  );
}