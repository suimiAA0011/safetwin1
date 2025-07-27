import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, RefreshCw, Bell, Shield, Users, Monitor, Volume2 } from 'lucide-react';

interface SettingsProps {
  config: any;
  updateConfig: (newConfig: any) => void;
}

export const Settings: React.FC<SettingsProps> = ({ config, updateConfig }) => {
  const [activeTab, setActiveTab] = useState('general');
  const [localConfig, setLocalConfig] = useState(config);
  const [hasChanges, setHasChanges] = useState(false);

  const tabs = [
    { id: 'general', label: 'General', icon: SettingsIcon },
    { id: 'alerts', label: 'Alerts', icon: Bell },
    { id: 'agents', label: 'AI Agents', icon: Shield },
    { id: 'zones', label: 'Zones', icon: Monitor },
    { id: 'team', label: 'Team', icon: Users }
  ];

  const handleConfigChange = (section: string, key: string, value: any) => {
    const newConfig = {
      ...localConfig,
      [section]: {
        ...localConfig[section],
        [key]: value
      }
    };
    setLocalConfig(newConfig);
    setHasChanges(true);
  };

  const handleSave = () => {
    updateConfig(localConfig);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalConfig(config);
    setHasChanges(false);
  };

  return (
    <div className="h-full flex">
      {/* Settings Sidebar */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 p-4">
        <div className="flex items-center space-x-2 mb-6">
          <SettingsIcon className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl font-semibold">Settings</h2>
        </div>
        
        <nav className="space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Settings Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        <div className="max-w-4xl">
          {/* Header with Save/Reset */}
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-semibold capitalize">{activeTab} Settings</h3>
            <div className="flex space-x-3">
              <button
                onClick={handleReset}
                disabled={!hasChanges}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  hasChanges
                    ? 'bg-gray-600 hover:bg-gray-700 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset</span>
              </button>
              <button
                onClick={handleSave}
                disabled={!hasChanges}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  hasChanges
                    ? 'bg-blue-600 hover:bg-blue-700 text-white'
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>

          {/* Settings Content */}
          {activeTab === 'general' && (
            <GeneralSettings config={localConfig} onChange={handleConfigChange} />
          )}
          {activeTab === 'alerts' && (
            <AlertSettings config={localConfig} onChange={handleConfigChange} />
          )}
          {activeTab === 'agents' && (
            <AgentSettings config={localConfig} onChange={handleConfigChange} />
          )}
          {activeTab === 'zones' && (
            <ZoneSettings config={localConfig} onChange={handleConfigChange} />
          )}
          {activeTab === 'team' && (
            <TeamSettings config={localConfig} onChange={handleConfigChange} />
          )}
        </div>
      </div>
    </div>
  );
};

const GeneralSettings: React.FC<any> = ({ config, onChange }) => (
  <div className="space-y-6">
    <div className="bg-gray-800 rounded-lg p-6">
      <h4 className="text-lg font-semibold mb-4">Airport Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Airport Name</label>
          <input
            type="text"
            value={config.airportName || ''}
            onChange={(e) => onChange('', 'airportName', e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Your Role</label>
          <select
            value={config.userRole || ''}
            onChange={(e) => onChange('', 'userRole', e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="">Select role</option>
            <option value="security_chief">Security Chief</option>
            <option value="operations_manager">Operations Manager</option>
            <option value="safety_officer">Safety Officer</option>
            <option value="it_administrator">IT Administrator</option>
            <option value="field_officer">Field Officer</option>
          </select>
        </div>
      </div>
    </div>

    <div className="bg-gray-800 rounded-lg p-6">
      <h4 className="text-lg font-semibold mb-4">System Preferences</h4>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h5 className="font-medium">Auto-refresh Dashboard</h5>
            <p className="text-sm text-gray-400">Automatically update data every 5 seconds</p>
          </div>
          <button
            onClick={() => onChange('systemSettings', 'autoRefresh', !config.systemSettings?.autoRefresh)}
            className={`w-12 h-6 rounded-full transition-colors ${
              config.systemSettings?.autoRefresh ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                config.systemSettings?.autoRefresh ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h5 className="font-medium">Dark Mode</h5>
            <p className="text-sm text-gray-400">Use dark theme for the interface</p>
          </div>
          <button
            onClick={() => onChange('systemSettings', 'darkMode', !config.systemSettings?.darkMode)}
            className={`w-12 h-6 rounded-full transition-colors ${
              config.systemSettings?.darkMode !== false ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                config.systemSettings?.darkMode !== false ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const AlertSettings: React.FC<any> = ({ config, onChange }) => (
  <div className="space-y-6">
    <div className="bg-gray-800 rounded-lg p-6">
      <h4 className="text-lg font-semibold mb-4">Alert Thresholds</h4>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Minimum Alert Level</label>
          <select
            value={config.alertSettings?.alertThreshold || 'medium'}
            onChange={(e) => onChange('alertSettings', 'alertThreshold', e.target.value)}
            className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
          >
            <option value="low">Low - All incidents</option>
            <option value="medium">Medium - Important incidents</option>
            <option value="high">High - Critical incidents only</option>
          </select>
        </div>
      </div>
    </div>

    <div className="bg-gray-800 rounded-lg p-6">
      <h4 className="text-lg font-semibold mb-4">Notification Methods</h4>
      <div className="space-y-4">
        {[
          { key: 'voiceAlerts', label: 'Voice Alerts', description: 'Audio announcements for critical alerts' },
          { key: 'emailNotifications', label: 'Email Notifications', description: 'Send alerts via email' },
          { key: 'pushNotifications', label: 'Push Notifications', description: 'Browser push notifications' },
          { key: 'smsAlerts', label: 'SMS Alerts', description: 'Text message notifications for critical alerts' }
        ].map(item => (
          <div key={item.key} className="flex items-center justify-between">
            <div>
              <h5 className="font-medium">{item.label}</h5>
              <p className="text-sm text-gray-400">{item.description}</p>
            </div>
            <button
              onClick={() => onChange('alertSettings', item.key, !config.alertSettings?.[item.key])}
              className={`w-12 h-6 rounded-full transition-colors ${
                config.alertSettings?.[item.key] ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  config.alertSettings?.[item.key] ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const AgentSettings: React.FC<any> = ({ config, onChange }) => (
  <div className="space-y-6">
    <div className="bg-gray-800 rounded-lg p-6">
      <h4 className="text-lg font-semibold mb-4">AI Agent Configuration</h4>
      <div className="space-y-4">
        {[
          { key: 'anomalyDetection', label: 'Anomaly Detection', description: 'Detects unusual behavior and objects' },
          { key: 'crowdMonitoring', label: 'Crowd Monitoring', description: 'Monitors crowd density and movement' },
          { key: 'securityBreach', label: 'Security Breach Detection', description: 'Identifies unauthorized access' },
          { key: 'emergencyResponse', label: 'Emergency Response', description: 'Coordinates emergency protocols' }
        ].map(agent => (
          <div key={agent.key} className="flex items-center justify-between p-4 bg-gray-700 rounded-lg">
            <div>
              <h5 className="font-medium">{agent.label}</h5>
              <p className="text-sm text-gray-400">{agent.description}</p>
            </div>
            <button
              onClick={() => onChange('aiAgents', agent.key, !config.aiAgents?.[agent.key])}
              className={`w-12 h-6 rounded-full transition-colors ${
                config.aiAgents?.[agent.key] ? 'bg-blue-500' : 'bg-gray-600'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  config.aiAgents?.[agent.key] ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const ZoneSettings: React.FC<any> = ({ config, onChange }) => {
  const availableZones = [
    { id: 'terminal-a', name: 'Terminal A', description: 'Main passenger terminal' },
    { id: 'terminal-b', name: 'Terminal B', description: 'Secondary passenger terminal' },
    { id: 'security-checkpoint', name: 'Security Checkpoint', description: 'TSA screening area' },
    { id: 'baggage-claim', name: 'Baggage Claim', description: 'Baggage collection area' },
    { id: 'departure-lounge', name: 'Departure Lounge', description: 'Gate waiting areas' },
    { id: 'retail-area', name: 'Retail Area', description: 'Shopping and dining' }
  ];

  const toggleZone = (zoneId: string) => {
    const currentZones = config.zones || [];
    const newZones = currentZones.includes(zoneId)
      ? currentZones.filter((id: string) => id !== zoneId)
      : [...currentZones, zoneId];
    onChange('', 'zones', newZones);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-800 rounded-lg p-6">
        <h4 className="text-lg font-semibold mb-4">Monitoring Zones</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {availableZones.map(zone => (
            <div
              key={zone.id}
              onClick={() => toggleZone(zone.id)}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                config.zones?.includes(zone.id)
                  ? 'border-blue-500 bg-blue-500/20'
                  : 'border-gray-600 bg-gray-700 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="font-semibold">{zone.name}</h5>
                  <p className="text-sm text-gray-400">{zone.description}</p>
                </div>
                <div className={`w-6 h-6 rounded-full border-2 ${
                  config.zones?.includes(zone.id)
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-500'
                }`}>
                  {config.zones?.includes(zone.id) && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TeamSettings: React.FC<any> = ({ config, onChange }) => (
  <div className="space-y-6">
    <div className="bg-gray-800 rounded-lg p-6">
      <h4 className="text-lg font-semibold mb-4">Team Management</h4>
      <p className="text-gray-400 mb-4">Configure team roles and permissions</p>
      <div className="space-y-4">
        <div className="p-4 bg-gray-700 rounded-lg">
          <h5 className="font-medium mb-2">Security Team Access</h5>
          <div className="space-y-2">
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="text-sm">View all alerts</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" defaultChecked />
              <span className="text-sm">Acknowledge alerts</span>
            </label>
            <label className="flex items-center space-x-2">
              <input type="checkbox" className="rounded" />
              <span className="text-sm">Modify system settings</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </div>
);