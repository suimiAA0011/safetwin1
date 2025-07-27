import { useState } from 'react';

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  zone: string;
  timestamp: Date;
  status: string;
  aiAnalysis: string;
  recommendations: string[];
  timeline: Array<{
    action: string;
    timestamp: Date;
  }>;
}

export const useIncidents = () => {
  const [incidents, setIncidents] = useState<Incident[]>([
    {
      id: 'INC-001',
      title: 'Unattended Baggage - Terminal A',
      description: 'Black suitcase left unattended near Gate 12 for over 20 minutes',
      severity: 'high',
      zone: 'terminal-a',
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      status: 'resolved',
      aiAnalysis: 'Object detection system identified stationary baggage. No threatening characteristics detected through X-ray analysis.',
      recommendations: [
        'Security team dispatched to investigate',
        'Baggage claim announcement made',
        'Owner identification through security footage',
        'Standard baggage removal protocol followed'
      ],
      timeline: [
        { action: 'Baggage detected by AI system', timestamp: new Date(Date.now() - 1800000) },
        { action: 'Security team notified', timestamp: new Date(Date.now() - 1740000) },
        { action: 'Owner located and verified', timestamp: new Date(Date.now() - 1200000) },
        { action: 'Incident resolved', timestamp: new Date(Date.now() - 900000) }
      ]
    },
    {
      id: 'INC-002',
      title: 'Crowd Density Alert - Security Checkpoint',
      description: 'Unusual crowd gathering detected at main security checkpoint',
      severity: 'medium',
      zone: 'security-checkpoint',
      timestamp: new Date(Date.now() - 900000), // 15 minutes ago
      status: 'monitoring',
      aiAnalysis: 'Crowd density exceeded normal parameters. No aggressive behavior patterns detected.',
      recommendations: [
        'Additional security personnel deployed',
        'Open additional screening lanes',
        'Monitor for escalation signs',
        'Implement crowd control measures if needed'
      ],
      timeline: [
        { action: 'Crowd density threshold exceeded', timestamp: new Date(Date.now() - 900000) },
        { action: 'Additional staff deployed', timestamp: new Date(Date.now() - 600000) },
        { action: 'Situation stabilizing', timestamp: new Date(Date.now() - 300000) }
      ]
    }
  ]);

  const addIncident = (incident: Incident) => {
    setIncidents(prev => [incident, ...prev]);
  };

  const updateIncidentStatus = (incidentId: string, status: string) => {
    setIncidents(prev => prev.map(incident => 
      incident.id === incidentId ? { ...incident, status } : incident
    ));
  };

  return { incidents, addIncident, updateIncidentStatus };
};