
import React from 'react';
import { ChatSession, AppMode } from '../types';
import { TRANSLATIONS } from '../translations';

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewChat: () => void;
  isOpen: boolean;
  onClose: () => void;
  language?: string;
}

const Icons = {
    [AppMode.SYMPTOM]: () => (
        <svg className="w-5 h-5 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
    ),
    [AppMode.SKIN]: () => (
        <svg className="w-5 h-5 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    [AppMode.MEDICINE]: () => (
        <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
    ),
    [AppMode.MENTAL_HEALTH]: () => (
        <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
    ),
};

export const Sidebar: React.FC<SidebarProps> = ({ 
    sessions, 
    activeSessionId, 
    onSelectSession, 
    onNewChat, 
    isOpen, 
    onClose,
    language = 'en' 
}) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];

  // Group sessions by date
  const groupedSessions = sessions.reduce((acc, session) => {
      const date = new Date(session.timestamp).toLocaleDateString();
      if (!acc[date]) acc[date] = [];
      acc[date].push(session);
      return acc;
  }, {} as Record<string, ChatSession[]>);

  // Sort dates descending
  const sortedDates = Object.keys(groupedSessions).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Container */}
      <div className={`fixed lg:relative z-40 top-0 left-0 h-full w-72 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out flex flex-col shadow-xl lg:shadow-none ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:hidden'}`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
           <h2 className="font-bold text-gray-800 text-lg flex items-center">
             <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
             {t.actions.history}
           </h2>
           <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-gray-600">
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
            <button 
                onClick={() => {
                    onNewChat();
                    if(window.innerWidth < 1024) onClose();
                }}
                className="w-full flex items-center justify-center space-x-2 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition-colors shadow-md hover:shadow-lg active:scale-[0.98] transform"
            >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                <span className="font-semibold">{t.actions.new_chat}</span>
            </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4 scrollbar-thin scrollbar-thumb-gray-200">
            {sessions.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                    <p className="text-sm">{t.actions.no_history}</p>
                </div>
            ) : (
                sortedDates.map(date => (
                    <div key={date}>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-2">{date}</h3>
                        <div className="space-y-1">
                            {groupedSessions[date].sort((a,b) => b.timestamp - a.timestamp).map(session => (
                                <button
                                    key={session.id}
                                    onClick={() => {
                                        onSelectSession(session.id);
                                        if(window.innerWidth < 1024) onClose();
                                    }}
                                    className={`w-full text-left p-3 rounded-xl transition-all duration-200 border group ${activeSessionId === session.id ? 'bg-indigo-50 border-indigo-200 shadow-sm' : 'bg-white border-transparent hover:bg-gray-50 hover:border-gray-100'}`}
                                >
                                    <div className="flex items-start">
                                        <div className={`mt-0.5 p-1.5 rounded-lg mr-3 ${activeSessionId === session.id ? 'bg-white' : 'bg-gray-100 group-hover:bg-white'}`}>
                                           {Icons[session.mode]()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className={`text-sm font-semibold truncate ${activeSessionId === session.id ? 'text-indigo-900' : 'text-gray-700'}`}>
                                                {session.title || session.mode}
                                            </h4>
                                            <p className="text-xs text-gray-500 truncate mt-0.5">
                                                {session.preview}
                                            </p>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </>
  );
};
