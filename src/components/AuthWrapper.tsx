import React, { useState, useEffect } from 'react';
import { AuthLogin } from './AuthLogin';
import { AuthRegister } from './AuthRegister';
import { Onboarding } from './Onboarding';
import { authService } from '../services/authService';
import { User } from '../types';
import { Shield, Loader } from 'lucide-react';

interface AuthWrapperProps {
  children: (user: User) => React.ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState(false);

  useEffect(() => {
    // Check if this is the user's first time
    const onboardingCompleted = localStorage.getItem('safetwin_onboarding_completed');
    if (!onboardingCompleted) {
      setIsFirstTime(true);
      setShowOnboarding(true);
      setIsLoading(false);
      return;
    }

    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = (authenticatedUser: User) => {
    // Restore user settings
    const savedSettings = localStorage.getItem(`safetwin_settings_${authenticatedUser.id}`);
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        authenticatedUser.preferences = { ...authenticatedUser.preferences, ...settings };
      } catch (error) {
        console.error('Failed to restore user settings:', error);
      }
    }
    setUser(authenticatedUser);
  };

  const handleSignOut = async () => {
    if (user) {
      // Save user settings before signing out
      localStorage.setItem(`safetwin_settings_${user.id}`, JSON.stringify(user.preferences));
    }
    await authService.signOut();
    setUser(null);
  };

  const handleOnboardingComplete = (config: any) => {
    localStorage.setItem('safetwin_onboarding_completed', 'true');
    setShowOnboarding(false);
    setIsFirstTime(false);
  };

  const handleOnboardingSkip = () => {
    localStorage.setItem('safetwin_onboarding_completed', 'true');
    setShowOnboarding(false);
    setIsFirstTime(false);
  };

  // Show onboarding for first-time users
  if (showOnboarding && isFirstTime) {
    return (
      <Onboarding 
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-blue-400 mx-auto mb-4 animate-pulse" />
          <Loader className="h-8 w-8 text-white mx-auto animate-spin mb-4" />
          <p className="text-white text-lg">Initializing SafeTwin...</p>
        </div>
      </div>
    );
  }

  if (!user) {
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
                  onClick={() => setShowOnboarding(true)}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  View Demo
                </button>
                <button
                  onClick={() => setAuthMode('login')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    authMode === 'login'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthMode('register')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    authMode === 'register'
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  Create Account
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Auth Content */}
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-6">
          {authMode === 'login' ? (
            <AuthLogin 
              onSuccess={handleAuthSuccess}
              onSwitchToRegister={() => setAuthMode('register')}
            />
          ) : (
            <AuthRegister 
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setAuthMode('login')}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {children(user)}
      
      {/* Sign Out Button */}
      <button
        onClick={handleSignOut}
        className="fixed top-4 right-4 z-50 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
      >
        Sign Out
      </button>
    </div>
  );
};