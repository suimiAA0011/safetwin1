import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, Clock } from 'lucide-react';

interface SafetyMetricsProps {
  alerts: any[];
  incidents: any[];
}

export const SafetyMetrics: React.FC<SafetyMetricsProps> = ({ alerts, incidents }) => {
  const totalAlerts = alerts.length;
  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical').length;
  const responseTime = 2.3; // minutes (simulated)
  const systemUptime = 99.8; // percent (simulated)

  return (
    <div className="p-4 h-full">
      <div className="flex items-center space-x-2 mb-4">
        <BarChart3 className="h-5 w-5 text-blue-400" />
        <h2 className="text-lg font-semibold">Safety Metrics</h2>
      </div>
      
      <div className="grid grid-cols-4 gap-4 h-20">
        <div className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-blue-400">{totalAlerts}</div>
            <div className="text-xs text-gray-400">Active Alerts</div>
          </div>
          <TrendingUp className="h-8 w-8 text-blue-400 opacity-50" />
        </div>
        
        <div className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-red-400">{criticalAlerts}</div>
            <div className="text-xs text-gray-400">Critical</div>
          </div>
          <TrendingDown className="h-8 w-8 text-red-400 opacity-50" />
        </div>
        
        <div className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-green-400">{responseTime}m</div>
            <div className="text-xs text-gray-400">Avg Response</div>
          </div>
          <Clock className="h-8 w-8 text-green-400 opacity-50" />
        </div>
        
        <div className="bg-gray-700 rounded-lg p-3 flex items-center justify-between">
          <div>
            <div className="text-2xl font-bold text-green-400">{systemUptime}%</div>
            <div className="text-xs text-gray-400">System Uptime</div>
          </div>
          <BarChart3 className="h-8 w-8 text-green-400 opacity-50" />
        </div>
      </div>
    </div>
  );
};