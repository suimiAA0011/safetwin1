import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CollapsibleSidebarProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  position: 'left' | 'right';
  defaultCollapsed?: boolean;
  width?: string;
}

export const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({
  title,
  icon,
  children,
  position,
  defaultCollapsed = false,
  width = 'w-80'
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  const toggleCollapsed = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className={`${isCollapsed ? 'w-12' : width} bg-gray-800 border-gray-700 flex flex-col transition-all duration-300 flex-shrink-0 ${
      position === 'left' ? 'border-r' : 'border-l'
    }`}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-700 bg-gray-800/90 backdrop-blur-sm">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            {icon}
            <h2 className="text-sm font-semibold text-white">{title}</h2>
          </div>
        )}
        
        <button
          onClick={toggleCollapsed}
          className="p-1 hover:bg-gray-600 rounded transition-colors flex-shrink-0"
          title={isCollapsed ? `Expand ${title}` : `Collapse ${title}`}
        >
          {isCollapsed ? (
            position === 'left' ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />
          ) : (
            position === 'left' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-hidden transition-all duration-300 ${
        isCollapsed ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}>
        {!isCollapsed && (
          <div className="h-full overflow-y-auto">
            {children}
          </div>
        )}
      </div>

      {/* Collapsed Icon */}
      {isCollapsed && (
        <div className="flex flex-col items-center py-4 space-y-2">
          <div className="p-2 bg-gray-700 rounded-lg">
            {icon}
          </div>
          <div className="text-xs text-gray-400 transform rotate-90 whitespace-nowrap origin-center">
            {title}
          </div>
        </div>
      )}
    </div>
  );
};