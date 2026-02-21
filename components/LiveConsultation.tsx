
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

interface LiveConsultationProps {
  onClose: () => void;
  language: string;
}

// Helper functions
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
  const activeSessionRef = useRef<Promise<any> | null>(null);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const cleanup = useCallback(() => {
    activeSourcesRef.current.forEach(source => {
        try { source.stop(); } catch(e) {}
    });
    activeSourcesRef.current.clear();
    if (processorRef.current) {
        processorRef.current.disconnect();
        processorRef.current.onaudioprocess = null;
    }
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
        streamRef.current = null;
    }
    if (audioContextRef.current) audioContextRef.current.close();
    if (inputContextRef.current) inputContextRef.current.close();
    if (activeSessionRef.current) {
        activeSessionRef.current.then(s => s.close());
    }
  }, []);

  const startSession = useCallback(async () => {
    setStatus('connecting');
    cleanup();

    try {
      // Re-initialize right before use for dynamic key selection
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      audioContextRef.current = outputCtx;
      inputContextRef.current = inputCtx;
      const outputNode = outputCtx.createGain();
      outputNode.connect(outputCtx.destination);

      const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { echoCancellation: true, noiseSuppression: true }, 
          video: true 
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(console.warn);
      }

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setStatus('connected');
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            processorRef.current = scriptProcessor;
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              let sum = 0;
              for(let i=0; i<inputData.length; i++) sum += inputData[i]*inputData[i];
              setVolume(Math.sqrt(sum/inputData.length));
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              const base64Data = encode(new Uint8Array(int16.buffer));
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: { mimeType: 'audio/pcm;rate=16000', data: base64Data } });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);

            setInterval(() => {
               if (canvasRef.current && videoRef.current) {
                  const ctx = canvasRef.current.getContext('2d');
                  canvasRef.current.width = videoRef.current.videoWidth || 320;
                  canvasRef.current.height = videoRef.current.videoHeight || 240;
                  ctx?.drawImage(videoRef.current, 0, 0);
                  const base64Img = canvasRef.current.toDataURL('image/jpeg', 0.4).split(',')[1];
                  sessionPromise.then(session => {
                      session.sendRealtimeInput({ media: { mimeType: 'image/jpeg', data: base64Img } });
                  });
               }
            }, 1000);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.interrupted) {
                activeSourcesRef.current.forEach(s => s.stop());
                activeSourcesRef.current.clear();
                return;
            }
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio) {
               const ctx = audioContextRef.current;
               if (!ctx) return;
               if (nextStartTimeRef.current < ctx.currentTime) nextStartTimeRef.current = ctx.currentTime;
               const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
               const source = ctx.createBufferSource();
               source.buffer = audioBuffer;
               source.connect(outputNode);
               source.start(nextStartTimeRef.current);
               nextStartTimeRef.current += audioBuffer.duration;
               activeSourcesRef.current.add(source);
               source.onended = () => activeSourcesRef.current.delete(source);
            }
          },
          onclose: () => setStatus('disconnected'),
          onerror: (e) => {
              setStatus('error');
              setErrorMessage("API Key rejected or connection failed.");
          }
        },
        config: {
           responseModalities: [Modality.AUDIO],
           systemInstruction: `You are MediGuide in ${language}. Speak immediately when connected.`
        }
      });
      activeSessionRef.current = sessionPromise;
    } catch (err: any) {
      setStatus('error');
      setErrorMessage(err.message || "Init failed.");
      cleanup();
    }
  }, [language, cleanup]);

  useEffect(() => {
    startSession();
    return () => cleanup();
  }, [startSession, cleanup]);

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center text-white">
       <button onClick={onClose} className="absolute top-6 right-6 bg-red-600 p-3 rounded-full"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M6 18L18 6M6 6l12 12" /></svg></button>
       <div className="w-full max-w-2xl px-4 flex flex-col items-center">
          <div className="relative w-full aspect-video bg-gray-900 rounded-2xl overflow-hidden border border-gray-800">
             {status === 'error' ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
                    <h3 className="text-xl font-bold mb-2">Connection Issue</h3>
                    <p className="text-gray-400 mb-4">{errorMessage}</p>
                    <button onClick={startSession} className="bg-indigo-600 px-6 py-2 rounded-lg">Retry</button>
                </div>
             ) : (
                <video ref={videoRef} className="w-full h-full object-cover transform scale-x-[-1]" muted playsInline />
             )}
             <canvas ref={canvasRef} className="hidden" />
          </div>
          <div className="flex items-center justify-center h-24">
             {status === 'connected' && <div className="text-indigo-400 animate-pulse font-bold">LIVE</div>}
          </div>
       </div>
    </div>
  );
};
