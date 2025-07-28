import React, { useState } from 'react';
import { Shield, Mail, Lock, Eye, EyeOff, User, Building, AlertCircle, CheckCircle, Settings, Bell, Palette, Volume2, Plane } from 'lucide-react';
import { authService } from '../services/authService';
import { User as UserType } from '../types';

interface AuthRegisterProps {
  onSuccess: (user: UserType) => void;
  onSwitchToLogin: () => void;
}

export const AuthRegister: React.FC<AuthRegisterProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: '',
    airportId: 'default-airport-id',
    preferences: {
      language: 'en',
      theme: 'dark',
      alertSettings: {
        voiceAlerts: true,
        emailNotifications: true,
        pushNotifications: true,
        smsAlerts: false,
        alertThreshold: 'medium'
      },
      soundEnabled: true,
      dashboardLayout: {
        sidebarCollapsed: false,
        activeView: 'dashboard',
        selectedZone: 'terminal-a'
      },
      aiAgents: {
        anomalyDetection: true,
        crowdMonitoring: true,
        securityBreach: true,
        emergencyResponse: true,
        runwayMonitoring: true,
        aircraftTracking: true,
        vehicleMonitoring: true,
        fuelSafety: true,
        perimeterSecurity: true,
        weatherMonitoring: true
      },
      systemSettings: {
        autoRefresh: true,
        refreshInterval: 5000,
        darkMode: true,
        simulationMode: true
      }
    }
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [passwordStrength, setPasswordStrength] = useState(0);

  const steps = [
    { title: 'Account Information', subtitle: 'Create your SafeTwin account' },
    { title: 'Zone Selection', subtitle: 'Choose monitoring zones' },
    { title: 'AI Agent Setup', subtitle: 'Configure your AI agents' },
    { title: 'Alert Preferences', subtitle: 'Customize your notifications' },
    { title: 'System Preferences', subtitle: 'Configure system settings' }
  ];

  const roles = [
    { value: 'security_chief', label: 'Security Chief' },
    { value: 'operations_manager', label: 'Operations Manager' },
    { value: 'safety_officer', label: 'Safety Officer' },
    { value: 'air_traffic_controller', label: 'Air Traffic Controller' },
    { value: 'ground_operations_manager', label: 'Ground Operations Manager' },
    { value: 'it_administrator', label: 'IT Administrator' },
    { value: 'field_officer', label: 'Field Officer' }
  ];

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[a-z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return strength;
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (passwordStrength < 3) {
      setError('Password must be stronger (at least 8 characters with uppercase, lowercase, and numbers)');
      setIsLoading(false);
      return;
    }

    // Move to zone selection step
    setIsLoading(false);
    setCurrentStep(1);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { user, error } = await authService.signUp(
        formData.email,
        formData.password,
        {
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          airportId: formData.airportId,
          preferences: formData.preferences
        }
      );
      
      if (error) {
        setError(error);
      } else if (user) {
        onSuccess(user);
      }
    } catch (err) {
      console.error('Registration error:', err);
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handlePreferenceChange = (section: string, key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [section]: typeof prev.preferences[section] === 'object' 
          ? { ...prev.preferences[section], [key]: value }
          : value
      }
    }));
  };

  const goBack = () => {
    setCurrentStep(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }

    if (error) setError(null);
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength <= 2) return 'bg-red-500';
    if (passwordStrength <= 3) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getPasswordStrengthText = () => {
    if (passwordStrength <= 2) return 'Weak';
    if (passwordStrength <= 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="w-full max-w-2xl">
      <div className="bg-white rounded-xl shadow-2xl p-8">
        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{steps[currentStep].title}</h2>
            <span className="text-sm text-gray-500">Step {currentStep + 1} of {steps.length}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="text-center mb-8">
          <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 mt-2">{steps[currentStep].subtitle}</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        )}

        {currentStep === 0 ? (
          <AccountInformationStep 
            formData={formData}
            handleInputChange={handleInputChange}
            handleSubmit={handleAccountSubmit}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            showConfirmPassword={showConfirmPassword}
            setShowConfirmPassword={setShowConfirmPassword}
            passwordStrength={passwordStrength}
            getPasswordStrengthColor={getPasswordStrengthColor}
            getPasswordStrengthText={getPasswordStrengthText}
            roles={roles}
          />
        ) : currentStep === 1 ? (
          <ZoneSelectionStep 
            formData={formData}
            setFormData={setFormData}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        ) : currentStep === 2 ? (
          <AIAgentSetupStep 
            formData={formData}
            handlePreferenceChange={handlePreferenceChange}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        ) : currentStep === 3 ? (
          <AlertPreferencesStep 
            formData={formData}
            handlePreferenceChange={handlePreferenceChange}
            nextStep={nextStep}
            prevStep={prevStep}
          />
        ) : currentStep === 4 ? (
          <SystemPreferencesStep 
            formData={formData}
            handlePreferenceChange={handlePreferenceChange}
            handleSubmit={handleFinalSubmit}
            isLoading={isLoading}
            prevStep={prevStep}
          />
        ) : (
          <CompletionStep 
            formData={formData}
            handleSubmit={handleFinalSubmit}
            isLoading={isLoading}
          />
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <button
              onClick={onSwitchToLogin}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in here
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

const AccountInformationStep: React.FC<any> = ({ 
  formData, 
  handleInputChange, 
  handleSubmit, 
  showPassword, 
  setShowPassword,
  showConfirmPassword,
  setShowConfirmPassword,
  passwordStrength,
  getPasswordStrengthColor,
  getPasswordStrengthText,
  roles
}) => (
  <form onSubmit={handleSubmit} className="space-y-6">
    {/* Personal Information */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          First Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="First name"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Last Name
        </label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            required
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Last name"
          />
        </div>
      </div>
    </div>

    {/* Email */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Email Address
      </label>
      <div className="relative">
        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          required
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter your email"
        />
      </div>
    </div>

    {/* Role */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Role
      </label>
      <div className="relative">
        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <select
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          required
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
        >
          <option value="">Select your role</option>
          {roles.map(role => (
            <option key={role.value} value={role.value}>
              {role.label}
            </option>
          ))}
        </select>
      </div>
    </div>

    {/* Password */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Password
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          required
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Create a password"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      
      {/* Password Strength Indicator */}
      {formData.password && (
        <div className="mt-2">
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor()}`}
                style={{ width: `${(passwordStrength / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs text-gray-600">{getPasswordStrengthText()}</span>
          </div>
        </div>
      )}
    </div>

    {/* Confirm Password */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Confirm Password
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
        <input
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          required
          className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Confirm your password"
        />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
      
      {/* Password Match Indicator */}
      {formData.confirmPassword && (
        <div className="mt-2 flex items-center space-x-2">
          {formData.password === formData.confirmPassword ? (
            <>
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xs text-green-600">Passwords match</span>
            </>
          ) : (
            <>
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span className="text-xs text-red-600">Passwords do not match</span>
            </>
          )}
        </div>
      )}
    </div>

    <button
      type="submit"
      disabled={passwordStrength < 3 || formData.password !== formData.confirmPassword}
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
    >
      Next: Setup Preferences
    </button>
  </form>
);

const ZoneSelectionStep: React.FC<any> = ({ formData, setFormData, nextStep, prevStep }) => {
  const availableZones = [
    // Terminal zones
    { id: 'terminal-a', name: 'Terminal A', description: 'Main passenger terminal', category: 'terminal', icon: Building },
    { id: 'terminal-b', name: 'Terminal B', description: 'Secondary passenger terminal', category: 'terminal', icon: Building },
    { id: 'security-checkpoint', name: 'Security Checkpoint', description: 'TSA screening area', category: 'terminal', icon: Shield },
    { id: 'baggage-claim', name: 'Baggage Claim', description: 'Baggage collection area', category: 'terminal', icon: Building },
    { id: 'departure-lounge', name: 'Departure Lounge', description: 'Gate waiting areas', category: 'terminal', icon: Building },
    { id: 'retail-area', name: 'Retail Area', description: 'Shopping and dining', category: 'terminal', icon: Building },
    // Airside zones
    { id: 'runway-09l', name: 'Runway 09L/27R', description: 'Primary runway operations', category: 'airside', icon: Plane },
    { id: 'runway-09r', name: 'Runway 09R/27L', description: 'Secondary runway operations', category: 'airside', icon: Plane },
    { id: 'taxiway-alpha', name: 'Taxiway Alpha', description: 'Main aircraft taxiway', category: 'airside', icon: Plane },
    { id: 'apron-north', name: 'North Apron', description: 'Aircraft parking and servicing', category: 'airside', icon: Plane },
    { id: 'apron-south', name: 'South Apron', description: 'Aircraft parking and servicing', category: 'airside', icon: Plane },
    { id: 'fuel-depot', name: 'Fuel Storage', description: 'Aircraft fuel storage and distribution', category: 'airside', icon: Plane }
  ];

  const toggleZone = (zoneId: string) => {
    setFormData(prev => ({
      ...prev,
      zones: prev.zones?.includes(zoneId)
        ? prev.zones.filter(id => id !== zoneId)
        : [...(prev.zones || []), zoneId]
    }));
  };

  const terminalZones = availableZones.filter(zone => zone.category === 'terminal');
  const airsideZones = availableZones.filter(zone => zone.category === 'airside');

  return (
    <div className="space-y-6">
      <p className="text-gray-300">Select the zones you want to monitor:</p>
      
      {/* Terminal Zones */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
          <Building className="h-5 w-5 text-blue-400" />
          <span>Terminal Operations</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {terminalZones.map(zone => {
            const Icon = zone.icon;
            return (
              <div
                key={zone.id}
                onClick={() => toggleZone(zone.id)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.zones?.includes(zone.id)
                    ? 'border-blue-500 bg-blue-500/20'
                    : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4 text-blue-400" />
                    <div>
                      <h4 className="font-semibold text-white text-sm">{zone.name}</h4>
                      <p className="text-xs text-gray-400">{zone.description}</p>
                    </div>
                  </div>
                  {formData.zones?.includes(zone.id) && (
                    <CheckCircle className="h-5 w-5 text-blue-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Airside Zones */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
          <Plane className="h-5 w-5 text-orange-400" />
          <span>Airside Operations</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {airsideZones.map(zone => {
            const Icon = zone.icon;
            return (
              <div
                key={zone.id}
                onClick={() => toggleZone(zone.id)}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.zones?.includes(zone.id)
                    ? 'border-orange-500 bg-orange-500/20'
                    : 'border-gray-600 bg-gray-700 hover:border-gray-500'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4 text-orange-400" />
                    <div>
                      <h4 className="font-semibold text-white text-sm">{zone.name}</h4>
                      <p className="text-xs text-gray-400">{zone.description}</p>
                    </div>
                  </div>
                  {formData.zones?.includes(zone.id) && (
                    <CheckCircle className="h-5 w-5 text-orange-400" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={prevStep}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          Next: AI Agents
        </button>
      </div>
    </div>
  );
};

const AIAgentSetupStep: React.FC<any> = ({ formData, handlePreferenceChange, nextStep, prevStep }) => {
  const terminalAgents = [
    { key: 'anomalyDetection', name: 'Anomaly Detection', description: 'Detects unusual behavior and objects in terminals' },
    { key: 'crowdMonitoring', name: 'Crowd Monitoring', description: 'Monitors crowd density and movement in terminals' },
    { key: 'securityBreach', name: 'Security Breach Detection', description: 'Identifies unauthorized access in terminals' },
    { key: 'emergencyResponse', name: 'Emergency Response', description: 'Coordinates emergency protocols' }
  ];

  const airsideAgents = [
    { key: 'runwayMonitoring', name: 'Runway Incursion Detection', description: 'Monitors runway safety and unauthorized access' },
    { key: 'aircraftTracking', name: 'Aircraft Movement Tracking', description: 'Tracks aircraft during taxiing and parking' },
    { key: 'vehicleMonitoring', name: 'Ground Vehicle Monitoring', description: 'Monitors ground support equipment and vehicles' },
    { key: 'fuelSafety', name: 'Fuel Safety Inspector', description: 'Monitors refueling operations and safety protocols' },
    { key: 'perimeterSecurity', name: 'Perimeter Security', description: 'Monitors airside perimeter and restricted areas' },
    { key: 'weatherMonitoring', name: 'Weather Impact Analyzer', description: 'Analyzes weather conditions for operational safety' }
  ];

  const toggleAgent = (agentKey: string) => {
    handlePreferenceChange('aiAgents', agentKey, !formData.preferences.aiAgents[agentKey]);
  };

  return (
    <div className="space-y-6">
      <p className="text-gray-300">Configure your AI agents for comprehensive airport monitoring:</p>
      
      {/* Terminal Agents */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
          <Building className="h-5 w-5 text-blue-400" />
          <span>Terminal AI Agents</span>
        </h3>
        <div className="space-y-3">
          {terminalAgents.map(agent => (
            <div
              key={agent.key}
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
            >
              <div>
                <h4 className="font-semibold text-white text-sm">{agent.name}</h4>
                <p className="text-xs text-gray-400">{agent.description}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleAgent(agent.key)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  formData.preferences.aiAgents[agent.key] ? 'bg-blue-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    formData.preferences.aiAgents[agent.key] ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Airside Agents */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
          <Plane className="h-5 w-5 text-orange-400" />
          <span>Airside AI Agents</span>
        </h3>
        <div className="space-y-3">
          {airsideAgents.map(agent => (
            <div
              key={agent.key}
              className="flex items-center justify-between p-3 bg-gray-700 rounded-lg"
            >
              <div>
                <h4 className="font-semibold text-white text-sm">{agent.name}</h4>
                <p className="text-xs text-gray-400">{agent.description}</p>
              </div>
              <button
                type="button"
                onClick={() => toggleAgent(agent.key)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  formData.preferences.aiAgents[agent.key] ? 'bg-orange-500' : 'bg-gray-600'
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${
                    formData.preferences.aiAgents[agent.key] ? 'translate-x-6' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          type="button"
          onClick={prevStep}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          Back
        </button>
        <button
          type="button"
          onClick={nextStep}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          Next: Alert Settings
        </button>
      </div>
    </div>
  );
};

const AlertPreferencesStep: React.FC<any> = ({ formData, handlePreferenceChange, nextStep, prevStep }) => (
  <div className="space-y-6">
    {/* Language */}
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Language
      </label>
      <select
        value={formData.preferences.language || 'en'}
        onChange={(e) => handlePreferenceChange('', 'language', e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="en">English</option>
        <option value="es">Spanish</option>
        <option value="fr">French</option>
        <option value="de">German</option>
      </select>
    </div>

    {/* Alert Threshold */}
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">Alert Sensitivity</label>
      <select
        value={formData.preferences.alertSettings.alertThreshold}
        onChange={(e) => handlePreferenceChange('alertSettings', 'alertThreshold', e.target.value)}
        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <option value="low">Low - All incidents</option>
        <option value="medium">Medium - Important incidents</option>
        <option value="high">High - Critical incidents only</option>
      </select>
    </div>

    {/* Alert Preferences */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Alert Preferences
      </label>
      <div className="space-y-3">
        {[
          { key: 'voiceAlerts', label: 'Voice Alerts', icon: Volume2 },
          { key: 'emailNotifications', label: 'Email Notifications', icon: Mail },
          { key: 'pushNotifications', label: 'Push Notifications', icon: Bell },
          { key: 'smsAlerts', label: 'SMS Alerts', icon: Bell }
        ].map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Icon className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </div>
            <button
              type="button"
              onClick={() => handlePreferenceChange('alertSettings', key, !formData.preferences.alertSettings[key])}
              className={`w-12 h-6 rounded-full transition-colors ${
                formData.preferences.alertSettings[key] ? 'bg-blue-500' : 'bg-gray-300'
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  formData.preferences.alertSettings[key] ? 'translate-x-6' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>
    </div>

    <div className="flex space-x-4">
      <button
        type="button"
        onClick={prevStep}
        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
      >
        Back
      </button>
      <button
        type="button"
        onClick={nextStep}
        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
      >
        Next: System Settings
      </button>
    </div>
  </div>
);

const SystemPreferencesStep: React.FC<any> = ({ formData, handlePreferenceChange, handleSubmit, isLoading, prevStep }) => (
  <form onSubmit={handleSubmit} className="space-y-6">
    {/* Theme */}
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">Theme</label>
      <div className="flex space-x-4">
        <label className="flex items-center">
          <input
            type="radio"
            name="theme"
            value="dark"
            checked={formData.preferences.theme === 'dark'}
            onChange={(e) => handlePreferenceChange('', 'theme', e.target.value)}
            className="mr-2"
          />
          <Palette className="h-4 w-4 mr-1" />
          Dark
        </label>
        <label className="flex items-center">
          <input
            type="radio"
            name="theme"
            value="light"
            checked={formData.preferences.theme === 'light'}
            onChange={(e) => handlePreferenceChange('', 'theme', e.target.value)}
            className="mr-2"
          />
          <Palette className="h-4 w-4 mr-1" />
          Light
        </label>
      </div>
    </div>

    {/* Sound Settings */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Sound & Audio
      </label>
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <Volume2 className="h-4 w-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-300">Enable System Sounds</span>
        </div>
        <button
          type="button"
          onClick={() => handlePreferenceChange('soundEnabled', '', !formData.preferences.soundEnabled)}
          className={`w-12 h-6 rounded-full transition-colors ${
            formData.preferences.soundEnabled ? 'bg-blue-500' : 'bg-gray-600'
          }`}
        >
          <div
            className={`w-5 h-5 bg-white rounded-full transition-transform ${
              formData.preferences.soundEnabled ? 'translate-x-6' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    </div>

    {/* System Settings */}
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">System Settings</label>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-sm font-medium text-white">Auto-refresh Dashboard</span>
            <p className="text-xs text-gray-400">Automatically update data every 5 seconds</p>
          </div>
          <button
            type="button"
            onClick={() => handlePreferenceChange('systemSettings', 'autoRefresh', !formData.preferences.systemSettings.autoRefresh)}
            className={`w-12 h-6 rounded-full transition-colors ${
              formData.preferences.systemSettings.autoRefresh ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                formData.preferences.systemSettings.autoRefresh ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
          <div>
            <span className="text-sm font-medium text-white">Simulation Mode</span>
            <p className="text-xs text-gray-400">Use mock data for development and training</p>
          </div>
          <button
            type="button"
            onClick={() => handlePreferenceChange('systemSettings', 'simulationMode', !formData.preferences.systemSettings.simulationMode)}
            className={`w-12 h-6 rounded-full transition-colors ${
              formData.preferences.systemSettings.simulationMode ? 'bg-orange-500' : 'bg-gray-600'
            }`}
          >
            <div
              className={`w-5 h-5 bg-white rounded-full transition-transform ${
                formData.preferences.systemSettings.simulationMode ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </button>
        </div>
      </div>
    </div>

    <div className="flex space-x-4">
      <button
        type="button"
        onClick={prevStep}
        className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors"
      >
        Back
      </button>
      <button
        type="submit"
        disabled={isLoading}
        className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        ) : (
          'Create Account'
        )}
      </button>
    </div>
  </form>
);

const CompletionStep: React.FC<any> = ({ formData, handleSubmit, isLoading }) => (
  <form onSubmit={handleSubmit} className="space-y-6">
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <CheckCircle className="h-24 w-24 text-green-400" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-white mb-4">Ready to Create Account!</h3>
        <p className="text-gray-300 mb-6">
          Your SafeTwin account is configured and ready. Click below to complete registration.
        </p>
        <div className="bg-gray-700 rounded-lg p-4">
          <h4 className="font-semibold text-white mb-2">Configuration Summary:</h4>
          <div className="text-sm text-gray-300 space-y-1">
            <p>• Email: {formData.email}</p>
            <p>• Name: {formData.firstName} {formData.lastName}</p>
            <p>• Role: {formData.role?.replace('_', ' ') || 'Not specified'}</p>
            <p>• Zones: {formData.zones?.length || 0} selected</p>
            <p>• AI Agents: {Object.values(formData.preferences.aiAgents).filter(Boolean).length} enabled</p>
            <p>• Alert Threshold: {formData.preferences.alertSettings.alertThreshold}</p>
            <p>• Theme: {formData.preferences.theme}</p>
            <p>• Simulation Mode: {formData.preferences.systemSettings.simulationMode ? 'Enabled' : 'Disabled'}</p>
          </div>
        </div>
      </div>
    </div>

    <button
      type="submit"
      disabled={isLoading}
      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center"
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
      ) : (
        'Create Account'
      )}
    </button>
  </form>
);