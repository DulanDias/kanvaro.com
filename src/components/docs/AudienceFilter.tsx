'use client';

import React, { useState } from 'react';
import { Audience } from '@/lib/docs/types';

interface AudienceFilterProps {
  selectedAudience?: Audience;
  onAudienceChange: (audience?: Audience) => void;
  visibility: 'public' | 'internal';
}

const audienceLabels: Record<Audience, string> = {
  admin: 'Admin',
  project_manager: 'Project Manager',
  team_member: 'Team Member',
  client: 'Client',
  viewer: 'Viewer',
  self_host_admin: 'Self-host Admin'
};

const audienceColors: Record<Audience, string> = {
  admin: 'bg-red-100 text-red-800',
  project_manager: 'bg-blue-100 text-blue-800',
  team_member: 'bg-green-100 text-green-800',
  client: 'bg-purple-100 text-purple-800',
  viewer: 'bg-gray-100 text-gray-800',
  self_host_admin: 'bg-orange-100 text-orange-800'
};

export function AudienceFilter({ 
  selectedAudience, 
  onAudienceChange, 
  visibility 
}: AudienceFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const availableAudiences: Audience[] = visibility === 'internal' 
    ? ['admin', 'project_manager', 'team_member', 'self_host_admin']
    : ['admin', 'project_manager', 'team_member', 'client', 'viewer'];

  const handleAudienceClick = (audience: Audience) => {
    if (selectedAudience === audience) {
      onAudienceChange(undefined);
    } else {
      onAudienceChange(audience);
    }
    setIsOpen(false);
  };

  const clearFilter = () => {
    onAudienceChange(undefined);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
      >
        <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
        {selectedAudience ? audienceLabels[selectedAudience] : 'All Audiences'}
        <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            <button
              onClick={clearFilter}
              className={`
                w-full text-left px-4 py-2 text-sm
                ${!selectedAudience 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'text-gray-700 hover:bg-gray-100'
                }
              `}
            >
              All Audiences
            </button>
            
            {availableAudiences.map((audience) => (
              <button
                key={audience}
                onClick={() => handleAudienceClick(audience)}
                className={`
                  w-full text-left px-4 py-2 text-sm flex items-center
                  ${selectedAudience === audience 
                    ? 'bg-blue-50 text-blue-700 font-medium' 
                    : 'text-gray-700 hover:bg-gray-100'
                  }
                `}
              >
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium mr-2 ${audienceColors[audience]}`}>
                  {audienceLabels[audience]}
                </span>
                {audienceLabels[audience]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

export default AudienceFilter;
