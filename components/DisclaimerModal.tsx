import React from 'react';
import { TRANSLATIONS } from '../translations';

interface DisclaimerModalProps {
  onAccept: () => void;
  language?: string; // e.g. 'en', 'bn'
}

export const DisclaimerModal: React.FC<DisclaimerModalProps> = ({ onAccept, language = 'en' }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
        
        <div className="flex flex-col items-center mb-6">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
           <h2 className="text-2xl font-bold text-gray-900 text-center">{t.disclaimer_title}</h2>
        </div>

        <div className="space-y-4 text-gray-600 mb-8">
          <p className="leading-relaxed">
            <span className="font-semibold text-gray-900">{t.disclaimer_text_1}</span>
          </p>
          <p>{t.disclaimer_text_2}</p>
          <ul className="list-disc pl-5 space-y-2 bg-red-50 p-4 rounded-lg border border-red-100 text-sm text-red-800">
            <li>{t.disclaimer_list_1}</li>
            <li>{t.disclaimer_list_2}</li>
          </ul>
        </div>

        <button
          onClick={onAccept}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {t.agree_button}
        </button>
      </div>
    </div>
  );
};