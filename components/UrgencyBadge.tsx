import React from 'react';
import { UrgencyLevel } from '../types';
import { TRANSLATIONS } from '../translations';

export const UrgencyBadge: React.FC<{ level: UrgencyLevel | string, language?: string }> = ({ level, language = 'en' }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  // Ensure urgency levels exist in translation, fallback to English if not
  const levels = t.urgency_levels || TRANSLATIONS['en'].urgency_levels;

  let colorClass = 'bg-gray-100 text-gray-800 border-gray-200';
  let label = levels[UrgencyLevel.UNKNOWN] || 'Unknown Urgency';
  let icon = null;

  switch (level) {
    case UrgencyLevel.LOW:
      colorClass = 'bg-emerald-100 text-emerald-800 border-emerald-200';
      label = levels[UrgencyLevel.LOW];
      icon = (
        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      break;
    case UrgencyLevel.MEDIUM:
      colorClass = 'bg-amber-100 text-amber-800 border-amber-200';
      label = levels[UrgencyLevel.MEDIUM];
      icon = (
        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      break;
    case UrgencyLevel.HIGH:
      colorClass = 'bg-red-100 text-red-800 border-red-200 animate-pulse';
      label = levels[UrgencyLevel.HIGH];
      icon = (
        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
      break;
  }

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${colorClass} uppercase tracking-wide`}>
      {icon}
      {label}
    </div>
  );
};