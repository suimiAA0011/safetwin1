import React, { useState } from 'react';
import { Bot, Eye, Bell, Shield, Activity, AlertCircle, Plane, Truck, Fuel, Cloud, Camera } from 'lucide-react';

interface AIAgentPanelProps {
  agents: any[];
  updateAgentStatus: (agentId: string, status: string) => void;
}

export const AIAgentPanel: React.FC<AIAgentPanelProps> = ({ agents, updateAgentStatus }) => {
  const [filterZone, setFilterZone] = useState<'all' | 'terminal' | 'airside'>('all');

  const getAgentIcon = (type: string) => {
    switch (type) {
      case 'anomaly_detector': return Eye;
      case 'safety_notifier': return Bell;
      case 'emergency_responder': return Shield;
      case 'crowd_monitor': return Activity;
      case 'runway_monitor': return Plane;
      case 'aircraft_tracker': return Plane;
      case 'vehicle_monitor': return Truck;
      case 'fuel_safety': return Fuel;
      case 'perimeter_security': return Shield;
      case 'weather_monitor': return Cloud;
      default: return Bot;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'alert': return 'text-orange-400';
      case 'critical': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  const filteredAgents = agents.filter(agent => {
    if (filterZone === 'all') return true;
    return agent.zone === filterZone;
  });

  return (
    <div className="p-4 border-b border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Bot className="h-5 w-5 text-blue-400" />
          <h2 className="text-lg font-semibold">AI Agents</h2>
        </div>
        <div className="flex space-x-1">
          <button
            onClick={() => setFilterZone('all')}
            className={`px-2 py-1 text-xs rounded ${
              filterZone === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterZone('terminal')}
            className={`px-2 py-1 text-xs rounded ${
              filterZone === 'terminal' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            Terminal
          </button>
          <button
            onClick={() => setFilterZone('airside')}
            className={`px-2 py-1 text-xs rounded ${
              filterZone === 'airside' ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            Airside
          </button>
        </div>
      </div>
      
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredAgents.map(agent => {
          const Icon = getAgentIcon(agent.type);
          return (
            <div key={agent.id} className="bg-gray-700 rounded-lg p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Icon className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium">{agent.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded ${
                    agent.zone === 'airside' ? 'bg-orange-500/20 text-orange-400' : 'bg-blue-500/20 text-blue-400'
                  }`}>
                    {agent.zone}
                  </span>
                  <div className={`text-xs ${getStatusColor(agent.status)}`}>
                    {agent.status.toUpperCase()}
                  </div>
                </div>
              </div>
              
              <div className="text-xs text-gray-400 mb-2">
                {agent.description}
              </div>
              
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Activity className="h-3 w-3 text-gray-400" />
                  <span className="text-xs text-gray-400">
                    {agent.detections} detections
                  </span>
                </div>
                
                {agent.lastAlert && (
                  <div className="flex items-center space-x-1">
                    <AlertCircle className="h-3 w-3 text-orange-400" />
                    <span className="text-xs text-orange-400">
                      {agent.lastAlert}
                    </span>
                  </div>
                )}
              </div>
              
              <div className="bg-gray-800 rounded-full h-2">
                <div 
                  className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${agent.confidence}%` }}
                />
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Confidence: {agent.confidence}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};