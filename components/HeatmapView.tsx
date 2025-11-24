import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { TrashRecord } from '../types';
import { TRASH_COLORS } from '../constants';
import { Loader2, RefreshCw } from 'lucide-react';

// Since we are not using a bundler that handles 'leaflet' module resolution properly in this XML output
// we assume L is available on window due to the <script> tag in index.html.
// In a real TS project, you would use `import { MapContainer, ... } from 'react-leaflet'`

declare global {
  interface Window {
    L: any;
  }
}

export const HeatmapView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<TrashRecord[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const records = await api.getDetections();
    setData(records);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Initialize Map
  useEffect(() => {
    if (loading) return;

    // Wait for DOM
    const container = document.getElementById('map-container');
    if (!container || !window.L) return;

    // Clean up previous map instance if exists (hacky for non-React-Leaflet)
    if ((container as any)._leaflet_id) {
        (container as any)._leaflet_id = null;
        container.innerHTML = '';
    }

    const map = window.L.map('map-container').setView([0, 0], 2);

    // Get user location for initial view
    navigator.geolocation.getCurrentPosition((pos) => {
        map.setView([pos.coords.latitude, pos.coords.longitude], 15);
    });

    window.L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    }).addTo(map);

    // Add markers
    data.forEach(record => {
      const color = TRASH_COLORS[record.trashType];
      
      const circle = window.L.circleMarker([record.lat, record.lng], {
        radius: 8,
        fillColor: color,
        color: '#fff',
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map);

      circle.bindPopup(`
        <div style="font-family: sans-serif;">
            <strong>${record.trashType.toUpperCase().replace('_', ' ')}</strong><br/>
            Confidence: ${Math.round(record.confidence * 100)}%<br/>
            ${new Date(record.createdAt).toLocaleTimeString()}
        </div>
      `);
    });

  }, [loading, data]);

  return (
    <div className="h-full w-full flex flex-col bg-gray-50">
      <div className="p-4 bg-white border-b border-gray-200 flex justify-between items-center shadow-sm z-10">
        <h2 className="text-xl font-bold text-gray-800">Waste Hotspots</h2>
        <button onClick={fetchData} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition">
          <RefreshCw size={20} className={loading ? "animate-spin text-eco-600" : "text-gray-600"} />
        </button>
      </div>
      
      <div className="flex-1 relative">
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
            <Loader2 className="animate-spin text-eco-600" size={32} />
          </div>
        )}
        <div id="map-container" className="h-full w-full outline-none" />
        
        {/* Legend */}
        <div className="absolute bottom-6 left-4 bg-white/90 p-3 rounded-lg shadow-md z-[400] text-xs">
          <h4 className="font-bold mb-2 text-gray-700">Legend</h4>
          {Object.entries(TRASH_COLORS).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2 mb-1 last:mb-0">
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: color }}></span>
              <span className="capitalize text-gray-600">{type.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};