import React, { useState } from 'react';
import { NavBar } from './components/NavBar';
import { Scanner } from './components/Scanner';
import { HeatmapView } from './components/HeatmapView';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [activeTab, setActiveTab] = useState<'camera' | 'map' | 'dashboard'>('camera');

  return (
    <div className="h-screen w-full bg-gray-100 flex flex-col font-sans">
      <div className="flex-1 overflow-hidden">
        {activeTab === 'camera' && <Scanner />}
        {activeTab === 'map' && <HeatmapView />}
        {activeTab === 'dashboard' && <Dashboard />}
      </div>
      <NavBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}