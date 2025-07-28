import React, { useState } from 'react';
import { Shield, Users, CheckCircle, AlertTriangle, Phone, MessageSquare, Clock } from 'lucide-react';
import { dataService } from '../services/dataService';
import { authService } from '../services/authService';

interface QuickActionsProps {
  alerts: any[];
  onActionComplete?: (action: string, alertId: string) => void;
}

export const QuickActions: React.FC<QuickActionsProps> = ({ alerts, onActionComplete }) => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<{
    action: string;
    alertId: string;
    message: string;
  } | null>(null);

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const highAlerts = alerts.filter(alert => alert.severity === 'high');

  const handleQuickAction = async (action: string, alertId: string) => {
    const currentUser = await authService.getCurrentUser();
    if (!currentUser) {
      console.error('No authenticated user for action');
      setShowConfirmation({
        action: 'error',
        alertId,
        message: 'Please log in to perform this action'
      });
      return;
    }

    setIsProcessing(alertId);

    try {
      switch (action) {
        case 'acknowledge':
          await dataService.acknowledgeAlert(alertId, currentUser.id);
          setShowConfirmation({
            action,
            alertId,
            message: `Alert acknowledged by ${currentUser.firstName} ${currentUser.lastName}`
          });
          break;
        case 'dispatch_security':
          await dataService.dispatchTeam(alertId, 'security', currentUser.id);
          setShowConfirmation({
            action,
            alertId,
            message: 'Security team dispatched - ETA 5 minutes'
          });
          break;
        case 'dispatch_medical':
          await dataService.dispatchTeam(alertId, 'medical', currentUser.id);
          setShowConfirmation({
            action,
            alertId,
            message: 'Medical team dispatched - ETA 3 minutes'
          });
          break;
        case 'dispatch_fire':
          await dataService.dispatchTeam(alertId, 'fire', currentUser.id);
          setShowConfirmation({
            action,
            alertId,
            message: 'Fire team dispatched - ETA 4 minutes'
          });
          break;
        case 'resolve':
          await dataService.resolveAlert(alertId, currentUser.id);
          setShowConfirmation({
            action,
            alertId,
            message: 'Alert resolved and logged'
          });
          break;
        default:
          console.warn('Unknown action:', action);
          return;
      }

      if (onActionComplete) {
        onActionComplete(action, alertId);
      }


      setTimeout(() => {
        setShowConfirmation(null);
      }, 3000);

    } catch (error) {
      console.error('Action failed:', error);
      setShowConfirmation({
        action: 'error',
        alertId,
        message: 'Action failed. Please try again or check your connection.'
      });
      setTimeout(() => {
        setShowConfirmation(null);
      }, 3000);
    } finally {
      setIsProcessing(null);
    }
  };

  const getActionSuccessMessage = (action: string): string => {
    switch (action) {
      case 'acknowledge':
        return 'Alert acknowledged successfully';
      case 'dispatch_security':
        return 'Security team dispatched';
      case 'dispatch_medical':
        return 'Medical team dispatched';
      case 'dispatch_fire':
        return 'Fire team dispatched';
      case 'resolve':
        return 'Alert resolved successfully';
      default:
        return 'Action completed successfully';
    }
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'acknowledge':
        return <CheckCircle className="h-4 w-4" />;
      case 'dispatch_security':
        return <Shield className="h-4 w-4" />;
      case 'dispatch_medical':
        return <Users className="h-4 w-4" />;
      case 'dispatch_fire':
        return <AlertTriangle className="h-4 w-4" />;
      case 'resolve':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'acknowledge':
        return 'bg-blue-600 hover:bg-blue-700';
      case 'dispatch_security':
        return 'bg-orange-600 hover:bg-orange-700';
      case 'dispatch_medical':
        return 'bg-green-600 hover:bg-green-700';
      case 'dispatch_fire':
        return 'bg-red-600 hover:bg-red-700';
      case 'resolve':
        return 'bg-green-600 hover:bg-green-700';
      default:
        return 'bg-gray-600 hover:bg-gray-700';
    }
  };

  return (
    <div className="space-y-4">
      {/* Critical Alerts Actions */}
      {criticalAlerts.length > 0 && (
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <h3 className="text-sm font-semibold text-red-400">Critical Alerts ({criticalAlerts.length})</h3>
          </div>
          
          <div className="space-y-2">
            {criticalAlerts.slice(0, 3).map(alert => (
              <div key={alert.id} className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-xs text-gray-300 mb-2 truncate">{alert.message}</div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleQuickAction('acknowledge', alert.id)}
                    disabled={isProcessing === alert.id}
                    className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${getActionColor('acknowledge')} ${
                      isProcessing === alert.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {getActionIcon('acknowledge')}
                    <span>Acknowledge</span>
                  </button>
                  
                  <button
                    onClick={() => handleQuickAction('dispatch_security', alert.id)}
                    disabled={isProcessing === alert.id}
                    className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${getActionColor('dispatch_security')} ${
                      isProcessing === alert.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {getActionIcon('dispatch_security')}
                    <span>Dispatch</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* High Priority Actions */}
      {highAlerts.length > 0 && (
        <div className="bg-orange-900/20 border border-orange-500 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            <h3 className="text-sm font-semibold text-orange-400">High Priority ({highAlerts.length})</h3>
          </div>
          
          <div className="space-y-2">
            {highAlerts.slice(0, 2).map(alert => (
              <div key={alert.id} className="bg-gray-800/50 rounded-lg p-3">
                <div className="text-xs text-gray-300 mb-2 truncate">{alert.message}</div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleQuickAction('acknowledge', alert.id)}
                    disabled={isProcessing === alert.id}
                    className={`flex items-center space-x-1 px-2 py-1 rounded text-xs transition-colors ${getActionColor('acknowledge')} ${
                      isProcessing === alert.id ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {getActionIcon('acknowledge')}
                    <span>Acknowledge</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* General Quick Actions */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Quick Actions</h3>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => {
              // Acknowledge all medium/low alerts
              const nonCriticalAlerts = alerts.filter(a => !['critical', 'high'].includes(a.severity));
              nonCriticalAlerts.forEach(alert => {
                handleQuickAction('acknowledge', alert.id);
              });
            }}
            disabled={alerts.filter(a => !['critical', 'high'].includes(a.severity)).length === 0}
            className="flex items-center space-x-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Ack All</span>
          </button>
          
          <button
            onClick={() => {
              // Emergency protocol - dispatch all teams
              criticalAlerts.forEach(alert => {
                handleQuickAction('dispatch_security', alert.id);
              });
            }}
            disabled={criticalAlerts.length === 0}
            className="flex items-center space-x-2 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
          >
            <AlertTriangle className="h-4 w-4" />
            <span>Emergency</span>
          </button>
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Emergency Contacts</h3>
        
        <div className="space-y-2">
          {[
            { name: 'Control Room', number: '+1 (555) 0123', color: 'text-green-400' },
            { name: 'Security', number: '+1 (555) 0456', color: 'text-blue-400' },
            { name: 'Fire Department', number: '+1 (555) 0789', color: 'text-red-400' },
            { name: 'Medical', number: '+1 (555) 0321', color: 'text-purple-400' }
          ].map(contact => (
            <button
              key={contact.name}
              onClick={() => {
                // Simulate calling
                setShowConfirmation({
                  action: 'call',
                  alertId: 'emergency',
                  message: `Calling ${contact.name} at ${contact.number}`
                });
                setTimeout(() => setShowConfirmation(null), 2000);
              }}
              className="w-full flex items-center justify-between text-xs p-2 rounded hover:bg-gray-700 transition-colors"
            >
              <span className="text-gray-400">{contact.name}</span>
              <div className="flex items-center space-x-2">
                <Phone className={`h-3 w-3 ${contact.color}`} />
                <span className="text-white">{contact.number}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Actions Log */}
      <div className="bg-gray-800 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3">Recent Actions</h3>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          <div className="text-xs text-gray-400 p-2 bg-gray-700/50 rounded">
            <div className="flex justify-between">
              <span>Alert acknowledged</span>
              <span>{new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="text-xs text-gray-400 p-2 bg-gray-700/50 rounded">
            <div className="flex justify-between">
              <span>Security team dispatched</span>
              <span>{new Date(Date.now() - 300000).toLocaleTimeString()}</span>
            </div>
          </div>
          <div className="text-xs text-gray-400 p-2 bg-gray-700/50 rounded">
            <div className="flex justify-between">
              <span>Alert resolved</span>
              <span>{new Date(Date.now() - 600000).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Confirmation */}
      {showConfirmation && (
        <div className={`fixed bottom-4 right-4 px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50 ${
          showConfirmation.action === 'error' 
            ? 'bg-red-600 text-white' 
            : 'bg-green-600 text-white'
        }`}>
          {showConfirmation.action === 'error' ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <CheckCircle className="h-4 w-4" />
          )}
          <span className="text-sm">{showConfirmation.message}</span>
        </div>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <div className="fixed bottom-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 z-50">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span className="text-sm">Processing action...</span>
        </div>
      )}
    </div>
  );
};