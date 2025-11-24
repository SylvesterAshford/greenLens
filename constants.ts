import { TrashType } from "./types";

export const MODEL_PATH = 'https://raw.githubusercontent.com/Hyuto/yolov8-onnx-runtime-web/master/public/model.onnx'; // Placeholder for a real hosted model
// Note: In a production app, this should point to a custom trained YOLOv8n.onnx for trash. 
// For this demo, we handle model loading errors gracefully.

export const TRASH_LABELS: Record<TrashType, string> = {
  [TrashType.BOTTLE]: 'Bottle',
  [TrashType.PLASTIC_BAG]: 'Plastic Bag',
  [TrashType.CAN]: 'Can',
  [TrashType.CUP]: 'Cup',
  [TrashType.TRASH]: 'General Trash',
};

export const TRASH_COLORS: Record<TrashType, string> = {
  [TrashType.BOTTLE]: '#3b82f6', // blue
  [TrashType.PLASTIC_BAG]: '#9ca3af', // gray
  [TrashType.CAN]: '#ef4444', // red
  [TrashType.CUP]: '#f59e0b', // amber
  [TrashType.TRASH]: '#10b981', // emerald
};

export const STORAGE_KEYS = {
  DETECTIONS: 'greenlens_detections',
};