import React, { useState, useEffect } from 'react';
import { MedicationReminder, UserProfile } from '../types';
import { TRANSLATIONS } from '../translations';

interface MedicationReminderModalProps {
  user: UserProfile;
  onClose: () => void;
  language?: string;
}

export const MedicationReminderModal: React.FC<MedicationReminderModalProps> = ({ user, onClose, language = 'en' }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  const rT = t.reminders || TRANSLATIONS['en'].reminders;

  const storageKey = `mediGuide_reminders_${user.emailOrPhone}`;

  const [reminders, setReminders] = useState<MedicationReminder[]>([]);
  const [view, setView] = useState<'list' | 'add'>('list');

  // Form State
  const [medName, setMedName] = useState('');
  const [totalQty, setTotalQty] = useState<number>(30);
  const [dailyDose, setDailyDose] = useState<number>(1);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        setReminders(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load reminders", e);
      }
    } else {
        setView('add');
    }
  }, [storageKey]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medName.trim()) return;

    const now = Date.now();
    // Calculate days remaining: Total / Daily
    const daysLasting = Math.floor(totalQty / dailyDose);
    // Refill Date = Now + Days * MS_PER_DAY
    const refillDate = now + (daysLasting * 24 * 60 * 60 * 1000);

    const newReminder: MedicationReminder = {
      id: Date.now().toString(),
      medicationName: medName,
      totalQuantity: totalQty,
      dosagePerDay: dailyDose,
      startDate: now,
      refillDate: refillDate,
      notes: notes
    };

    const updated = [...reminders, newReminder];
    setReminders(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));

    // Reset Form
    setMedName('');
    setTotalQty(30);
    setDailyDose(1);
    setNotes('');
    setView('list');
  };

  const handleDelete = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    setReminders(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const getDaysRemaining = (refillDate: number) => {
    const diff = refillDate - Date.now();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-50 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-white p-5 border-b border-gray-200 flex justify-between items-center">
            <div className="flex items-center space-x-3">
                <div className="bg-teal-100 p-2 rounded-lg text-teal-600">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                </div>
                <h2 className="text-xl font-bold text-gray-800">{rT.title}</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
            
             {/* Toggle Views */}
             <div className="flex bg-gray-200 rounded-lg p-1 mb-6">
                <button 
                    onClick={() => setView('list')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${view === 'list' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {t.tracker.history}
                </button>
                <button 
                    onClick={() => setView('add')}
                    className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${view === 'add' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {rT.add_new}
                </button>
            </div>

            {view === 'list' ? (
                <div className="space-y-4">
                    {reminders.length === 0 ? (
                         <div className="text-center py-12 text-gray-400">
                             <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                             <p>{rT.no_reminders}</p>
                         </div>
                    ) : (
                        reminders.map(rem => {
                            const daysLeft = getDaysRemaining(rem.refillDate);
                            const totalDays = Math.floor(rem.totalQuantity / rem.dosagePerDay);
                            const percent = Math.max(0, Math.min(100, (daysLeft / totalDays) * 100));

                            return (
                                <div key={rem.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm group">
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="font-bold text-gray-900 text-lg">{rem.medicationName}</h3>
                                        <button onClick={() => handleDelete(rem.id)} className="text-gray-300 hover:text-red-500 transition-colors">
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        </button>
                                    </div>
                                    
                                    <div className="flex justify-between text-sm text-gray-600 mb-3">
                                        <span>{rT.daily_dose}: {rem.dosagePerDay}</span>
                                        <span>{rT.days_remaining}: <span className={`font-bold ${daysLeft < 5 ? 'text-red-600' : 'text-teal-600'}`}>{daysLeft}</span></span>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                                        <div 
                                            className={`h-2.5 rounded-full ${daysLeft < 5 ? 'bg-red-500' : 'bg-teal-500'}`} 
                                            style={{ width: `${percent}%` }}
                                        ></div>
                                    </div>
                                    
                                    <div className="text-xs text-gray-400 flex justify-between">
                                        <span>{rT.refill_by} {new Date(rem.refillDate).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            ) : (
                <form onSubmit={handleSave} className="space-y-5 animate-in slide-in-from-right duration-200">
                    <div className="bg-teal-50 p-3 rounded-lg text-sm text-teal-800 mb-4">
                        💡 Use the "Medicine Insight" mode to identify the pack size and dosage from your label first.
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{rT.med_name}</label>
                        <input 
                            type="text" 
                            required
                            value={medName}
                            onChange={(e) => setMedName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            placeholder="e.g. Amoxicillin"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{rT.total_qty}</label>
                            <input 
                                type="number" 
                                required
                                min="1"
                                value={totalQty}
                                onChange={(e) => setTotalQty(parseInt(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">{rT.daily_dose}</label>
                            <input 
                                type="number" 
                                required
                                min="0.1"
                                step="0.1"
                                value={dailyDose}
                                onChange={(e) => setDailyDose(parseFloat(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl shadow-lg transition-colors"
                    >
                        {rT.save}
                    </button>
                </form>
            )}
        </div>
      </div>
    </div>
  );
};