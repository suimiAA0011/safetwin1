import { useState, useEffect } from 'react';

export const useAIAgents = () => {
  const [agents, setAgents] = useState([
    {
      id: 'agent-1',
      name: 'Anomaly Detector Alpha',
      type: 'anomaly_detector',
      status: 'active',
      description: 'Monitors for unusual behavior patterns and objects',
      confidence: 94,
      detections: 127,
      lastAlert: '2m ago',
      zone: 'terminal'
    },
    {
      id: 'agent-2',
      name: 'Safety Notifier Beta',
      type: 'safety_notifier',
      status: 'active',
      description: 'Manages alert distribution and notifications',
      confidence: 98,
      detections: 89,
      lastAlert: '5m ago',
      zone: 'terminal'
    },
    {
      id: 'agent-3',
      name: 'Emergency Responder Gamma',
      type: 'emergency_responder',
      status: 'alert',
      description: 'Coordinates emergency response protocols',
      confidence: 91,
      detections: 34,
      lastAlert: '1m ago',
      zone: 'terminal'
    },
    {
      id: 'agent-4',
      name: 'Crowd Monitor Delta',
      type: 'crowd_monitor',
      status: 'active',
      description: 'Tracks crowd density and movement patterns',
      confidence: 87,
      detections: 156,
      lastAlert: '8m ago',
      zone: 'terminal'
    },
    // New Airside AI Agents
    {
      id: 'agent-5',
      name: 'Runway Incursion Detector',
      type: 'runway_monitor',
      status: 'active',
      description: 'Detects unauthorized runway access and incursions',
      confidence: 96,
      detections: 23,
      lastAlert: '12m ago',
      zone: 'airside'
    },
    {
      id: 'agent-6',
      name: 'Aircraft Movement Tracker',
      type: 'aircraft_tracker',
      status: 'active',
      description: 'Monitors aircraft taxiing and parking operations',
      confidence: 93,
      detections: 78,
      lastAlert: '3m ago',
      zone: 'airside'
    },
    {
      id: 'agent-7',
      name: 'Ground Vehicle Monitor',
      type: 'vehicle_monitor',
      status: 'active',
      description: 'Tracks ground support equipment and vehicles',
      confidence: 89,
      detections: 145,
      lastAlert: '6m ago',
      zone: 'airside'
    },
    {
      id: 'agent-8',
      name: 'Fuel Safety Inspector',
      type: 'fuel_safety',
      status: 'active',
      description: 'Monitors refueling operations and safety protocols',
      confidence: 97,
      detections: 12,
      lastAlert: '15m ago',
      zone: 'airside'
    },
    {
      id: 'agent-9',
      name: 'Perimeter Security Agent',
      type: 'perimeter_security',
      status: 'active',
      description: 'Monitors airside perimeter and restricted areas',
      confidence: 92,
      detections: 67,
      lastAlert: '4m ago',
      zone: 'airside'
    },
    {
      id: 'agent-10',
      name: 'Weather Impact Analyzer',
      type: 'weather_monitor',
      status: 'active',
      description: 'Analyzes weather conditions for operational safety',
      confidence: 85,
      detections: 34,
      lastAlert: '20m ago',
      zone: 'airside'
    }
  ]);

  const updateAgentStatus = (agentId: string, status: string) => {
    setAgents(prev => prev.map(agent => 
      agent.id === agentId ? { ...agent, status } : agent
    ));
  };

  // Simulate agent activity
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => ({
        ...agent,
        confidence: Math.max(80, Math.min(100, agent.confidence + (Math.random() - 0.5) * 4)),
        detections: agent.detections + (Math.random() < 0.3 ? 1 : 0)
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return { agents, updateAgentStatus };
};