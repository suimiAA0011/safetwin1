import React, { useState } from 'react';
import { FileText, Calendar, MapPin, User, Clock, AlertTriangle } from 'lucide-react';

interface IncidentReportsProps {
  incidents: any[];
  addIncident: (incident: any) => void;
}

export const IncidentReports: React.FC<IncidentReportsProps> = ({ incidents, addIncident }) => {
  const [selectedIncident, setSelectedIncident] = useState<any>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="flex h-full">
      {/* Incident List */}
      <div className="w-1/2 p-6 border-r border-gray-700">
        <div className="flex items-center space-x-2 mb-6">
          <FileText className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl font-semibold">Incident Reports</h2>
        </div>
        
        <div className="space-y-4">
          {incidents.map(incident => (
            <div 
              key={incident.id}
              onClick={() => setSelectedIncident(incident)}
              className={`bg-gray-800 rounded-lg p-4 cursor-pointer transition-all duration-200 ${
                selectedIncident?.id === incident.id ? 'ring-2 ring-blue-400' : 'hover:bg-gray-750'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className={`h-3 w-3 rounded-full ${
                    incident.severity === 'critical' ? 'bg-red-400' :
                    incident.severity === 'high' ? 'bg-orange-400' :
                    'bg-yellow-400'
                  }`} />
                  <span className="font-medium text-sm">{incident.title}</span>
                </div>
                <span className={`text-xs ${getSeverityColor(incident.severity)}`}>
                  {incident.severity.toUpperCase()}
                </span>
              </div>
              
              <p className="text-sm text-gray-300 mb-3">{incident.description}</p>
              
              <div className="flex items-center space-x-4 text-xs text-gray-400">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{formatDate(incident.timestamp)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-3 w-3" />
                  <span>{incident.zone}</span>
                </div>
              </div>
            </div>
          ))}
          
          {incidents.length === 0 && (
            <div className="text-center text-gray-500 py-12">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">No incidents reported</p>
              <p className="text-sm">System is operating normally</p>
            </div>
          )}
        </div>
      </div>

      {/* Incident Details */}
      <div className="w-1/2 p-6">
        {selectedIncident ? (
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <AlertTriangle className={`h-6 w-6 ${getSeverityColor(selectedIncident.severity)}`} />
              <h3 className="text-xl font-semibold">{selectedIncident.title}</h3>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium mb-2">Incident Details</h4>
                <p className="text-gray-300 mb-4">{selectedIncident.description}</p>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <label className="text-gray-400">Severity</label>
                    <p className={`font-medium ${getSeverityColor(selectedIncident.severity)}`}>
                      {selectedIncident.severity.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-400">Zone</label>
                    <p className="font-medium">{selectedIncident.zone}</p>
                  </div>
                  <div>
                    <label className="text-gray-400">Timestamp</label>
                    <p className="font-medium">{formatDate(selectedIncident.timestamp)}</p>
                  </div>
                  <div>
                    <label className="text-gray-400">Status</label>
                    <p className="font-medium">{selectedIncident.status}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium mb-2">AI Agent Analysis</h4>
                <p className="text-gray-300 mb-2">{selectedIncident.aiAnalysis}</p>
                
                <div className="mt-4">
                  <h5 className="text-sm font-medium mb-2">Recommended Actions</h5>
                  <ul className="space-y-1 text-sm text-gray-300">
                    {selectedIncident.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <span className="text-blue-400 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-lg p-4">
                <h4 className="font-medium mb-2">Response Timeline</h4>
                <div className="space-y-3">
                  {selectedIncident.timeline.map((event: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className="h-2 w-2 bg-blue-400 rounded-full mt-2"></div>
                      <div>
                        <p className="text-sm font-medium">{event.action}</p>
                        <p className="text-xs text-gray-400">{formatDate(event.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <div className="text-center">
              <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Select an incident to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};