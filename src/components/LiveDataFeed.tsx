import React, { useState, useEffect } from 'react';
import { Activity, Camera, Wifi, Users, Clock, Plane, Truck, Wind, Thermometer } from 'lucide-react';

interface LiveDataFeedProps {
  selectedZone: string;
}

export const LiveDataFeed: React.FC<LiveDataFeedProps> = ({ selectedZone }) => {
  const [sensorData, setSensorData] = useState({
    occupancy: 0,
    temperature: 0,
    humidity: 0,
    airQuality: 0,
    noiseLevel: 0,
    // Airside specific data
    aircraftCount: 0,
    vehicleCount: 0,
    windSpeed: 0,
    visibility: 0,
    runwayCondition: 'dry'
  });

  const [cameraStatus, setCameraStatus] = useState([
    { id: 1, name: 'North Entrance', status: 'active', fps: 30, type: 'security' },
    { id: 2, name: 'South Entrance', status: 'active', fps: 30, type: 'security' },
    { id: 3, name: 'Central Area', status: 'active', fps: 30, type: 'security' },
    { id: 4, name: 'Exit Gates', status: 'active', fps: 30, type: 'security' }
  ]);

  const isAirsideZone = (zone: string) => {
    return ['runway-09l', 'runway-09r', 'taxiway-alpha', 'apron-north', 'apron-south', 
            'service-road-1', 'fuel-depot', 'cargo-area', 'maintenance-hangar'].includes(zone);
  };

  useEffect(() => {
    // Update camera feeds based on zone type
    if (isAirsideZone(selectedZone)) {
      setCameraStatus([
        { id: 1, name: 'Runway Approach', status: 'active', fps: 30, type: 'thermal' },
        { id: 2, name: 'Apron Overview', status: 'active', fps: 60, type: 'drone' },
        { id: 3, name: 'Service Roads', status: 'active', fps: 30, type: 'security' },
        { id: 4, name: 'Perimeter', status: 'active', fps: 30, type: 'thermal' }
      ]);
    } else {
      setCameraStatus([
        { id: 1, name: 'North Entrance', status: 'active', fps: 30, type: 'security' },
        { id: 2, name: 'South Entrance', status: 'active', fps: 30, type: 'security' },
        { id: 3, name: 'Central Area', status: 'active', fps: 30, type: 'security' },
        { id: 4, name: 'Exit Gates', status: 'active', fps: 30, type: 'security' }
      ]);
    }

    // Simulate real-time sensor data
    const interval = setInterval(() => {
      setSensorData({
        occupancy: Math.floor(Math.random() * 100),
        temperature: Math.floor(Math.random() * 5) + 20,
        humidity: Math.floor(Math.random() * 20) + 40,
        airQuality: Math.floor(Math.random() * 50) + 50,
        noiseLevel: Math.floor(Math.random() * 30) + 35,
        // Airside specific
        aircraftCount: Math.floor(Math.random() * 8) + 2,
        vehicleCount: Math.floor(Math.random() * 15) + 5,
        windSpeed: Math.floor(Math.random() * 15) + 3,
        visibility: Math.floor(Math.random() * 5) + 8,
        runwayCondition: Math.random() > 0.8 ? 'wet' : 'dry'
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [selectedZone]);

  const getCameraIcon = (type: string) => {
    switch (type) {
      case 'thermal': return <Thermometer className="h-4 w-4 text-red-400" />;
      case 'drone': return <Plane className="h-4 w-4 text-blue-400" />;
      default: return <Camera className="h-4 w-4 text-green-400" />;
    }
  };

  return (
    <div className="absolute bottom-6 left-6 right-6 bg-gray-800/95 backdrop-blur-sm rounded-lg p-4 border border-gray-700 shadow-xl">
      <div className="flex items-center space-x-2 mb-4">
        <Activity className="h-5 w-5 text-green-400" />
        <h3 className="text-lg font-semibold">Live Data Feed - {selectedZone}</h3>
        <span className={`text-xs px-2 py-1 rounded ${
          isAirsideZone(selectedZone) ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
        }`}>
          {isAirsideZone(selectedZone) ? 'AIRSIDE' : 'TERMINAL'}
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {/* Primary Metrics */}
        <div className="bg-gray-700/80 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            {isAirsideZone(selectedZone) ? (
              <>
                <Plane className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium">Aircraft</span>
              </>
            ) : (
              <>
                <Users className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium">Occupancy</span>
              </>
            )}
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {isAirsideZone(selectedZone) ? sensorData.aircraftCount : `${sensorData.occupancy}%`}
          </div>
          <div className="text-xs text-gray-400">
            {isAirsideZone(selectedZone) ? 'Active aircraft' : 'Current capacity'}
          </div>
        </div>

        {/* Environmental Data */}
        <div className="bg-gray-700/80 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Clock className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium">Environment</span>
          </div>
          <div className="text-sm space-y-1">
            <div>Temp: {sensorData.temperature}°C</div>
            <div>Humidity: {sensorData.humidity}%</div>
            {isAirsideZone(selectedZone) ? (
              <div>Visibility: {sensorData.visibility} km</div>
            ) : (
              <div>Air Quality: {sensorData.airQuality}</div>
            )}
          </div>
        </div>

        {/* Weather/Operations Data */}
        {isAirsideZone(selectedZone) ? (
          <div className="bg-gray-700/80 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Wind className="h-4 w-4 text-cyan-400" />
              <span className="text-sm font-medium">Weather</span>
            </div>
            <div className="text-sm space-y-1">
              <div>Wind: {sensorData.windSpeed} kt</div>
              <div>Runway: {sensorData.runwayCondition}</div>
              <div className={`${sensorData.runwayCondition === 'wet' ? 'text-orange-400' : 'text-green-400'}`}>
                {sensorData.runwayCondition === 'wet' ? 'Caution' : 'Normal'}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-700/80 rounded-lg p-3">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium">Activity</span>
            </div>
            <div className="text-sm space-y-1">
              <div>Noise: {sensorData.noiseLevel} dB</div>
              <div>Traffic: Normal</div>
              <div className="text-green-400">Operational</div>
            </div>
          </div>
        )}

        {/* Camera Status */}
        <div className="bg-gray-700/80 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Camera className="h-4 w-4 text-purple-400" />
            <span className="text-sm font-medium">Cameras</span>
          </div>
          <div className="text-sm space-y-1">
            {cameraStatus.slice(0, 2).map(camera => (
              <div key={camera.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-1">
                  {getCameraIcon(camera.type)}
                  <span className="text-xs">{camera.name}</span>
                </div>
                <span className="text-green-400 text-xs">●</span>
              </div>
            ))}
          </div>
        </div>

        {/* Network/System Status */}
        <div className="bg-gray-700/80 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Wifi className="h-4 w-4 text-orange-400" />
            <span className="text-sm font-medium">System</span>
          </div>
          <div className="text-sm space-y-1">
            <div>Uptime: 99.8%</div>
            <div>Latency: 12ms</div>
            {isAirsideZone(selectedZone) ? (
              <div>Vehicles: {sensorData.vehicleCount}</div>
            ) : (
              <div>Bandwidth: 95%</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};