import React, { useState } from 'react';
import FlightTracker from './components/FlightTracker';
import AirportBoard from './components/AirportBoard';
import RadarMap from './components/RadarMap';

export default function App() {
  const [activeTab, setActiveTab] = useState('radar');

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans">
      {/* Navigation Header */}
      <header className="bg-slate-800 border-b border-slate-700 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">📡</span>
            <h1 className="text-2xl font-bold tracking-wider bg-gradient-to-r from-sky-400 to-blue-500 bg-clip-text text-transparent">
              AeroTrack Radar Center
            </h1>
          </div>
          <nav className="flex bg-slate-900 p-1 rounded-lg border border-slate-700">
            <button
              onClick={() => setActiveTab('radar')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeTab === 'radar'
                  ? 'bg-sky-500 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live Radar Map
            </button>
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

      {/* Main Content Render Core */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'radar' && <RadarMap />}
        {activeTab === 'track' && <FlightTracker />}
        {activeTab === 'board' && <AirportBoard />}
      </main>
    </div>
  );
}