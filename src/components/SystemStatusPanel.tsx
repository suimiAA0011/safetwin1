import React, { useState, useEffect } from 'react';
import { Activity, Wifi, WifiOff, Server, Database, Camera, Cpu, AlertTriangle, CheckCircle, Clock, Users } from 'lucide-react';

interface SystemStatusPanelProps {
  connectionStatus: 'connecting' | 'connected' | 'offline';
  simulatorMode: boolean;
  alerts: any[];
  incidents: any[];
}

export const SystemStatusPanel: React.FC<SystemStatusPanelProps> = ({
  connectionStatus,
  simulatorMode,
  alerts,
  incidents
}) => {
  const [systemMetrics, setSystemMetrics] = useState({
    uptime: 99.8,
    responseTime: 45,
    activeConnections: 156,
    memoryUsage: 68,
    cpuUsage: 23,
    diskUsage: 45
  });

  const [componentStatus, setComponentStatus] = useState({
    database: 'online',
    sensors: 'online',
    cameras: 'online',
    aiServices: 'online',
    network: connectionStatus === 'connected' ? 'online' : 'offline'
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        uptime: Math.max(99.0, prev.uptime + (Math.random() - 0.5) * 0.1),
        responseTime: Math.max(20, prev.responseTime + (Math.random() - 0.5) * 10),
        activeConnections: Math.max(100, prev.activeConnections + Math.floor((Math.random() - 0.5) * 20)),
        memoryUsage: Math.max(50, Math.min(90, prev.memoryUsage + (Math.random() - 0.5) * 5)),
        cpuUsage: Math.max(10, Math.min(80, prev.cpuUsage + (Math.random() - 0.5) * 10)),
        diskUsage: Math.max(30, Math.min(70, prev.diskUsage + (Math.random() - 0.5) * 2))
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setComponentStatus(prev => ({
      ...prev,
      network: connectionStatus === 'connected' ? 'online' : 'offline'
    }));
  }, [connectionStatus]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'offline': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      default: return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400';
      case 'offline': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getMetricColor = (value: number, type: 'usage' | 'uptime' | 'response') => {
    if (type === 'uptime') {
      return value >= 99.5 ? 'text-green-400' : value >= 99.0 ? 'text-yellow-400' : 'text-red-400';
    } else if (type === 'response') {
      return value <= 50 ? 'text-green-400' : value <= 100 ? 'text-yellow-400' : 'text-red-400';
    } else { // usage
      return value <= 70 ? 'text-green-400' : value <= 85 ? 'text-yellow-400' : 'text-red-400';
    }
  };

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical').length;
  const highAlerts = alerts.filter(alert => alert.severity === 'high').length;
  const activeIncidents = incidents.filter(incident => incident.status === 'active').length;

  return (
    <div className="flex flex-col h-full">
      {/* System Overview */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <Server className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold">System Overview</h3>
        </div>
        
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Uptime</span>
              <span className={`text-sm font-bold ${getMetricColor(systemMetrics.uptime, 'uptime')}`}>
                {systemMetrics.uptime.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-1">
              <div 
                className="bg-green-400 h-1 rounded-full transition-all duration-300"
                style={{ width: `${systemMetrics.uptime}%` }}
              />
            </div>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Response</span>
              <span className={`text-sm font-bold ${getMetricColor(systemMetrics.responseTime, 'response')}`}>
                {Math.round(systemMetrics.responseTime)}ms
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-1">
              <div 
                className="bg-blue-400 h-1 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, (200 - systemMetrics.responseTime) / 2)}%` }}
              />
            </div>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">Memory</span>
              <span className={`text-sm font-bold ${getMetricColor(systemMetrics.memoryUsage, 'usage')}`}>
                {Math.round(systemMetrics.memoryUsage)}%
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-1">
              <div 
                className="bg-purple-400 h-1 rounded-full transition-all duration-300"
                style={{ width: `${systemMetrics.memoryUsage}%` }}
              />
            </div>
          </div>
          
          <div className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">CPU</span>
              <span className={`text-sm font-bold ${getMetricColor(systemMetrics.cpuUsage, 'usage')}`}>
                {Math.round(systemMetrics.cpuUsage)}%
              </span>
            </div>
            <div className="w-full bg-gray-600 rounded-full h-1">
              <div 
                className="bg-orange-400 h-1 rounded-full transition-all duration-300"
                style={{ width: `${systemMetrics.cpuUsage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Component Status */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <Activity className="h-5 w-5 text-green-400" />
          <h3 className="text-lg font-semibold">Component Status</h3>
        </div>
        
        <div className="space-y-3">
          {[
            { key: 'database', label: 'Database', icon: Database },
            { key: 'sensors', label: 'IoT Sensors', icon: Activity },
            { key: 'cameras', label: 'Camera Feeds', icon: Camera },
            { key: 'aiServices', label: 'AI Services', icon: Cpu },
            { key: 'network', label: 'Network', icon: connectionStatus === 'connected' ? Wifi : WifiOff }
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Icon className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{label}</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(componentStatus[key])}
                <span className={`text-xs font-medium ${getStatusColor(componentStatus[key])}`}>
                  {componentStatus[key].toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alert Summary */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <AlertTriangle className="h-5 w-5 text-orange-400" />
          <h3 className="text-lg font-semibold">Alert Summary</h3>
        </div>
        
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-red-400">{criticalAlerts}</div>
            <div className="text-xs text-red-300">Critical</div>
          </div>
          <div className="bg-orange-500/20 border border-orange-500/30 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-orange-400">{highAlerts}</div>
            <div className="text-xs text-orange-300">High</div>
          </div>
          <div className="bg-purple-500/20 border border-purple-500/30 rounded-lg p-2 text-center">
            <div className="text-lg font-bold text-purple-400">{activeIncidents}</div>
            <div className="text-xs text-purple-300">Incidents</div>
          </div>
        </div>
      </div>

      {/* Connection Info */}
      <div className="p-4 flex-1">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-cyan-400" />
          <h3 className="text-lg font-semibold">Connection Info</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Active Connections</span>
            <span className="text-sm font-medium text-cyan-400">{systemMetrics.activeConnections}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Mode</span>
            <span className={`text-sm font-medium ${simulatorMode ? 'text-orange-400' : 'text-green-400'}`}>
              {simulatorMode ? 'Simulation' : 'Live'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Last Update</span>
            <span className="text-sm font-medium text-gray-300">
              {new Date().toLocaleTimeString()}
            </span>
          </div>
        </div>

        {simulatorMode && (
          <div className="mt-4 p-3 bg-orange-500/20 border border-orange-500/30 rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Clock className="h-4 w-4 text-orange-400" />
              <span className="text-sm font-medium text-orange-300">Training Mode Active</span>
            </div>
            <p className="text-xs text-orange-200">
              System is running in simulation mode for training and demonstration purposes.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};