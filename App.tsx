
import React, { useState, useRef, useEffect } from 'react';
import { DisclaimerModal } from './components/DisclaimerModal';
import { MessageBubble } from './components/MessageBubble';
import { LiveConsultation } from './components/LiveConsultation';
import { DoctorSummaryModal } from './components/DoctorSummaryModal';
import { LoginScreen } from './components/LoginScreen';
import { ProfileModal } from './components/ProfileModal';
import { HelpModal } from './components/HelpModal';
import { SymptomTrackerModal } from './components/SymptomTrackerModal';
import { MedicationReminderModal } from './components/MedicationReminderModal';
import { Sidebar } from './components/Sidebar';
import { sendMessageToGemini, transcribeAudio, generateDoctorSummary } from './services/geminiService';
import { AppMode, Message, UrgencyLevel, SUPPORTED_LANGUAGES, UserProfile, ChatSession } from './types';
import { TRANSLATIONS } from './translations';

// Icons
const Icons = {
  Symptom: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  Skin: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Medicine: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  Mental: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Send: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
    </svg>
  ),
  Attach: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
    </svg>
  ),
  Mic: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  ),
  Back: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
  ),
  Report: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  Share: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  ),
  LightBulb: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Target: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Tracker: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Pill: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
    </svg>
  ),
  MapPin: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  )
};

const MAX_CHARS = 2000;

export default function App() {
  const [hasAcceptedDisclaimer, setHasAcceptedDisclaimer] = useState(false);

  // Helper to load user synchronously
  const loadUserFromStorage = (): UserProfile | null => {
    try {
      const activeUserId = localStorage.getItem('mediGuide_activeUser');
      if (activeUserId) {
        const storedUsers = JSON.parse(localStorage.getItem('mediGuide_users') || '{}');
        return storedUsers[activeUserId] || null;
      }
    } catch (e) {
      console.error("Failed to load user from storage", e);
    }
    return null;
  };
  
  const initialUser = loadUserFromStorage();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(initialUser);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showTrackerModal, setShowTrackerModal] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  
  // Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Voice Interaction State
  const [lastInputWasVoice, setLastInputWasVoice] = useState(false);

  // Chat State
  const [mode, setMode] = useState<AppMode | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);

  const [inputText, setInputText] = useState('');
  const [inputImage, setInputImage] = useState<string | null>(null); // Base64 data URL
  const [isLoading, setIsLoading] = useState(false);
  
  const [language, setLanguage] = useState(initialUser?.language || SUPPORTED_LANGUAGES[0].name); 
  const [isLiveActive, setIsLiveActive] = useState(false);
  
  // Location State
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | undefined>(undefined);

  // Tips State
  const [isTipsOpen, setIsTipsOpen] = useState(true);
  
  // Summary State
  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);

  // Audio Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Helper to get location with fallback
  const attemptGetLocation = () => {
    if (!navigator.geolocation) return;

    // First try high accuracy
    navigator.geolocation.getCurrentPosition(
        (position) => {
            setUserLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
            });
        },
        (error) => {
            console.warn("High accuracy location failed, retrying with low accuracy...", error);
            // If high accuracy times out or fails, try low accuracy
            if (error.code === 3 || error.code === 2) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                         setUserLocation({
                            latitude: position.coords.latitude,
                            longitude: position.coords.longitude
                        });
                    },
                    (err) => console.warn("Low accuracy location failed", err),
                    { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
                );
            }
        },
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  };

  // Get Location on Mount
  useEffect(() => {
    attemptGetLocation();
  }, []);

  // Load Sessions Logic
  useEffect(() => {
    if (!userProfile) return;
    
    const keySessions = `mediGuide_sessions_${userProfile.emailOrPhone}`;
    const storedSessions = localStorage.getItem(keySessions);
    let parsedSessions: ChatSession[] = [];

    if (storedSessions) {
        try {
            parsedSessions = JSON.parse(storedSessions);
        } catch (e) {
            console.error("Failed to parse sessions", e);
        }
    } else {
        // Legacy Migration: Check for old single-chat history
        const keyOldHistory = `mediGuide_chatHistory_${userProfile.emailOrPhone}`;
        const keyOldMode = `mediGuide_chatMode_${userProfile.emailOrPhone}`;
        const oldHistory = localStorage.getItem(keyOldHistory);
        const oldMode = localStorage.getItem(keyOldMode);
        
        if (oldHistory && oldMode && oldHistory !== '[]') {
            const msgs = JSON.parse(oldHistory);
            const legacySession: ChatSession = {
                id: Date.now().toString(),
                userId: userProfile.emailOrPhone,
                mode: (oldMode === 'LAB_REPORT' ? AppMode.MEDICINE : oldMode as AppMode),
                title: "Previous Chat",
                preview: msgs[msgs.length - 1]?.text || "Chat history",
                timestamp: Date.now(),
                messages: msgs
            };
            parsedSessions = [legacySession];
            localStorage.setItem(keySessions, JSON.stringify(parsedSessions));
        }
    }
    
    setSessions(parsedSessions);

  }, [userProfile]);

  // Sync language with profile if profile changes (Login or Update)
  useEffect(() => {
    if (userProfile?.language) {
      setLanguage(userProfile.language);
    }
  }, [userProfile]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Handle Language Change from Header
  const handleLanguageChange = (newLangName: string) => {
    setLanguage(newLangName);
    
    // Persist language change to user profile immediately
    if (userProfile) {
        const updatedProfile = { ...userProfile, language: newLangName };
        setUserProfile(updatedProfile);
        
        try {
            const storedUsers = JSON.parse(localStorage.getItem('mediGuide_users') || '{}');
            if (storedUsers[userProfile.emailOrPhone]) {
                storedUsers[userProfile.emailOrPhone] = updatedProfile;
                localStorage.setItem('mediGuide_users', JSON.stringify(storedUsers));
            }
        } catch (e) {
            console.error("Failed to update user language in storage", e);
        }
    }
  };

  // DERIVE CURRENT TRANSLATIONS BASED ON LANGUAGE
  const getLangCode = (langName: string) => {
    const found = SUPPORTED_LANGUAGES.find(l => l.name === langName);
    return found ? found.code : 'en';
  };
  const currentLangCode = getLangCode(language);
  const t = TRANSLATIONS[currentLangCode] || TRANSLATIONS['en'];

  // Safe Tip Accessor with English Fallback
  const getModeTips = (): string[] => {
    if (!mode) return [];
    
    // Mapping AppMode Enum to translation keys
    const modeKeyMap: Record<AppMode, string> = { 
      [AppMode.SYMPTOM]: 'symptom', 
      [AppMode.SKIN]: 'skin', 
      [AppMode.MEDICINE]: 'medicine', 
      [AppMode.MENTAL_HEALTH]: 'mental'
    };

    const key = modeKeyMap[mode];
    // Try to find tips in current language
    if (t.modes[key]?.tips && Array.isArray(t.modes[key].tips)) {
       return t.modes[key].tips;
    }
    // Fallback to English tips if missing in current language
    return TRANSLATIONS['en'].modes[key]?.tips || [];
  };

  const currentTips = getModeTips();

  const handleDisclaimerAccept = () => {
    setHasAcceptedDisclaimer(true);
  };

  const handleLogin = (profile: UserProfile) => {
    setUserProfile(profile);
    localStorage.setItem('mediGuide_activeUser', profile.emailOrPhone);
  };

  const handleLogout = () => {
    setUserProfile(null);
    setShowProfileModal(false);
    resetChat();
    setSessions([]);
    setActiveSessionId(null);
    localStorage.removeItem('mediGuide_activeUser');
  };

  const resetChat = () => {
    setMode(null);
    setMessages([]);
    setInputText('');
    setInputImage(null);
    setActiveSessionId(null);
  };

  const saveSessions = (newSessions: ChatSession[]) => {
    if (!userProfile) return;
    setSessions(newSessions);
    localStorage.setItem(`mediGuide_sessions_${userProfile.emailOrPhone}`, JSON.stringify(newSessions));
  };

  // Create a new session when mode is selected
  const handleModeSelect = (selectedMode: AppMode) => {
    if (!userProfile) return;

    let greetingText = '';
    const name = userProfile.name.split(' ')[0];
    
    if (currentLangCode === 'en') greetingText = `Hello ${name}. I am ready to help.`;
    else if (currentLangCode === 'bn') greetingText = `হ্যালো ${name}। আমি সাহায্য করতে প্রস্তুত।`;
    else if (currentLangCode === 'hi') greetingText = `नमस्ते ${name}। मैं मदद के लिए तैयार हूँ।`;
    else if (currentLangCode === 'es') greetingText = `Hola ${name}. Estoy listo para ayudar.`;
    else if (currentLangCode === 'fr') greetingText = `Bonjour ${name}. Je suis prêt à aider.`;
    else greetingText = `Hello ${name}.`;

    const initialMessage: Message = {
      id: 'init',
      role: 'model',
      structuredResponse: {
        advice: greetingText,
        urgency: UrgencyLevel.LOW,
        reasoning: "Initial greeting",
        followUpQuestions: []
      },
      timestamp: Date.now()
    };

    const newSessionId = Date.now().toString();
    const newSession: ChatSession = {
        id: newSessionId,
        userId: userProfile.emailOrPhone,
        mode: selectedMode,
        title: `${t.modes[selectedMode === AppMode.MENTAL_HEALTH ? 'mental' : selectedMode.toLowerCase()]?.title || selectedMode}`,
        preview: "New conversation started",
        timestamp: Date.now(),
        messages: [initialMessage]
    };

    // Update State
    setMode(selectedMode);
    setMessages([initialMessage]);
    setActiveSessionId(newSessionId);
    
    // Save
    saveSessions([newSession, ...sessions]);
  };

  const handleSelectSession = (sessionId: string) => {
    const session = sessions.find(s => s.id === sessionId);
    if (session) {
        setMode(session.mode);
        setMessages(session.messages);
        setActiveSessionId(session.id);
        if (window.innerWidth < 1024) setIsSidebarOpen(false);
    }
  };

  const updateCurrentSession = (updatedMessages: Message[], lastMessageText: string) => {
      if (!activeSessionId) return;
      
      const updatedSessions = sessions.map(s => {
          if (s.id === activeSessionId) {
              // Generate a title from the first user message if it's generic
              let title = s.title;
              if ((s.title.includes("New conversation") || s.title === s.mode) && updatedMessages.length > 1) {
                  const firstUserMsg = updatedMessages.find(m => m.role === 'user');
                  if (firstUserMsg && firstUserMsg.text) {
                      title = firstUserMsg.text.slice(0, 30) + (firstUserMsg.text.length > 30 ? '...' : '');
                  }
              }

              return {
                  ...s,
                  messages: updatedMessages,
                  timestamp: Date.now(),
                  preview: lastMessageText.slice(0, 60) + (lastMessageText.length > 60 ? '...' : ''),
                  title: title
              };
          }
          return s;
      });
      
      // Sort by timestamp desc
      updatedSessions.sort((a, b) => b.timestamp - a.timestamp);
      saveSessions(updatedSessions);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInputImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const handleGenerateReport = async () => {
    if (messages.length < 2) return;
    setIsGeneratingSummary(true);
    const summary = await generateDoctorSummary(messages);
    setSummaryText(summary);
    setShowSummary(true);
    setIsGeneratingSummary(false);
  };

  const handleShare = async () => {
    if (messages.length === 0) return;

    const textToShare = messages.map(m => {
        const role = m.role === 'user' ? 'Patient' : 'MediGuide';
        const content = m.text || m.structuredResponse?.advice || '';
        return `${role}: ${content}`;
    }).join('\n\n');

    let shareUrl = '';
    try {
        if (window.location.protocol.startsWith('http')) {
            shareUrl = window.location.href;
        }
    } catch (e) {
        console.warn("Could not determine share URL", e);
    }

    const shareData: { title: string; text: string; url?: string } = {
      title: 'MediGuide Consultation',
      text: `MediGuide Consultation Transcript:\n\n${textToShare}`,
    };
    
    if (shareUrl) {
        shareData.url = shareUrl;
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing', err);
      }
    } else {
      const body = shareData.text + (shareData.url ? `\n\nLink: ${shareData.url}` : '');
      const mailtoLink = `mailto:?subject=${encodeURIComponent(shareData.title)}&body=${encodeURIComponent(body)}`;
      window.location.href = mailtoLink;
    }
  };

  const handleSendMessage = async (
    isFocus: boolean = false, 
    isVoice: boolean = false, 
    overrideText?: string, 
    locationOverride?: {latitude: number, longitude: number}
  ) => {
    const textToSend = overrideText || inputText;
    if ((!textToSend.trim() && !inputImage) || isLoading || !mode) return;

    setLastInputWasVoice(isVoice);

    const newUserMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      image: inputImage || undefined,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    updateCurrentSession(updatedMessages, textToSend);

    if (!overrideText) setInputText(''); 
    const currentImageToSend = inputImage ? inputImage.split(',')[1] : undefined;
    
    let mimeType = 'image/jpeg';
    if (inputImage) {
        const match = inputImage.match(/^data:(.*);base64,/);
        if (match) {
            mimeType = match[1];
        }
    }

    setInputImage(null); 
    setIsLoading(true);

    const tempModelId = (Date.now() + 1).toString();
    const tempModelMsg: Message = {
        id: tempModelId,
        role: 'model',
        text: '',
        timestamp: Date.now()
    };
    
    // Optimistic Update
    setMessages(prev => [...prev, tempModelMsg]);

    try {
      const result = await sendMessageToGemini(
        updatedMessages, 
        newUserMsg.text || '', 
        currentImageToSend,
        mimeType, 
        mode,
        language,
        userProfile || undefined,
        (streamedText) => {
            setIsLoading(false); 
            setMessages(prev => prev.map(msg => 
                msg.id === tempModelId ? { ...msg, text: streamedText } : msg
            ));
        },
        isFocus,
        userLocation || locationOverride 
      );

      const newModelMsg: Message = {
        id: tempModelId,
        role: 'model',
        structuredResponse: result.structured,
        groundingChunks: result.groundingChunks,
        timestamp: Date.now()
      };

      const finalMessages = updatedMessages.concat(newModelMsg);
      setMessages(finalMessages);
      updateCurrentSession(finalMessages, result.structured.advice);

    } catch (error) {
      console.error(error);
      setMessages(prev => prev.filter(msg => msg.id !== tempModelId));
    } finally {
      setIsLoading(false);
    }
  };

  // --- Audio Recording Logic ---
  const startRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const mediaRecorder = new MediaRecorder(stream);
        mediaRecorderRef.current = mediaRecorder;
        audioChunksRef.current = [];

        mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                audioChunksRef.current.push(event.data);
            }
        };

        mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' }); 
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = (reader.result as string).split(',')[1];
                setIsLoading(true); // temporary load while transcribing
                const text = await transcribeAudio(base64Audio);
                setIsLoading(false);
                
                if (text.trim()) {
                    // AUTO SEND LOGIC for Voice Command
                    setInputText(text); // Set text briefly
                    
                    const newUserMsg: Message = {
                      id: Date.now().toString(),
                      role: 'user',
                      text: text, 
                      image: inputImage || undefined,
                      timestamp: Date.now(),
                    };
                    
                    setLastInputWasVoice(true);
                    // Manually trigger logic to update session state correctly
                    // We duplicate logic here because state updates in handleSendMessage might clash if called too fast
                    const updatedMessages = [...messages, newUserMsg];
                    setMessages(updatedMessages);
                    updateCurrentSession(updatedMessages, text);

                    setInputText('');
                    const currentImageToSend = inputImage ? inputImage.split(',')[1] : undefined;
                    let mimeType = 'image/jpeg';
                    if (inputImage) {
                        const match = inputImage.match(/^data:(.*);base64,/);
                        if (match) mimeType = match[1];
                    }
                    setInputImage(null);
                    setIsLoading(true);
                    
                    const tempModelId = (Date.now() + 1).toString();
                    setMessages(prev => [...prev, { id: tempModelId, role: 'model', text: '', timestamp: Date.now() }]);

                    try {
                        const result = await sendMessageToGemini(
                            updatedMessages, // Include new message in history
                            text,
                            currentImageToSend,
                            mimeType,
                            mode as AppMode,
                            language,
                            userProfile || undefined,
                            (streamedText) => {
                                setIsLoading(false);
                                setMessages(prev => prev.map(msg => msg.id === tempModelId ? { ...msg, text: streamedText } : msg));
                            },
                            false, // isFocus
                            userLocation
                        );
                        
                        const newModelMsg = {
                             id: tempModelId, role: 'model', structuredResponse: result.structured, groundingChunks: result.groundingChunks, timestamp: Date.now() 
                        } as Message;

                        const finalMessages = updatedMessages.concat(newModelMsg);
                        setMessages(finalMessages);
                        updateCurrentSession(finalMessages, result.structured.advice);

                    } catch (e) {
                        console.error(e);
                        setMessages(prev => prev.filter(msg => msg.id !== tempModelId));
                    } finally {
                        setIsLoading(false);
                    }
                }
            };
            stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.start();
        setIsRecording(true);
    } catch (err) {
        console.error("Mic Error", err);
        alert("Could not access microphone.");
    }
  };

  const stopRecording = () => {
      if (mediaRecorderRef.current && isRecording) {
          mediaRecorderRef.current.stop();
          setIsRecording(false);
      }
  };
  // -----------------------------

  const handleFindCare = () => {
      const proceedWithQuery = async (loc: {latitude: number, longitude: number}) => {
          const text = "Find the nearest pharmacies and medical centers.";
          
          if (!mode) {
              // COLD START LOGIC
              const selectedMode = AppMode.SYMPTOM;
              const name = userProfile ? userProfile.name.split(' ')[0] : '';
              
              // 1. Generate Greeting
              let greetingText = '';
              if (currentLangCode === 'en') greetingText = `Hello ${name}. I am ready to help.`;
              else if (currentLangCode === 'bn') greetingText = `হ্যালো ${name}। আমি সাহায্য করতে প্রস্তুত।`;
              else if (currentLangCode === 'hi') greetingText = `नमस्ते ${name}। मैं मदद के लिए तैयार हूँ।`;
              else if (currentLangCode === 'es') greetingText = `Hola ${name}. Estoy listo para ayudar.`;
              else if (currentLangCode === 'fr') greetingText = `Bonjour ${name}. Je suis prêt à aider.`;
              else greetingText = `Hello ${name}.`;

              const greetingMsg: Message = {
                  id: 'init',
                  role: 'model',
                  structuredResponse: {
                    advice: greetingText,
                    urgency: UrgencyLevel.LOW,
                    reasoning: "Initial greeting",
                    followUpQuestions: []
                  },
                  timestamp: Date.now()
              };

              // 2. Create User Message
              const userMsg: Message = {
                  id: (Date.now() + 1).toString(),
                  role: 'user',
                  text: text,
                  timestamp: Date.now() + 1
              };

              const initialMessages = [greetingMsg, userMsg];
              const newSessionId = Date.now().toString();
              
              const newSession: ChatSession = {
                  id: newSessionId,
                  userId: userProfile?.emailOrPhone || 'guest',
                  mode: selectedMode,
                  title: "Nearby Care",
                  preview: text,
                  timestamp: Date.now(),
                  messages: initialMessages
              };

              // 3. Update State & Storage Immediately
              setMode(selectedMode);
              setActiveSessionId(newSessionId);
              setMessages(initialMessages);
              
              // Force update sessions list manually since state is stale
              const updatedSessions = [newSession, ...sessions];
              saveSessions(updatedSessions);

              // 4. Call API
              setIsLoading(true);
              const tempModelId = (Date.now() + 2).toString();
              
              // Add placeholder for streaming
              setMessages(prev => [...prev, { id: tempModelId, role: 'model', text: '', timestamp: Date.now() }]);

              try {
                  const result = await sendMessageToGemini(
                    initialMessages, 
                    text, 
                    undefined, 
                    undefined, 
                    selectedMode,
                    language,
                    userProfile || undefined,
                    (streamedText) => {
                        setIsLoading(false); 
                        setMessages(prev => prev.map(msg => 
                            msg.id === tempModelId ? { ...msg, text: streamedText } : msg
                        ));
                    },
                    false,
                    loc
                  );

                  const newModelMsg: Message = {
                    id: tempModelId,
                    role: 'model',
                    structuredResponse: result.structured,
                    groundingChunks: result.groundingChunks,
                    timestamp: Date.now()
                  };

                  const finalMessages = [...initialMessages, newModelMsg];
                  
                  // Update UI with final message
                  setMessages(finalMessages);
                  
                  // Update Session Storage
                  const finalSessions = [newSession, ...sessions].map(s => {
                      if (s.id === newSessionId) {
                          return { 
                              ...s, 
                              messages: finalMessages, 
                              preview: result.structured.advice.slice(0, 60) + (result.structured.advice.length > 60 ? '...' : '') 
                          };
                      }
                      return s;
                  });
                  saveSessions(finalSessions);

              } catch (error) {
                  console.error(error);
                  setMessages(prev => prev.filter(msg => msg.id !== tempModelId));
              } finally {
                  setIsLoading(false);
              }

          } else {
              // Existing Session
              handleSendMessage(false, false, text, loc);
          }
      };

      if (!userLocation) {
          if (navigator.geolocation) {
              setIsLoading(true); // Show loading feedback
              navigator.geolocation.getCurrentPosition(
                  (position) => {
                      setIsLoading(false);
                      const loc = {
                          latitude: position.coords.latitude,
                          longitude: position.coords.longitude
                      };
                      setUserLocation(loc);
                      proceedWithQuery(loc);
                  },
                  (error) => {
                      setIsLoading(false);
                      let msg = "Could not retrieve location.";
                      if (error.code === 1) {
                         msg = "Location access denied. Please enable it in your browser settings.";
                      } else if (error.code === 3) {
                         msg = "Location request timed out. Trying low accuracy mode...";
                         navigator.geolocation.getCurrentPosition(
                            (pos) => {
                                const loc = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
                                setUserLocation(loc);
                                proceedWithQuery(loc);
                            }, 
                            () => alert("Location retrieval failed. Please check your signal."),
                            { enableHighAccuracy: false, timeout: 10000 }
                         );
                         return;
                      } else if (error.code === 2) {
                         msg = "Location information is unavailable.";
                      }
                      
                      alert(msg);
                  },
                  { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
              );
          } else {
             alert("Geolocation is not supported by this browser.");
          }
      } else {
          proceedWithQuery(userLocation);
      }
  };

  const ModeCard = ({ m, title, icon: Icon, desc }: { m: AppMode, title: string, icon: any, desc: string }) => (
    <button
      onClick={() => handleModeSelect(m)}
      className="group bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-indigo-100 transition-all duration-300 flex flex-col items-center text-center h-full"
    >
      <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300">
        <Icon />
      </div>
      <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
    </button>
  );

  // --- Render Flow ---
  
  if (!hasAcceptedDisclaimer) {
    return <DisclaimerModal onAccept={handleDisclaimerAccept} language={currentLangCode} />;
  }

  if (!userProfile) {
    return <LoginScreen onLogin={handleLogin} uiLanguage={language} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans overflow-hidden">
      {/* Sidebar */}
      <Sidebar 
        sessions={sessions} 
        activeSessionId={activeSessionId} 
        onSelectSession={handleSelectSession} 
        onNewChat={resetChat}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        language={currentLangCode}
      />

      <div className="flex-1 flex flex-col h-screen overflow-hidden w-full relative">
      
      {/* Live Overlay */}
      {isLiveActive && <LiveConsultation onClose={() => setIsLiveActive(false)} language={language} />}
      
      {/* Summary Modal */}
      {showSummary && <DoctorSummaryModal summary={summaryText} onClose={() => setShowSummary(false)} langCode={currentLangCode} />}
      
      {/* Profile Modal */}
      {showProfileModal && <ProfileModal user={userProfile} onClose={() => setShowProfileModal(false)} onLogout={handleLogout} />}

      {/* Help Modal */}
      {showHelpModal && <HelpModal onClose={() => setShowHelpModal(false)} language={currentLangCode} />}

      {/* Symptom Tracker Modal */}
      {showTrackerModal && <SymptomTrackerModal user={userProfile} onClose={() => setShowTrackerModal(false)} language={currentLangCode} />}

      {/* Medication Reminder Modal */}
      {showReminderModal && <MedicationReminderModal user={userProfile} onClose={() => setShowReminderModal(false)} language={currentLangCode} />}

      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm shrink-0">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
             <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-lg">
                <Icons.Menu />
             </button>

            {mode && (
                <button 
                  onClick={resetChat}
                  className="mr-2 p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors hidden lg:block"
                  aria-label="Go back"
                >
                   <Icons.Back />
                </button>
            )}
            <div className="bg-gradient-to-tr from-indigo-600 to-violet-600 text-white p-1.5 rounded-lg">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 hidden sm:block">
              {t.app_name}
            </h1>
          </div>

          <div className="flex items-center space-x-1 sm:space-x-2">
             {/* Help Trigger */}
             <button 
                onClick={() => setShowHelpModal(true)}
                className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                title="Help & FAQ"
             >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
             </button>

             {/* Tracker Trigger */}
             <button
               onClick={() => setShowTrackerModal(true)}
               className="p-2 text-gray-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
               title="Symptom Tracker"
             >
                <Icons.Tracker />
             </button>

              {/* Medication Reminders Trigger */}
              <button
               onClick={() => setShowReminderModal(true)}
               className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
               title="Medication Refills"
             >
                <Icons.Pill />
             </button>
             
             {/* Find Care Trigger */}
             <button
               id="force-send-care"
               onClick={handleFindCare}
               disabled={isLoading}
               className={`p-2 rounded-lg transition-colors relative ${userLocation ? 'text-gray-500 hover:text-emerald-600 hover:bg-emerald-50' : isLoading ? 'text-gray-300 cursor-wait' : 'text-gray-300 hover:text-emerald-400'}`}
               title={userLocation ? "Find Nearby Care" : "Location access required"}
             >
                <Icons.MapPin />
                {userLocation && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>}
             </button>

             {/* Profile Avatar Trigger */}
             <button onClick={() => setShowProfileModal(true)} className="flex items-center space-x-2 hover:bg-gray-50 rounded-lg p-1 transition-colors">
                <div className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold text-sm">
                  {userProfile.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700 hidden md:block truncate max-w-[100px]">{userProfile.name.split(' ')[0]}</span>
             </button>

             {/* Share Button */}
             {mode && messages.length > 0 && (
               <button
                 onClick={handleShare}
                 className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 p-2 rounded-lg transition-colors border border-indigo-200 hidden sm:block"
                 title={t.actions.share}
               >
                 <Icons.Share />
               </button>
             )}

             {/* Report Button */}
             {mode && messages.length > 2 && (
               <button
                 onClick={handleGenerateReport}
                 disabled={isGeneratingSummary}
                 className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-colors border border-indigo-200 hidden sm:flex"
               >
                 {isGeneratingSummary ? (
                   <span className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2"></span>
                 ) : (
                   <span className="mr-2"><Icons.Report /></span>
                 )}
                 <span className="hidden sm:inline">{t.actions.report}</span>
               </button>
             )}

             <select 
                className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block p-2 max-w-[100px] sm:max-w-none"
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
             >
                {SUPPORTED_LANGUAGES.map(lang => (
                    <option key={lang.code} value={lang.name}>{lang.name}</option>
                ))}
             </select>

             <button 
                onClick={() => setIsLiveActive(true)}
                className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-lg text-sm font-medium flex items-center transition-colors whitespace-nowrap"
             >
                <div className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                {t.actions.live}
             </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col relative w-full">
        {!mode ? (
          /* Mode Selection Screen */
          <div className="flex-1 overflow-y-auto p-4">
              <div className="flex flex-col justify-center items-center py-10 min-h-full">
                 <div className="text-center mb-12 max-w-lg">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">{t.welcome}, {userProfile.name.split(' ')[0]}?</h2>
                  <p className="text-gray-500 text-lg">{t.choose_category}</p>
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
                   <ModeCard 
                      m={AppMode.SYMPTOM} 
                      title={t.modes.symptom.title} 
                      icon={Icons.Symptom} 
                      desc={t.modes.symptom.desc}
                    />
                   <ModeCard 
                      m={AppMode.SKIN} 
                      title={t.modes.skin.title} 
                      icon={Icons.Skin} 
                      desc={t.modes.skin.desc}
                    />
                   <ModeCard 
                      m={AppMode.MEDICINE} 
                      title={t.modes.medicine.title} 
                      icon={Icons.Medicine} 
                      desc={t.modes.medicine.desc}
                    />
                   <ModeCard 
                      m={AppMode.MENTAL_HEALTH} 
                      title={t.modes.mental.title} 
                      icon={Icons.Mental} 
                      desc={t.modes.mental.desc}
                    />
                 </div>

                 <div className="mt-16 bg-blue-50 text-blue-800 text-sm px-4 py-2 rounded-full border border-blue-100 flex items-center">
                   <span className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></span>
                   Powered by Google Gemini 3 Pro
                 </div>
              </div>
          </div>
        ) : (
          /* Chat Interface */
          <div className="flex flex-col flex-1 h-full relative bg-white/50 border-t border-gray-100 backdrop-blur-sm overflow-hidden">
            
            {/* Quick Tips Section */}
            {mode && currentTips.length > 0 && (
                <div className="mx-4 mt-4 bg-indigo-50/50 border border-indigo-100 rounded-xl overflow-hidden transition-all duration-300 shrink-0">
                    <button 
                        onClick={() => setIsTipsOpen(!isTipsOpen)} 
                        className="w-full flex justify-between items-center p-3 text-indigo-900 font-medium text-sm hover:bg-indigo-50/80 transition-colors"
                    >
                        <span className="flex items-center">
                        <span className="mr-2 text-indigo-600"><Icons.LightBulb /></span>
                        {/* LOCALIZED HEADER: "{Quick Tips for} {Mode Title}" */}
                        {t.quick_tips || "Quick Tips for"} {t.modes[mode === AppMode.MENTAL_HEALTH ? 'mental' : mode.toLowerCase()]?.title || mode}
                        </span>
                        <div className={`transform transition-transform duration-300 text-indigo-400 ${isTipsOpen ? 'rotate-180' : ''}`}>
                            <Icons.ChevronDown />
                        </div>
                    </button>
                    <div 
                        className={`transition-all duration-300 ease-in-out overflow-hidden ${isTipsOpen ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}
                    >
                        <ul className="p-3 pt-0 text-sm text-indigo-800 space-y-1.5 ml-8 list-disc pr-4">
                            {currentTips.map((tip, i) => (
                                <li key={i} className="leading-snug">{tip}</li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-300">
              {messages.map((msg, idx) => (
                <MessageBubble 
                    key={msg.id} 
                    message={msg} 
                    isLast={idx === messages.length - 1} 
                    language={currentLangCode}
                    autoPlay={idx === messages.length - 1 && lastInputWasVoice} 
                />
              ))}
              {isLoading && (
                <div className="flex items-center space-x-2 p-4 bg-white/80 rounded-2xl w-fit shadow-sm border border-gray-100">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot"></div>
                  <div className="w-2 h-2 bg-indigo-400 rounded-full typing-dot"></div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-gray-100 shrink-0">
              {inputImage && (
                <div className="mb-3 flex items-center bg-gray-50 p-2 rounded-lg w-fit border border-gray-200">
                   <div className="w-12 h-12 rounded bg-gray-200 overflow-hidden mr-3 relative">
                      <img src={inputImage} alt="preview" className="w-full h-full object-cover" />
                   </div>
                   <span className="text-sm text-gray-600 mr-2">Image attached</span>
                   <button 
                    onClick={() => setInputImage(null)}
                    className="text-gray-400 hover:text-red-500"
                   >
                     ✕
                   </button>
                </div>
              )}

              <div className={`flex items-end space-x-3 bg-gray-50 p-2 rounded-2xl border transition-all duration-300 ${
                  isRecording 
                  ? 'border-red-400 ring-2 ring-red-100 bg-red-50' 
                  : 'border-gray-200 focus-within:ring-2 focus-within:ring-indigo-100 focus-within:border-indigo-400'
              }`}>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isRecording}
                  className={`p-3 rounded-xl transition-colors ${
                      isRecording ? 'text-gray-300 cursor-not-allowed' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
                  }`}
                  title={t.actions.upload}
                >
                  <Icons.Attach />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                
                <div className="flex-1 relative min-w-0">
                    {isRecording ? (
                         <div className="h-full flex items-center text-red-600 font-medium px-2 py-3">
                             <span className="flex h-3 w-3 relative mr-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                            Listening...
                         </div>
                    ) : (
                        <>
                            <textarea
                              value={inputText}
                              onChange={(e) => setInputText(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  handleSendMessage();
                                }
                              }}
                              maxLength={MAX_CHARS}
                              placeholder={t.placeholder || "Type your message..."}
                              className="w-full bg-transparent border-none focus:ring-0 text-gray-900 placeholder-gray-400 resize-none py-3 max-h-32 pr-2"
                              rows={1}
                              style={{ minHeight: '48px' }}
                            />
                            <div className="absolute bottom-1 right-1 text-[10px] text-gray-400 font-medium bg-gray-50/80 px-1 rounded pointer-events-none">
                                {inputText.length}/{MAX_CHARS}
                            </div>
                        </>
                    )}
                </div>

                <button
                    onClick={() => handleSendMessage(true)}
                    disabled={isLoading || !inputText.trim() || isRecording}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                        isLoading || !inputText.trim() || isRecording
                        ? 'text-gray-300 cursor-not-allowed' 
                        : 'text-indigo-600 hover:bg-indigo-50'
                    }`}
                    title="Focus deeply on this topic"
                >
                    <Icons.Target />
                </button>

                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`p-3 rounded-xl transition-all duration-200 ${isRecording ? 'bg-red-500 text-white animate-pulse shadow-red-200 shadow-lg' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                    title={t.actions.speak}
                >
                    <Icons.Mic />
                </button>

                <button
                  onClick={() => handleSendMessage(false)}
                  disabled={isLoading || (!inputText.trim() && !inputImage) || isRecording}
                  className={`p-3 rounded-xl transition-all duration-200 ${
                    isLoading || (!inputText.trim() && !inputImage) || isRecording
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                  }`}
                  title={t.actions.send}
                >
                  <Icons.Send />
                </button>
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">
                MediGuide can make mistakes. Consider checking important information.
              </p>
            </div>
          </div>
        )}
      </main>
      </div>
    </div>
  );
}
