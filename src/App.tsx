import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { DigitalTwin } from './components/DigitalTwin';
import { AIAgentPanel } from './components/AIAgentPanel';
import { AlertSystem } from './components/AlertSystem';
import { IncidentReports } from './components/IncidentReports';
import { VoiceAlert } from './components/VoiceAlert';
import { EmergencySimulator } from './components/EmergencySimulator';
import { LiveDataFeed } from './components/LiveDataFeed';
import { SecurityTeamPanel } from './components/SecurityTeamPanel';
import { SafetyMetrics } from './components/SafetyMetrics';
import { Onboarding } from './components/Onboarding';
import { Settings } from './components/Settings';
import { useAIAgents } from './hooks/useAIAgents';
import { useAlerts } from './hooks/useAlerts';
import { useIncidents } from './hooks/useIncidents';

function App() {
  const [isFirstTime, setIsFirstTime] = useState(true);
  const [activeView, setActiveView] = useState('dashboard');
  const [simulatorMode, setSimulatorMode] = useState(false);
  const [selectedZone, setSelectedZone] = useState('terminal-a');
  const [systemConfig, setSystemConfig] = useState({
    airportName: '',
    userRole: '',
    zones: ['terminal-a'],
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
    },
    systemSettings: {
      autoRefresh: true,
      darkMode: true
    }
  });
  
  const { agents, updateAgentStatus } = useAIAgents();
  const { alerts, addAlert, clearAlert } = useAlerts();
  const { incidents, addIncident } = useIncidents();

  // Check if user has completed onboarding
  useEffect(() => {
    const hasCompletedOnboarding = localStorage.getItem('safetwin_onboarding_complete');
    const savedConfig = localStorage.getItem('safetwin_config');
    
    if (hasCompletedOnboarding && savedConfig) {
      setIsFirstTime(false);
      setSystemConfig(JSON.parse(savedConfig));
    }
  }, []);

  // Handle onboarding completion
  const handleOnboardingComplete = (config: any) => {
    setSystemConfig(config);
    setIsFirstTime(false);
    localStorage.setItem('safetwin_onboarding_complete', 'true');
    localStorage.setItem('safetwin_config', JSON.stringify(config));
  };

  // Update system configuration
  const updateSystemConfig = (newConfig: any) => {
    setSystemConfig(newConfig);
    localStorage.setItem('safetwin_config', JSON.stringify(newConfig));
  };

  // Simulate real-time data updates
  useEffect(() => {
    if (isFirstTime || !systemConfig.systemSettings?.autoRefresh) return;

    const interval = setInterval(() => {
      // Only generate alerts if the threshold allows it
      const shouldGenerateAlert = () => {
        const random = Math.random();
        switch (systemConfig.alertSettings.alertThreshold) {
          case 'low': return random < 0.15;
          case 'medium': return random < 0.1;
          case 'high': return random < 0.05;
          default: return random < 0.1;
        }
      };

      if (shouldGenerateAlert()) {
        // Determine if this should be a terminal or airside event
        const isAirsideZone = ['runway-09l', 'runway-09r', 'taxiway-alpha', 'apron-north', 'apron-south', 
                              'service-road-1', 'fuel-depot', 'cargo-area', 'maintenance-hangar'].includes(selectedZone);
        
        const terminalEventTypes = ['unattended_baggage', 'crowding', 'restricted_access', 'suspicious_behavior'];
        const airsideEventTypes = ['runway_incursion', 'aircraft_collision_risk', 'ground_vehicle_violation', 
                                  'fuel_spill_incident', 'perimeter_breach', 'weather_emergency'];
        
        const eventTypes = isAirsideZone ? airsideEventTypes : terminalEventTypes;
        const severity = Math.random() < 0.3 ? 'critical' : Math.random() < 0.5 ? 'high' : 'medium';
        const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
        
        // Only add alert if it meets the threshold
        const severityLevels = { low: 0, medium: 1, high: 2, critical: 3 };
        const thresholdLevels = { low: 0, medium: 1, high: 2 };
        
        if (severityLevels[severity] >= thresholdLevels[systemConfig.alertSettings.alertThreshold]) {
          const relevantAgents = agents.filter(agent => 
            isAirsideZone ? agent.zone === 'airside' : agent.zone === 'terminal'
          );
          
          addAlert({
            id: Date.now().toString(),
            type: eventType,
            severity,
            zone: selectedZone,
            message: `${eventType.replace('_', ' ')} detected in ${selectedZone}`,
            timestamp: new Date(),
            agentId: relevantAgents.length > 0 ? relevantAgents[Math.floor(Math.random() * relevantAgents.length)].id : 'system'
          });
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [selectedZone, agents, addAlert, systemConfig, isFirstTime]);

  // Show onboarding for first-time users
  if (isFirstTime) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <Header 
        activeView={activeView}
        setActiveView={setActiveView}
        simulatorMode={simulatorMode}
        setSimulatorMode={setSimulatorMode}
        systemConfig={systemConfig}
      />

      {/* Main Content Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - AI Agents & Alerts (only show on dashboard) */}
        {activeView === 'dashboard' && (
          <div className="w-80 bg-gray-800 border-r border-gray-700 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <AIAgentPanel agents={agents} updateAgentStatus={updateAgentStatus} />
              <AlertSystem alerts={alerts} clearAlert={clearAlert} />
            </div>
          </div>
        )}

        {/* Main Dashboard Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeView === 'dashboard' && (
            <>
              {/* Digital Twin Area */}
              <div className="flex-1 relative overflow-hidden">
                <DigitalTwin 
                  selectedZone={selectedZone}
                  setSelectedZone={setSelectedZone}
                  alerts={alerts}
                  simulatorMode={simulatorMode}
                  systemConfig={systemConfig}
                  onAlert={addAlert}
                />
                <LiveDataFeed selectedZone={selectedZone} />
              </div>
              
              {/* Safety Metrics Bottom Panel */}
              <div className="h-32 bg-gray-800 border-t border-gray-700 flex-shrink-0">
                <SafetyMetrics alerts={alerts} incidents={incidents} />
              </div>
            </>
          )}

          {activeView === 'incidents' && (
            <div className="flex-1 overflow-hidden">
              <IncidentReports incidents={incidents} addIncident={addIncident} />
            </div>
          )}

          {activeView === 'simulator' && (
            <div className="flex-1 overflow-y-auto">
              <EmergencySimulator 
                addAlert={addAlert}
                addIncident={addIncident}
                selectedZone={selectedZone}
              />
            </div>
          )}

          {activeView === 'settings' && (
            <div className="flex-1 overflow-hidden">
              <Settings 
                config={systemConfig}
                updateConfig={updateSystemConfig}
              />
            </div>
          )}
        </div>

        {/* Right Sidebar - Security Team (only show on dashboard) */}
        {activeView === 'dashboard' && (
          <div className="w-80 bg-gray-800 border-l border-gray-700 flex-shrink-0 overflow-hidden">
            <SecurityTeamPanel alerts={alerts} incidents={incidents} />
          </div>
        )}
      </div>

      {/* Voice Alert System */}
      {systemConfig.alertSettings?.voiceAlerts && (
        <VoiceAlert alerts={alerts} />
      )}
    </div>
  );
}

export default App;