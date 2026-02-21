import React from 'react';
import { UserProfile, SUPPORTED_LANGUAGES } from '../types';
import { TRANSLATIONS } from '../translations';

interface ProfileModalProps {
  user: UserProfile;
  onClose: () => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ user, onClose, onLogout }) => {
  // Determine language code
  const langObj = SUPPORTED_LANGUAGES.find(l => l.name === user.language);
  const code = langObj ? langObj.code : 'en';
  const t = TRANSLATIONS[code] || TRANSLATIONS['en'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
         <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white relative">
            <button onClick={onClose} className="absolute top-4 right-4 text-white/80 hover:text-white">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
            <div className="flex flex-col items-center">
                <div className="w-20 h-20 bg-white text-indigo-600 rounded-full flex items-center justify-center text-3xl font-bold shadow-lg mb-3">
                    {user.name.charAt(0).toUpperCase()}
                </div>
                <h2 className="text-xl font-bold">{user.name}</h2>
                <p className="text-indigo-100 text-sm">{user.age} • {user.gender}</p>
                <div className="mt-2 text-xs bg-white/20 px-2 py-1 rounded-full">
                  Verified ID: {user.emailOrPhone}
                </div>
            </div>
         </div>

         <div className="p-6 space-y-4">
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.profile.conditions}</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-100 text-gray-700 text-sm">
                    {user.medicalHistory || "None listed"}
                </div>
            </div>
            
            <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">{t.profile.language}</label>
                <div className="mt-1 p-3 bg-gray-50 rounded-lg border border-gray-100 text-gray-700 text-sm">
                    {user.language}
                </div>
            </div>

            <div className="pt-4 mt-4 border-t border-gray-100 flex space-x-3">
                <button 
                  onClick={onClose}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                >
                   {t.actions.close}
                </button>
                <button 
                  onClick={onLogout}
                  className="flex-1 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors flex items-center justify-center"
                >
                   <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                   </svg>
                   {t.actions.logout}
                </button>
            </div>
         </div>
      </div>
    </div>
  );
};