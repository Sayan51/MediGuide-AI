
export enum AppMode {
  SYMPTOM = 'SYMPTOM',
  SKIN = 'SKIN',
  MEDICINE = 'MEDICINE',
  MENTAL_HEALTH = 'MENTAL_HEALTH'
}

export enum UrgencyLevel {
  LOW = 'LOW', // Self-care / Monitor
  MEDIUM = 'MEDIUM', // Consult Doctor
  HIGH = 'HIGH', // Emergency
  UNKNOWN = 'UNKNOWN'
}

export interface UserProfile {
  id: string; // Unique ID for database
  emailOrPhone: string;
  name: string;
  age: string;
  gender: string;
  medicalHistory: string; 
  language: string;
  isVerified: boolean;
}

export interface ChatState {
  advice: string;
  urgency: UrgencyLevel;
  reasoning: string;
  followUpQuestions: string[];
}

export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
  maps?: {
    uri: string;
    title: string;
    placeId?: string;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text?: string;
  image?: string; // Base64 string
  structuredResponse?: ChatState;
  groundingChunks?: GroundingChunk[];
  timestamp: number;
  isThinking?: boolean;
}

export interface ChatSession {
  id: string;
  userId: string;
  mode: AppMode;
  title: string; // e.g. "Headache relief"
  preview: string; // Short snippet of last message
  timestamp: number; // Last active
  messages: Message[];
}

export interface GeminiResponseSchema {
  advice: string;
  urgency: UrgencyLevel;
  reasoning: string;
  followUpQuestions: string[];
}

export interface SymptomLogEntry {
  id: string;
  timestamp: number;
  symptom: string;
  severity: number; // 1-10
  duration?: string;
  frequency?: string;
  notes?: string;
}

export interface MedicationReminder {
  id: string;
  medicationName: string;
  totalQuantity: number;
  dosagePerDay: number;
  startDate: number;
  refillDate: number; // Calculated timestamp
  notes?: string;
}

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'Hindi (हिन्दी)' },
  { code: 'bn', name: 'Bengali (বাংলা)' },
  { code: 'ta', name: 'Tamil (தமிழ்)' },
  { code: 'te', name: 'Telugu (తెలుగు)' },
  { code: 'gu', name: 'Gujarati (ગુજરાતી)' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'zh', name: 'Chinese (中文)' },
];
