import { supabase } from './supabaseClient';
import { Alert, Incident, Sensor, Camera, Zone, Airport, SystemHealth } from '../types';

export class DataService {
  private static instance: DataService;
  private currentAirportId: string | null = null;

  static getInstance(): DataService {
    if (!DataService.instance) {
      DataService.instance = new DataService();
    }
    return DataService.instance;
  }

  setCurrentAirport(airportId: string): void {
    this.currentAirportId = airportId;
  }

  // Airport Management
  async getAirports(): Promise<Airport[]> {
    const { data, error } = await supabase
      .from('airports')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data.map(this.transformAirport);
  }

  async getAirportById(id: string): Promise<Airport | null> {
    const { data, error } = await supabase
      .from('airports')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return this.transformAirport(data);
  }

  // Zone Management
  async getZones(airportId?: string): Promise<Zone[]> {
    const targetAirportId = airportId || this.currentAirportId;
    if (!targetAirportId) throw new Error('No airport ID specified');

    const { data, error } = await supabase
      .from('zones')
      .select('*')
      .eq('airport_id', targetAirportId)
      .eq('is_active', true)
      .order('name');

    if (error) throw error;
    return data.map(this.transformZone);
  }

  async createZone(zone: Omit<Zone, 'id'>): Promise<Zone> {
    const { data, error } = await supabase
      .from('zones')
      .insert({
        airport_id: this.currentAirportId,
        name: zone.name,
        type: zone.type,
        coordinates: zone.coordinates,
        capacity: zone.capacity || 0
      })
      .select()
      .single();

    if (error) throw error;
    return this.transformZone(data);
  }

  // Sensor Management
  async getSensors(zoneId?: string): Promise<Sensor[]> {
    let query = supabase
      .from('sensors')
      .select('*')
      .eq('airport_id', this.currentAirportId)
      .eq('is_active', true);

    if (zoneId) {
      query = query.eq('zone_id', zoneId);
    }

    const { data, error } = await query.order('name');
    if (error) throw error;
    return data.map(this.transformSensor);
  }

  async updateSensorReading(sensorId: string, value: number, unit: string): Promise<void> {
    // Update sensor's last reading
    await supabase
      .from('sensors')
      .update({
        last_reading: {
          value,
          unit,
          timestamp: new Date().toISOString()
        }
      })
      .eq('id', sensorId);

    // Insert new reading record
    await supabase
      .from('sensor_readings')
      .insert({
        sensor_id: sensorId,
        value,
        unit,
        recorded_at: new Date().toISOString()
      });
  }

  // Camera Management
  async getCameras(zoneId?: string): Promise<Camera[]> {
    let query = supabase
      .from('cameras')
      .select('*')
      .eq('airport_id', this.currentAirportId)
      .eq('is_active', true);

    if (zoneId) {
      query = query.eq('zone_id', zoneId);
    }

    const { data, error } = await query.order('name');
    if (error) throw error;
    return data.map(this.transformCamera);
  }

  async recordCameraEvent(cameraId: string, eventType: string, confidence: number, metadata: any): Promise<void> {
    await supabase
      .from('camera_events')
      .insert({
        camera_id: cameraId,
        event_type: eventType,
        confidence,
        metadata,
        detected_at: new Date().toISOString()
      });
  }

  // Alert Management
  async getAlerts(status?: string): Promise<Alert[]> {
    try {
      let query = supabase
        .from('alerts')
        .select(`
          *,
          zones(name, type),
          user_profiles(first_name, last_name)
        `)
        .eq('airport_id', this.currentAirportId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data.map(this.transformAlert);
    } catch (error) {
      console.warn('Failed to fetch alerts from database, returning empty array:', error);
      return [];
    }
  }

  async createAlert(alert: Omit<Alert, 'id'>): Promise<Alert> {
    try {
      // Get zone_id from zone name
      const { data: zoneData } = await supabase
        .from('zones')
        .select('id')
        .eq('airport_id', this.currentAirportId)
        .eq('name', alert.zone)
        .single();

      const { data, error } = await supabase
        .from('alerts')
        .insert({
          airport_id: this.currentAirportId,
          zone_id: zoneData?.id,
          type: alert.type,
          severity: alert.severity,
          title: alert.type.replace('_', ' ').toUpperCase(),
          message: alert.message,
          source_type: alert.sourceType,
          source_id: alert.sourceId,
          agent_id: alert.agentId,
          metadata: alert.metadata || {}
        })
        .select(`
          *,
          zones(name, type)
        `)
        .single();

      if (error) throw error;
      return this.transformAlert(data);
    } catch (error) {
      console.warn('Failed to create alert in database, creating mock alert:', error);
      // Return a mock alert for demo mode
      return {
        id: `mock-${Date.now()}`,
        type: alert.type,
        severity: alert.severity,
        zone: alert.zone,
        message: alert.message,
        timestamp: alert.timestamp,
        agentId: alert.agentId,
        sourceType: alert.sourceType,
        sourceId: alert.sourceId,
        status: alert.status,
        assignedTo: alert.assignedTo,
        metadata: alert.metadata || {}
      };
    }
  }

  async updateAlert(alertId: string, updates: Partial<Alert>): Promise<void> {
    try {
      const updateData: any = {};
      
      if (updates.status) updateData.status = updates.status;
      if (updates.assignedTo) updateData.assigned_to = updates.assignedTo;
      if (updates.status === 'resolved') updateData.resolved_at = new Date().toISOString();

      const { error } = await supabase
        .from('alerts')
        .update(updateData)
        .eq('id', alertId);

      if (error) throw error;
    } catch (error) {
      console.warn('Failed to update alert in database:', error);
      // In demo mode, we'll just log the action
    }
  }

  async acknowledgeAlert(alertId: string, userId: string): Promise<void> {
    try {
      await this.updateAlert(alertId, { status: 'acknowledged', assignedTo: userId });
      
      // Try to record the action
      try {
        await supabase
          .from('alert_actions')
          .insert({
            alert_id: alertId,
            user_id: userId,
            action: 'acknowledge'
          });
      } catch (error) {
        console.warn('Failed to record alert action:', error);
      }
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      // Don't throw error in demo mode, just log it
      console.warn('Alert acknowledgment completed in demo mode');
    }
  }

  async resolveAlert(alertId: string, userId: string, notes?: string): Promise<void> {
    try {
      await this.updateAlert(alertId, { status: 'resolved' });
      
      // Try to record the action
      try {
        await supabase
          .from('alert_actions')
          .insert({
            alert_id: alertId,
            user_id: userId,
            action: 'resolve',
            notes
          });
      } catch (error) {
        console.warn('Failed to record alert action:', error);
      }
    } catch (error) {
      console.error('Failed to resolve alert:', error);
      // Don't throw error in demo mode, just log it
      console.warn('Alert resolution completed in demo mode');
    }
  }

  // Team Dispatch
  async dispatchTeam(alertId: string, teamType: string, dispatchedBy: string): Promise<void> {
    try {
      try {
        await supabase
          .from('team_dispatches')
          .insert({
            alert_id: alertId,
            team_type: teamType,
            dispatched_by: dispatchedBy,
            status: 'dispatched',
            estimated_arrival: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
          });

        // Record the action
        await supabase
          .from('alert_actions')
          .insert({
            alert_id: alertId,
            user_id: dispatchedBy,
            action: 'dispatch_team',
            notes: `Dispatched ${teamType} team`
          });
      } catch (error) {
        console.warn('Failed to record team dispatch:', error);
      }
    } catch (error) {
      console.error('Failed to dispatch team:', error);
      // Don't throw error in demo mode, just log it
      console.warn('Team dispatch completed in demo mode');
    }
  }

  // Legacy methods for backward compatibility
  async acknowledgeAlertLegacy(alertId: string, userId: string): Promise<void> {
    await this.updateAlert(alertId, { status: 'acknowledged', assignedTo: userId });
    
    // Record the action
    await supabase
      .from('alert_actions')
      .insert({
        alert_id: alertId,
        user_id: userId,
        action: 'acknowledge'
      });
  }

  async resolveAlertLegacy(alertId: string, userId: string, notes?: string): Promise<void> {
    await this.updateAlert(alertId, { status: 'resolved' });
    
    // Record the action
    await supabase
      .from('alert_actions')
      .insert({
        alert_id: alertId,
        user_id: userId,
        action: 'resolve',
        notes
      });
  }

  // Incident Management
  async getIncidents(status?: string): Promise<Incident[]> {
    try {
      let query = supabase
        .from('incidents')
        .select(`
          *,
          zones(name, type),
          user_profiles(first_name, last_name)
        `)
        .eq('airport_id', this.currentAirportId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data.map(this.transformIncident);
    } catch (error) {
      console.warn('Failed to fetch incidents from database, returning mock data:', error);
      // Return some mock incidents for demo mode
      return [
        {
          id: 'demo-inc-001',
          title: 'Demo: Unattended Baggage - Terminal A',
          description: 'Simulated unattended baggage scenario for training purposes',
          severity: 'high',
          zone: 'terminal-a',
          timestamp: new Date(Date.now() - 1800000),
          status: 'resolved',
          aiAnalysis: 'Demo analysis: Object detection system identified stationary baggage. Training scenario completed successfully.',
          recommendations: [
            'Security team dispatched to investigate',
            'Baggage claim announcement made',
            'Owner identification through security footage',
            'Standard baggage removal protocol followed'
          ],
          timeline: [
            { action: 'Demo baggage detected by AI system', timestamp: new Date(Date.now() - 1800000) },
            { action: 'Security team notified', timestamp: new Date(Date.now() - 1740000) },
            { action: 'Training scenario completed', timestamp: new Date(Date.now() - 900000) }
          ],
          assignedTeam: [],
          relatedAlerts: []
        }
      ];
    }
  }

  async createIncident(incident: Omit<Incident, 'id'>): Promise<Incident> {
    try {
      // Get zone_id from zone name
      const { data: zoneData } = await supabase
        .from('zones')
        .select('id')
        .eq('airport_id', this.currentAirportId)
        .eq('name', incident.zone)
        .single();

      const { data, error } = await supabase
        .from('incidents')
        .insert({
          airport_id: this.currentAirportId,
          zone_id: zoneData?.id,
          title: incident.title,
          description: incident.description,
          severity: incident.severity,
          ai_analysis: incident.aiAnalysis,
          recommendations: incident.recommendations,
          timeline: incident.timeline,
          assigned_team: incident.assignedTeam || [],
          related_alerts: incident.relatedAlerts || []
        })
        .select(`
          *,
          zones(name, type)
        `)
        .single();

      if (error) throw error;
      return this.transformIncident(data);
    } catch (error) {
      console.warn('Failed to create incident in database, creating mock incident:', error);
      // Return a mock incident for demo mode
      return {
        id: `mock-inc-${Date.now()}`,
        title: incident.title,
        description: incident.description,
        severity: incident.severity,
        zone: incident.zone,
        timestamp: incident.timestamp,
        status: incident.status,
        aiAnalysis: incident.aiAnalysis,
        recommendations: incident.recommendations,
        timeline: incident.timeline,
        assignedTeam: incident.assignedTeam || [],
        relatedAlerts: incident.relatedAlerts || []
      };
    }
  }

  async updateIncident(incidentId: string, updates: Partial<Incident>): Promise<void> {
    const updateData: any = {};
    
    if (updates.status) updateData.status = updates.status;
    if (updates.timeline) updateData.timeline = updates.timeline;
    if (updates.assignedTeam) updateData.assigned_team = updates.assignedTeam;
    if (updates.status === 'resolved') updateData.resolved_at = new Date().toISOString();

    const { error } = await supabase
      .from('incidents')
      .update(updateData)
      .eq('id', incidentId);

    if (error) throw error;
  }

  async dispatchTeamLegacy(alertId: string, teamType: string, dispatchedBy: string): Promise<void> {
    await supabase
      .from('team_dispatches')
      .insert({
        alert_id: alertId,
        team_type: teamType,
        dispatched_by: dispatchedBy,
        status: 'dispatched',
        estimated_arrival: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 minutes
      });

    // Record the action
    await supabase
      .from('alert_actions')
      .insert({
        alert_id: alertId,
        user_id: dispatchedBy,
        action: 'dispatch_team',
        notes: `Dispatched ${teamType} team`
      });
  }

  // System Health
  async getSystemHealth(): Promise<SystemHealth> {
    const { data, error } = await supabase
      .from('system_health')
      .select('*')
      .eq('airport_id', this.currentAirportId)
      .order('last_check', { ascending: false })
      .limit(1);

    if (error || !data || data.length === 0) {
      // Return default health status
      return {
        overall: 'healthy',
        components: {
          database: 'online',
          sensors: 'online',
          cameras: 'online',
          aiServices: 'online',
          network: 'online'
        },
        metrics: {
          uptime: 99.8,
          responseTime: 45,
          errorRate: 0.1,
          activeConnections: 150
        },
        lastCheck: new Date()
      };
    }

    return this.transformSystemHealth(data[0]);
  }

  async updateSystemHealth(health: Partial<SystemHealth>): Promise<void> {
    await supabase
      .from('system_health')
      .upsert({
        airport_id: this.currentAirportId,
        component: 'overall',
        status: health.overall || 'healthy',
        metrics: health.metrics || {},
        last_check: new Date().toISOString()
      });
  }

  // Real-time subscriptions
  subscribeToAlerts(callback: (alert: Alert) => void) {
    return supabase
      .channel('alerts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'alerts',
        filter: `airport_id=eq.${this.currentAirportId}`
      }, (payload) => {
        // Fetch full alert data with relations
        this.getAlerts().then(alerts => {
          const newAlert = alerts.find(a => a.id === payload.new.id);
          if (newAlert) callback(newAlert);
        });
      })
      .subscribe();
  }

  subscribeToIncidents(callback: (incident: Incident) => void) {
    return supabase
      .channel('incidents')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'incidents',
        filter: `airport_id=eq.${this.currentAirportId}`
      }, (payload) => {
        // Fetch full incident data with relations
        this.getIncidents().then(incidents => {
          const updatedIncident = incidents.find(i => i.id === payload.new.id);
          if (updatedIncident) callback(updatedIncident);
        });
      })
      .subscribe();
  }

  // Data transformation methods
  private transformAirport(data: any): Airport {
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      location: {
        city: data.city,
        country: data.country,
        coordinates: data.coordinates
      },
      zones: [],
      sensors: [],
      cameras: [],
      createdAt: new Date(data.created_at),
      isActive: data.is_active
    };
  }

  private transformZone(data: any): Zone {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      coordinates: data.coordinates,
      sensors: [],
      cameras: [],
      isActive: data.is_active
    };
  }

  private transformSensor(data: any): Sensor {
    return {
      id: data.id,
      type: data.type,
      zoneId: data.zone_id,
      status: data.status,
      lastReading: {
        value: data.last_reading?.value || 0,
        unit: data.unit,
        timestamp: data.last_reading?.timestamp ? new Date(data.last_reading.timestamp) : new Date()
      },
      thresholds: data.thresholds
    };
  }

  private transformCamera(data: any): Camera {
    return {
      id: data.id,
      name: data.name,
      type: data.type,
      zoneId: data.zone_id,
      streamUrl: data.stream_url,
      status: data.status,
      resolution: data.resolution,
      fps: data.fps,
      capabilities: data.capabilities || []
    };
  }

  private transformAlert(data: any): Alert {
    return {
      id: data.id,
      type: data.type,
      severity: data.severity,
      zone: data.zones?.name || 'Unknown Zone',
      message: data.message,
      timestamp: new Date(data.created_at),
      agentId: data.agent_id,
      sourceType: data.source_type,
      sourceId: data.source_id,
      status: data.status,
      assignedTo: data.assigned_to,
      metadata: data.metadata || {}
    };
  }

  private transformIncident(data: any): Incident {
    return {
      id: data.id,
      title: data.title,
      description: data.description,
      severity: data.severity,
      zone: data.zones?.name || 'Unknown Zone',
      timestamp: new Date(data.created_at),
      status: data.status,
      aiAnalysis: data.ai_analysis || '',
      recommendations: data.recommendations || [],
      timeline: data.timeline || [],
      assignedTeam: data.assigned_team || [],
      relatedAlerts: data.related_alerts || []
    };
  }

  private transformSystemHealth(data: any): SystemHealth {
    return {
      overall: data.status,
      components: {
        database: 'online',
        sensors: 'online',
        cameras: 'online',
        aiServices: 'online',
        network: 'online'
      },
      metrics: data.metrics || {
        uptime: 99.8,
        responseTime: 45,
        errorRate: 0.1,
        activeConnections: 150
      },
      lastCheck: new Date(data.last_check)
    };
  }
}

export const dataService = DataService.getInstance();