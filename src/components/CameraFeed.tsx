import React, { useRef, useEffect, useState } from 'react';
import { Camera, Wifi, WifiOff, Eye, Thermometer, AlertTriangle } from 'lucide-react';
import { visionService } from '../services/visionService';

interface CameraFeedProps {
  feedId: string;
  zone: string;
  type: 'security' | 'thermal' | 'drone';
  onAlert?: (alert: any) => void;
}

export const CameraFeed: React.FC<CameraFeedProps> = ({ feedId, zone, type, onAlert }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detections, setDetections] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(true);
  const [fps, setFps] = useState(30);

  useEffect(() => {
    // Initialize vision service
    visionService.initialize().catch(console.error);
    
    // Simulate camera feed
    const interval = setInterval(() => {
      simulateCameraFrame();
    }, 1000 / fps);

    return () => clearInterval(interval);
  }, [fps]);

  const simulateCameraFrame = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Simulate camera feed with random noise and objects
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Add some simulated objects
    ctx.fillStyle = '#4ade80';
    for (let i = 0; i < 3; i++) {
      const x = Math.random() * (canvas.width - 20);
      const y = Math.random() * (canvas.height - 20);
      ctx.fillRect(x, y, 20, 20);
    }

    // Process frame with vision services
    if (!isProcessing) {
      setIsProcessing(true);
      try {
        const results = await visionService.processVideoFrame(canvas, zone);
        if (results) {
          setDetections(results.detections || []);
          
          // Send alerts to parent component
          if (results.alerts && results.alerts.length > 0 && onAlert) {
            results.alerts.forEach(alert => onAlert(alert));
          }
        }
      } catch (error) {
        console.error('Vision processing error:', error);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const getCameraIcon = () => {
    switch (type) {
      case 'thermal': return <Thermometer className="h-4 w-4 text-red-400" />;
      case 'drone': return <Eye className="h-4 w-4 text-blue-400" />;
      default: return <Camera className="h-4 w-4 text-green-400" />;
    }
  };

  const getTypeLabel = () => {
    switch (type) {
      case 'thermal': return 'Thermal';
      case 'drone': return 'Drone';
      default: return 'Security';
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-3 border border-gray-700">
      {/* Camera Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {getCameraIcon()}
          <span className="text-sm font-medium">{getTypeLabel()} Cam {feedId}</span>
        </div>
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <Wifi className="h-3 w-3 text-green-400" />
          ) : (
            <WifiOff className="h-3 w-3 text-red-400" />
          )}
          <span className="text-xs text-gray-400">{fps}fps</span>
        </div>
      </div>

      {/* Camera Feed */}
      <div className="relative bg-black rounded border border-gray-600 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={200}
          height={150}
          className="w-full h-auto"
        />
        
        {/* Processing Indicator */}
        {isProcessing && (
          <div className="absolute top-2 right-2 bg-blue-500/80 rounded px-2 py-1">
            <span className="text-xs text-white">AI Processing...</span>
          </div>
        )}

        {/* Detection Overlays */}
        {detections.map((detection, index) => (
          <div
            key={index}
            className="absolute border-2 border-red-400 bg-red-400/20"
            style={{
              left: `${(detection.bbox?.x / 640) * 100}%`,
              top: `${(detection.bbox?.y / 480) * 100}%`,
              width: `${(detection.bbox?.width / 640) * 100}%`,
              height: `${(detection.bbox?.height / 480) * 100}%`,
            }}
          >
            <div className="absolute -top-6 left-0 bg-red-500 text-white text-xs px-1 rounded">
              {detection.class} ({Math.round(detection.confidence * 100)}%)
            </div>
          </div>
        ))}

        {/* Zone Label */}
        <div className="absolute bottom-2 left-2 bg-gray-900/80 text-white text-xs px-2 py-1 rounded">
          {zone}
        </div>
      </div>

      {/* Detection Summary */}
      <div className="mt-2 text-xs text-gray-400">
        <div className="flex justify-between">
          <span>Detections: {detections.length}</span>
          <span>Zone: {zone}</span>
        </div>
        {detections.length > 0 && (
          <div className="flex items-center space-x-1 mt-1">
            <AlertTriangle className="h-3 w-3 text-orange-400" />
            <span className="text-orange-400">Objects detected</span>
          </div>
        )}
      </div>
    </div>
  );
};