import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Detection, TrashType, TrashRecord } from '../types';
import { yoloService } from '../services/yoloService';
import { api } from '../services/api';
import { TRASH_COLORS, TRASH_LABELS } from '../constants';
import { analyzeWasteImage } from '../services/geminiService';
import { Loader2, Sparkles, MapPin, Info } from 'lucide-react';

export const Scanner: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isModelLoading, setIsModelLoading] = useState(true);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detections, setDetections] = useState<Detection[]>([]);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{ name: string; advice: string } | null>(null);
  const requestRef = useRef<number>();

  // Initialize Camera and Model
  useEffect(() => {
    const init = async () => {
      // 1. Load Model
      await yoloService.loadModel();
      setIsModelLoading(false);

      // 2. Setup Camera
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
              facingMode: 'environment',
              width: { ideal: 640 },
              height: { ideal: 640 }
            },
          });
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current?.play();
            };
          }
        } catch (err) {
          console.error("Camera access denied:", err);
          alert("Please enable camera permissions to use GreenLens.");
        }
      }

      // 3. Setup Location
      navigator.geolocation.getCurrentPosition(
        (pos) => setCurrentLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn("Location denied, using mock", err),
        { enableHighAccuracy: true }
      );
    };

    init();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  // Detection Loop
  const detectFrame = useCallback(async () => {
    if (videoRef.current && canvasRef.current && isDetecting) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      if (video.readyState === 4 && ctx) {
        // Match canvas size to video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Run Inference
        const results = await yoloService.detect(video);
        setDetections(results);

        // Draw Logic
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        results.forEach(det => {
          const [x, y, w, h] = det.box;
          const color = TRASH_COLORS[det.class] || '#fff';
          
          // Draw Box
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.strokeRect(x, y, w, h);

          // Draw Label Background
          ctx.fillStyle = color;
          ctx.fillRect(x, y - 25, w, 25);

          // Draw Text
          ctx.fillStyle = '#fff';
          ctx.font = 'bold 14px sans-serif';
          ctx.fillText(`${TRASH_LABELS[det.class]} ${Math.round(det.confidence * 100)}%`, x + 5, y - 7);
          
          // Auto-save detection if high confidence (throttled in real app)
          if (det.confidence > 0.85 && currentLocation) {
             api.saveDetection({
               trashType: det.class,
               confidence: det.confidence,
               lat: currentLocation.lat + (Math.random() * 0.0001), // Jitter for demo
               lng: currentLocation.lng + (Math.random() * 0.0001)
             });
          }
        });
      }
    }
    requestRef.current = requestAnimationFrame(detectFrame);
  }, [isDetecting, currentLocation]);

  useEffect(() => {
    if (isDetecting) {
      requestRef.current = requestAnimationFrame(detectFrame);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      setDetections([]);
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }
  }, [isDetecting, detectFrame]);

  // Manual Gemini Analysis
  const handleDeepScan = async () => {
    if (!videoRef.current) return;
    setAnalyzing(true);
    setAiResult(null);

    // Capture frame
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0);
    const base64 = canvas.toDataURL('image/jpeg');

    try {
      const result = await analyzeWasteImage(base64);
      setAiResult({
        name: result.itemName,
        advice: `${result.recyclability}: ${result.disposalAdvice}`
      });
      
      // Save rich data
      if (currentLocation) {
        api.saveDetection({
          trashType: TrashType.TRASH,
          confidence: 1.0,
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          description: result.itemName
        });
      }

    } catch (e) {
      alert("AI analysis failed. Please try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="relative h-full w-full bg-black overflow-hidden flex flex-col">
      {/* Header Overlay */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-black/70 to-transparent text-white flex justify-between items-start">
        <div>
          <h1 className="text-xl font-bold text-eco-500">GreenLens</h1>
          <p className="text-xs text-gray-300 flex items-center gap-1">
            <MapPin size={10} />
            {currentLocation ? `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}` : 'Locating...'}
          </p>
        </div>
        <div className="bg-black/50 backdrop-blur px-3 py-1 rounded-full border border-white/10">
          <span className="text-xs font-mono">{detections.length} Objects</span>
        </div>
      </div>

      {/* Camera View */}
      <div className="relative flex-1 flex items-center justify-center">
        {isModelLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-gray-900 text-white">
            <Loader2 className="animate-spin mb-4 text-eco-500" size={40} />
            <p>Loading AI Model...</p>
          </div>
        )}
        
        <video 
          ref={videoRef}
          className="absolute h-full w-full object-cover"
          playsInline
          muted
        />
        <canvas 
          ref={canvasRef}
          className="absolute h-full w-full object-cover pointer-events-none"
        />

        {/* AI Result Card */}
        {aiResult && (
          <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur rounded-xl p-4 shadow-lg text-gray-800 z-30 border border-eco-200 animate-in slide-in-from-bottom-5">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-bold text-lg text-eco-700">{aiResult.name}</h3>
              <button onClick={() => setAiResult(null)} className="text-gray-400 hover:text-gray-600">×</button>
            </div>
            <p className="text-sm text-gray-600">{aiResult.advice}</p>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-center items-center gap-6 pb-6">
        {/* Toggle Detection */}
        <button
          onClick={() => setIsDetecting(!isDetecting)}
          className={`h-16 w-16 rounded-full flex items-center justify-center transition-all shadow-lg border-4 ${
            isDetecting 
              ? 'bg-red-500 border-red-200 text-white' 
              : 'bg-white border-white text-eco-600'
          }`}
        >
          {isDetecting ? (
            <div className="h-4 w-4 bg-white rounded-sm" />
          ) : (
            <div className="h-4 w-4 bg-eco-600 rounded-full" />
          )}
        </button>

        {/* Gemini AI Trigger */}
        <button
          onClick={handleDeepScan}
          disabled={analyzing}
          className="absolute right-8 h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg border border-white/20 disabled:opacity-50"
        >
          {analyzing ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
        </button>
      </div>
    </div>
  );
};