
import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import ImageView from './components/ImageView';
import LiveView from './components/LiveView';
import VideoView from './components/VideoView';
import SearchView from './components/SearchView';
import { AIAppMode } from './types';

const App: React.FC = () => {
  const [currentMode, setCurrentMode] = useState<AIAppMode>(AIAppMode.CHAT);

  const renderContent = () => {
    switch (currentMode) {
      case AIAppMode.CHAT:
        return <ChatView />;
      case AIAppMode.IMAGE:
        return <ImageView />;
      case AIAppMode.LIVE:
        return <LiveView />;
      case AIAppMode.VIDEO:
        return <VideoView />;
      case AIAppMode.SEARCH:
        return <SearchView />;
      default:
        return <ChatView />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-[#0a0f1d] text-slate-100">
      <Sidebar currentMode={currentMode} onModeChange={setCurrentMode} />
      
      <main className="flex-1 relative flex flex-col min-w-0 h-full">
        {/* Top Header */}
        <header className="h-16 glass flex items-center justify-between px-8 z-20 border-b border-white/5">
          <div className="flex items-center gap-3">
            <h1 className="font-bold text-lg text-white tracking-tight">
              {currentMode === AIAppMode.CHAT && "Intelligent Chat"}
              {currentMode === AIAppMode.IMAGE && "Visual Creation"}
              {currentMode === AIAppMode.SEARCH && "Knowledge Engine"}
              {currentMode === AIAppMode.LIVE && "Voice Experience"}
              {currentMode === AIAppMode.VIDEO && "Cinematic Generation"}
            </h1>
            <div className="h-4 w-[1px] bg-slate-700 mx-2"></div>
            <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
              SOD Level 4 Edition
            </span>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 group cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="text-[10px] font-bold text-slate-500 uppercase leading-none">Creator</p>
                <p className="text-xs font-bold text-white group-hover:text-indigo-400 transition-colors">T. Ishimwe</p>
              </div>
              <div className="relative">
                <div className="absolute -inset-1 bg-indigo-500 rounded-full blur opacity-0 group-hover:opacity-40 transition-opacity"></div>
                <img 
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Thierry" 
                  className="relative w-8 h-8 rounded-full border border-indigo-500 shadow-lg" 
                  alt="Thierry Ishimwe" 
                />
              </div>
            </div>
            
            <button className="text-slate-500 hover:text-white transition-colors">
              <i className="fa-solid fa-gear"></i>
            </button>
          </div>
        </header>

        {/* View Content Area */}
        <div className="flex-1 overflow-hidden relative bg-gradient-to-b from-[#0a0f1d] to-[#0f172a]">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default App;
