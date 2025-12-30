
import React, { useState, useRef, useEffect } from 'react';
import { GeminiService } from '../services/geminiService';
import { Message } from '../types';

const ChatView: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: 'welcome-card', 
      role: 'assistant', 
      content: "Hello! I am **THIERRY AI**, a next-generation intelligence platform. I am proud to share that I was developed by **THIERRY ISHIMWE**, an ambitious student currently studying in **LEVEL 4 SOD** (Software Development). How can I help you today?", 
      timestamp: Date.now(), 
      type: 'text' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      const stream = await GeminiService.generateChatResponse(input);
      let assistantContent = '';
      const assistantId = (Date.now() + 1).toString();

      setMessages(prev => [...prev, {
        id: assistantId,
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        type: 'text'
      }]);

      for await (const chunk of stream) {
        assistantContent += chunk.text || '';
        setMessages(prev => prev.map(msg => 
          msg.id === assistantId ? { ...msg, content: assistantContent } : msg
        ));
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I encountered an error. Please try again.',
        timestamp: Date.now(),
        type: 'text'
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto w-full p-4">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto custom-scrollbar space-y-6 pb-4 pt-4"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.id === 'welcome-card' ? (
              <div className="glass rounded-3xl overflow-hidden border border-indigo-500/20 shadow-2xl max-w-lg">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex items-center gap-6">
                  <div className="relative shrink-0">
                    <div className="absolute -inset-2 bg-white/20 rounded-full blur-sm"></div>
                    {/* Placeholder for the user's uploaded photo - using representational placeholder */}
                    <div className="relative w-24 h-24 rounded-full border-4 border-white/30 overflow-hidden shadow-2xl bg-slate-900">
                       <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Thierry" className="w-full h-full object-cover" alt="Thierry Ishimwe" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-white font-black text-xl tracking-tight leading-tight">THIERRY ISHIMWE</h3>
                    <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-1 opacity-80">LEVEL 4 SOD STUDENT</p>
                    <div className="mt-2 flex gap-1">
                      <span className="bg-white/20 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">DEVELOPER</span>
                      <span className="bg-white/20 text-white text-[9px] px-2 py-0.5 rounded-full font-bold">LEVEL 4</span>
                    </div>
                  </div>
                </div>
                <div className="p-6 text-slate-300 text-sm leading-relaxed">
                  {msg.content}
                </div>
              </div>
            ) : (
              <div className={`max-w-[85%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/10' 
                  : 'glass text-slate-200 border border-white/5'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                   <i className={`fa-solid ${msg.role === 'user' ? 'fa-user' : 'fa-robot'} opacity-50 text-[10px]`}></i>
                   <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">
                     {msg.role === 'user' ? 'YOU' : 'THIERRY AI'}
                   </span>
                </div>
                <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                  {msg.content}
                </div>
              </div>
            )}
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="glass rounded-2xl p-4 flex gap-2 border border-white/5">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-75"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-150"></div>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 glass rounded-2xl p-2 flex gap-2 border border-white/10 shadow-2xl relative z-10">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
          placeholder="Message THIERRY AI..."
          className="flex-1 bg-transparent border-none focus:ring-0 p-3 resize-none text-slate-200 placeholder-slate-500 h-[52px]"
        />
        <button
          onClick={handleSend}
          disabled={isTyping || !input.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 p-3 px-6 rounded-xl transition-all self-end shadow-lg shadow-indigo-500/20 active:scale-95"
        >
          <i className="fa-solid fa-paper-plane"></i>
        </button>
      </div>
    </div>
  );
};

export default ChatView;
