import React, { useState, useEffect } from 'react';
import { TestTube, Play, Square, AlertTriangle, Clock, Target, Zap } from 'lucide-react';
import { simulationService, SimulationScenario } from '../services/simulationService';

interface SimulationPanelProps {
  isVisible: boolean;
  onClose: () => void;
  onScenarioRun: (scenarioId: string) => void;
}

export const SimulationPanel: React.FC<SimulationPanelProps> = ({ 
  isVisible, 
  onClose, 
  onScenarioRun 
}) => {
  const [scenarios, setScenarios] = useState<SimulationScenario[]>([]);
  const [runningScenarios, setRunningScenarios] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'terminal' | 'airside'>('all');
  const [simulationLog, setSimulationLog] = useState<string[]>([]);

  useEffect(() => {
    setScenarios(simulationService.getAvailableScenarios());

    // Subscribe to simulation events for logging
    const handleScenarioCompleted = (data: any) => {
      setRunningScenarios(prev => {
        const newSet = new Set(prev);
        newSet.delete(data.scenarioId);
        return newSet;
      });
      
      setSimulationLog(prev => [
        ...prev.slice(-9), // Keep last 9 entries
        `${new Date().toLocaleTimeString()}: Completed "${data.scenario.name}"`
      ]);
    };

    simulationService.on('scenario_completed', handleScenarioCompleted);

    return () => {
      simulationService.off('scenario_completed', handleScenarioCompleted);
    };
  }, []);

  const handleRunScenario = (scenarioId: string) => {
    setRunningScenarios(prev => new Set([...prev, scenarioId]));
    setSimulationLog(prev => [
      ...prev.slice(-9),
      `${new Date().toLocaleTimeString()}: Started "${scenarios.find(s => s.id === scenarioId)?.name}"`
    ]);
    
    simulationService.runScenario(scenarioId);
    onScenarioRun(scenarioId);
  };

  const handleStopScenario = (scenarioId: string) => {
    simulationService.stopScenario(scenarioId);
    setRunningScenarios(prev => {
      const newSet = new Set(prev);
      newSet.delete(scenarioId);
      return newSet;
    });
    
    setSimulationLog(prev => [
      ...prev.slice(-9),
      `${new Date().toLocaleTimeString()}: Stopped "${scenarios.find(s => s.id === scenarioId)?.name}"`
    ]);
  };

  const handleStopAll = () => {
    simulationService.stopAllScenarios();
    setRunningScenarios(new Set());
    setSimulationLog(prev => [
      ...prev.slice(-9),
      `${new Date().toLocaleTimeString()}: Stopped all scenarios`
    ]);
  };

  const filteredScenarios = scenarios.filter(scenario => 
    selectedCategory === 'all' || scenario.category === selectedCategory
  );

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400 bg-red-500/20 border-red-500';
      case 'high': return 'text-orange-400 bg-orange-500/20 border-orange-500';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500';
      default: return 'text-blue-400 bg-blue-500/20 border-blue-500';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'terminal': return '🏢';
      case 'airside': return '✈️';
      default: return '⚡';
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-3">
            <TestTube className="h-6 w-6 text-purple-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Test Simulation Scenarios</h2>
              <p className="text-sm text-gray-400">Run realistic safety scenarios for training and testing</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handleStopAll}
              disabled={runningScenarios.size === 0}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              <Square className="h-4 w-4" />
              <span>Stop All</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-5rem)]">
          {/* Scenarios List */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Category Filter */}
            <div className="flex space-x-2 mb-6">
              {[
                { id: 'all', label: 'All Scenarios', count: scenarios.length },
                { id: 'terminal', label: 'Terminal', count: scenarios.filter(s => s.category === 'terminal').length },
                { id: 'airside', label: 'Airside', count: scenarios.filter(s => s.category === 'airside').length }
              ].map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {category.label} ({category.count})
                </button>
              ))}
            </div>

            {/* Scenarios Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {filteredScenarios.map(scenario => {
                const isRunning = runningScenarios.has(scenario.id);
                
                return (
                  <div
                    key={scenario.id}
                    className={`bg-gray-700 rounded-lg p-4 border-2 transition-all ${
                      isRunning ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg">{getCategoryIcon(scenario.category)}</span>
                        <div>
                          <h3 className="font-semibold text-white text-sm">{scenario.name}</h3>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className={`text-xs px-2 py-1 rounded border ${getSeverityColor(scenario.severity)}`}>
                              {scenario.severity.toUpperCase()}
                            </span>
                            <div className="flex items-center space-x-1 text-xs text-gray-400">
                              <Clock className="h-3 w-3" />
                              <span>{Math.round(scenario.duration / 1000)}s</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {isRunning && (
                        <div className="flex items-center space-x-1 text-purple-400">
                          <Zap className="h-4 w-4 animate-pulse" />
                          <span className="text-xs font-medium">RUNNING</span>
                        </div>
                      )}
                    </div>

                    <p className="text-sm text-gray-300 mb-4">{scenario.description}</p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs text-gray-400">
                        <Target className="h-3 w-3" />
                        <span>{scenario.events.length} events</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        {isRunning ? (
                          <button
                            onClick={() => handleStopScenario(scenario.id)}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors"
                          >
                            <Square className="h-3 w-3" />
                            <span>Stop</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRunScenario(scenario.id)}
                            className="flex items-center space-x-1 px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-xs transition-colors"
                          >
                            <Play className="h-3 w-3" />
                            <span>Run</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Simulation Log */}
          <div className="w-80 border-l border-gray-700 p-6">
            <div className="flex items-center space-x-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-orange-400" />
              <h3 className="font-semibold text-white">Simulation Log</h3>
            </div>
            
            <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto">
              {simulationLog.length === 0 ? (
                <p className="text-gray-500 text-sm">No simulation activity yet...</p>
              ) : (
                <div className="space-y-2">
                  {simulationLog.map((entry, index) => (
                    <div key={index} className="text-xs text-gray-300 font-mono">
                      {entry}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Running Scenarios Summary */}
            <div className="mt-6">
              <h4 className="font-medium text-white mb-2">Active Scenarios</h4>
              {runningScenarios.size === 0 ? (
                <p className="text-gray-500 text-sm">No scenarios running</p>
              ) : (
                <div className="space-y-2">
                  {Array.from(runningScenarios).map(scenarioId => {
                    const scenario = scenarios.find(s => s.id === scenarioId);
                    return (
                      <div key={scenarioId} className="flex items-center space-x-2 text-sm">
                        <div className="h-2 w-2 bg-purple-400 rounded-full animate-pulse"></div>
                        <span className="text-gray-300">{scenario?.name}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};