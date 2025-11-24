import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import { ImpactMetrics } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Leaf, Award, Map as MapIcon, Trash2 } from 'lucide-react';
import { TRASH_COLORS } from '../constants';

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      const m = await api.getMetrics();
      const records = await api.getDetections();
      
      setMetrics(m);

      // Process for chart
      const counts: Record<string, number> = {};
      records.forEach(r => {
        counts[r.trashType] = (counts[r.trashType] || 0) + 1;
      });

      const data = Object.keys(counts).map(key => ({
        name: key.replace('_', ' '),
        count: counts[key],
        color: TRASH_COLORS[key as any]
      }));
      setChartData(data);
    };
    load();
  }, []);

  if (!metrics) {
    return <div className="h-full flex items-center justify-center text-gray-500">Loading metrics...</div>;
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 pb-20">
      <div className="bg-eco-600 p-8 text-white rounded-b-3xl shadow-lg">
        <h1 className="text-2xl font-bold mb-2">Impact Overview</h1>
        <p className="opacity-90">Your contribution to a cleaner planet.</p>
        
        <div className="mt-6 flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur p-4 rounded-2xl flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <Leaf size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wider">CO2 Saved</span>
                </div>
                <div className="text-2xl font-bold">{metrics.carbonOffsetEstimate}g</div>
            </div>
             <div className="bg-white/20 backdrop-blur p-4 rounded-2xl flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <Trash2 size={16} />
                    <span className="text-xs font-semibold uppercase tracking-wider">Items Found</span>
                </div>
                <div className="text-2xl font-bold">{metrics.totalItems}</div>
            </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 mb-3">
                    <Award size={20} />
                </div>
                <div className="text-sm text-gray-500">Top Waste Type</div>
                <div className="text-lg font-bold capitalize text-gray-800">
                    {metrics.mostCommonType.replace('_', ' ')}
                </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-3">
                    <MapIcon size={20} />
                </div>
                <div className="text-sm text-gray-500">Hotspots ID'd</div>
                <div className="text-lg font-bold text-gray-800">{metrics.hotspotsFound}</div>
            </div>
        </div>

        {/* Chart */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-gray-800 mb-6">Waste Composition</h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis hide />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                            {chartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color || '#22c55e'} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};