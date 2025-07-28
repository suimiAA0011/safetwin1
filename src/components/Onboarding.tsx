import React, { useState } from 'react';
import { Shield, ArrowRight, CheckCircle, Settings, Users, AlertTriangle, Bot, Plane, Building } from 'lucide-react';
import { User } from '../types';

interface OnboardingProps {
  onComplete: (config: any) => void;
  onSkip: () => void;
  isGuestMode?: boolean;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onSkip, isGuestMode = false }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState({
    airportName: '',
    userRole: '',
    zones: [],
    alertSettings: {
      voiceAlerts: true,
      emailNotifications: true,
      pushNotifications: true,
      alertThreshold: 'medium'
    },
    aiAgents: {
      anomalyDetection: true,
      crowdMonitoring: true,
      securityBreach: true,
      emergencyResponse: true,
      // Airside agents
      runwayMonitoring: true,
      aircraftTracking: true,
      vehicleMonitoring: true,
      fuelSafety: true,
      perimeterSecurity: true,
      weatherMonitoring: true
    }
  });

  const steps = [
    {
      title: 'Welcome to SafeTwin',
      subtitle: 'AI-Powered Airport Safety System',
      component: WelcomeStep
    },
    {
      title: 'Airport Configuration',
      subtitle: 'Set up your airport details',
      component: AirportConfigStep
    },
    {
      title: 'Zone Selection',
      subtitle: 'Choose monitoring zones',
      component: ZoneSelectionStep
    },
    {
      title: 'AI Agent Setup',
      subtitle: 'Configure your AI agents',
      component: AIAgentSetupStep
    },
    {
      title: 'Alert Preferences',
      subtitle: 'Customize your notifications',
      component: AlertPreferencesStep
    },
    {
      title: 'Setup Complete',
      subtitle: 'Ready to monitor your airport',
      component: CompletionStep
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Mark onboarding as completed
      if (isGuestMode) {
        // Store as temporary session preferences
        sessionStorage.setItem('safetwin_guest_preferences', JSON.stringify(config));
      } else {
        localStorage.setItem('safetwin_onboarding_completed', 'true');
      }
      onComplete(config);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* White Header Bar */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">SafeTwin</h1>
                <p className="text-xs text-gray-600">AI Airport Safety System</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={onSkip}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Skip Setup
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
      <div className="max-w-4xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-white">Setup SafeTwin</h1>
            <span className="text-sm text-gray-400">
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">{steps[currentStep].title}</h2>
            <p className="text-gray-400">{steps[currentStep].subtitle}</p>
          </div>

          <CurrentStepComponent config={config} setConfig={setConfig} />

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`px-6 py-3 rounded-lg transition-colors ${
                currentStep === 0
                  ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              Previous
            </button>
            <button
              onClick={nextStep}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <span>{currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

const WelcomeStep: React.FC<any> = () => (
  <div className="text-center space-y-6">
    <div className="flex justify-center">
      <Shield className="h-24 w-24 text-blue-400" />
    </div>
    <div className="space-y-4">
      <p className="text-lg text-gray-300">
        Welcome to SafeTwin, the next-generation AI-powered airport safety monitoring system for both terminal and airside operations.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-gray-700 rounded-lg p-4">
          <Bot className="h-8 w-8 text-blue-400 mb-2" />
          <h3 className="font-semibold mb-2">AI Agents</h3>
          <p className="text-sm text-gray-400">Intelligent monitoring with specialized AI agents for terminal and airside operations</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <AlertTriangle className="h-8 w-8 text-orange-400 mb-2" />
          <h3 className="font-semibold mb-2">Real-time Alerts</h3>
          <p className="text-sm text-gray-400">Instant notifications for safety incidents across all airport zones</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <Users className="h-8 w-8 text-green-400 mb-2" />
          <h3 className="font-semibold mb-2">Comprehensive Coverage</h3>
          <p className="text-sm text-gray-400">Monitor terminals, runways, aprons, and all critical airport areas</p>
        </div>
      </div>
    </div>
  </div>
);

const AirportConfigStep: React.FC<any> = ({ config, setConfig }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">Airport Name</label>
      <input
        type="text"
        value={config.airportName}
        onChange={(e) => setConfig(prev => ({ ...prev, airportName: e.target.value }))}
        placeholder="e.g., John F. Kennedy International Airport"
        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">Your Role</label>
      <select
        value={config.userRole}
        onChange={(e) => setConfig(prev => ({ ...prev, userRole: e.target.value }))}
        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="">Select your role</option>
        <option value="security_chief">Security Chief</option>
        <option value="operations_manager">Operations Manager</option>
        <option value="safety_officer">Safety Officer</option>
        <option value="air_traffic_controller">Air Traffic Controller</option>
        <option value="ground_operations_manager">Ground Operations Manager</option>
        <option value="it_administrator">IT Administrator</option>
        <option value="field_officer">Field Officer</option>
      </select>
    </div>
  </div>
);

const ZoneSelectionStep: React.FC<any> = ({ config, setConfig }) => {
  const availableZones = [
    // Terminal zones
    { id: 'terminal-a', name: 'Terminal A', description: 'Main passenger terminal', category: 'terminal', icon: Building },
    { id: 'terminal-b', name: 'Terminal B', description: 'Secondary passenger terminal', category: 'terminal', icon: Building },
    { id: 'security-checkpoint', name: 'Security Checkpoint', description: 'TSA screening area', category: 'terminal', icon: Shield },
    { id: 'baggage-claim', name: 'Baggage Claim', description: 'Baggage collection area', category: 'terminal', icon: Building },
    { id: 'departure-lounge', name: 'Departure Lounge', description: 'Gate waiting areas', category: 'terminal', icon: Building },
    { id: 'retail-area', name: 'Retail Area', description: 'Shopping and dining', category: 'terminal', icon: Building },
    // Airside zones
    { id: 'runway-09l', name: 'Runway 09L/27R', description: 'Primary runway operations', category: 'airside', icon: Plane },
    { id: 'runway-09r', name: 'Runway 09R/27L', description: 'Secondary runway operations', category: 'airside', icon: Plane },
    { id: 'taxiway-alpha', name: 'Taxiway Alpha', description: 'Main aircraft taxiway', category: 'airside', icon: Plane },
    { id: 'apron-north', name: 'North Apron', description: 'Aircraft parking and servicing', category: 'airside', icon: Plane },
    { id: 'apron-south', name: 'South Apron', description: 'Aircraft parking and servicing', category: 'airside', icon: Plane },
    { id: 'service-road-1', name: 'Service Road East', description: 'Ground vehicle operations', category: 'airside', icon: Plane },
    { id: 'fuel-depot', name: 'Fuel Storage', description: 'Aircraft fuel storage and distribution', category: 'airside', icon: Plane },
    { id: 'cargo-area', name: 'Cargo Terminal', description: 'Freight and cargo operations', category: 'airside', icon: Plane },
    { id: 'maintenance-hangar', name: 'Maintenance Hangar', description: 'Aircraft maintenance facility', category: 'airside', icon: Plane }
  ];

  const toggleZone = (zoneId: string) => {
    setConfig(prev => ({
      ...prev,
      zones: prev.zones.includes(zoneId)
        ? prev.zones.filter(id => id !== zoneId)
        : [...prev.zones, zoneId]
    }));
  };

  const terminalZones = availableZones.filter(zone => zone.category === 'terminal');
  const airsideZones = availableZones.filter(zone => zone.category === 'airside');

  return (
    <div className="space-y-6">
      <p className="text-gray-300">Select the zones you want to monitor:</p>
      
      {/* Terminal Zones */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
          <Building className="h-5 w-5 text-blue-400" />
          <span>Terminal Operations</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {terminalZones.map(zone => {
            const Icon = zone.icon;
            return (
              <div
                key={zone.id}
                onClick={() => toggleZone(zone.id)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  config.zones.includes(zone.id)
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4 text-blue-400" />
                    <div>
                      <h4 className="font-semibold text-white text-sm">{zone.name}</h4>
                      <p className="text-xs text-gray-400">{zone.description}</p>
                    </div>
                  </div>
                  {config.zones.includes(zone.id) && (
                    <CheckCircle className="h-5 w-5 text-blue-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Airside Zones */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
          <Plane className="h-5 w-5 text-orange-400" />
          <span>Airside Operations</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {airsideZones.map(zone => {
            const Icon = zone.icon;
            return (
              <div
                key={zone.id}
                onClick={() => toggleZone(zone.id)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  config.zones.includes(zone.id)
                    ? 'border-orange-500 bg-orange-500/20'
                    : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4 text-orange-400" />
                    <div>
                      <h4 className="font-semibold text-white text-sm">{zone.name}</h4>
                      <p className="text-xs text-gray-400">{zone.description}</p>
                    </div>
                  </div>
                  {config.zones.includes(zone.id) && (
                    <CheckCircle className="h-5 w-5 text-orange-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const AIAgentSetupStep: React.FC<any> = ({ config, setConfig }) => {
  const terminalAgents = [
    { key: 'anomalyDetection', name: 'Anomaly Detection', description: 'Detects unusual behavior and objects in terminals' },
    { key: 'crowdMonitoring', name: 'Crowd Monitoring', description: 'Monitors crowd density and movement in terminals' },
    { key: 'securityBreach', name: 'Security Breach Detection', description: 'Identifies unauthorized access in terminals' },
    { key: 'emergencyResponse', name: 'Emergency Response', description: 'Coordinates emergency protocols' }
  ];

  const airsideAgents = [
    { key: 'runwayMonitoring', name: 'Runway Incursion Detection', description: 'Monitors runway safety and unauthorized access' },
    { key: 'aircraftTracking', name: 'Aircraft Movement Tracking', description: 'Tracks aircraft during taxiing and parking' },
    { key: 'vehicleMonitoring', name: 'Ground Vehicle Monitoring', description: 'Monitors ground support equipment and vehicles' },
    { key: 'fuelSafety', name: 'Fuel Safety Inspector', description: 'Monitors refueling operations and safety protocols' },
    { key: 'perimeterSecurity', name: 'Perimeter Security', description: 'Monitors airside perimeter and restricted areas' },
    { key: 'weatherMonitoring', name: 'Weather Impact Analyzer', description: 'Analyzes weather conditions for operational safety' }
  ];

  const toggleAgent = (agentKey: string) => {
    setConfig(prev => ({
      ...prev,
      aiAgents: {
        ...prev.aiAgents,
        [agentKey]: !prev.aiAgents[agentKey]
      }
    }));
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-300">Configure your AI agents for comprehensive airport monitoring:</p>
      
      {/* Terminal Agents */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
          <Building className="h-5 w-5 text-blue-400" />
          <span>Terminal AI Agents</span>
        </h3>
        <div className="space-y-3">
          {terminalAgents.map(agent => (
            <div
              key={agent.key}
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
            >
              <div>
                <h4 className="font-semibold text-white text-sm">{agent.name}</h4>
                <p className="text-xs text-gray-400">{agent.description}</p>
              </div>
              <button
                onClick={() => toggleAgent(agent.key)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  config.aiAgents[agent.key] ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    config.aiAgents[agent.key] ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Airside Agents */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
          <Plane className="h-5 w-5 text-orange-400" />
          <span>Airside AI Agents</span>
        </h3>
        <div className="space-y-3">
          {airsideAgents.map(agent => (
            <div
              key={agent.key}
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
            >
              <div>
                <h4 className="font-semibold text-white text-sm">{agent.name}</h4>
                <p className="text-xs text-gray-400">{agent.description}</p>
              </div>
              <button
                onClick={() => toggleAgent(agent.key)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  config.aiAgents[agent.key] ? 'bg-orange-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    config.aiAgents[agent.key] ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AlertPreferencesStep: React.FC<any> = ({ config, setConfig }) => (
  <div className="space-y-6">
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">Alert Threshold</label>
      <select
        value={config.alertSettings.alertThreshold}
        onChange={(e) => setConfig(prev => ({
          ...prev,
          alertSettings: { ...prev.alertSettings, alertThreshold: e.target.value }
        }))}
        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="low">Low - All incidents (including minor violations)</option>
        <option value="medium">Medium - Important incidents (safety concerns)</option>
        <option value="high">High - Critical incidents only (immediate threats)</option>
      </select>
    </div>
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
      {Object.entries({
        voiceAlerts: 'Voice Alerts',
        emailNotifications: 'Email Notifications',
        pushNotifications: 'Push Notifications'
      }).map(([key, label]) => (
        <div key={key} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <span className="text-white">{label}</span>
          <button
            onClick={() => setConfig(prev => ({
              ...prev,
              alertSettings: {
                ...prev.alertSettings,
                [key]: !prev.alertSettings[key]
              }
            }))}
            className={`w-12 h-6 rounded-full transition-colors ${
              config.alertSettings[key] ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                config.alertSettings[key] ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      ))}
    </div>
  </div>
);

const CompletionStep: React.FC<any> = ({ config }) => {
  const terminalZones = config.zones.filter(zone => 
    ['terminal-a', 'terminal-b', 'security-checkpoint', 'baggage-claim', 'departure-lounge', 'retail-area'].includes(zone)
  );
  const airsideZones = config.zones.filter(zone => 
    ['runway-09l', 'runway-09r', 'taxiway-alpha', 'apron-north', 'apron-south', 'service-road-1', 'fuel-depot', 'cargo-area', 'maintenance-hangar'].includes(zone)
  );

  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircle className="h-24 w-24 text-green-400" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Setup Complete!</h3>
        <p className="text-gray-300 mb-6">
          SafeTwin is now configured for {config.airportName || 'your airport'}. 
          Your AI agents are ready to monitor {config.zones.length} zones across terminal and airside operations.
        </p>
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">Configuration Summary:</h4>
          <div className="text-sm text-gray-300 space-y-1">
            <p>• Airport: {config.airportName || 'Not specified'}</p>
            <p>• Role: {config.userRole?.replace('_', ' ') || 'Not specified'}</p>
            <p>• Terminal Zones: {terminalZones.length}</p>
            <p>• Airside Zones: {airsideZones.length}</p>
            <p>• Active AI Agents: {Object.values(config.aiAgents).filter(Boolean).length}</p>
            <p>• Alert Threshold: {config.alertSettings.alertThreshold}</p>
          </div>
        </div>
      </div>
    </div>
  );
};