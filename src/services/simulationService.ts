import { Alert, Incident } from '../types';

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  category: 'terminal' | 'airside' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  duration: number;
  events: SimulationEvent[];
}

export interface SimulationEvent {
  type: 'alert' | 'incident' | 'sensor_reading' | 'camera_detection';
  delay: number; // milliseconds from scenario start
  data: any;
}

export class SimulationService {
  private static instance: SimulationService;
  private isSimulationMode = false;
  private activeScenarios: Map<string, NodeJS.Timeout> = new Map();
  private eventCallbacks: Map<string, Function[]> = new Map();

  static getInstance(): SimulationService {
    if (!SimulationService.instance) {
      SimulationService.instance = new SimulationService();
    }
    return SimulationService.instance;
  }

  setSimulationMode(enabled: boolean): void {
    this.isSimulationMode = enabled;
    if (!enabled) {
      this.stopAllScenarios();
    }
  }

  isInSimulationMode(): boolean {
    return this.isSimulationMode;
  }

  // Event subscription system
  on(eventType: string, callback: Function): void {
    if (!this.eventCallbacks.has(eventType)) {
      this.eventCallbacks.set(eventType, []);
    }
    this.eventCallbacks.get(eventType)!.push(callback);
  }

  off(eventType: string, callback: Function): void {
    const callbacks = this.eventCallbacks.get(eventType);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  private emit(eventType: string, data: any): void {
    const callbacks = this.eventCallbacks.get(eventType) || [];
    callbacks.forEach(callback => callback(data));
  }

  // Predefined simulation scenarios
  getAvailableScenarios(): SimulationScenario[] {
    return [
      {
        id: 'unattended_baggage_terminal',
        name: 'Unattended Baggage - Terminal',
        description: 'Suspicious package left unattended in departure lounge',
        category: 'terminal',
        severity: 'high',
        duration: 45000,
        events: [
          {
            type: 'camera_detection',
            delay: 0,
            data: {
              cameraId: 'cam-terminal-01',
              detection: 'unattended_object',
              confidence: 0.89,
              location: 'departure-lounge'
            }
          },
          {
            type: 'alert',
            delay: 2000,
            data: {
              type: 'unattended_baggage',
              severity: 'high',
              zone: 'departure-lounge',
              message: 'SIMULATION: Unattended baggage detected in departure lounge - Gate 12 area',
              agentId: 'vision-ai'
            }
          },
          {
            type: 'incident',
            delay: 5000,
            data: {
              title: 'Training Simulation: Unattended Baggage Alert',
              description: 'Black suitcase detected unattended for over 3 minutes in high-traffic area',
              severity: 'high',
              zone: 'departure-lounge'
            }
          }
        ]
      },
      {
        id: 'runway_incursion_critical',
        name: 'Runway Incursion - Critical',
        description: 'Unauthorized vehicle detected on active runway',
        category: 'airside',
        severity: 'critical',
        duration: 60000,
        events: [
          {
            type: 'sensor_reading',
            delay: 0,
            data: {
              sensorId: 'motion-runway-09l',
              type: 'motion',
              value: 1,
              zone: 'runway-09l'
            }
          },
          {
            type: 'camera_detection',
            delay: 1000,
            data: {
              cameraId: 'cam-runway-thermal',
              detection: 'unauthorized_vehicle',
              confidence: 0.95,
              location: 'runway-09l'
            }
          },
          {
            type: 'alert',
            delay: 1500,
            data: {
              type: 'runway_incursion',
              severity: 'critical',
              zone: 'runway-09l',
              message: 'SIMULATION: CRITICAL - Unauthorized vehicle detected on Runway 09L during active operations',
              agentId: 'runway-monitor'
            }
          },
          {
            type: 'incident',
            delay: 3000,
            data: {
              title: 'Training Simulation: Runway Incursion Emergency',
              description: 'Service vehicle entered active runway without clearance during aircraft approach',
              severity: 'critical',
              zone: 'runway-09l'
            }
          }
        ]
      },
      {
        id: 'security_breach_restricted',
        name: 'Security Breach - Restricted Area',
        description: 'Unauthorized person detected in secure airside area',
        category: 'airside',
        severity: 'high',
        duration: 40000,
        events: [
          {
            type: 'camera_detection',
            delay: 0,
            data: {
              cameraId: 'cam-perimeter-01',
              detection: 'unauthorized_person',
              confidence: 0.92,
              location: 'fuel-depot'
            }
          },
          {
            type: 'alert',
            delay: 2000,
            data: {
              type: 'security_breach',
              severity: 'high',
              zone: 'fuel-depot',
              message: 'SIMULATION: Unauthorized personnel detected in fuel storage restricted area',
              agentId: 'perimeter-security'
            }
          }
        ]
      },
      {
        id: 'crowd_surge_terminal',
        name: 'Crowd Surge - Security Checkpoint',
        description: 'Unusual crowd density causing safety concerns',
        category: 'terminal',
        severity: 'medium',
        duration: 35000,
        events: [
          {
            type: 'sensor_reading',
            delay: 0,
            data: {
              sensorId: 'occupancy-security-01',
              type: 'occupancy',
              value: 95,
              zone: 'security-checkpoint'
            }
          },
          {
            type: 'alert',
            delay: 3000,
            data: {
              type: 'crowd_surge',
              severity: 'medium',
              zone: 'security-checkpoint',
              message: 'SIMULATION: High crowd density detected at security checkpoint - 95% capacity',
              agentId: 'crowd-monitor'
            }
          }
        ]
      },
      {
        id: 'fuel_spill_emergency',
        name: 'Fuel Spill Emergency',
        description: 'Fuel leak detected during aircraft refueling',
        category: 'airside',
        severity: 'critical',
        duration: 90000,
        events: [
          {
            type: 'sensor_reading',
            delay: 0,
            data: {
              sensorId: 'chemical-fuel-depot',
              type: 'air_quality',
              value: 180,
              zone: 'fuel-depot'
            }
          },
          {
            type: 'alert',
            delay: 2000,
            data: {
              type: 'fuel_spill',
              severity: 'critical',
              zone: 'fuel-depot',
              message: 'SIMULATION: CRITICAL - Fuel spill detected during refueling operations at Gate 15',
              agentId: 'fuel-safety'
            }
          },
          {
            type: 'incident',
            delay: 5000,
            data: {
              title: 'Training Simulation: Fuel Spill Emergency Response',
              description: 'Jet fuel leak detected during aircraft refueling - environmental hazard protocol activated',
              severity: 'critical',
              zone: 'fuel-depot'
            }
          }
        ]
      },
      {
        id: 'weather_emergency_operations',
        name: 'Severe Weather - Ground Operations',
        description: 'Dangerous weather conditions affecting operations',
        category: 'airside',
        severity: 'high',
        duration: 120000,
        events: [
          {
            type: 'sensor_reading',
            delay: 0,
            data: {
              sensorId: 'wind-runway-center',
              type: 'wind',
              value: 45,
              zone: 'runway-09l'
            }
          },
          {
            type: 'alert',
            delay: 3000,
            data: {
              type: 'weather_emergency',
              severity: 'high',
              zone: 'runway-09l',
              message: 'SIMULATION: Severe weather alert - Wind speeds exceeding safe operational limits (45kt)',
              agentId: 'weather-monitor'
            }
          }
        ]
      }
    ];
  }

  runScenario(scenarioId: string): void {
    if (!this.isSimulationMode) {
      console.warn('Cannot run scenario - simulation mode is disabled');
      return;
    }

    const scenario = this.getAvailableScenarios().find(s => s.id === scenarioId);
    if (!scenario) {
      console.error('Scenario not found:', scenarioId);
      return;
    }

    // Stop existing scenario if running
    this.stopScenario(scenarioId);

    console.log(`Starting simulation scenario: ${scenario.name}`);

    // Schedule all events
    scenario.events.forEach(event => {
      const timeout = setTimeout(() => {
        this.executeEvent(event, scenario);
      }, event.delay);

      // Store timeout for cleanup
      this.activeScenarios.set(`${scenarioId}-${event.delay}`, timeout);
    });

    // Schedule scenario completion
    const completionTimeout = setTimeout(() => {
      console.log(`Simulation scenario completed: ${scenario.name}`);
      this.emit('scenario_completed', { scenarioId, scenario });
      this.cleanupScenario(scenarioId);
    }, scenario.duration);

    this.activeScenarios.set(`${scenarioId}-completion`, completionTimeout);
  }

  private executeEvent(event: SimulationEvent, scenario: SimulationScenario): void {
    console.log(`Executing simulation event: ${event.type}`, event.data);

    switch (event.type) {
      case 'alert':
        this.emit('simulation_alert', {
          ...event.data,
          id: `sim-${Date.now()}`,
          timestamp: new Date(),
          sourceType: 'ai_agent',
          status: 'active',
          metadata: {
            simulation: true,
            scenarioId: scenario.id,
            scenarioName: scenario.name
          }
        });
        break;

      case 'incident':
        this.emit('simulation_incident', {
          ...event.data,
          id: `sim-inc-${Date.now()}`,
          timestamp: new Date(),
          status: 'active',
          aiAnalysis: `Simulation analysis: ${event.data.description}. This is a training scenario.`,
          recommendations: this.generateRecommendations(event.data.severity),
          timeline: [
            {
              action: 'Simulation event triggered',
              timestamp: new Date()
            }
          ],
          assignedTeam: [],
          relatedAlerts: []
        });
        break;

      case 'sensor_reading':
        this.emit('simulation_sensor_data', {
          ...event.data,
          timestamp: new Date(),
          quality: 1.0,
          simulation: true
        });
        break;

      case 'camera_detection':
        this.emit('simulation_camera_event', {
          ...event.data,
          timestamp: new Date(),
          simulation: true
        });
        break;
    }
  }

  private generateRecommendations(severity: string): string[] {
    const baseRecommendations = [
      'Dispatch security team to location',
      'Establish safety perimeter',
      'Notify relevant authorities',
      'Monitor situation for escalation'
    ];

    const criticalRecommendations = [
      'Activate emergency response protocol',
      'Evacuate immediate area',
      'Contact emergency services',
      'Implement crisis management procedures'
    ];

    return severity === 'critical' ? criticalRecommendations : baseRecommendations;
  }

  stopScenario(scenarioId: string): void {
    // Clear all timeouts for this scenario
    for (const [key, timeout] of this.activeScenarios.entries()) {
      if (key.startsWith(scenarioId)) {
        clearTimeout(timeout);
        this.activeScenarios.delete(key);
      }
    }
  }

  stopAllScenarios(): void {
    // Clear all active timeouts
    for (const timeout of this.activeScenarios.values()) {
      clearTimeout(timeout);
    }
    this.activeScenarios.clear();
  }

  private cleanupScenario(scenarioId: string): void {
    // Remove completed scenario timeouts
    for (const key of this.activeScenarios.keys()) {
      if (key.startsWith(scenarioId)) {
        this.activeScenarios.delete(key);
      }
    }
  }

  // Mock data generators for simulation mode
  generateMockSensorData(sensorType: string): any {
    const mockData = {
      temperature: { value: 18 + Math.random() * 10, unit: '°C' },
      humidity: { value: 40 + Math.random() * 40, unit: '%' },
      motion: { value: Math.random() > 0.8 ? 1 : 0, unit: 'boolean' },
      sound: { value: 30 + Math.random() * 50, unit: 'dB' },
      air_quality: { value: 50 + Math.random() * 100, unit: 'AQI' },
      occupancy: { value: Math.floor(Math.random() * 100), unit: 'count' },
      wind: { value: Math.random() * 20, unit: 'kt' },
      visibility: { value: 5 + Math.random() * 10, unit: 'km' },
      pressure: { value: 1000 + Math.random() * 50, unit: 'hPa' }
    };

    return mockData[sensorType] || { value: Math.random() * 100, unit: 'units' };
  }

  generateMockCameraFrame(cameraType: string): any {
    return {
      width: 640,
      height: 480,
      fps: 30,
      timestamp: new Date(),
      detections: Math.random() > 0.7 ? [
        {
          class: ['person', 'vehicle', 'baggage', 'aircraft'][Math.floor(Math.random() * 4)],
          confidence: 0.7 + Math.random() * 0.3,
          bbox: {
            x: Math.random() * 640,
            y: Math.random() * 480,
            width: 50 + Math.random() * 100,
            height: 50 + Math.random() * 100
          }
        }
      ] : [],
      simulation: true
    };
  }

  // System health simulation
  generateMockSystemHealth(): any {
    return {
      overall: Math.random() > 0.9 ? 'warning' : 'healthy',
      components: {
        database: 'online',
        sensors: Math.random() > 0.95 ? 'partial' : 'online',
        cameras: Math.random() > 0.95 ? 'partial' : 'online',
        aiServices: 'online',
        network: 'online'
      },
      metrics: {
        uptime: 99.5 + Math.random() * 0.5,
        responseTime: 30 + Math.random() * 40,
        errorRate: Math.random() * 0.5,
        activeConnections: 100 + Math.floor(Math.random() * 100)
      },
      lastCheck: new Date(),
      simulation: true
    };
  }
}

export const simulationService = SimulationService.getInstance();