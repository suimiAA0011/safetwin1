import React, { useState, useEffect } from 'react';
import { Eye, Brain, Camera, Activity, Settings, Play, Pause } from 'lucide-react';
import { CameraFeed } from './CameraFeed';
import { visionService } from '../services/visionService';

interface VisionDashboardProps {
  selectedZone: string;
  onAlert?: (alert: any) => void;
}

export const VisionDashboard: React.FC<VisionDashboardProps> = ({ selectedZone, onAlert }) => {
  const [isVisionActive, setIsVisionActive] = useState(true);
  const [visionStats, setVisionStats] = useState({
    totalDetections: 0,
    activeFeeds: 0,
    processingLatency: 0,
    accuracy: 0
  });
  const [visionConfig, setVisionConfig] = useState({
    yoloEnabled: true,
    opencvEnabled: true,
    rekognitionEnabled: false, // Requires AWS credentials
    confidenceThreshold: 0.7,
    processingInterval: 1000
  });

  const cameraFeeds = [
    { id: '1', type: 'security' as const, name: 'North View' },
    { id: '2', type: 'thermal' as const, name: 'Thermal Scan' },
    { id: '3', type: 'drone' as const, name: 'Aerial View' },
    { id: '4', type: 'security' as const, name: 'Perimeter' }
  ];

  useEffect(() => {
    // Initialize vision services
    visionService.initialize().then(() => {
      console.log('Vision services initialized');
    }).catch(error => {
      console.error('Vision initialization failed:', error);
    });

    // Update stats periodically
    const interval = setInterval(() => {
      setVisionStats(prev => ({
        totalDetections: prev.totalDetections + Math.floor(Math.random() * 3),
        activeFeeds: cameraFeeds.length,
        processingLatency: 50 + Math.random() * 100,
        accuracy: 85 + Math.random() * 15
      }));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleAlert = (alert: any) => {
    if (onAlert) {
      onAlert({
        ...alert,
        id: Date.now().toString(),
        agentId: 'vision-ai'
      });
    }
  };

  const toggleVisionProcessing = () => {
    setIsVisionActive(!isVisionActive);
  };

  return (
    <div className="bg-gray-800/95 backdrop-blur-sm rounded-lg p-4 border border-gray-700 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Eye className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold">AI Vision System</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleVisionProcessing}
            className={`flex items-center space-x-2 px-3 py-1 rounded-lg transition-colors ${
              isVisionActive
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-gray-600 hover:bg-gray-700 text-gray-300'
            }`}
          >
            {isVisionActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span className="text-sm">{isVisionActive ? 'Active' : 'Paused'}</span>
          </button>
        </div>
      </div>

      {/* Vision Stats */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-gray-700/80 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-blue-400">{visionStats.totalDetections}</div>
          <div className="text-xs text-gray-400">Detections</div>
        </div>
        <div className="bg-gray-700/80 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-green-400">{visionStats.activeFeeds}</div>
          <div className="text-xs text-gray-400">Active Feeds</div>
        </div>
        <div className="bg-gray-700/80 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-orange-400">{Math.round(visionStats.processingLatency)}ms</div>
          <div className="text-xs text-gray-400">Latency</div>
        </div>
        <div className="bg-gray-700/80 rounded-lg p-2 text-center">
          <div className="text-lg font-bold text-purple-400">{Math.round(visionStats.accuracy)}%</div>
          <div className="text-xs text-gray-400">Accuracy</div>
        </div>
      </div>

      {/* AI Services Status */}
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2 flex items-center space-x-2">
          <Brain className="h-4 w-4 text-purple-400" />
          <span>AI Services</span>
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <div className={`p-2 rounded border ${visionConfig.yoloEnabled ? 'border-green-500 bg-green-500/20' : 'border-gray-600 bg-gray-700'}`}>
            <div className="text-xs font-medium">YOLOv8</div>
            <div className="text-xs text-gray-400">Object Detection</div>
          </div>
          <div className={`p-2 rounded border ${visionConfig.opencvEnabled ? 'border-green-500 bg-green-500/20' : 'border-gray-600 bg-gray-700'}`}>
            <div className="text-xs font-medium">OpenCV</div>
            <div className="text-xs text-gray-400">Motion Analysis</div>
          </div>
          <div className={`p-2 rounded border ${visionConfig.rekognitionEnabled ? 'border-green-500 bg-green-500/20' : 'border-gray-600 bg-gray-700'}`}>
            <div className="text-xs font-medium">AWS Rekognition</div>
            <div className="text-xs text-gray-400">Behavior Analysis</div>
          </div>
        </div>
      </div>

      {/* Camera Feeds */}
      <div className="grid grid-cols-2 gap-3">
        {cameraFeeds.map(feed => (
          <CameraFeed
            key={feed.id}
            feedId={feed.id}
            zone={selectedZone}
            type={feed.type}
            onAlert={isVisionActive ? handleAlert : undefined}
          />
        ))}
      </div>

      {/* Configuration Panel */}
      <div className="mt-4 p-3 bg-gray-700/50 rounded-lg">
        <div className="flex items-center space-x-2 mb-2">
          <Settings className="h-4 w-4 text-gray-400" />
          <span className="text-sm font-medium">Vision Configuration</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Confidence Threshold</span>
            <input
              type="range"
              min="0.5"
              max="0.95"
              step="0.05"
              value={visionConfig.confidenceThreshold}
              onChange={(e) => setVisionConfig(prev => ({
                ...prev,
                confidenceThreshold: parseFloat(e.target.value)
              }))}
              className="w-20"
            />
            <span className="text-xs text-white">{Math.round(visionConfig.confidenceThreshold * 100)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Processing Interval</span>
            <select
              value={visionConfig.processingInterval}
              onChange={(e) => setVisionConfig(prev => ({
                ...prev,
                processingInterval: parseInt(e.target.value)
              }))}
              className="text-xs bg-gray-600 border border-gray-500 rounded px-2 py-1"
            >
              <option value={500}>500ms</option>
              <option value={1000}>1s</option>
              <option value={2000}>2s</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};