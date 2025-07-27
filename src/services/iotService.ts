import { dataService } from './dataService';
import { visionService } from './visionService';

export interface SensorReading {
  sensorId: string;
  value: number;
  unit: string;
  timestamp: Date;
  quality: number;
}

export interface CameraFrame {
  cameraId: string;
  frameData: ImageData;
  timestamp: Date;
  metadata: any;
}

export class IoTService {
  private static instance: IoTService;
  private sensorConnections: Map<string, WebSocket> = new Map();
  private cameraConnections: Map<string, WebSocket> = new Map();
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  static getInstance(): IoTService {
    if (!IoTService.instance) {
      IoTService.instance = new IoTService();
    }
    return IoTService.instance;
  }

  async initialize(airportId: string): Promise<void> {
    try {
      console.log('Initializing IoT Service for airport:', airportId);
      
      // In a real implementation, this would connect to actual IoT infrastructure
      // For now, we'll simulate real-time data streams
      await this.connectToSensorNetwork(airportId);
      await this.connectToCameraNetwork(airportId);
      
      this.isConnected = true;
      this.startDataSimulation(airportId);
      
      console.log('IoT Service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize IoT Service:', error);
      throw error;
    }
  }

  private async connectToSensorNetwork(airportId: string): Promise<void> {
    // Get all sensors for the airport
    const sensors = await dataService.getSensors();
    
    sensors.forEach(sensor => {
      this.connectSensor(sensor.id, sensor.type);
    });
  }

  private async connectToCameraNetwork(airportId: string): Promise<void> {
    // Get all cameras for the airport
    const cameras = await dataService.getCameras();
    
    cameras.forEach(camera => {
      this.connectCamera(camera.id, camera.type);
    });
  }

  private connectSensor(sensorId: string, sensorType: string): void {
    try {
      // In a real implementation, this would connect to actual sensor WebSocket endpoints
      // For simulation, we'll create mock WebSocket connections
      const mockWs = this.createMockSensorWebSocket(sensorId, sensorType);
      this.sensorConnections.set(sensorId, mockWs);
      
      console.log(`Connected to sensor ${sensorId} (${sensorType})`);
    } catch (error) {
      console.error(`Failed to connect to sensor ${sensorId}:`, error);
    }
  }

  private connectCamera(cameraId: string, cameraType: string): void {
    try {
      // In a real implementation, this would connect to actual camera stream endpoints
      const mockWs = this.createMockCameraWebSocket(cameraId, cameraType);
      this.cameraConnections.set(cameraId, mockWs);
      
      console.log(`Connected to camera ${cameraId} (${cameraType})`);
    } catch (error) {
      console.error(`Failed to connect to camera ${cameraId}:`, error);
    }
  }

  private createMockSensorWebSocket(sensorId: string, sensorType: string): WebSocket {
    // Create a mock WebSocket that simulates real sensor data
    const mockWs = {
      readyState: WebSocket.OPEN,
      close: () => {},
      send: () => {},
      addEventListener: () => {},
      removeEventListener: () => {}
    } as any;

    // Simulate periodic sensor readings
    const interval = setInterval(() => {
      const reading = this.generateSensorReading(sensorId, sensorType);
      this.handleSensorReading(reading);
    }, this.getSensorInterval(sensorType));

    mockWs._interval = interval;
    return mockWs;
  }

  private createMockCameraWebSocket(cameraId: string, cameraType: string): WebSocket {
    // Create a mock WebSocket that simulates real camera frames
    const mockWs = {
      readyState: WebSocket.OPEN,
      close: () => {},
      send: () => {},
      addEventListener: () => {},
      removeEventListener: () => {}
    } as any;

    // Simulate periodic camera frames
    const interval = setInterval(() => {
      const frame = this.generateCameraFrame(cameraId, cameraType);
      this.handleCameraFrame(frame);
    }, 1000 / 30); // 30 FPS

    mockWs._interval = interval;
    return mockWs;
  }

  private generateSensorReading(sensorId: string, sensorType: string): SensorReading {
    let value: number;
    let unit: string;

    switch (sensorType) {
      case 'temperature':
        value = 18 + Math.random() * 10; // 18-28°C
        unit = '°C';
        break;
      case 'humidity':
        value = 40 + Math.random() * 40; // 40-80%
        unit = '%';
        break;
      case 'motion':
        value = Math.random() > 0.7 ? 1 : 0; // Motion detected
        unit = 'boolean';
        break;
      case 'sound':
        value = 30 + Math.random() * 50; // 30-80 dB
        unit = 'dB';
        break;
      case 'air_quality':
        value = 50 + Math.random() * 100; // AQI 50-150
        unit = 'AQI';
        break;
      case 'occupancy':
        value = Math.floor(Math.random() * 100); // 0-100 people
        unit = 'count';
        break;
      case 'wind':
        value = Math.random() * 20; // 0-20 kt
        unit = 'kt';
        break;
      case 'visibility':
        value = 5 + Math.random() * 10; // 5-15 km
        unit = 'km';
        break;
      case 'pressure':
        value = 1000 + Math.random() * 50; // 1000-1050 hPa
        unit = 'hPa';
        break;
      default:
        value = Math.random() * 100;
        unit = 'units';
    }

    return {
      sensorId,
      value: Math.round(value * 100) / 100, // Round to 2 decimal places
      unit,
      timestamp: new Date(),
      quality: 0.9 + Math.random() * 0.1 // 90-100% quality
    };
  }

  private generateCameraFrame(cameraId: string, cameraType: string): CameraFrame {
    // Create a mock ImageData object
    const width = 640;
    const height = 480;
    const data = new Uint8ClampedArray(width * height * 4);
    
    // Fill with random pixel data (simulating camera feed)
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.random() * 255;     // Red
      data[i + 1] = Math.random() * 255; // Green
      data[i + 2] = Math.random() * 255; // Blue
      data[i + 3] = 255;                 // Alpha
    }

    const imageData = new ImageData(data, width, height);

    return {
      cameraId,
      frameData: imageData,
      timestamp: new Date(),
      metadata: {
        type: cameraType,
        resolution: `${width}x${height}`,
        fps: 30
      }
    };
  }

  private getSensorInterval(sensorType: string): number {
    // Different sensors have different update frequencies
    switch (sensorType) {
      case 'motion':
        return 500; // 2 Hz
      case 'temperature':
      case 'humidity':
      case 'pressure':
        return 5000; // 0.2 Hz
      case 'sound':
      case 'occupancy':
        return 1000; // 1 Hz
      case 'air_quality':
        return 10000; // 0.1 Hz
      case 'wind':
      case 'visibility':
        return 2000; // 0.5 Hz
      default:
        return 3000; // Default 0.33 Hz
    }
  }

  private async handleSensorReading(reading: SensorReading): Promise<void> {
    try {
      // Store the reading in the database
      await dataService.updateSensorReading(reading.sensorId, reading.value, reading.unit);
      
      // Check for threshold violations and generate alerts
      await this.checkSensorThresholds(reading);
      
      // Emit real-time event for UI updates
      this.emitSensorReading(reading);
    } catch (error) {
      console.error('Error handling sensor reading:', error);
    }
  }

  private async handleCameraFrame(frame: CameraFrame): Promise<void> {
    try {
      // Process frame with AI vision services
      const canvas = document.createElement('canvas');
      canvas.width = frame.frameData.width;
      canvas.height = frame.frameData.height;
      const ctx = canvas.getContext('2d');
      
      if (ctx) {
        ctx.putImageData(frame.frameData, 0, 0);
        
        // Process with vision AI
        const results = await visionService.processVideoFrame(canvas, frame.cameraId);
        
        if (results && results.alerts && results.alerts.length > 0) {
          // Create alerts from vision detection
          for (const alert of results.alerts) {
            await dataService.createAlert({
              type: alert.type || 'camera_detection',
              severity: alert.severity || 'medium',
              zone: alert.zone || 'unknown',
              message: alert.message || 'Camera detection event',
              timestamp: new Date(),
              agentId: 'vision-ai',
              sourceType: 'camera',
              sourceId: frame.cameraId,
              status: 'active',
              metadata: {
                confidence: results.detections?.[0]?.confidence || 0.8,
                detectionType: results.detections?.[0]?.class || 'unknown'
              }
            });
          }
        }

        // Record camera event
        if (results && results.detections && results.detections.length > 0) {
          for (const detection of results.detections) {
            await dataService.recordCameraEvent(
              frame.cameraId,
              detection.class,
              detection.confidence,
              {
                bbox: detection.bbox,
                timestamp: frame.timestamp
              }
            );
          }
        }
      }
      
      // Emit real-time event for UI updates
      this.emitCameraFrame(frame);
    } catch (error) {
      console.error('Error handling camera frame:', error);
    }
  }

  private async checkSensorThresholds(reading: SensorReading): Promise<void> {
    // Get sensor configuration to check thresholds
    const sensors = await dataService.getSensors();
    const sensor = sensors.find(s => s.id === reading.sensorId);
    
    if (!sensor || !sensor.thresholds) return;

    const { min, max, critical } = sensor.thresholds;
    let alertSeverity: 'low' | 'medium' | 'high' | 'critical' | null = null;
    let alertMessage = '';

    if (reading.value >= critical) {
      alertSeverity = 'critical';
      alertMessage = `Critical threshold exceeded: ${reading.value}${reading.unit} (threshold: ${critical}${reading.unit})`;
    } else if (reading.value >= max) {
      alertSeverity = 'high';
      alertMessage = `High threshold exceeded: ${reading.value}${reading.unit} (threshold: ${max}${reading.unit})`;
    } else if (reading.value <= min) {
      alertSeverity = 'medium';
      alertMessage = `Low threshold violated: ${reading.value}${reading.unit} (threshold: ${min}${reading.unit})`;
    }

    if (alertSeverity) {
      await dataService.createAlert({
        type: 'sensor_threshold_violation',
        severity: alertSeverity,
        zone: sensor.zoneId || 'unknown',
        message: alertMessage,
        timestamp: reading.timestamp,
        agentId: 'sensor-monitor',
        sourceType: 'sensor',
        sourceId: reading.sensorId,
        status: 'active',
        metadata: {
          sensorType: sensor.type,
          reading: reading.value,
          unit: reading.unit,
          threshold: alertSeverity === 'critical' ? critical : max,
          quality: reading.quality
        }
      });
    }
  }

  private emitSensorReading(reading: SensorReading): void {
    // Emit custom event for real-time UI updates
    window.dispatchEvent(new CustomEvent('sensorReading', {
      detail: reading
    }));
  }

  private emitCameraFrame(frame: CameraFrame): void {
    // Emit custom event for real-time UI updates
    window.dispatchEvent(new CustomEvent('cameraFrame', {
      detail: frame
    }));
  }

  private startDataSimulation(airportId: string): void {
    // Start periodic system health checks
    setInterval(async () => {
      await this.updateSystemHealth();
    }, 30000); // Every 30 seconds

    // Start periodic connection health checks
    setInterval(() => {
      this.checkConnectionHealth();
    }, 10000); // Every 10 seconds
  }

  private async updateSystemHealth(): Promise<void> {
    try {
      const sensorHealth = this.getSensorNetworkHealth();
      const cameraHealth = this.getCameraNetworkHealth();
      
      await dataService.updateSystemHealth({
        overall: this.getOverallHealth(sensorHealth, cameraHealth),
        components: {
          database: 'online',
          sensors: sensorHealth,
          cameras: cameraHealth,
          aiServices: 'online',
          network: 'online'
        },
        metrics: {
          uptime: 99.8,
          responseTime: 45 + Math.random() * 20,
          errorRate: Math.random() * 0.5,
          activeConnections: this.sensorConnections.size + this.cameraConnections.size
        },
        lastCheck: new Date()
      });
    } catch (error) {
      console.error('Error updating system health:', error);
    }
  }

  private getSensorNetworkHealth(): 'online' | 'offline' | 'partial' {
    const totalSensors = this.sensorConnections.size;
    const onlineSensors = Array.from(this.sensorConnections.values())
      .filter(ws => ws.readyState === WebSocket.OPEN).length;
    
    if (onlineSensors === 0) return 'offline';
    if (onlineSensors < totalSensors) return 'partial';
    return 'online';
  }

  private getCameraNetworkHealth(): 'online' | 'offline' | 'partial' {
    const totalCameras = this.cameraConnections.size;
    const onlineCameras = Array.from(this.cameraConnections.values())
      .filter(ws => ws.readyState === WebSocket.OPEN).length;
    
    if (onlineCameras === 0) return 'offline';
    if (onlineCameras < totalCameras) return 'partial';
    return 'online';
  }

  private getOverallHealth(sensorHealth: string, cameraHealth: string): 'healthy' | 'warning' | 'critical' {
    if (sensorHealth === 'offline' || cameraHealth === 'offline') return 'critical';
    if (sensorHealth === 'partial' || cameraHealth === 'partial') return 'warning';
    return 'healthy';
  }

  private checkConnectionHealth(): void {
    // Check and reconnect failed sensor connections
    this.sensorConnections.forEach((ws, sensorId) => {
      if (ws.readyState === WebSocket.CLOSED) {
        console.log(`Reconnecting to sensor ${sensorId}`);
        this.reconnectSensor(sensorId);
      }
    });

    // Check and reconnect failed camera connections
    this.cameraConnections.forEach((ws, cameraId) => {
      if (ws.readyState === WebSocket.CLOSED) {
        console.log(`Reconnecting to camera ${cameraId}`);
        this.reconnectCamera(cameraId);
      }
    });
  }

  private async reconnectSensor(sensorId: string): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnection attempts reached for sensor ${sensorId}`);
      return;
    }

    try {
      // Get sensor info
      const sensors = await dataService.getSensors();
      const sensor = sensors.find(s => s.id === sensorId);
      
      if (sensor) {
        setTimeout(() => {
          this.connectSensor(sensorId, sensor.type);
          this.reconnectAttempts++;
        }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
      }
    } catch (error) {
      console.error(`Failed to reconnect sensor ${sensorId}:`, error);
    }
  }

  private async reconnectCamera(cameraId: string): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnection attempts reached for camera ${cameraId}`);
      return;
    }

    try {
      // Get camera info
      const cameras = await dataService.getCameras();
      const camera = cameras.find(c => c.id === cameraId);
      
      if (camera) {
        setTimeout(() => {
          this.connectCamera(cameraId, camera.type);
          this.reconnectAttempts++;
        }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
      }
    } catch (error) {
      console.error(`Failed to reconnect camera ${cameraId}:`, error);
    }
  }

  // Public methods for manual control
  async disconnectSensor(sensorId: string): Promise<void> {
    const ws = this.sensorConnections.get(sensorId);
    if (ws) {
      if (ws._interval) {
        clearInterval(ws._interval);
      }
      ws.close();
      this.sensorConnections.delete(sensorId);
    }
  }

  async disconnectCamera(cameraId: string): Promise<void> {
    const ws = this.cameraConnections.get(cameraId);
    if (ws) {
      if (ws._interval) {
        clearInterval(ws._interval);
      }
      ws.close();
      this.cameraConnections.delete(cameraId);
    }
  }

  async disconnect(): Promise<void> {
    // Disconnect all sensors
    for (const [sensorId] of this.sensorConnections) {
      await this.disconnectSensor(sensorId);
    }

    // Disconnect all cameras
    for (const [cameraId] of this.cameraConnections) {
      await this.disconnectCamera(cameraId);
    }

    this.isConnected = false;
    console.log('IoT Service disconnected');
  }

  getConnectionStatus(): {
    isConnected: boolean;
    sensors: number;
    cameras: number;
    health: string;
  } {
    return {
      isConnected: this.isConnected,
      sensors: this.sensorConnections.size,
      cameras: this.cameraConnections.size,
      health: this.getOverallHealth(
        this.getSensorNetworkHealth(),
        this.getCameraNetworkHealth()
      )
    };
  }
}

export const iotService = IoTService.getInstance();