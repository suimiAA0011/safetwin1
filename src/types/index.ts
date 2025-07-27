export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'security_chief' | 'operations_manager' | 'safety_officer' | 'air_traffic_controller' | 'ground_operations_manager' | 'it_administrator' | 'field_officer';
  airportId: string;
  preferences: UserPreferences;
  createdAt: Date;
  lastLogin: Date;
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  alertSettings: {
    voiceAlerts: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    smsAlerts: boolean;
    alertThreshold: 'low' | 'medium' | 'high';
  };
  dashboardLayout: {
    sidebarCollapsed: boolean;
    activeView: string;
    selectedZone: string;
  };
  aiAgents: Record<string, boolean>;
  systemSettings: {
    autoRefresh: boolean;
    refreshInterval: number;
    darkMode: boolean;
  };
}

export interface Airport {
  id: string;
  name: string;
  code: string;
  location: {
    city: string;
    country: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  zones: Zone[];
  sensors: Sensor[];
  cameras: Camera[];
  createdAt: Date;
  isActive: boolean;
}

export interface Zone {
  id: string;
  name: string;
  type: 'terminal' | 'airside' | 'security' | 'baggage' | 'lounge' | 'retail' | 'runway' | 'taxiway' | 'apron' | 'service_road' | 'fuel' | 'cargo' | 'hangar';
  coordinates: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  sensors: string[];
  cameras: string[];
  isActive: boolean;
}

export interface Sensor {
  id: string;
  type: 'temperature' | 'humidity' | 'motion' | 'sound' | 'air_quality' | 'occupancy' | 'wind' | 'visibility';
  zoneId: string;
  status: 'online' | 'offline' | 'maintenance';
  lastReading: {
    value: number;
    unit: string;
    timestamp: Date;
  };
  thresholds: {
    min: number;
    max: number;
    critical: number;
  };
}

export interface Camera {
  id: string;
  name: string;
  type: 'security' | 'thermal' | 'drone';
  zoneId: string;
  streamUrl: string;
  status: 'online' | 'offline' | 'maintenance';
  resolution: string;
  fps: number;
  capabilities: string[];
}

export interface Alert {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  zone: string;
  message: string;
  timestamp: Date;
  agentId: string;
  sourceType: 'sensor' | 'camera' | 'ai_agent' | 'manual';
  sourceId: string;
  status: 'active' | 'acknowledged' | 'resolved';
  assignedTo?: string;
  metadata?: Record<string, any>;
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  zone: string;
  timestamp: Date;
  status: 'active' | 'investigating' | 'resolved' | 'closed';
  aiAnalysis: string;
  recommendations: string[];
  timeline: Array<{
    action: string;
    timestamp: Date;
    userId?: string;
  }>;
  assignedTeam: string[];
  relatedAlerts: string[];
}

export interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  components: {
    database: 'online' | 'offline';
    sensors: 'online' | 'offline' | 'partial';
    cameras: 'online' | 'offline' | 'partial';
    aiServices: 'online' | 'offline' | 'partial';
    network: 'online' | 'offline';
  };
  metrics: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeConnections: number;
  };
  lastCheck: Date;
}