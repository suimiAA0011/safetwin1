import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, Mic } from 'lucide-react';

interface VoiceAlertProps {
  alerts: any[];
}

export const VoiceAlert: React.FC<VoiceAlertProps> = ({ alerts }) => {
  const [isEnabled, setIsEnabled] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastAlertId, setLastAlertId] = useState<string | null>(null);

  useEffect(() => {
    if (!isEnabled || alerts.length === 0) return;

    const latestAlert = alerts[alerts.length - 1];
    if (latestAlert.id === lastAlertId) return;

    setLastAlertId(latestAlert.id);
    setIsPlaying(true);

    // Simulate voice alert (in a real implementation, this would use ElevenLabs or similar)
    const speakAlert = (alert: any) => {
      const message = `${alert.severity} alert in ${alert.zone}. ${alert.message}`;
      
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = 0.8;
        utterance.pitch = 1.0;
        utterance.volume = 0.8;
        utterance.onend = () => setIsPlaying(false);
        speechSynthesis.speak(utterance);
      } else {
        // Fallback for browsers without speech synthesis
        setTimeout(() => setIsPlaying(false), 3000);
      }
    };

    speakAlert(latestAlert);
  }, [alerts, isEnabled, lastAlertId]);

  const toggleVoiceAlerts = () => {
    setIsEnabled(!isEnabled);
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-gray-800/95 backdrop-blur-sm rounded-lg p-3 border border-gray-700 flex items-center space-x-3 shadow-xl">
        <div className="flex items-center space-x-2">
          <Mic className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium">Voice Alerts</span>
        </div>
        
        <button
          onClick={toggleVoiceAlerts}
          className={`p-2 rounded-lg transition-colors ${
            isEnabled 
              ? 'bg-blue-600 hover:bg-blue-700' 
              : 'bg-gray-600 hover:bg-gray-700'
          }`}
        >
          {isEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>
        
        {isPlaying && (
          <div className="flex items-center space-x-2">
            <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-green-400">Playing...</span>
          </div>
        )}
      </div>
    </div>
  );
};