
import React from 'react';
import { AIAppMode } from '../types';

interface SidebarProps {
  currentMode: AIAppMode;
  onModeChange: (mode: AIAppMode) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentMode, onModeChange }) => {
  const menuItems = [
    { id: AIAppMode.CHAT, icon: 'fa-comments', label: 'Chat Assistant' },
    { id: AIAppMode.IMAGE, icon: 'fa-wand-magic-sparkles', label: 'Image Creator' },
    { id: AIAppMode.SEARCH, icon: 'fa-magnifying-glass', label: 'Smart Search' },
    { id: AIAppMode.LIVE, icon: 'fa-microphone-lines', label: 'Voice Live' },
    { id: AIAppMode.VIDEO, icon: 'fa-video', label: 'Video Gen' },
  ];

  const DEVELOPER_PHOTO = "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2574&auto=format&fit=crop"; // Note: User image should be base64 or hosted URL. Using representational path.

  return (
    <aside className="w-20 md:w-64 glass h-screen flex flex-col transition-all duration-300 z-10 border-r border-white/5">
      <div className="p-6 flex items-center justify-center md:justify-start gap-3">
        <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-500/20">
          <i className="fa-solid fa-microchip text-xl text-white"></i>
        </div>
        <span className="hidden md:block font-bold text-xl tracking-tight text-white">THIERRY AI</span>
      </div>
      
      <nav className="flex-1 mt-6 px-3 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onModeChange(item.id)}
            className={`w-full flex items-center justify-center md:justify-start gap-4 p-4 rounded-xl transition-all duration-200 group ${
              currentMode === item.id 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 border border-indigo-400/30' 
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
            }`}
          >
            <i className={`fa-solid ${item.icon} text-xl w-6 text-center group-hover:scale-110 transition-transform`}></i>
            <span className="hidden md:block font-medium">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-4 mt-auto">
        <div className="hidden md:flex bg-slate-800/40 rounded-2xl p-4 border border-white/5 flex-col items-center text-center">
          <div className="relative mb-3">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur opacity-25"></div>
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Thierry" 
              alt="Thierry Ishimwe" 
              className="relative w-12 h-12 rounded-full border-2 border-indigo-500 object-cover shadow-xl bg-slate-900"
            />
          </div>
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Lead Developer</p>
          <p className="text-sm font-bold text-white leading-tight">THIERRY ISHIMWE</p>
          <p className="text-[10px] text-indigo-400 font-medium mt-1 uppercase tracking-tighter">LEVEL 4 SOD STUDENT</p>
        </div>
        
        {/* Mobile Avatar */}
        <div className="md:hidden flex justify-center pb-2">
           <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Thierry" className="w-10 h-10 rounded-full border border-indigo-500 shadow-lg" alt="Thierry" />
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
