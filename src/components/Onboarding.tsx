import React, { useState } from 'react';
import { Shield, ArrowRight, CheckCircle, Bot, AlertTriangle, Users, Eye, Plane, Building, Monitor, Bell } from 'lucide-react';

interface OnboardingProps {
  onComplete: () => void;
  onSkip: () => void;
  isGuestMode?: boolean;
}

export const Onboarding: React.FC<OnboardingProps> = ({ onComplete, onSkip, isGuestMode = false }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to SafeTwin',
      subtitle: 'AI-Powered Airport Safety System',
      component: WelcomeStep
    },
    {
      title: 'AI-Powered Monitoring',
      subtitle: 'Advanced artificial intelligence for safety',
      component: AIFeaturesStep
    },
    {
      title: 'Comprehensive Coverage',
      subtitle: 'Terminal and airside operations',
      component: CoverageStep
    },
    {
      title: 'Real-time Alerts',
      subtitle: 'Instant notifications and responses',
      component: AlertsStep
    },
    {
      title: 'Ready to Begin',
      subtitle: 'Start monitoring your airport',
      component: CompletionStep
    }
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900">
      {/* White Header Bar */}
      <div className="bg-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">SafeTwin</h1>
                <p className="text-xs text-gray-600">AI Airport Safety System</p>
              </div>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={onSkip}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Skip Tour
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Onboarding Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
        <div className="max-w-4xl w-full">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-white">System Overview</h1>
              <span className="text-sm text-gray-400">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step Content */}
          <div className="bg-gray-800 rounded-xl p-8 border border-gray-700 shadow-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-2">{steps[currentStep].title}</h2>
              <p className="text-gray-400">{steps[currentStep].subtitle}</p>
            </div>

            <CurrentStepComponent />

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                disabled={currentStep === 0}
                className={`px-6 py-3 rounded-lg transition-colors ${
                  currentStep === 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                }`}
              >
                Previous
              </button>
              <button
                onClick={nextStep}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <span>{currentStep === steps.length - 1 ? 'Get Started' : 'Next'}</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WelcomeStep: React.FC = () => (
  <div className="text-center space-y-6">
    <div className="flex justify-center">
      <Shield className="h-24 w-24 text-blue-400" />
    </div>
    <div className="space-y-4">
      <p className="text-lg text-gray-300">
        SafeTwin is the next-generation AI-powered airport safety monitoring system for both terminal and airside operations.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-gray-700 rounded-lg p-4">
          <Bot className="h-8 w-8 text-blue-400 mb-2" />
          <h3 className="font-semibold mb-2">AI Agents</h3>
          <p className="text-sm text-gray-400">Intelligent monitoring with specialized AI agents</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <AlertTriangle className="h-8 w-8 text-orange-400 mb-2" />
          <h3 className="font-semibold mb-2">Real-time Alerts</h3>
          <p className="text-sm text-gray-400">Instant notifications for safety incidents</p>
        </div>
        <div className="bg-gray-700 rounded-lg p-4">
          <Users className="h-8 w-8 text-green-400 mb-2" />
          <h3 className="font-semibold mb-2">Comprehensive Coverage</h3>
          <p className="text-sm text-gray-400">Monitor all critical airport areas</p>
        </div>
      </div>
    </div>
  </div>
);

const AIFeaturesStep: React.FC = () => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <Bot className="h-16 w-16 text-blue-400 mx-auto mb-4" />
      <p className="text-lg text-gray-300">
        Our AI agents work 24/7 to monitor your airport and detect potential safety issues before they become problems.
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-gray-700 rounded-lg p-6">
        <Eye className="h-8 w-8 text-purple-400 mb-3" />
        <h3 className="font-semibold text-white mb-2">Computer Vision</h3>
        <p className="text-sm text-gray-400">Advanced image recognition to detect unattended baggage, unauthorized access, and suspicious behavior.</p>
      </div>
      
      <div className="bg-gray-700 rounded-lg p-6">
        <Monitor className="h-8 w-8 text-green-400 mb-3" />
        <h3 className="font-semibold text-white mb-2">Sensor Integration</h3>
        <p className="text-sm text-gray-400">Real-time monitoring of environmental conditions, crowd density, and equipment status.</p>
      </div>
      
      <div className="bg-gray-700 rounded-lg p-6">
        <AlertTriangle className="h-8 w-8 text-red-400 mb-3" />
        <h3 className="font-semibold text-white mb-2">Predictive Analytics</h3>
        <p className="text-sm text-gray-400">Machine learning algorithms predict potential safety incidents before they occur.</p>
      </div>
      
      <div className="bg-gray-700 rounded-lg p-6">
        <Bell className="h-8 w-8 text-yellow-400 mb-3" />
        <h3 className="font-semibold text-white mb-2">Smart Alerts</h3>
        <p className="text-sm text-gray-400">Intelligent alert prioritization ensures critical issues get immediate attention.</p>
      </div>
    </div>
  </div>
);

const CoverageStep: React.FC = () => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <div className="flex justify-center space-x-4 mb-4">
        <Building className="h-12 w-12 text-blue-400" />
        <Plane className="h-12 w-12 text-orange-400" />
      </div>
      <p className="text-lg text-gray-300">
        SafeTwin monitors both terminal and airside operations with specialized AI agents for each environment.
      </p>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Building className="h-6 w-6 text-blue-400" />
          <h3 className="text-xl font-semibold text-white">Terminal Operations</h3>
        </div>
        <div className="space-y-3">
          <div className="bg-gray-700 rounded-lg p-3">
            <h4 className="font-medium text-white text-sm">Security Checkpoints</h4>
            <p className="text-xs text-gray-400">Monitor passenger flow and detect security threats</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <h4 className="font-medium text-white text-sm">Baggage Areas</h4>
            <p className="text-xs text-gray-400">Track unattended luggage and suspicious packages</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <h4 className="font-medium text-white text-sm">Departure Lounges</h4>
            <p className="text-xs text-gray-400">Crowd monitoring and emergency response</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center space-x-2 mb-4">
          <Plane className="h-6 w-6 text-orange-400" />
          <h3 className="text-xl font-semibold text-white">Airside Operations</h3>
        </div>
        <div className="space-y-3">
          <div className="bg-gray-700 rounded-lg p-3">
            <h4 className="font-medium text-white text-sm">Runway Safety</h4>
            <p className="text-xs text-gray-400">Detect runway incursions and unauthorized access</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <h4 className="font-medium text-white text-sm">Aircraft Operations</h4>
            <p className="text-xs text-gray-400">Monitor aircraft movement and ground operations</p>
          </div>
          <div className="bg-gray-700 rounded-lg p-3">
            <h4 className="font-medium text-white text-sm">Ground Vehicles</h4>
            <p className="text-xs text-gray-400">Track service vehicles and safety compliance</p>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const AlertsStep: React.FC = () => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <Bell className="h-16 w-16 text-yellow-400 mx-auto mb-4" />
      <p className="text-lg text-gray-300">
        Get instant notifications when safety issues are detected, with intelligent prioritization and automated response coordination.
      </p>
    </div>
    
    <div className="space-y-4">
      <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-2">
          <div className="h-3 w-3 bg-red-400 rounded-full animate-pulse"></div>
          <span className="font-medium text-red-400">CRITICAL ALERT</span>
        </div>
        <p className="text-sm text-gray-300">Runway incursion detected - immediate response required</p>
      </div>
      
      <div className="bg-orange-500/20 border border-orange-500 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-2">
          <div className="h-3 w-3 bg-orange-400 rounded-full animate-pulse"></div>
          <span className="font-medium text-orange-400">HIGH PRIORITY</span>
        </div>
        <p className="text-sm text-gray-300">Unattended baggage detected in departure lounge</p>
      </div>
      
      <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4">
        <div className="flex items-center space-x-3 mb-2">
          <div className="h-3 w-3 bg-yellow-400 rounded-full animate-pulse"></div>
          <span className="font-medium text-yellow-400">MEDIUM PRIORITY</span>
        </div>
        <p className="text-sm text-gray-300">Crowd density threshold exceeded at security checkpoint</p>
      </div>
    </div>
    
    <div className="bg-gray-700 rounded-lg p-4 mt-6">
      <h4 className="font-semibold text-white mb-2">Alert Features</h4>
      <ul className="text-sm text-gray-300 space-y-1">
        <li>• Voice announcements for critical alerts</li>
        <li>• Email and SMS notifications</li>
        <li>• Automated team dispatch</li>
        <li>• Real-time incident tracking</li>
      </ul>
    </div>
  </div>
);

const CompletionStep: React.FC = () => (
  <div className="text-center space-y-6">
    <div className="flex justify-center">
      <CheckCircle className="h-24 w-24 text-green-400" />
    </div>
    <div>
      <h3 className="text-xl font-semibold text-white mb-4">You're Ready to Begin!</h3>
      <p className="text-gray-300 mb-6">
        SafeTwin is now ready to help you monitor and protect your airport operations. 
        The system will start in simulation mode for training and demonstration purposes.
      </p>
      <div className="bg-gray-700 rounded-lg p-4">
        <h4 className="font-semibold text-white mb-2">What's Next:</h4>
        <div className="text-sm text-gray-300 space-y-1 text-left">
          <p>• Create your account or sign in</p>
          <p>• Configure your monitoring zones</p>
          <p>• Set up AI agents for your needs</p>
          <p>• Start monitoring your airport</p>
        </div>
      </div>
    </div>
  </div>
);