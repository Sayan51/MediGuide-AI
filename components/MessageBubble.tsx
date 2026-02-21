
import React, { useState, useEffect } from 'react';
import { Message } from '../types';
import { UrgencyBadge } from './UrgencyBadge';
import { generateSpeech } from '../services/geminiService';
import { TRANSLATIONS } from '../translations';

interface MessageBubbleProps {
  message: Message;
  isLast: boolean;
  language?: string;
  autoPlay?: boolean;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, isLast, language = 'en', autoPlay = false }) => {
  const t = TRANSLATIONS[language] || TRANSLATIONS['en'];
  const isUser = message.role === 'user';
  const [isPlaying, setIsPlaying] = useState(false);
  const [showSources, setShowSources] = useState(false);

  // Auto-play TTS if requested (e.g. voice interaction)
  useEffect(() => {
    if (autoPlay && !isUser && message.structuredResponse && !isPlaying) {
        handlePlayTTS();
    }
  }, [autoPlay, message]);

  // Enhanced Markdown Formatter
  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    return lines.map((line, i) => {
        // Headers (### )
        if (line.trim().startsWith('###')) {
            return <h3 key={i} className="text-md font-bold text-indigo-900 mt-4 mb-2">{line.replace(/^###\s*/, '')}</h3>;
        }
        // Bold Headers ( **Header**: )
        if (line.trim().startsWith('**') && line.includes('**:')) {
             const parts = line.split('**:');
             return (
                <div key={i} className="mb-2">
                    <strong className="text-indigo-900 font-bold">{parts[0].replace(/\*\*/g, '')}:</strong>
                    <span>{formatBold(parts.slice(1).join('**:'))}</span>
                </div>
             );
        }
        // Bullet Points
        if (line.trim().startsWith('- ') || line.trim().startsWith('* ')) {
            return (
                <div key={i} className="flex items-start ml-2 mb-1">
                    <span className="mr-2 text-indigo-500 mt-1.5 text-[8px]">●</span>
                    <span className="flex-1">{formatBold(line.replace(/^[-*]\s*/, ''))}</span>
                </div>
            );
        }
        // Empty Line
        if (line.trim() === '') {
            return <div key={i} className="h-2"></div>;
        }
        // Standard Paragraph
        return <p key={i} className="mb-1 leading-relaxed">{formatBold(line)}</p>;
    });
  };

  const formatBold = (text: string) => {
    return text.split(/(\*\*.*?\*\*)/g).map((part, index) => 
      part.startsWith('**') && part.endsWith('**') ? (
        <strong key={index} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>
      ) : (
        <span key={index}>{part}</span>
      )
    );
  };

  // Helper to decode raw PCM data (16-bit, 24kHz, Mono) from Gemini TTS
  const decodePCM = (base64: string, ctx: AudioContext): AudioBuffer => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    // Ensure we have an even number of bytes for Int16Array
    const int16Count = Math.floor(len / 2);
    const dataInt16 = new Int16Array(bytes.buffer, 0, int16Count);
    
    // Gemini TTS is typically 24000Hz, 1 Channel
    const buffer = ctx.createBuffer(1, int16Count, 24000);
    const channelData = buffer.getChannelData(0);
    
    for (let i = 0; i < int16Count; i++) {
      // Convert Int16 (-32768 to 32767) to Float32 (-1.0 to 1.0)
      channelData[i] = dataInt16[i] / 32768.0;
    }
    
    return buffer;
  };

  const handlePlayTTS = async () => {
    if (isPlaying) return;
    const textToRead = message.structuredResponse ? message.structuredResponse.advice : message.text;
    if (!textToRead) return;

    setIsPlaying(true);
    try {
      const audioData = await generateSpeech(textToRead);
      if (audioData) {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          
          // Use manual PCM decoding
          const audioBuffer = decodePCM(audioData, audioCtx);
          
          const source = audioCtx.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioCtx.destination);
          source.start(0);
          source.onended = () => setIsPlaying(false);
      } else {
          setIsPlaying(false);
      }
    } catch (e) {
      console.error("Audio playback failed", e);
      setIsPlaying(false);
    }
  };

  if (isUser) {
    return (
      <div className="flex justify-end mb-6">
        <div className="bg-indigo-600 text-white rounded-2xl rounded-tr-none px-5 py-4 max-w-[85%] shadow-md">
           {message.image && (
            <div className="mb-3 rounded-lg overflow-hidden border-2 border-indigo-400">
              <img src={message.image} alt="User upload" className="max-w-full h-auto max-h-64 object-cover" />
            </div>
          )}
          <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
        </div>
      </div>
    );
  }

  // Model response
  return (
    <div className="flex justify-start mb-8 w-full">
      <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-6 py-6 w-full max-w-3xl shadow-sm ring-1 ring-gray-900/5">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
            </div>
            <span className="font-semibold text-gray-900">{t.assistant_name || "MediGuide Assistant"}</span>
          </div>
          <button 
            onClick={handlePlayTTS}
            disabled={isPlaying}
            className={`p-2 rounded-full hover:bg-gray-100 transition-colors ${isPlaying ? 'text-indigo-600 animate-pulse' : 'text-gray-400'}`}
            title="Read Aloud"
          >
             <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
             </svg>
          </button>
        </div>

        {message.structuredResponse ? (
          <div className="space-y-5">
            {/* Urgency Badge */}
            <div className="mb-2">
              <UrgencyBadge level={message.structuredResponse.urgency} language={language} />
            </div>

            {/* Main Advice - Using New Render Markdown */}
            <div className="text-gray-700 text-sm">
               {renderMarkdown(message.structuredResponse.advice)}
            </div>
            
            {/* Reasoning - subtle */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm text-gray-500 italic">
               <span className="font-semibold not-italic text-gray-600">{t.ai_reasoning || "AI Reasoning"}: </span>
               {message.structuredResponse.reasoning}
            </div>

            {/* Follow up questions */}
            {message.structuredResponse.followUpQuestions.length > 0 && (
              <div className="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                <h4 className="text-sm font-bold text-indigo-900 uppercase tracking-wider mb-3">Questions to Consider</h4>
                <ul className="space-y-2">
                  {message.structuredResponse.followUpQuestions.map((q, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="inline-block w-5 h-5 bg-indigo-200 text-indigo-700 rounded-full text-xs flex items-center justify-center mr-2 mt-0.5 flex-shrink-0">{idx + 1}</span>
                      <span className="text-gray-700 text-sm font-medium">{q}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Grounding Sources - Collapsible Cards */}
            {message.groundingChunks && message.groundingChunks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                    {!showSources ? (
                       <button 
                         onClick={() => setShowSources(true)}
                         className="flex items-center space-x-3 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-lg transition-all duration-200 w-full group border border-gray-200"
                       >
                         <div className="flex -space-x-1.5">
                            {message.groundingChunks.slice(0, 3).map((_, i) => (
                               <div key={i} className="h-6 w-6 rounded-full ring-2 ring-white bg-white flex items-center justify-center shadow-sm text-xs">
                                  {message.groundingChunks?.[i]?.maps ? '📍' : '🔗'}
                               </div>
                            ))}
                            {message.groundingChunks.length > 3 && (
                                <div className="h-6 w-6 rounded-full ring-2 ring-white bg-indigo-50 flex items-center justify-center text-[9px] font-bold text-indigo-600 shadow-sm">
                                    +{message.groundingChunks.length - 3}
                                </div>
                            )}
                         </div>
                         <div className="flex flex-col items-start">
                             <span className="text-xs font-semibold text-gray-700 group-hover:text-indigo-700">View Verified Sources</span>
                             <span className="text-[10px] text-gray-400">{message.groundingChunks.length} citations found</span>
                         </div>
                         <svg className="w-4 h-4 ml-auto text-gray-400 group-hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                       </button>
                    ) : (
                       <div className="bg-gray-50 rounded-lg p-3 border border-gray-100 animate-in fade-in slide-in-from-top-1 duration-200">
                         <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-200">
                            <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center">
                                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                Sources
                            </h5>
                            <button onClick={() => setShowSources(false)} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors">
                               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" /></svg>
                            </button>
                         </div>
                         <ul className="space-y-2">
                            {message.groundingChunks.map((chunk, i) => {
                                if (chunk.web) {
                                    return (
                                        <li key={i} className="text-sm bg-white p-2.5 rounded border border-gray-200 hover:border-indigo-300 transition-colors shadow-sm">
                                            <a href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="flex flex-col group">
                                                <span className="font-semibold text-indigo-700 group-hover:underline truncate">{chunk.web.title}</span>
                                                <span className="text-[10px] text-gray-400 truncate mt-0.5">{chunk.web.uri}</span>
                                            </a>
                                        </li>
                                    );
                                } else if (chunk.maps) {
                                    return (
                                        <li key={i} className="bg-white rounded border border-gray-200 hover:border-red-300 transition-colors shadow-sm overflow-hidden">
                                            <a href={chunk.maps.uri} target="_blank" rel="noopener noreferrer" className="block p-2.5 group hover:bg-red-50/30 transition-colors">
                                                <div className="flex items-start">
                                                    <div className="bg-red-100 text-red-600 p-1.5 rounded-lg mr-3">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                                    </div>
                                                    <div className="flex-1">
                                                        <span className="font-bold text-gray-900 group-hover:text-red-700 block">{chunk.maps.title}</span>
                                                        <span className="text-xs text-gray-500 block mt-1">View on Google Maps</span>
                                                    </div>
                                                    <div className="text-gray-300 group-hover:text-red-400">
                                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                    </div>
                                                </div>
                                            </a>
                                        </li>
                                    );
                                }
                                return null;
                            })}
                         </ul>
                       </div>
                    )}
                </div>
            )}

            <div className="text-xs text-gray-400 mt-4 border-t pt-2">
              {t.footer_disclaimer || "Remember: This is an AI assessment, not a doctor's diagnosis."}
            </div>
          </div>
        ) : (
          /* Fallback or simple text state */
           <div className="space-y-4">
               <div className="text-gray-700">{renderMarkdown(message.text || "")}</div>
           </div>
        )}
      </div>
    </div>
  );
};
