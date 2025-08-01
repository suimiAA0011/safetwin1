import React from 'react';
import { Shield, AlertTriangle, FileText, Settings, Play, Pause, User, TestTube } from 'lucide-react';
import { User as UserType } from '../types';

interface HeaderProps {
  activeView: string;
  setActiveView: (view: string) => void;
  simulatorMode: boolean;
  setSimulatorMode: (mode: boolean) => void;
  systemConfig: any;
  user: UserType;
  onToggleSimulation?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  activeView, 
  setActiveView, 
  simulatorMode, 
  setSimulatorMode,
  systemConfig,
  user,
  onToggleSimulation
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Digital Twin', icon: Shield },
    { id: 'incidents', label: 'Incidents', icon: FileText },
    { id: 'simulator', label: 'Simulator', icon: AlertTriangle },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <header className="h-16 bg-gray-900 border-b border-gray-700 flex items-center justify-between px-6">
      <div className="flex items-center space-x-8">
        <div className="flex items-center space-x-3">
          <Shield className="h-8 w-8 text-blue-400" />
          <div>
            <h1 className="text-xl font-bold text-white">SafeTwin</h1>
            <p className="text-xs text-gray-400">
              {user.airportId || 'AI Airport Safety System'}
            </p>
          </div>
        </div>

        <nav className="flex space-x-4">
          {navItems.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveView(id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                activeView === id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          ))}
        </nav>
      </div>

      <div className="flex items-center space-x-4">
        {/* User Info */}
        <div className="flex items-center space-x-2 text-sm text-gray-300">
          <User className="h-4 w-4" />
          <span>{user.firstName} {user.lastName}</span>
          <span className="text-xs text-gray-500">({user.role.replace('_', ' ')})</span>
        </div>

        {/* Simulator Mode Toggle */}
        <button
          onClick={() => setSimulatorMode(!simulatorMode)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
            simulatorMode
              ? 'bg-orange-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {simulatorMode ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span className="text-sm font-medium">
            {simulatorMode ? 'Training Mode' : 'Live Mode'}
          </span>
        </button>

        {/* Test Scenarios Button */}
        {simulatorMode && onToggleSimulation && (
          <button
            onClick={onToggleSimulation}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <TestTube className="h-4 w-4" />
            <span className="text-sm font-medium">Test Scenarios</span>
          </button>
        )}

        {/* System Status */}
        <div className="flex items-center space-x-2">
          <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-300">System Online</span>
        </div>
      </div>
    </header>
  );
};