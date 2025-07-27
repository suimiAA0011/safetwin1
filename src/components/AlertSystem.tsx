import React from 'react';
import { AlertTriangle, X, Clock, MapPin } from 'lucide-react';

interface AlertSystemProps {
  alerts: any[];
  clearAlert: (alertId: string) => void;
}

export const AlertSystem: React.FC<AlertSystemProps> = ({ alerts, clearAlert }) => {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/20 border-red-500 text-red-400';
      case 'high': return 'bg-orange-500/20 border-orange-500 text-orange-400';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
      default: return 'bg-blue-500/20 border-blue-500 text-blue-400';
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className="p-4 flex-1 overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-5 w-5 text-orange-400" />
          <h2 className="text-lg font-semibold">Active Alerts</h2>
        </div>
        <div className="text-sm text-gray-400">
          {alerts.length} active
        </div>
      </div>
      
      <div className="space-y-3">
        {alerts.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <AlertTriangle className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No active alerts</p>
            <p className="text-xs">System monitoring normally</p>
          </div>
        ) : (
          alerts.map(alert => (
            <div 
              key={alert.id} 
              className={`border rounded-lg p-3 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`h-2 w-2 rounded-full ${
                      alert.severity === 'critical' ? 'bg-red-400' :
                      alert.severity === 'high' ? 'bg-orange-400' :
                      'bg-yellow-400'
                    } animate-pulse`} />
                    <span className="text-sm font-medium">
                      {alert.type.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  
                  <p className="text-sm mb-2">{alert.message}</p>
                  
                  <div className="flex items-center space-x-4 text-xs">
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(alert.timestamp)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{alert.zone}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => clearAlert(alert.id)}
                  className="p-1 hover:bg-gray-600 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};