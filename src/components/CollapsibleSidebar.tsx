import React from 'react';

interface CollapsibleSidebarProps {
  children: React.ReactNode;
}

const CollapsibleSidebar: React.FC<CollapsibleSidebarProps> = ({ children }) => {
  return (
    <div className="flex flex-col h-full w-64 bg-gray-900 border-r border-gray-800 text-white">
      <div className="flex flex-col flex-1 overflow-y-auto p-4 space-y-4">
        {children}

        <div className="mt-auto px-2 pt-4">
          <button
            onClick={() => window.location.href = '/logout'}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium shadow transition"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default CollapsibleSidebar;
