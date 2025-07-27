import { useState } from 'react';

export interface Alert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  zone: string;
  message: string;
  timestamp: Date;
  agentId: string;
}

export const useAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const addAlert = (alert: Alert) => {
    setAlerts(prev => [...prev, alert]);
  };

  const clearAlert = (alertId: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const clearAllAlerts = () => {
    setAlerts([]);
  };

  return { alerts, addAlert, clearAlert, clearAllAlerts };
};