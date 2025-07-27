import React, { useState, useEffect } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, MapPin, Camera, Wifi, Info, Plane, Truck, Users, Eye, Thermometer, Cloud } from 'lucide-react';
import { VisionDashboard } from './VisionDashboard';

interface DigitalTwinProps {
  selectedZone: string;
  setSelectedZone: (zone: string) => void;
  alerts: any[];
  simulatorMode: boolean;
  systemConfig: any;
  onAlert?: (alert: any) => void;
}

export const DigitalTwin: React.FC<DigitalTwinProps> = ({ 
  selectedZone, 
  setSelectedZone, 
  alerts, 
  simulatorMode,
  systemConfig,
  onAlert
}) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [viewMode, setViewMode] = useState<'terminal' | 'airside'>('terminal');
  const [showVisionDashboard, setShowVisionDashboard] = useState(false);
  const [cameraFeeds, setCameraFeeds] = useState<any[]>([]);
  const [showZoneInfo, setShowZoneInfo] = useState(false);
  const [aircraftPositions, setAircraftPositions] = useState<any[]>([]);
  const [groundVehicles, setGroundVehicles] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState({
    temperature: 22,
    windSpeed: 8,
    visibility: 10,
    runway_condition: 'dry'
  });

  // Terminal zones (existing)
  const terminalZones = [
    { id: 'terminal-a', name: 'Terminal A', x: 20, y: 30, width: 200, height: 150, type: 'terminal' },
    { id: 'terminal-b', name: 'Terminal B', x: 250, y: 30, width: 200, height: 150, type: 'terminal' },
    { id: 'security-checkpoint', name: 'Security', x: 120, y: 200, width: 150, height: 100, type: 'security' },
    { id: 'baggage-claim', name: 'Baggage Claim', x: 300, y: 200, width: 180, height: 120, type: 'baggage' },
    { id: 'departure-lounge', name: 'Departure Lounge', x: 50, y: 350, width: 250, height: 100, type: 'lounge' },
    { id: 'retail-area', name: 'Retail Area', x: 350, y: 350, width: 120, height: 100, type: 'retail' }
  ];

  // Airside zones (new)
  const airsideZones = [
    { id: 'runway-09l', name: 'Runway 09L/27R', x: 50, y: 200, width: 400, height: 40, type: 'runway' },
    { id: 'runway-09r', name: 'Runway 09R/27L', x: 50, y: 300, width: 400, height: 40, type: 'runway' },
    { id: 'taxiway-alpha', name: 'Taxiway Alpha', x: 50, y: 250, width: 400, height: 20, type: 'taxiway' },
    { id: 'apron-north', name: 'North Apron', x: 100, y: 50, width: 150, height: 120, type: 'apron' },
    { id: 'apron-south', name: 'South Apron', x: 300, y: 50, width: 150, height: 120, type: 'apron' },
    { id: 'service-road-1', name: 'Service Road East', x: 470, y: 50, width: 20, height: 300, type: 'service_road' },
    { id: 'fuel-depot', name: 'Fuel Storage', x: 500, y: 100, width: 80, height: 60, type: 'fuel' },
    { id: 'cargo-area', name: 'Cargo Terminal', x: 500, y: 200, width: 100, height: 80, type: 'cargo' },
    { id: 'maintenance-hangar', name: 'Maintenance Hangar', x: 500, y: 300, width: 120, height: 100, type: 'hangar' }
  ];

  const currentZones = viewMode === 'terminal' ? terminalZones : airsideZones;

  const getZoneAlerts = (zoneId: string) => {
    return alerts.filter(alert => alert.zone === zoneId);
  };

  const getZoneStatusColor = (zoneId: string) => {
    const zoneAlerts = getZoneAlerts(zoneId);
    if (zoneAlerts.some(alert => alert.severity === 'critical')) return 'border-red-500 bg-red-500/20';
    if (zoneAlerts.some(alert => alert.severity === 'high')) return 'border-orange-500 bg-orange-500/20';
    if (zoneAlerts.some(alert => alert.severity === 'medium')) return 'border-yellow-500 bg-yellow-500/20';
    return 'border-green-500 bg-green-500/10';
  };

  const getZoneTypeColor = (type: string) => {
    switch (type) {
      case 'runway': return 'fill-gray-600 stroke-yellow-400';
      case 'taxiway': return 'fill-gray-700 stroke-blue-400';
      case 'apron': return 'fill-blue-900/30 stroke-blue-300';
      case 'service_road': return 'fill-gray-800 stroke-gray-400';
      case 'fuel': return 'fill-red-900/30 stroke-red-400';
      case 'cargo': return 'fill-orange-900/30 stroke-orange-400';
      case 'hangar': return 'fill-purple-900/30 stroke-purple-400';
      default: return 'fill-gray-700 stroke-gray-400';
    }
  };

  useEffect(() => {
    // Simulate camera feeds based on view mode
    const feeds = viewMode === 'terminal' ? [
      { id: 1, zone: selectedZone, status: 'active', angle: 'North View', type: 'security' },
      { id: 2, zone: selectedZone, status: 'active', angle: 'South View', type: 'security' },
      { id: 3, zone: selectedZone, status: 'active', angle: 'East View', type: 'security' },
      { id: 4, zone: selectedZone, status: 'active', angle: 'West View', type: 'security' }
    ] : [
      { id: 1, zone: selectedZone, status: 'active', angle: 'Runway Approach', type: 'thermal' },
      { id: 2, zone: selectedZone, status: 'active', angle: 'Apron Overview', type: 'drone' },
      { id: 3, zone: selectedZone, status: 'active', angle: 'Service Roads', type: 'security' },
      { id: 4, zone: selectedZone, status: 'active', angle: 'Perimeter', type: 'thermal' }
    ];
    setCameraFeeds(feeds);

    // Simulate aircraft positions (airside only)
    if (viewMode === 'airside') {
      setAircraftPositions([
        { id: 'AC001', callsign: 'UAL123', x: 120, y: 80, status: 'parked', type: 'B737' },
        { id: 'AC002', callsign: 'DAL456', x: 180, y: 100, status: 'pushback', type: 'A320' },
        { id: 'AC003', callsign: 'AAL789', x: 320, y: 90, status: 'boarding', type: 'B777' },
        { id: 'AC004', callsign: 'SWA101', x: 200, y: 260, status: 'taxiing', type: 'B737' }
      ]);

      setGroundVehicles([
        { id: 'GV001', type: 'fuel_truck', x: 140, y: 120, status: 'active', destination: 'AC001' },
        { id: 'GV002', type: 'catering', x: 200, y: 110, status: 'active', destination: 'AC002' },
        { id: 'GV003', type: 'baggage_cart', x: 340, y: 100, status: 'active', destination: 'AC003' },
        { id: 'GV004', type: 'pushback_tug', x: 175, y: 95, status: 'active', destination: 'AC002' },
        { id: 'GV005', type: 'security_patrol', x: 480, y: 150, status: 'patrol', destination: 'perimeter' }
      ]);
    }
  }, [selectedZone, viewMode]);

  const handleZoneClick = (zoneId: string) => {
    setSelectedZone(zoneId);
    setShowZoneInfo(true);
    setTimeout(() => setShowZoneInfo(false), 3000);
  };

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'fuel_truck': return '⛽';
      case 'catering': return '🍽️';
      case 'baggage_cart': return '🧳';
      case 'pushback_tug': return '🚜';
      case 'security_patrol': return '🚔';
      default: return '🚛';
    }
  };

  const getCameraIcon = (type: string) => {
    switch (type) {
      case 'thermal': return <Thermometer className="h-3 w-3" />;
      case 'drone': return <Eye className="h-3 w-3" />;
      default: return <Camera className="h-3 w-3" />;
    }
  };

  return (
    <div className="h-full bg-gray-900 relative overflow-hidden">
      {/* View Mode Toggle */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10">
        <div className="bg-gray-800/95 backdrop-blur-sm rounded-lg p-2 border border-gray-700 shadow-xl">
          <div className="flex space-x-2">
            <button
              onClick={() => setViewMode('terminal')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'terminal'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Terminal View
            </button>
            <button
              onClick={() => setViewMode('airside')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'airside'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Airside View
            </button>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute top-4 left-4 z-10 flex flex-col space-y-2">
        <div className="bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 border border-gray-700 shadow-xl">
          <div className="flex items-center space-x-2 mb-2">
            <MapPin className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium">Zone Control</span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 3))}
              className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
            <button
              onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.5))}
              className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <button
              onClick={() => setRotation(prev => (prev + 90) % 360)}
              className="p-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
              title="Rotate View"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
            <button
              onClick={() => setShowVisionDashboard(!showVisionDashboard)}
              className={`p-2 rounded transition-colors ${
                showVisionDashboard ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'
              }`}
              title="AI Vision Dashboard"
            >
              <Eye className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Camera Feeds */}
        <div className="bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 border border-gray-700 shadow-xl">
          <div className="flex items-center space-x-2 mb-2">
            <Camera className="h-4 w-4 text-green-400" />
            <span className="text-sm font-medium">Live Feeds</span>
          </div>
          <div className="space-y-1">
            {cameraFeeds.map(feed => (
              <div key={feed.id} className="flex items-center space-x-2 text-xs">
                <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                {getCameraIcon(feed.type)}
                <span className="text-gray-300">{feed.angle}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weather Data (Airside only) */}
        {viewMode === 'airside' && (
          <div className="bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 border border-gray-700 shadow-xl">
            <div className="flex items-center space-x-2 mb-2">
              <Cloud className="h-4 w-4 text-blue-400" />
              <span className="text-sm font-medium">Weather</span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-400">Temp:</span>
                <span className="text-white">{weatherData.temperature}°C</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Wind:</span>
                <span className="text-white">{weatherData.windSpeed} kt</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Visibility:</span>
                <span className="text-white">{weatherData.visibility} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Runway:</span>
                <span className="text-green-400">{weatherData.runway_condition}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Vision Dashboard */}
      {showVisionDashboard && (
        <div className="absolute top-4 right-96 z-10 w-80">
          <VisionDashboard selectedZone={selectedZone} onAlert={onAlert} />
        </div>
      )}

      {/* Zone Info */}
      <div className="absolute top-4 right-4 z-10 bg-gray-800/95 backdrop-blur-sm rounded-lg p-4 border border-gray-700 shadow-xl">
        <div className="flex items-center space-x-2 mb-2">
          <Wifi className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium">Selected Zone</span>
        </div>
        <div className="text-lg font-bold text-white mb-1">
          {currentZones.find(z => z.id === selectedZone)?.name || 'Unknown Zone'}
        </div>
        <div className="text-sm text-gray-400 space-y-1">
          <div>Active Alerts: {getZoneAlerts(selectedZone).length}</div>
          <div>Status: {getZoneAlerts(selectedZone).some(a => a.severity === 'critical') ? 'Critical' : 'Normal'}</div>
          {viewMode === 'airside' && (
            <>
              <div>Aircraft: {aircraftPositions.filter(ac => Math.abs(ac.x - 200) < 100).length}</div>
              <div>Vehicles: {groundVehicles.filter(gv => gv.status === 'active').length}</div>
            </>
          )}
        </div>
        
        {showZoneInfo && (
          <div className="mt-3 p-2 bg-blue-500/20 border border-blue-500 rounded text-xs text-blue-300">
            <Info className="h-3 w-3 inline mr-1" />
            Zone selected for monitoring
          </div>
        )}
      </div>

      {/* Digital Twin Visualization */}
      <div 
        className="absolute inset-0 flex items-center justify-center"
        style={{
          transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
          transition: 'transform 0.3s ease'
        }}
      >
        <div className="relative">
          {/* Airport Layout */}
          <svg width="650" height="500" className="bg-gray-800 rounded-lg border border-gray-700 shadow-2xl">
            {/* Background Grid */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#374151" strokeWidth="1"/>
              </pattern>
              <filter id="glow">
                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                <feMerge> 
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
              <pattern id="runway-markings" width="40" height="10" patternUnits="userSpaceOnUse">
                <rect width="40" height="10" fill="none"/>
                <rect x="15" y="3" width="10" height="4" fill="#FBBF24"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Airport Zones */}
            {currentZones.map(zone => (
              <g key={zone.id}>
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.width}
                  height={zone.height}
                  className={`cursor-pointer transition-all duration-300 hover:opacity-80 ${
                    selectedZone === zone.id 
                      ? 'stroke-blue-400 stroke-2 filter-glow' 
                      : 'stroke-gray-500 stroke-1'
                  } ${getZoneStatusColor(zone.id)} ${getZoneTypeColor(zone.type)}`}
                  onClick={() => handleZoneClick(zone.id)}
                  filter={selectedZone === zone.id ? "url(#glow)" : "none"}
                  fill={zone.type === 'runway' ? "url(#runway-markings)" : undefined}
                />
                <text
                  x={zone.x + zone.width / 2}
                  y={zone.y + zone.height / 2}
                  textAnchor="middle"
                  className="fill-white text-xs font-medium pointer-events-none"
                >
                  {zone.name}
                </text>
                
                {/* Alert Indicators */}
                {getZoneAlerts(zone.id).map((alert, index) => (
                  <circle
                    key={alert.id}
                    cx={zone.x + 10 + index * 15}
                    cy={zone.y + 10}
                    r="5"
                    className={`${
                      alert.severity === 'critical' ? 'fill-red-500' :
                      alert.severity === 'high' ? 'fill-orange-500' :
                      'fill-yellow-500'
                    } animate-pulse`}
                  />
                ))}
              </g>
            ))}

            {/* Aircraft (Airside view only) */}
            {viewMode === 'airside' && aircraftPositions.map(aircraft => (
              <g key={aircraft.id}>
                <circle
                  cx={aircraft.x}
                  cy={aircraft.y}
                  r="8"
                  className={`${
                    aircraft.status === 'taxiing' ? 'fill-yellow-400' :
                    aircraft.status === 'pushback' ? 'fill-orange-400' :
                    'fill-blue-400'
                  } stroke-white stroke-2`}
                />
                <text
                  x={aircraft.x}
                  y={aircraft.y - 15}
                  textAnchor="middle"
                  className="fill-white text-xs font-medium"
                >
                  {aircraft.callsign}
                </text>
                <Plane className="h-4 w-4 text-white" style={{
                  position: 'absolute',
                  left: aircraft.x - 8,
                  top: aircraft.y - 8,
                  pointerEvents: 'none'
                }} />
              </g>
            ))}

            {/* Ground Vehicles (Airside view only) */}
            {viewMode === 'airside' && groundVehicles.map(vehicle => (
              <g key={vehicle.id}>
                <rect
                  x={vehicle.x - 6}
                  y={vehicle.y - 4}
                  width="12"
                  height="8"
                  className={`${
                    vehicle.status === 'patrol' ? 'fill-red-400' :
                    'fill-green-400'
                  } stroke-white stroke-1 rounded`}
                />
                <text
                  x={vehicle.x}
                  y={vehicle.y + 15}
                  textAnchor="middle"
                  className="fill-white text-xs"
                >
                  {getVehicleIcon(vehicle.type)}
                </text>
              </g>
            ))}
            
            {/* Connection Lines (Terminal view only) */}
            {viewMode === 'terminal' && (
              <>
                <line x1="220" y1="105" x2="120" y2="200" stroke="#6B7280" strokeWidth="2" strokeDasharray="5,5"/>
                <line x1="250" y1="105" x2="300" y2="200" stroke="#6B7280" strokeWidth="2" strokeDasharray="5,5"/>
                <line x1="200" y1="300" x2="175" y2="350" stroke="#6B7280" strokeWidth="2" strokeDasharray="5,5"/>
                <line x1="380" y1="320" x2="410" y2="350" stroke="#6B7280" strokeWidth="2" strokeDasharray="5,5"/>
              </>
            )}

            {/* Taxiway Lines (Airside view only) */}
            {viewMode === 'airside' && (
              <>
                <line x1="50" y1="240" x2="450" y2="240" stroke="#3B82F6" strokeWidth="2" strokeDasharray="10,5"/>
                <line x1="50" y1="280" x2="450" y2="280" stroke="#3B82F6" strokeWidth="2" strokeDasharray="10,5"/>
                <line x1="175" y1="170" x2="175" y2="240" stroke="#3B82F6" strokeWidth="2" strokeDasharray="10,5"/>
                <line x1="375" y1="170" x2="375" y2="240" stroke="#3B82F6" strokeWidth="2" strokeDasharray="10,5"/>
              </>
            )}
          </svg>
        </div>
      </div>

      {/* Simulator Mode Overlay */}
      {simulatorMode && (
        <div className="absolute bottom-6 left-6 right-6 bg-orange-900/90 backdrop-blur-sm border border-orange-600 rounded-lg p-4 z-10 shadow-xl">
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 bg-orange-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-orange-200">Training Mode Active - {viewMode === 'airside' ? 'Airside Operations' : 'Terminal Operations'}</span>
          </div>
          <p className="text-xs text-orange-300 mt-1">
            {viewMode === 'airside' 
              ? 'Simulated runway, aircraft, and ground vehicle scenarios are active. This is for training purposes only.'
              : 'Simulated terminal safety scenarios are active. This is for training purposes only.'
            }
          </p>
        </div>
      )}
    </div>
  );
};