/*
  # SafeTwin Database Schema

  1. New Tables
    - `airports` - Airport information and configuration
    - `user_profiles` - Extended user profile data
    - `zones` - Airport zones and areas
    - `sensors` - IoT sensor configuration
    - `cameras` - Camera feed configuration
    - `alerts` - Real-time alert system
    - `incidents` - Incident management
    - `alert_actions` - User actions on alerts
    - `team_dispatches` - Team dispatch records
    - `system_health` - System monitoring data
    - `sensor_readings` - Real-time sensor data
    - `camera_events` - Camera-detected events

  2. Security
    - Enable RLS on all tables
    - Add policies for multi-tenant access control
    - Secure user data and airport isolation

  3. Real-time Features
    - Enable real-time subscriptions for alerts and incidents
    - Optimize for high-frequency sensor data
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Airports table
CREATE TABLE IF NOT EXISTS airports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text UNIQUE NOT NULL,
  city text NOT NULL,
  country text NOT NULL,
  coordinates jsonb NOT NULL DEFAULT '{"lat": 0, "lng": 0}',
  timezone text NOT NULL DEFAULT 'UTC',
  configuration jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- User profiles table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  role text NOT NULL CHECK (role IN (
    'security_chief', 'operations_manager', 'safety_officer', 
    'air_traffic_controller', 'ground_operations_manager', 
    'it_administrator', 'field_officer'
  )),
  airport_id uuid REFERENCES airports(id) ON DELETE CASCADE,
  preferences jsonb NOT NULL DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  last_login timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Zones table
CREATE TABLE IF NOT EXISTS zones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airport_id uuid REFERENCES airports(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN (
    'terminal', 'airside', 'security', 'baggage', 'lounge', 'retail',
    'runway', 'taxiway', 'apron', 'service_road', 'fuel', 'cargo', 'hangar'
  )),
  coordinates jsonb NOT NULL DEFAULT '{"x": 0, "y": 0, "width": 100, "height": 100}',
  capacity integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(airport_id, name)
);

-- Sensors table
CREATE TABLE IF NOT EXISTS sensors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airport_id uuid REFERENCES airports(id) ON DELETE CASCADE,
  zone_id uuid REFERENCES zones(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN (
    'temperature', 'humidity', 'motion', 'sound', 'air_quality', 
    'occupancy', 'wind', 'visibility', 'pressure'
  )),
  unit text NOT NULL DEFAULT '',
  thresholds jsonb NOT NULL DEFAULT '{"min": 0, "max": 100, "critical": 90}',
  status text DEFAULT 'online' CHECK (status IN ('online', 'offline', 'maintenance')),
  last_reading jsonb DEFAULT '{"value": 0, "timestamp": null}',
  configuration jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cameras table
CREATE TABLE IF NOT EXISTS cameras (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airport_id uuid REFERENCES airports(id) ON DELETE CASCADE,
  zone_id uuid REFERENCES zones(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('security', 'thermal', 'drone')),
  stream_url text,
  status text DEFAULT 'online' CHECK (status IN ('online', 'offline', 'maintenance')),
  resolution text DEFAULT '1920x1080',
  fps integer DEFAULT 30,
  capabilities jsonb DEFAULT '[]',
  configuration jsonb DEFAULT '{}',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airport_id uuid REFERENCES airports(id) ON DELETE CASCADE,
  zone_id uuid REFERENCES zones(id) ON DELETE CASCADE,
  type text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  title text NOT NULL,
  message text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('sensor', 'camera', 'ai_agent', 'manual')),
  source_id text,
  agent_id text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed')),
  assigned_to uuid REFERENCES user_profiles(id),
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airport_id uuid REFERENCES airports(id) ON DELETE CASCADE,
  zone_id uuid REFERENCES zones(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'resolved', 'closed')),
  ai_analysis text,
  recommendations jsonb DEFAULT '[]',
  timeline jsonb DEFAULT '[]',
  assigned_team jsonb DEFAULT '[]',
  related_alerts jsonb DEFAULT '[]',
  created_by uuid REFERENCES user_profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Alert actions table
CREATE TABLE IF NOT EXISTS alert_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid REFERENCES alerts(id) ON DELETE CASCADE,
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN (
    'acknowledge', 'dismiss', 'escalate', 'resolve', 'dispatch_team', 'add_note'
  )),
  notes text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Team dispatches table
CREATE TABLE IF NOT EXISTS team_dispatches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid REFERENCES alerts(id) ON DELETE CASCADE,
  incident_id uuid REFERENCES incidents(id) ON DELETE CASCADE,
  team_type text NOT NULL,
  dispatched_by uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  assigned_to jsonb DEFAULT '[]',
  status text DEFAULT 'dispatched' CHECK (status IN ('dispatched', 'en_route', 'on_scene', 'completed')),
  priority text DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  estimated_arrival timestamptz,
  actual_arrival timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- System health table
CREATE TABLE IF NOT EXISTS system_health (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  airport_id uuid REFERENCES airports(id) ON DELETE CASCADE,
  component text NOT NULL,
  status text NOT NULL CHECK (status IN ('healthy', 'warning', 'critical', 'offline')),
  metrics jsonb DEFAULT '{}',
  last_check timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Sensor readings table (for real-time data)
CREATE TABLE IF NOT EXISTS sensor_readings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sensor_id uuid REFERENCES sensors(id) ON DELETE CASCADE,
  value numeric NOT NULL,
  unit text NOT NULL,
  quality_score numeric DEFAULT 1.0 CHECK (quality_score >= 0 AND quality_score <= 1),
  metadata jsonb DEFAULT '{}',
  recorded_at timestamptz DEFAULT now()
);

-- Camera events table
CREATE TABLE IF NOT EXISTS camera_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  camera_id uuid REFERENCES cameras(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  confidence numeric DEFAULT 0 CHECK (confidence >= 0 AND confidence <= 1),
  bounding_box jsonb,
  metadata jsonb DEFAULT '{}',
  frame_url text,
  detected_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE airports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensors ENABLE ROW LEVEL SECURITY;
ALTER TABLE cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health ENABLE ROW LEVEL SECURITY;
ALTER TABLE sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE camera_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- RLS Policies for airports (users can only access their assigned airport)
CREATE POLICY "Users can read own airport"
  ON airports
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT airport_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for zones
CREATE POLICY "Users can read zones in their airport"
  ON zones
  FOR SELECT
  TO authenticated
  USING (
    airport_id IN (
      SELECT airport_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for sensors
CREATE POLICY "Users can read sensors in their airport"
  ON sensors
  FOR SELECT
  TO authenticated
  USING (
    airport_id IN (
      SELECT airport_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for cameras
CREATE POLICY "Users can read cameras in their airport"
  ON cameras
  FOR SELECT
  TO authenticated
  USING (
    airport_id IN (
      SELECT airport_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for alerts
CREATE POLICY "Users can read alerts in their airport"
  ON alerts
  FOR SELECT
  TO authenticated
  USING (
    airport_id IN (
      SELECT airport_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update alerts in their airport"
  ON alerts
  FOR UPDATE
  TO authenticated
  USING (
    airport_id IN (
      SELECT airport_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert alerts in their airport"
  ON alerts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    airport_id IN (
      SELECT airport_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for incidents
CREATE POLICY "Users can read incidents in their airport"
  ON incidents
  FOR SELECT
  TO authenticated
  USING (
    airport_id IN (
      SELECT airport_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update incidents in their airport"
  ON incidents
  FOR UPDATE
  TO authenticated
  USING (
    airport_id IN (
      SELECT airport_id FROM user_profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can insert incidents in their airport"
  ON incidents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    airport_id IN (
      SELECT airport_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for alert_actions
CREATE POLICY "Users can read alert actions in their airport"
  ON alert_actions
  FOR SELECT
  TO authenticated
  USING (
    alert_id IN (
      SELECT id FROM alerts WHERE airport_id IN (
        SELECT airport_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert alert actions"
  ON alert_actions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies for team_dispatches
CREATE POLICY "Users can read team dispatches in their airport"
  ON team_dispatches
  FOR SELECT
  TO authenticated
  USING (
    alert_id IN (
      SELECT id FROM alerts WHERE airport_id IN (
        SELECT airport_id FROM user_profiles WHERE id = auth.uid()
      )
    )
    OR
    incident_id IN (
      SELECT id FROM incidents WHERE airport_id IN (
        SELECT airport_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert team dispatches"
  ON team_dispatches
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = dispatched_by);

-- RLS Policies for system_health
CREATE POLICY "Users can read system health for their airport"
  ON system_health
  FOR SELECT
  TO authenticated
  USING (
    airport_id IN (
      SELECT airport_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- RLS Policies for sensor_readings
CREATE POLICY "Users can read sensor readings in their airport"
  ON sensor_readings
  FOR SELECT
  TO authenticated
  USING (
    sensor_id IN (
      SELECT id FROM sensors WHERE airport_id IN (
        SELECT airport_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

-- RLS Policies for camera_events
CREATE POLICY "Users can read camera events in their airport"
  ON camera_events
  FOR SELECT
  TO authenticated
  USING (
    camera_id IN (
      SELECT id FROM cameras WHERE airport_id IN (
        SELECT airport_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_airport_id ON user_profiles(airport_id);
CREATE INDEX IF NOT EXISTS idx_zones_airport_id ON zones(airport_id);
CREATE INDEX IF NOT EXISTS idx_sensors_airport_id ON sensors(airport_id);
CREATE INDEX IF NOT EXISTS idx_sensors_zone_id ON sensors(zone_id);
CREATE INDEX IF NOT EXISTS idx_cameras_airport_id ON cameras(airport_id);
CREATE INDEX IF NOT EXISTS idx_cameras_zone_id ON cameras(zone_id);
CREATE INDEX IF NOT EXISTS idx_alerts_airport_id ON alerts(airport_id);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at);
CREATE INDEX IF NOT EXISTS idx_incidents_airport_id ON incidents(airport_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_sensor_id ON sensor_readings(sensor_id);
CREATE INDEX IF NOT EXISTS idx_sensor_readings_recorded_at ON sensor_readings(recorded_at);
CREATE INDEX IF NOT EXISTS idx_camera_events_camera_id ON camera_events(camera_id);
CREATE INDEX IF NOT EXISTS idx_camera_events_detected_at ON camera_events(detected_at);

-- Insert default airport
INSERT INTO airports (id, name, code, city, country, coordinates, configuration) 
VALUES (
  'default-airport-id'::uuid,
  'SafeTwin Demo Airport',
  'DEMO',
  'Demo City',
  'Demo Country',
  '{"lat": 40.7128, "lng": -74.0060}',
  '{"timezone": "America/New_York", "operating_hours": "24/7"}'
) ON CONFLICT (code) DO NOTHING;

-- Insert default zones for the demo airport
INSERT INTO zones (airport_id, name, type, coordinates) VALUES
  ('default-airport-id'::uuid, 'Terminal A', 'terminal', '{"x": 20, "y": 30, "width": 200, "height": 150}'),
  ('default-airport-id'::uuid, 'Terminal B', 'terminal', '{"x": 250, "y": 30, "width": 200, "height": 150}'),
  ('default-airport-id'::uuid, 'Security Checkpoint', 'security', '{"x": 120, "y": 200, "width": 150, "height": 100}'),
  ('default-airport-id'::uuid, 'Baggage Claim', 'baggage', '{"x": 300, "y": 200, "width": 180, "height": 120}'),
  ('default-airport-id'::uuid, 'Departure Lounge', 'lounge', '{"x": 50, "y": 350, "width": 250, "height": 100}'),
  ('default-airport-id'::uuid, 'Retail Area', 'retail', '{"x": 350, "y": 350, "width": 120, "height": 100}'),
  ('default-airport-id'::uuid, 'Runway 09L/27R', 'runway', '{"x": 50, "y": 200, "width": 400, "height": 40}'),
  ('default-airport-id'::uuid, 'Runway 09R/27L', 'runway', '{"x": 50, "y": 300, "width": 400, "height": 40}'),
  ('default-airport-id'::uuid, 'Taxiway Alpha', 'taxiway', '{"x": 50, "y": 250, "width": 400, "height": 20}'),
  ('default-airport-id'::uuid, 'North Apron', 'apron', '{"x": 100, "y": 50, "width": 150, "height": 120}'),
  ('default-airport-id'::uuid, 'South Apron', 'apron', '{"x": 300, "y": 50, "width": 150, "height": 120}'),
  ('default-airport-id'::uuid, 'Service Road East', 'service_road', '{"x": 470, "y": 50, "width": 20, "height": 300}'),
  ('default-airport-id'::uuid, 'Fuel Storage', 'fuel', '{"x": 500, "y": 100, "width": 80, "height": 60}'),
  ('default-airport-id'::uuid, 'Cargo Terminal', 'cargo', '{"x": 500, "y": 200, "width": 100, "height": 80}'),
  ('default-airport-id'::uuid, 'Maintenance Hangar', 'hangar', '{"x": 500, "y": 300, "width": 120, "height": 100}')
ON CONFLICT (airport_id, name) DO NOTHING;

-- Create functions for real-time updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at columns
CREATE TRIGGER update_airports_updated_at BEFORE UPDATE ON airports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_zones_updated_at BEFORE UPDATE ON zones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sensors_updated_at BEFORE UPDATE ON sensors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_cameras_updated_at BEFORE UPDATE ON cameras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_alerts_updated_at BEFORE UPDATE ON alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_incidents_updated_at BEFORE UPDATE ON incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_team_dispatches_updated_at BEFORE UPDATE ON team_dispatches FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();