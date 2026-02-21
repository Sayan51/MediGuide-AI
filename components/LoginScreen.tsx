
import React, { useState, useEffect } from 'react';
import { UserProfile, SUPPORTED_LANGUAGES } from '../types';
import { TRANSLATIONS } from '../translations';

interface LoginScreenProps {
  onLogin: (profile: UserProfile) => void;
  uiLanguage?: string;
}

/* 
 * Fix global declaration to avoid conflicts with pre-existing AIStudio type in the environment.
 * We define the AIStudio interface and use the readonly modifier to match platform definitions.
 */
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }
  interface Window {
    readonly aistudio: AIStudio;
  }
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, uiLanguage = 'en' }) => {
  const [step, setStep] = useState<'login' | 'verify' | 'profile'>('login');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [hasApiKey, setHasApiKey] = useState(false);

  // Profile Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Prefer not to say');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [language, setLanguage] = useState(SUPPORTED_LANGUAGES[0].name);

  useEffect(() => {
    const checkApiKey = async () => {
      // Check for environment variable first
      if (process.env.VITE_GEMINI_API_KEY && process.env.VITE_GEMINI_API_KEY !== 'PLACEHOLDER_API_KEY') {
        setHasApiKey(true);
        return;
      }

      if (window.aistudio?.hasSelectedApiKey) {
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(selected);
      }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio?.openSelectKey) {
      await window.aistudio.openSelectKey();
      // Assume success as per instructions
      setHasApiKey(true);
    } else {
      // Fallback for manual entry or explanation
      window.open('https://aistudio.google.com/app/apikey', '_blank');
    }
  };

  const getLangCode = (langName: string) => {
    const found = SUPPORTED_LANGUAGES.find(l => l.name === langName);
    return found ? found.code : 'en';
  };

  const currentLangCode = getLangCode(language);
  const t = TRANSLATIONS[currentLangCode] || TRANSLATIONS['en'];

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    alert(`[DEV SIMULATION] Verification code sent to ${identifier}: 123456`);
    setStep('verify');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === '123456') {
      const storedUsers = JSON.parse(localStorage.getItem('mediGuide_users') || '{}');
      if (storedUsers[identifier]) {
        onLogin(storedUsers[identifier]);
      } else {
        setStep('profile');
      }
    } else {
      alert("Invalid Code. Try 123456");
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !age.trim()) return;

    const newProfile: UserProfile = {
      id: Date.now().toString(),
      emailOrPhone: identifier,
      name,
      age,
      gender,
      medicalHistory,
      language,
      isVerified: true
    };

    const storedUsers = JSON.parse(localStorage.getItem('mediGuide_users') || '{}');
    storedUsers[identifier] = newProfile;
    localStorage.setItem('mediGuide_users', JSON.stringify(storedUsers));
    onLogin(newProfile);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 border border-indigo-50">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl mb-6 shadow-lg transform rotate-3 hover:rotate-6 transition-transform">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t.app_name}</h1>
          <p className="text-gray-500 mt-2">
            {step === 'login' ? t.login.subtitle : step === 'verify' ? 'Secure Login' : t.login.create_profile}
          </p>
        </div>

        {/* API Key Status Card */}
        <div className={`mb-8 p-4 rounded-xl border flex items-center justify-between ${hasApiKey ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
          <div className="flex items-center">
            <div className={`p-2 rounded-lg mr-3 ${hasApiKey ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
            </div>
            <div>
              <div className={`text-xs font-bold uppercase ${hasApiKey ? 'text-emerald-700' : 'text-amber-700'}`}>
                {hasApiKey ? 'API Key Configured' : 'API Key Required'}
              </div>
              <div className="text-[10px] text-gray-500">
                {hasApiKey ? 'Ready to use Gemini AI' : 'Provide a key to enable AI features'}
              </div>
            </div>
          </div>
          {!hasApiKey && (
            <button
              onClick={handleSelectKey}
              className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-amber-600 text-white hover:bg-amber-700"
            >
              Link Key
            </button>
          )}
        </div>

        {step === 'login' && (
          <div className="space-y-6">
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.login.email_label}</label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="name@example.com"
                />
              </div>
              <button
                type="submit"
                disabled={!hasApiKey}
                className={`w-full font-bold py-3 px-4 rounded-xl shadow-lg transition-all ${!hasApiKey ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700 text-white'}`}
              >
                {t.login.send_code}
              </button>
            </form>
            <div className="text-center">
              <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-500 hover:underline">
                Why do I need a billing-enabled API key?
              </a>
            </div>
          </div>
        )}

        {step === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.login.enter_code}</label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-center font-bold"
                placeholder="123456"
                maxLength={6}
              />
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg">
              {t.login.verify}
            </button>
          </form>
        )}

        {step === 'profile' && (
          <form onSubmit={handleSaveProfile} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.full_name}</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.age}</label>
                <input type="number" required value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.gender}</label>
                <select value={gender} onChange={(e) => setGender(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg">
                  <option>Male</option><option>Female</option><option>Non-binary</option><option>Prefer not to say</option>
                </select>
              </div>
            </div>
            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg mt-2">
              {t.login.save_continue}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
