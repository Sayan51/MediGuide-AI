
import React, { useState, useEffect } from 'react';
import { UserProfile, SUPPORTED_LANGUAGES } from '../types';
import { TRANSLATIONS } from '../translations';

interface LoginScreenProps {
  onLogin: (profile: UserProfile) => void;
  // Passing the currently selected UI language for the login screen itself before profile load
  uiLanguage?: string; 
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, uiLanguage = 'en' }) => {
  const [step, setStep] = useState<'login' | 'verify' | 'profile'>('login');
  const [identifier, setIdentifier] = useState(''); // Email or Phone
  const [otp, setOtp] = useState('');
  
  // Profile Form State
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Prefer not to say');
  const [medicalHistory, setMedicalHistory] = useState('');
  const [language, setLanguage] = useState(SUPPORTED_LANGUAGES[0].name);

  // Helper to get translation based on selected language in dropdown or default
  const getLangCode = (langName: string) => {
    const found = SUPPORTED_LANGUAGES.find(l => l.name === langName);
    return found ? found.code : 'en';
  };

  const currentLangCode = getLangCode(language);
  const t = TRANSLATIONS[currentLangCode] || TRANSLATIONS['en'];

  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    // SIMULATION: Sending OTP to backend
    alert(`[DEV SIMULATION] Verification code sent to ${identifier}: 123456`);
    setStep('verify');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // SIMULATION: Verify OTP
    if (otp === '123456') {
      // Check if user exists in "Database" (localStorage)
      const storedUsers = JSON.parse(localStorage.getItem('mediGuide_users') || '{}');
      if (storedUsers[identifier]) {
        // User exists, login
        onLogin(storedUsers[identifier]);
      } else {
        // New user, go to profile creation
        setStep('profile');
      }
    } else {
      alert("Invalid Code. Try 123456");
    }
  };

  const handleSocialLogin = (provider: string) => {
    // SIMULATION: Social Auth
    const mockEmail = `user@${provider.toLowerCase()}.com`;
    setIdentifier(mockEmail);
    // Auto-verify for social
    const storedUsers = JSON.parse(localStorage.getItem('mediGuide_users') || '{}');
    if (storedUsers[mockEmail]) {
        onLogin(storedUsers[mockEmail]);
    } else {
        setStep('profile');
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

    // Save to "Database"
    const storedUsers = JSON.parse(localStorage.getItem('mediGuide_users') || '{}');
    storedUsers[identifier] = newProfile;
    localStorage.setItem('mediGuide_users', JSON.stringify(storedUsers));

    onLogin(newProfile);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-8 border border-indigo-50">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-2xl mb-6 shadow-lg transform rotate-3 hover:rotate-6 transition-transform duration-300">
             <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
             </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t.app_name}</h1>
          <p className="text-gray-500 mt-2">
            {step === 'login' ? t.login.subtitle : step === 'verify' ? 'Secure Login' : t.login.create_profile}
          </p>
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                    placeholder="name@example.com"
                  />
               </div>
               <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-200"
               >
                  {t.login.send_code}
               </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
              <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">{t.login.or_social}</span></div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleSocialLogin('Google')} className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                 <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                 {t.login.google}
              </button>
              <button onClick={() => handleSocialLogin('Facebook')} className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                 <svg className="w-5 h-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.791-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                 {t.login.facebook}
              </button>
            </div>
          </div>
        )}

        {step === 'verify' && (
           <form onSubmit={handleVerify} className="space-y-4 animate-in slide-in-from-right duration-300">
              <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">{t.login.enter_code}</label>
                 <input
                   type="text"
                   required
                   value={otp}
                   onChange={(e) => setOtp(e.target.value)}
                   className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-center tracking-widest text-lg font-bold"
                   placeholder={t.login.code_placeholder}
                   maxLength={6}
                 />
              </div>
              <button
                 type="submit"
                 className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all duration-200"
              >
                 {t.login.verify}
              </button>
              <button onClick={() => setStep('login')} type="button" className="w-full text-sm text-gray-500 hover:text-indigo-600">
                 {t.actions.back}
              </button>
           </form>
        )}

        {step === 'profile' && (
           <form onSubmit={handleSaveProfile} className="space-y-5 animate-in slide-in-from-right duration-300">
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.full_name}</label>
               <input
                 type="text"
                 required
                 value={name}
                 onChange={(e) => setName(e.target.value)}
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
               />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.age}</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max="120"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  />
               </div>
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.gender}</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                  >
                    <option>Male</option>
                    <option>Female</option>
                    <option>Non-binary</option>
                    <option>Prefer not to say</option>
                  </select>
               </div>
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t.profile.language}</label>
                <select
                   value={language}
                   onChange={(e) => setLanguage(e.target.value)}
                   className="w-full px-4 py-2 border border-indigo-300 bg-indigo-50 rounded-lg text-indigo-900"
                >
                   {SUPPORTED_LANGUAGES.map(lang => (
                       <option key={lang.code} value={lang.name}>{lang.name}</option>
                   ))}
                </select>
                <p className="text-xs text-indigo-600 mt-1">App will switch to this language.</p>
             </div>
             <div>
               <label className="block text-sm font-medium text-gray-700 mb-1">
                 {t.profile.medical_history}
               </label>
               <textarea
                 value={medicalHistory}
                 onChange={(e) => setMedicalHistory(e.target.value)}
                 className="w-full px-4 py-2 border border-gray-300 rounded-lg h-20 resize-none"
               />
             </div>
             <button
               type="submit"
               className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg mt-2"
             >
               {t.login.save_continue}
             </button>
           </form>
        )}
      </div>
    </div>
  );
};
