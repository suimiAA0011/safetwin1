import React from 'react';
import { Shield, Users, Phone, MapPin, Clock, AlertCircle } from 'lucide-react';

interface SecurityTeamPanelProps {
  alerts: any[];
  incidents: any[];
}

export const SecurityTeamPanel: React.FC<SecurityTeamPanelProps> = ({ alerts, incidents }) => {
  const securityTeam = [
    { id: 1, name: 'Sarah Johnson', role: 'Security Chief', status: 'available', zone: 'Central Command' },
    { id: 2, name: 'Mike Chen', role: 'Field Officer', status: 'on_duty', zone: 'Terminal A' },
    { id: 3, name: 'Emma Davis', role: 'Field Officer', status: 'responding', zone: 'Terminal B' },
    { id: 4, name: 'James Wilson', role: 'Supervisor', status: 'available', zone: 'Security Checkpoint' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-400';
      case 'on_duty': return 'text-blue-400';
      case 'responding': return 'text-orange-400';
      case 'unavailable': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'available': return '●';
      case 'on_duty': return '▲';
      case 'responding': return '!';
      case 'unavailable': return '×';
      default: return '○';
    }
  };

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const highAlerts = alerts.filter(alert => alert.severity === 'high');

  return (
    <div className="flex flex-col h-full">
      {/* Security Team Status */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-semibold">Security Team</h2>
        </div>
        
        <div className="space-y-3">
          {securityTeam.map(officer => (
            <div key={officer.id} className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium">{officer.name}</span>
                <span className={`text-sm ${getStatusColor(officer.status)}`}>
                  {getStatusIcon(officer.status)}
                </span>
              </div>
              <div className="text-xs text-gray-400">{officer.role}</div>
              <div className="text-xs text-gray-400">{officer.zone}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Priority Alerts */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2 mb-4">
          <AlertCircle className="h-5 w-5 text-red-400" />
          <h2 className="text-lg font-semibold">Priority Alerts</h2>
        </div>
        
        <div className="space-y-2">
          {criticalAlerts.length > 0 && (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3">
              <div className="text-sm font-medium text-red-400 mb-1">
                Critical Alerts ({criticalAlerts.length})
              </div>
              <div className="text-xs text-red-300">
                Immediate response required
              </div>
            </div>
          )}
          
          {highAlerts.length > 0 && (
            <div className="bg-orange-500/20 border border-orange-500 rounded-lg p-3">
              <div className="text-sm font-medium text-orange-400 mb-1">
                High Priority ({highAlerts.length})
              </div>
              <div className="text-xs text-orange-300">
                Response within 5 minutes
              </div>
            </div>
          )}
          
          {criticalAlerts.length === 0 && highAlerts.length === 0 && (
            <div className="text-center text-gray-500 py-4">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No priority alerts</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-4 flex-1">
        <div className="flex items-center space-x-2 mb-4">
          <Users className="h-5 w-5 text-green-400" />
          <h2 className="text-lg font-semibold">Quick Actions</h2>
        </div>
        
        <div className="space-y-2">
          <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors text-sm">
            Dispatch Team
          </button>
          <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-2 px-4 rounded-lg transition-colors text-sm">
            Emergency Protocol
          </button>
          <button className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-sm">
            All Clear
          </button>
        </div>
        
        <div className="mt-6 bg-gray-700 rounded-lg p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Phone className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium">Emergency Contacts</span>
          </div>
          <div className="text-xs text-gray-400 space-y-1">
            <div>Control Room: +1 (555) 0123</div>
            <div>Local Police: +1 (555) 0911</div>
            <div>Fire Department: +1 (555) 0456</div>
          </div>
        </div>
      </div>
    </div>
  );
};