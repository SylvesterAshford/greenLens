import { TrashRecord, TrashType, ImpactMetrics } from "../types";
import { STORAGE_KEYS } from "../constants";

// Simulates a backend database
export const api = {
  // POST /detection
  saveDetection: async (record: Omit<TrashRecord, 'id' | 'createdAt'>): Promise<TrashRecord> => {
    return new Promise((resolve) => {
      const newRecord: TrashRecord = {
        ...record,
        id: crypto.randomUUID(),
        createdAt: Date.now(),
      };

      const existingData = localStorage.getItem(STORAGE_KEYS.DETECTIONS);
      const detections: TrashRecord[] = existingData ? JSON.parse(existingData) : [];
      detections.push(newRecord);
      localStorage.setItem(STORAGE_KEYS.DETECTIONS, JSON.stringify(detections));

      // Simulate network delay
      setTimeout(() => resolve(newRecord), 100);
    });
  },

  // GET /heatmap
  getDetections: async (): Promise<TrashRecord[]> => {
    return new Promise((resolve) => {
      const existingData = localStorage.getItem(STORAGE_KEYS.DETECTIONS);
      const detections: TrashRecord[] = existingData ? JSON.parse(existingData) : [];
      setTimeout(() => resolve(detections), 100);
    });
  },

  // GET /metrics
  getMetrics: async (): Promise<ImpactMetrics> => {
    const detections = await api.getDetections();
    const totalItems = detections.length;

    if (totalItems === 0) {
      return { totalItems: 0, mostCommonType: 'N/A', hotspotsFound: 0, carbonOffsetEstimate: 0 };
    }

    const typeCounts: Record<string, number> = {};
    detections.forEach(d => {
      typeCounts[d.trashType] = (typeCounts[d.trashType] || 0) + 1;
    });

    const mostCommonType = Object.entries(typeCounts).reduce((a, b) => b[1] > a[1] ? b : a)[0];
    
    // Simple clustering logic for hotspots (arbitrary proximity check)
    // In a real backend, this would use DBSCAN or K-Means
    const hotspotsFound = Math.ceil(totalItems / 5); 

    // Arbitrary carbon calculation: avg 20g CO2 savings per item recycled
    const carbonOffsetEstimate = totalItems * 20;

    return {
      totalItems,
      mostCommonType,
      hotspotsFound,
      carbonOffsetEstimate
    };
  }
};