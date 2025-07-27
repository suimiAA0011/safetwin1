import { supabase } from './supabaseClient';
import { Alert, Sensor, Camera, SystemHealth } from '../types';
import { io, Socket } from 'socket.io-client';

export class RealtimeService {
  private static instance: RealtimeService;
  private socket: Socket | null = null;
  private sensorSubscriptions: Map<string, any> = new Map();
  private cameraSubscriptions: Map<string, any> = new Map();
  private alertCallbacks: ((alert: Alert) => void)[] = [];
  private sensorCallbacks: ((sensorId: string, data: any) => void)[] = [];
  private systemHealthCallbacks: ((health: SystemHealth) => void)[] = [];

  static getInstance(): RealtimeService {
    if (!RealtimeService.instance) {
      RealtimeService.instance = new RealtimeService();
    }
    return RealtimeService.instance;
  }

  async initialize(airportId: string): Promise<void> {
    try {
      // Initialize WebSocket connection for real-time data
      this.socket = io(import.meta.env.VITE_WEBSOCKET_URL || 'ws://localhost:3001', {
        query: { airportId },
        transports: ['websocket']
      });

      this.socket.on('connect', () => {
        console.log('Connected to real-time service');
      });

      this.socket.on('sensor_data', (data) => {
        this.handleSensorData(data);
      });

      this.socket.on('camera_feed', (data) => {
        this.handleCameraFeed(data);
      });

      this.socket.on('system_alert', (alert) => {
        this.handleSystemAlert(alert);
      });

      this.socket.on('system_health', (health) => {
        this.handleSystemHealth(health);
      });

      // Subscribe to Supabase real-time changes
      await this.subscribeToAlerts(airportId);
      await this.subscribeToIncidents(airportId);

    } catch (error) {
      console.error('Failed to initialize real-time service:', error);
    }
  }

  private async subscribeToAlerts(airportId: string): Promise<void> {
    const alertSubscription = supabase
      .channel('alerts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'alerts',
        filter: `airport_id=eq.${airportId}`
      }, (payload) => {
        const alert = this.transformAlert(payload.new);
        this.notifyAlertCallbacks(alert);
      })
      .subscribe();
  }

  private async subscribeToIncidents(airportId: string): Promise<void> {
    const incidentSubscription = supabase
      .channel('incidents')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'incidents',
        filter: `airport_id=eq.${airportId}`
      }, (payload) => {
        console.log('Incident update:', payload);
      })
      .subscribe();
  }

  async subscribeSensorData(sensorId: string, callback: (data: any) => void): Promise<void> {
    if (this.socket) {
      this.socket.emit('subscribe_sensor', { sensorId });
      this.sensorSubscriptions.set(sensorId, callback);
    }
  }

  async subscribeCameraFeed(cameraId: string, callback: (frame: any) => void): Promise<void> {
    if (this.socket) {
      this.socket.emit('subscribe_camera', { cameraId });
      this.cameraSubscriptions.set(cameraId, callback);
    }
  }

  onAlert(callback: (alert: Alert) => void): void {
    this.alertCallbacks.push(callback);
  }

  onSensorData(callback: (sensorId: string, data: any) => void): void {
    this.sensorCallbacks.push(callback);
  }

  onSystemHealth(callback: (health: SystemHealth) => void): void {
    this.systemHealthCallbacks.push(callback);
  }

  private handleSensorData(data: any): void {
    const callback = this.sensorSubscriptions.get(data.sensorId);
    if (callback) {
      callback(data);
    }

    // Notify all sensor data callbacks
    this.sensorCallbacks.forEach(callback => {
      callback(data.sensorId, data);
    });

    // Check for threshold violations
    this.checkSensorThresholds(data);
  }

  private handleCameraFeed(data: any): void {
    const callback = this.cameraSubscriptions.get(data.cameraId);
    if (callback) {
      callback(data);
    }
  }

  private handleSystemAlert(alert: any): void {
    const transformedAlert = this.transformAlert(alert);
    this.notifyAlertCallbacks(transformedAlert);
  }

  private handleSystemHealth(health: SystemHealth): void {
    this.systemHealthCallbacks.forEach(callback => {
      callback(health);
    });
  }

  private checkSensorThresholds(sensorData: any): void {
    const { sensorId, value, thresholds, zoneId } = sensorData;

    if (value > thresholds.critical || value < thresholds.min) {
      const alert: Alert = {
        id: `sensor-${Date.now()}`,
        type: 'sensor_threshold_violation',
        severity: 'critical',
        zone: zoneId,
        message: `Sensor ${sensorId} reading ${value} exceeds critical threshold`,
        timestamp: new Date(),
        agentId: 'sensor-monitor',
        sourceType: 'sensor',
        sourceId: sensorId,
        status: 'active',
        metadata: {
          sensorType: sensorData.type,
          reading: value,
          threshold: thresholds.critical
        }
      };

      this.notifyAlertCallbacks(alert);
    }
  }

  private transformAlert(alertData: any): Alert {
    return {
      id: alertData.id,
      type: alertData.type,
      severity: alertData.severity,
      zone: alertData.zone,
      message: alertData.message,
      timestamp: new Date(alertData.timestamp),
      agentId: alertData.agent_id,
      sourceType: alertData.source_type,
      sourceId: alertData.source_id,
      status: alertData.status,
      assignedTo: alertData.assigned_to,
      metadata: alertData.metadata
    };
  }

  private notifyAlertCallbacks(alert: Alert): void {
    this.alertCallbacks.forEach(callback => {
      callback(alert);
    });
  }

  async sendQuickAction(action: string, alertId: string, userId: string): Promise<void> {
    if (this.socket) {
      this.socket.emit('quick_action', {
        action,
        alertId,
        userId,
        timestamp: new Date().toISOString()
      });
    }

    // Also update in database
    await supabase
      .from('alert_actions')
      .insert({
        alert_id: alertId,
        user_id: userId,
        action,
        timestamp: new Date().toISOString()
      });
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    await this.sendQuickAction('acknowledge', alertId, userId);
    
    // Update alert status
    await supabase
      .from('alerts')
      .update({
        status: 'acknowledged',
        assigned_to: userId,
        updated_at: new Date().toISOString()
      })
      .eq('id', alertId);
  }

  async dispatchTeam(alertId: string, teamType: string, userId: string): Promise<void> {
    await this.sendQuickAction('dispatch_team', alertId, userId);
    
    // Create dispatch record
    await supabase
      .from('team_dispatches')
      .insert({
        alert_id: alertId,
        team_type: teamType,
        dispatched_by: userId,
        status: 'dispatched',
        timestamp: new Date().toISOString()
      });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.sensorSubscriptions.clear();
    this.cameraSubscriptions.clear();
    this.alertCallbacks = [];
    this.sensorCallbacks = [];
    this.systemHealthCallbacks = [];
  }
}

export const realtimeService = RealtimeService.getInstance();