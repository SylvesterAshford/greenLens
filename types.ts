export enum TrashType {
  BOTTLE = 'bottle',
  PLASTIC_BAG = 'plastic_bag',
  CAN = 'can',
  CUP = 'cup',
  TRASH = 'trash',
}

export interface Detection {
  id: string;
  box: [number, number, number, number]; // x, y, width, height
  class: TrashType;
  confidence: number;
  label: string;
}

export interface TrashRecord {
  id: string;
  trashType: TrashType;
  confidence: number;
  lat: number;
  lng: number;
  createdAt: number; // timestamp
  description?: string; // Optional AI description
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
}

export interface ImpactMetrics {
  totalItems: number;
  mostCommonType: string;
  hotspotsFound: number;
  carbonOffsetEstimate: number; // in grams
}

export interface ApiError {
  message: string;
}