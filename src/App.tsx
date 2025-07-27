import React, { useState, useEffect } from 'react';
import { AuthWrapper } from './components/AuthWrapper';
import { CollapsibleSidebar } from './components/CollapsibleSidebar';
import { QuickActions } from './components/QuickActions';
import { Header } from './components/Header';
import { DigitalTwin } from './components/DigitalTwin';
import { IncidentReports } from './components/IncidentReports';
import { VoiceAlert } from './components/VoiceAlert';
import { EmergencySimulator } from './components/EmergencySimulator';
import { LiveDataFeed } from './components/LiveDataFeed';
import { Settings } from './components/Settings';
import { Bot, AlertTriangle } from 'lucide-react';
import { useAIAgents } from './hooks/useAIAgents';
import { useAlerts } from './hooks/useAlerts';
import { useIncidents } from './hooks/useIncidents';
import { dataService } from './services/dataService';
import { iotService } from './services/iotService';
import { realtimeService } from './services/realtimeService';
import { authService } from './services/authService';
import { User } from './types';

function App() {
  return (
    <AuthWrapper>
      {(user: User) => <SafeTwinDashboard user={user} />}
    </AuthWrapper>
  );
}

const SafeTwinDashboard: React.FC<{ user: User }> = ({ user }) => {
  const [activeView, setActiveView] = useState('dashboard');
  const [simulatorMode, setSimulatorMode] = useState(false);
  const [selectedZone, setSelectedZone] = useState('terminal-a');
  const [isInitialized, setIsInitialized] = useState(false);
  
  const { agents, updateAgentStatus } = useAIAgents();
  const { alerts, addAlert, clearAlert } = useAlerts();
  const { incidents, addIncident } = useIncidents();

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        // Set current airport for data service
        dataService.setCurrentAirport(user.airportId);
        
        // Initialize IoT service for real-time data
        await iotService.initialize(user.airportId);
        
        // Initialize real-time service for live updates
        await realtimeService.initialize(user.airportId);
        
        // Subscribe to real-time alerts
        realtimeService.onAlert((alert) => {
          addAlert(alert);
        });
        
        // Subscribe to real-time sensor data
        realtimeService.onSensorData((sensorId, data) => {
          console.log('Sensor data received:', sensorId, data);
        });
        
        setIsInitialized(true);
        console.log('SafeTwin services initialized successfully');
      } catch (error) {
        console.error('Failed to initialize SafeTwin services:', error);
      }
    };

    initializeServices();
    
    // Cleanup on unmount
    return () => {
      iotService.disconnect();
      realtimeService.disconnect();
    };
  }, [user.airportId, addAlert]);

  // Load real-time data from database
  useEffect(() => {
    if (!isInitialized || !user.preferences.systemSettings?.autoRefresh) return;

    const loadData = async () => {
      try {
        // Load active alerts
        const activeAlerts = await dataService.getAlerts('active');
        activeAlerts.forEach(alert => addAlert(alert));
        
        // Load active incidents
        const activeIncidents = await dataService.getIncidents('active');
        activeIncidents.forEach(incident => addIncident(incident));
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };

    loadData();
  }, [isInitialized, user.preferences.systemSettings?.autoRefresh, addAlert, addIncident]);

  const handleActionComplete = (action: string, alertId: string) => {
    // Remove alert from local state if resolved
    if (action === 'resolve') {
      clearAlert(alertId);
    }
    
    // Save user activity
    if (user) {
      const activity = {
        action,
        alertId,
        timestamp: new Date().toISOString()
      };
      const existingActivity = JSON.parse(localStorage.getItem(`safetwin_activity_${user.id}`) || '[]');
      existingActivity.push(activity);
      localStorage.setItem(`safetwin_activity_${user.id}`, JSON.stringify(existingActivity.slice(-100))); // Keep last 100 activities
    }
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Initializing SafeTwin System...</p>
          <p className="text-gray-400 text-sm mt-2">Connecting to sensors and cameras...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      {/* Header */}
      <Header 
        activeView={activeView}
        setActiveView={setActiveView}
        simulatorMode={simulatorMode}
        setSimulatorMode={setSimulatorMode}
        systemConfig={user.preferences}
        user={user}
      />

      {/* Main Content Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Quick Actions Only */}
        {activeView === 'dashboard' && (
          <CollapsibleSidebar
            title="Quick Actions"
            icon={<Bot className="h-5 w-5 text-blue-400" />}
            position="left"
            defaultCollapsed={true}
          >
            <QuickActions alerts={alerts} onActionComplete={handleActionComplete} />
          </CollapsibleSidebar>
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
                  systemConfig={user.preferences}
                  onAlert={addAlert}
                />
                <LiveDataFeed selectedZone={selectedZone} />
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
                config={user.preferences}
                updateConfig={(newConfig) => {
                  // Update user preferences through auth service
                  authService.updateUserPreferences(newConfig);
                  // Update local user state
                  setUser(prev => prev ? { ...prev, preferences: { ...prev.preferences, ...newConfig } } : null);
                }}
              />
            </div>
          )}
        </div>

        {/* Right Sidebar - Collapsed by default */}
        {activeView === 'dashboard' && (
          <CollapsibleSidebar
            title="System Status"
            icon={<AlertTriangle className="h-5 w-5 text-orange-400" />}
            position="right"
            defaultCollapsed={true}
          >
            <div className="p-4">
              <div className="text-center text-gray-400">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">System monitoring</p>
                <p className="text-xs">All systems operational</p>
              </div>
            </div>
          </CollapsibleSidebar>
        )}
      </div>

      {/* Voice Alert System */}
      {user.preferences.alertSettings?.voiceAlerts && (
        <VoiceAlert alerts={alerts} />
      )}
    </div>
  );
};

export default App;