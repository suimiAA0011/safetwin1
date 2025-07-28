import React, { useState } from 'react';
import { Play, AlertTriangle, Users, Package, ShieldAlert, Plane, Truck, Fuel, Wind } from 'lucide-react';

interface EmergencySimulatorProps {
  addAlert: (alert: any) => void;
  addIncident: (incident: any) => void;
  selectedZone: string;
}

export const EmergencySimulator: React.FC<EmergencySimulatorProps> = ({ 
  addAlert, 
  addIncident, 
  selectedZone 
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentRunningScenario, setCurrentRunningScenario] = useState<string | null>(null);
  const [scenarioCategory, setScenarioCategory] = useState<'terminal' | 'airside'>('terminal');

  const terminalScenarios = [
    {
      id: 'unattended_baggage',
      title: 'Unattended Baggage',
      description: 'Suspicious package left unattended in high-traffic area',
      icon: Package,
      severity: 'high',
      duration: 30000
    },
    {
      id: 'crowd_surge',
      title: 'Crowd Surge',
      description: 'Unexpected crowd gathering causing safety concerns',
      icon: Users,
      severity: 'medium',
      duration: 45000
    },
    {
      id: 'security_breach',
      title: 'Security Breach',
      description: 'Unauthorized access to restricted area detected',
      icon: ShieldAlert,
      severity: 'critical',
      duration: 60000
    },
    {
      id: 'medical_emergency',
      title: 'Medical Emergency',
      description: 'Passenger requiring immediate medical attention',
      icon: AlertTriangle,
      severity: 'high',
      duration: 20000
    }
  ];

  const airsideScenarios = [
    {
      id: 'runway_incursion',
      title: 'Runway Incursion',
      description: 'Unauthorized vehicle or person detected on active runway',
      icon: Plane,
      severity: 'critical',
      duration: 45000
    },
    {
      id: 'aircraft_collision_risk',
      title: 'Aircraft Collision Risk',
      description: 'Two aircraft on potential collision course during taxiing',
      icon: Plane,
      severity: 'critical',
      duration: 30000
    },
    {
      id: 'ground_vehicle_violation',
      title: 'Ground Vehicle Violation',
      description: 'Service vehicle violating safety protocols near aircraft',
      icon: Truck,
      severity: 'high',
      duration: 25000
    },
    {
      id: 'fuel_spill_incident',
      title: 'Fuel Spill Incident',
      description: 'Fuel leak detected during refueling operations',
      icon: Fuel,
      severity: 'high',
      duration: 60000
    },
    {
      id: 'weather_emergency',
      title: 'Severe Weather Alert',
      description: 'Dangerous weather conditions affecting ground operations',
      icon: Wind,
      severity: 'medium',
      duration: 90000
    },
    {
      id: 'perimeter_breach',
      title: 'Perimeter Security Breach',
      description: 'Unauthorized access detected at airside perimeter',
      icon: ShieldAlert,
      severity: 'critical',
      duration: 40000
    },
    {
      id: 'aircraft_emergency',
      title: 'Aircraft Emergency Landing',
      description: 'Emergency aircraft requiring immediate runway clearance',
      icon: Plane,
      severity: 'critical',
      duration: 120000
    },
    {
      id: 'ground_equipment_failure',
      title: 'Ground Equipment Failure',
      description: 'Critical ground support equipment malfunction',
      icon: Truck,
      severity: 'medium',
      duration: 35000
    }
  ];

  const currentScenarios = scenarioCategory === 'terminal' ? terminalScenarios : airsideScenarios;

  const runSimulation = (scenario: any) => {
    if (isRunning && currentRunningScenario === scenario.id) {
      return; // Prevent double-clicking the same scenario
    }
    
    setIsRunning(true);
    setCurrentRunningScenario(scenario.id);
    
    // Create initial alert
    const alertId = Date.now().toString();
    addAlert({
      id: alertId,
      type: scenario.id,
      severity: scenario.severity,
      zone: selectedZone,
      message: `SIMULATION: ${scenario.description}`,
      timestamp: new Date(),
      agentId: 'simulator'
    });

    // Create incident report
    const incidentId = `INC-${Date.now()}`;
    const aiAnalysisMap = {
      'runway_incursion': 'Critical runway safety violation detected. Immediate runway closure and emergency response required.',
      'aircraft_collision_risk': 'Collision avoidance system activated. Ground control intervention required immediately.',
      'ground_vehicle_violation': 'Vehicle safety protocol breach detected. Immediate vehicle recall and safety briefing required.',
      'fuel_spill_incident': 'Environmental hazard detected. Fire suppression systems on standby, area evacuation initiated.',
      'weather_emergency': 'Meteorological conditions exceed safe operating parameters. Ground operations suspension recommended.',
      'perimeter_breach': 'Security perimeter compromised. Law enforcement notification and area lockdown initiated.',
      'aircraft_emergency': 'Emergency aircraft inbound. Runway clearance and emergency services deployment required.',
      'ground_equipment_failure': 'Equipment malfunction affecting operational safety. Maintenance team dispatch required.'
    };

    const recommendationsMap = {
      'runway_incursion': [
        'Immediately close affected runway',
        'Dispatch emergency response team',
        'Notify air traffic control',
        'Investigate security breach',
        'Review perimeter access protocols'
      ],
      'aircraft_collision_risk': [
        'Issue immediate stop instructions to both aircraft',
        'Deploy ground marshalling team',
        'Clear taxiway of other traffic',
        'Investigate communication breakdown',
        'Review taxiway procedures'
      ],
      'ground_vehicle_violation': [
        'Recall vehicle to designated area',
        'Suspend vehicle operator certification',
        'Conduct safety briefing',
        'Review vehicle tracking systems',
        'Implement additional safety measures'
      ],
      'fuel_spill_incident': [
        'Activate fire suppression systems',
        'Evacuate immediate area',
        'Deploy hazmat response team',
        'Notify environmental authorities',
        'Investigate equipment failure'
      ],
      'weather_emergency': [
        'Suspend ground operations',
        'Secure loose equipment',
        'Move personnel to safe areas',
        'Monitor weather conditions',
        'Prepare for operations resumption'
      ],
      'perimeter_breach': [
        'Lock down affected area',
        'Deploy security teams',
        'Notify law enforcement',
        'Review surveillance footage',
        'Strengthen perimeter security'
      ],
      'aircraft_emergency': [
        'Clear runway immediately',
        'Deploy emergency services',
        'Prepare medical facilities',
        'Coordinate with air traffic control',
        'Activate emergency response plan'
      ],
      'ground_equipment_failure': [
        'Remove equipment from service',
        'Deploy backup equipment',
        'Notify maintenance team',
        'Investigate failure cause',
        'Update maintenance schedules'
      ]
    };

    addIncident({
      id: incidentId,
      title: `Training Simulation: ${scenario.title}`,
      description: scenario.description,
      severity: scenario.severity,
      zone: selectedZone,
      timestamp: new Date(),
      status: 'active',
      aiAnalysis: aiAnalysisMap[scenario.id] || `AI analysis indicates ${scenario.severity} severity incident. Automated response protocols initiated.`,
      recommendations: recommendationsMap[scenario.id] || [
        'Dispatch security team to location',
        'Establish safety perimeter',
        'Notify relevant authorities',
        'Monitor situation for escalation'
      ],
      timeline: [
        {
          action: 'Incident detected by AI Agent',
          timestamp: new Date()
        },
        {
          action: 'Security team notified',
          timestamp: new Date(Date.now() + 5000)
        }
      ]
    });

    // Simulate progression
    setTimeout(() => {
      setIsRunning(false);
      setCurrentRunningScenario(null);
    }, scenario.duration);
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center space-x-2 mb-6">
          <AlertTriangle className="h-6 w-6 text-orange-400" />
          <h2 className="text-xl font-semibold">Emergency Training Simulator</h2>
        </div>
        
        <div className="bg-orange-900/20 border border-orange-600 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            <span className="font-medium text-orange-200">Training Mode</span>
          </div>
          <p className="text-sm text-orange-300">
            This simulator creates realistic emergency scenarios for both terminal and airside operations training. 
            All alerts and incidents generated are simulated and marked as training exercises.
          </p>
        </div>

        {/* Scenario Category Toggle */}
        <div className="flex justify-center mb-6">
          <div className="bg-gray-800 rounded-lg p-2 border border-gray-700">
            <div className="flex space-x-2">
              <button
                onClick={() => setScenarioCategory('terminal')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  scenarioCategory === 'terminal'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Terminal Scenarios
              </button>
              <button
                onClick={() => setScenarioCategory('airside')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  scenarioCategory === 'airside'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Airside Scenarios
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentScenarios.map(scenario => {
            const Icon = scenario.icon;
            return (
              <div key={scenario.id} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center space-x-3 mb-4">
                  <Icon className="h-8 w-8 text-blue-400" />
                  <div>
                    <h3 className="text-lg font-semibold">{scenario.title}</h3>
                    <span className={`text-sm px-2 py-1 rounded ${
                      scenario.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      scenario.severity === 'high' ? 'bg-orange-500/20 text-orange-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {scenario.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-4">{scenario.description}</p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    Duration: {scenario.duration / 1000}s
                  </span>
                  <button
                    onClick={() => runSimulation(scenario)}
                    disabled={isRunning}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      isRunning && scenario.id === currentRunningScenario
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    <Play className="h-4 w-4" />
                    <span>
                      {isRunning && scenario.id === currentRunningScenario ? 'Running...' : 'Run Simulation'}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Simulation Controls</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">{currentScenarios.length}</div>
              <div className="text-sm text-gray-400">Available Scenarios</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">{selectedZone}</div>
              <div className="text-sm text-gray-400">Active Zone</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-400">{scenarioCategory}</div>
              <div className="text-sm text-gray-400">Scenario Type</div>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${isRunning ? 'text-orange-400' : 'text-gray-400'}`}>
                {isRunning ? 'ACTIVE' : 'READY'}
              </div>
              <div className="text-sm text-gray-400">Status</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};