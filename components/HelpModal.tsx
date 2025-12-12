import React from 'react';
import { TRANSLATIONS } from '../translations';

interface HelpModalProps {
  onClose: () => void;
  language?: string;
}

export const HelpModal: React.FC<HelpModalProps> = ({ onClose, language = 'en' }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  const help = t.help || TRANSLATIONS['en'].help; // Fallback if help not defined in specific lang

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold text-gray-800 flex items-center">
            <svg className="w-6 h-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {help.title}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-8 text-gray-700">
          
          {/* How to use */}
          <section>
             <h3 className="text-lg font-bold text-gray-900 mb-3">{help.how_to_use_title}</h3>
             <ul className="space-y-3">
               {help.how_to_use_steps.map((step: string, idx: number) => (
                 <li key={idx} className="flex items-start">
                   <span className="flex-shrink-0 w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-xs font-bold mr-3 mt-0.5">{idx + 1}</span>
                   <span>{step}</span>
                 </li>
               ))}
             </ul>
          </section>

           {/* Limitations */}
           <section className="bg-amber-50 p-5 rounded-xl border border-amber-100">
             <h3 className="text-lg font-bold text-amber-900 mb-3 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                {help.limitations_title}
             </h3>
             <ul className="list-disc pl-5 space-y-2 text-amber-800">
               {help.limitations_items.map((item: string, idx: number) => (
                 <li key={idx}>{item}</li>
               ))}
             </ul>
          </section>

          {/* Privacy */}
          <section>
             <h3 className="text-lg font-bold text-gray-900 mb-2">{help.privacy_title}</h3>
             <p className="text-gray-600 leading-relaxed">{help.privacy_text}</p>
          </section>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end">
           <button onClick={onClose} className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors font-medium">
             {t.actions.close}
           </button>
        </div>
      </div>
    </div>
  );
};