
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface LiveConsultationProps {
  onClose: () => void;
  language: string;
}

// Helper functions for Audio
function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const LiveConsultation: React.FC<LiveConsultationProps> = ({ onClose, language }) => {
  const [status, setStatus] = useState<'connecting' | 'connected' | 'error' | 'disconnected'>('connecting');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [volume, setVolume] = useState(0);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const videoIntervalRef = useRef<number | null>(null);
  const activeSessionRef = useRef<Promise<any> | null>(null);
  
  // Track active audio sources to support interruption
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const cleanup = useCallback(() => {
    // Stop all active audio playback immediately
    activeSourcesRef.current.forEach(source => {
        try { source.stop(); } catch(e) { /* ignore already stopped */ }
    });
    activeSourcesRef.current.clear();

    // Stop Audio Processing
    if (processorRef.current && inputContextRef.current) {
        processorRef.current.disconnect();
        processorRef.current.onaudioprocess = null;
    }
    if (sourceRef.current) {
        sourceRef.current.disconnect();
    }
    
    // Stop Video Processing
    if (videoIntervalRef.current) {
        clearInterval(videoIntervalRef.current);
        videoIntervalRef.current = null;
    }

    // Stop Media Stream
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }

    // Close Audio Contexts
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
    }
    if (inputContextRef.current && inputContextRef.current.state !== 'closed') {
        inputContextRef.current.close();
    }

    // Close Session
    if (activeSessionRef.current) {
        activeSessionRef.current.then(s => {
            try { s.close(); } catch(e) { /* ignore */ }
        });
        activeSessionRef.current = null;
    }
  }, []);

  const startSession = useCallback(async () => {
    setStatus('connecting');
    setErrorMessage('');
    cleanup(); // Ensure fresh start

    try {
      if (!process.env.API_KEY) {
          throw new Error("API Key missing");
      }
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Setup Audio Contexts
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = outputCtx;
      inputContextRef.current = inputCtx;
      
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);

      // Get User Media with Echo Cancellation
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            audio: {
                echoCancellation: true,
                noiseSuppression: true,
                autoGainControl: true
            }, 
            video: true 
        });
      } catch (e: any) {
        if (e.name === 'NotAllowedError') {
            throw new Error("Microphone/Camera permission denied. Please allow access.");
        } else if (e.name === 'NotFoundError') {
            throw new Error("No camera or microphone found.");
        }
        throw e;
      }
      
      streamRef.current = stream;
      
      // Video Preview
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.warn);
      }

      // Live API Connection
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('connected');
            
            // 1. Setup Audio Input
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            sourceRef.current = source;
            processorRef.current = scriptProcessor;

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Volume calc
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i]*inputData[i];
              setVolume(Math.sqrt(sum/inputData.length));

              // PCM conversion for API
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                  int16[i] = inputData[i] * 32768;
              }
              const base64Data = encode(new Uint8Array(int16.buffer));

              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: {
                    mimeType: 'audio/pcm;rate=16000',
                    data: base64Data
                  }
                });
              });
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);

            // 2. Setup Video Frame Loop
            videoIntervalRef.current = window.setInterval(() => {
               if (canvasRef.current && videoRef.current) {
                  const ctx = canvasRef.current.getContext('2d');
                  canvasRef.current.width = videoRef.current.videoWidth || 640;
                  canvasRef.current.height = videoRef.current.videoHeight || 480;
                  ctx?.drawImage(videoRef.current, 0, 0);
                  
                  // Use lower quality for faster transmission
                  const base64Img = canvasRef.current.toDataURL('image/jpeg', 0.5).split(',')[1];
                  sessionPromise.then(session => {
                      session.sendRealtimeInput({
                          media: { mimeType: 'image/jpeg', data: base64Img }
                      });
                  });
               }
            }, 1000); // 1 FPS
          },
          onmessage: async (msg: LiveServerMessage) => {
            const ctx = audioContextRef.current;
            if (!ctx) return;

            // Handle Server Interruption (Barge-In)
            // If the model detects the user speaking, it sends an 'interrupted' flag.
            if (msg.serverContent?.interrupted) {
                console.log("Interruption detected: Stopping AI audio.");
                activeSourcesRef.current.forEach(source => {
                    try { source.stop(); } catch(e) {}
                });
                activeSourcesRef.current.clear();
                nextStartTimeRef.current = ctx.currentTime; // Reset timing cursor
                return;
            }

            const base64Audio = msg.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
               // Ensure playback timing is smooth
               if (nextStartTimeRef.current < ctx.currentTime) {
                   nextStartTimeRef.current = ctx.currentTime;
               }
               
               try {
                   const audioBuffer = await decodeAudioData(
                     decode(base64Audio),
                     ctx,
                     24000,
                     1
                   );
                   
                   const source = ctx.createBufferSource();
                   source.buffer = audioBuffer;
                   source.connect(outputNode);
                   
                   source.start(nextStartTimeRef.current);
                   nextStartTimeRef.current += audioBuffer.duration;

                   // Track active source for interruption
                   activeSourcesRef.current.add(source);
                   source.onended = () => {
                       activeSourcesRef.current.delete(source);
                   };

               } catch (e) {
                   console.warn("Audio decode failed", e);
               }
            }
          },
          onclose: () => {
             // Only set disconnected if we haven't already explicitly cleaned up or errored
             setStatus(prev => prev === 'error' ? 'error' : 'disconnected');
          },
          onerror: (e) => {
              console.error("Live API Error", e);
              setStatus('error');
              setErrorMessage("Connection interrupted.");
          }
        },
        config: {
           responseModalities: [Modality.AUDIO],
           systemInstruction: `
             You are MediGuide, a warm and helpful home health assistant speaking in ${language}. 
             
             INSTRUCTION:
             1. As soon as you are connected, say "Hello, I am MediGuide. How can I help you today?"
             2. Do NOT wait for the user to speak first. Speak immediately.
             3. Be concise. Avoid repeating yourself.
             
             BEHAVIOR:
             - Goal: Provide practical home remedies and self-care advice.
             - Medication: You ARE allowed to suggest Over-The-Counter (OTC) medicines (like Ibuprofen, Antihistamines) if appropriate.
             - Tone: Caring, confident, and conversational.
             - Disclaimers: Mention "I am not a doctor" only once briefly. Focus on actionable help.
           `
        }
      });
      
      activeSessionRef.current = sessionPromise;

    } catch (err: any) {
      console.error("Live Init Error", err);
      setStatus('error');
      setErrorMessage(err.message || "Failed to initialize connection.");
      cleanup();
    }
  }, [language, cleanup]);

  useEffect(() => {
    startSession();
    return () => cleanup();
  }, [startSession, cleanup]);

  const handleRetry = () => {
      startSession();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center text-white">
       <div className="absolute top-6 right-6 z-10">
         <button onClick={onClose} className="bg-red-600 hover:bg-red-700 p-3 rounded-full transition-colors shadow-lg">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
         </button>
       </div>

       <div className="w-full max-w-2xl px-4 flex flex-col items-center">
          <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden shadow-2xl mb-8 border border-gray-800">
             {status === 'error' || status === 'disconnected' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10 p-6 text-center">
                    <div className="w-16 h-16 bg-red-900/50 text-red-500 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Connection Issue</h3>
                    <p className="text-gray-400 mb-6">{errorMessage || "The session ended unexpectedly."}</p>
                    <button 
                        onClick={handleRetry}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Retry Connection
                    </button>
                </div>
             ) : (
                 <>
                    <video ref={videoRef} className="w-full h-full object-cover transform scale-x-[-1]" muted playsInline />
                    <canvas ref={canvasRef} className="hidden" />
                    
                    <div className="absolute bottom-4 left-4 flex items-center space-x-2 bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-white/10">
                        <div className={`w-3 h-3 rounded-full ${status === 'connected' ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></div>
                        <span className="text-sm font-medium">
                            {status === 'connected' ? 'Live with MediGuide' : 'Connecting...'}
                        </span>
                    </div>
                 </>
             )}
          </div>

          <div className="flex items-center justify-center w-full h-24">
             {status === 'connected' ? (
                <div className="flex items-end space-x-1 h-12">
                   {[...Array(5)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-3 bg-indigo-500 rounded-full transition-all duration-75"
                        style={{ 
                            height: `${Math.max(10, volume * 300 * (Math.random() + 0.5))}%`,
                            opacity: 0.7 + (Math.random() * 0.3)
                        }}
                      ></div>
                   ))}
                </div>
             ) : (
                <p className="text-gray-500 text-sm">
                    {status === 'connecting' ? 'Establishing secure connection...' : 'Session ended'}
                </p>
             )}
          </div>
          
          <p className="text-center text-gray-500 mt-4 text-xs max-w-md">
            MediGuide sees and hears you to provide assistance. Audio & video are processed in real-time by Google AI.
          </p>
       </div>
    </div>
  );
};
