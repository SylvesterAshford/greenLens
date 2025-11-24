import React from 'react';
import { LayoutDashboard, Camera, Map } from 'lucide-react';

interface NavBarProps {
  activeTab: 'camera' | 'map' | 'dashboard';
  setActiveTab: (tab: 'camera' | 'map' | 'dashboard') => void;
}

export const NavBar: React.FC<NavBarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 h-16 flex justify-around items-center z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
      <button
        onClick={() => setActiveTab('camera')}
        className={`flex flex-col items-center p-2 ${activeTab === 'camera' ? 'text-eco-600' : 'text-gray-400'}`}
      >
        <Camera size={24} />
        <span className="text-xs mt-1 font-medium">Scan</span>
      </button>
      
      <button
        onClick={() => setActiveTab('map')}
        className={`flex flex-col items-center p-2 ${activeTab === 'map' ? 'text-eco-600' : 'text-gray-400'}`}
      >
        <Map size={24} />
        <span className="text-xs mt-1 font-medium">Heatmap</span>
      </button>

      <button
        onClick={() => setActiveTab('dashboard')}
        className={`flex flex-col items-center p-2 ${activeTab === 'dashboard' ? 'text-eco-600' : 'text-gray-400'}`}
      >
        <LayoutDashboard size={24} />
        <span className="text-xs mt-1 font-medium">Impact</span>
      </button>
    </div>
  );
};