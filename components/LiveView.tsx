
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { decodeBase64, encodeBase64, decodeAudioData } from '../services/geminiService';

const LiveView: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [transcript, setTranscript] = useState<{ role: string, text: string }[]>([]);
  const [status, setStatus] = useState('Standby');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const startLiveSession = async () => {
    try {
      setStatus('Initializing...');
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = audioCtx;
      
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setStatus('Live');
            setIsActive(true);
            
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encodeBase64(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const bytes = decodeBase64(audioData);
              const buffer = await decodeAudioData(bytes, audioCtx, 24000, 1);
              
              const source = audioCtx.createBufferSource();
              source.buffer = buffer;
              source.connect(audioCtx.destination);
              
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, audioCtx.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            if (message.serverContent?.outputTranscription) {
              const text = message.serverContent.outputTranscription.text;
              setTranscript(prev => [...prev, { role: 'Gemini', text }]);
            }
          },
          onerror: (e) => {
            console.error('Live Error:', e);
            setStatus('Error occurred');
          },
          onclose: () => {
            setIsActive(false);
            setStatus('Closed');
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          systemInstruction: "You are a friendly live assistant. Speak naturally and helpfuly."
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setStatus('Failed to connect');
    }
  };

  const stopLiveSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    setIsActive(false);
    setStatus('Standby');
  };

  return (
    <div className="h-full p-6 flex flex-col max-w-4xl mx-auto w-full">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold mb-2">Real-time Voice</h2>
        <div className="flex items-center justify-center gap-2">
          <span className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-500 animate-pulse' : 'bg-slate-600'}`}></span>
          <span className="text-slate-400 font-medium">{status}</span>
        </div>
      </div>

      <div className="flex-1 glass rounded-3xl p-8 mb-8 flex flex-col items-center justify-center relative overflow-hidden">
        {isActive ? (
          <div className="relative z-10 text-center">
            <div className="w-32 h-32 bg-indigo-600 rounded-full flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(79,70,229,0.5)] animate-pulse">
              <i className="fa-solid fa-microphone text-5xl"></i>
            </div>
            <p className="text-xl font-medium text-slate-200">Gemini is listening...</p>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-32 h-32 bg-slate-800 rounded-full flex items-center justify-center mb-8 border border-slate-700">
              <i className="fa-solid fa-microphone-slash text-5xl text-slate-600"></i>
            </div>
            <button
              onClick={startLiveSession}
              className="bg-indigo-600 hover:bg-indigo-500 px-10 py-4 rounded-2xl font-bold transition-all shadow-xl hover:scale-105 active:scale-95"
            >
              Start Conversation
            </button>
          </div>
        )}
        
        {/* Abstract Background Animation */}
        {isActive && (
          <div className="absolute inset-0 opacity-20 flex items-center justify-center pointer-events-none">
            <div className="w-[500px] h-[500px] bg-indigo-500/30 rounded-full blur-[100px] animate-pulse"></div>
            <div className="w-[300px] h-[300px] bg-purple-500/30 rounded-full blur-[80px] animate-pulse delay-700"></div>
          </div>
        )}
      </div>

      <div className="h-48 glass rounded-2xl p-4 overflow-y-auto custom-scrollbar">
        <p className="text-xs font-bold text-slate-500 uppercase mb-3 tracking-widest">Transcription Feed</p>
        <div className="space-y-2">
          {transcript.map((t, i) => (
            <div key={i} className="text-sm">
              <span className="font-bold text-indigo-400">{t.role}: </span>
              <span className="text-slate-300">{t.text}</span>
            </div>
          ))}
          {transcript.length === 0 && <p className="text-slate-600 italic">No audio processed yet...</p>}
        </div>
      </div>

      {isActive && (
        <button
          onClick={stopLiveSession}
          className="mt-6 bg-red-500/20 text-red-400 border border-red-500/30 px-6 py-3 rounded-xl hover:bg-red-500 hover:text-white transition-all font-bold mx-auto flex items-center gap-2"
        >
          <i className="fa-solid fa-phone-slash"></i>
          End Call
        </button>
      )}
    </div>
  );
};

export default LiveView;
