
import React from 'react';
import { FileText, Hash, Mic } from 'lucide-react';
import { BouncyCard } from '../UI/BouncyComponents';
import { ToolMode, Theme } from '../../types';
import { useApp } from '../../context/AppContext';

interface Props {
  onSelectTool: (mode: ToolMode) => void;
}

export const HomeView: React.FC<Props> = ({ onSelectTool }) => {
  const { settings, user } = useApp();
  
  let cardClass = 'bg-white dark:bg-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none';
  let iconBgClass = 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400';
  let hoverRingClass = 'hover:ring-indigo-500/20';
  let decorationBgClass = 'bg-indigo-500/10';

  // Theme-specific overrides
  if (settings.theme === Theme.GLASS) {
    cardClass = 'bg-glass backdrop-blur-md border border-glass-border';
    iconBgClass = 'bg-white/10 text-white';
    hoverRingClass = 'hover:ring-white/20';
    decorationBgClass = 'bg-white/5';
  } else if (settings.theme === Theme.ONE_UI_DARK) {
    cardClass = 'bg-[#1a1a1a] border border-[#333] text-[#e0e0e0] shadow-lg';
    iconBgClass = 'bg-[#2c2c2c] text-[#7c4dff]'; // Purple accent for One UI
    hoverRingClass = 'hover:ring-[#7c4dff]/20';
    decorationBgClass = 'bg-[#7c4dff]/10';
  } else if (settings.theme === Theme.LIGHT) {
    // Sky Blue for Light Theme
    iconBgClass = 'bg-sky-100 text-sky-600';
    hoverRingClass = 'hover:ring-sky-500/20';
    decorationBgClass = 'bg-sky-500/10';
  } else if (settings.theme === Theme.RETRO_3D) {
    cardClass = ''; // Handled by BouncyCard
    iconBgClass = 'bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]';
    hoverRingClass = ''; 
    decorationBgClass = 'hidden'; 
  }

  // Text Gradient
  let greetingGradient = 'from-indigo-500 to-pink-500';
  if (settings.theme === Theme.LIGHT) greetingGradient = 'from-sky-500 to-blue-600';
  if (settings.theme === Theme.ONE_UI_DARK) greetingGradient = 'from-[#7c4dff] to-[#b388ff]';
  if (settings.theme === Theme.RETRO_3D) greetingGradient = 'from-black to-black';
  if (settings.experimentalFeatures && settings.enableNeon) greetingGradient = 'from-pink-500 via-purple-500 to-cyan-500 animate-pulse';

  // Avatar Border color
  let avatarBorderClass = 'border-white dark:border-slate-700';
  if (settings.theme === Theme.GLASS) avatarBorderClass = 'border-white/20';
  if (settings.theme === Theme.ONE_UI_DARK) avatarBorderClass = 'border-[#333]';
  if (settings.theme === Theme.LIGHT) avatarBorderClass = 'border-white shadow-sm';
  if (settings.theme === Theme.RETRO_3D) avatarBorderClass = 'border-black border-2 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]';
  if (settings.experimentalFeatures && settings.enableNeon) avatarBorderClass = 'border-transparent animate-neon-flow';

  // Universal 3D Override cleanup
  if (settings.experimentalFeatures && settings.enable3DMode && settings.theme !== Theme.RETRO_3D) {
     decorationBgClass = 'hidden'; // Clean look for 3D
  }

  return (
    <div className="w-full h-full flex flex-col items-center pt-12 px-6 animate-in fade-in duration-500">
      <div className="w-full max-w-4xl">
        <div className="mb-10 flex justify-between items-start">
          <div>
            <h1 className={`text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r ${greetingGradient} ${settings.theme === Theme.RETRO_3D ? '!text-current !bg-none' : ''} ${settings.theme === Theme.RETRO_3D ? 'drop-shadow-[2px_2px_0px_rgba(255,255,255,1)]' : ''}`}>
              Hello, {user.name.split(' ')[0]}
            </h1>
            <p className={`text-lg opacity-60 ${settings.theme === Theme.RETRO_3D ? 'text-black opacity-100 font-medium' : ''}`}>What are we creating today?</p>
          </div>
          
          {/* Profile Picture in Home */}
          <div className="relative group cursor-pointer transition-transform hover:scale-105 duration-200">
            <img 
              src={user.avatarUrl} 
              alt="Profile" 
              className={`w-14 h-14 rounded-full object-cover border-2 ${avatarBorderClass} shadow-lg`}
            />
            <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Synopsis Generator */}
          <BouncyCard 
            onClick={() => onSelectTool(ToolMode.SYNOPSIS)}
            className={`${cardClass} group hover:ring-4 ${hoverRingClass} cursor-pointer relative overflow-hidden transition-all hover:-translate-y-1 ${settings.theme === Theme.RETRO_3D ? '!bg-blue-200 !rounded-lg' : ''}`}
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${decorationBgClass} rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500`}></div>
            <div className={`w-14 h-14 rounded-2xl ${iconBgClass} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300 ${settings.theme === Theme.RETRO_3D ? '!rounded-lg' : ''}`}>
              <FileText size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2">Synopsis Generator</h3>
            <p className="opacity-60 text-sm">Turn your scripts into engaging summaries with tailored modes like Suspense or Descriptive.</p>
          </BouncyCard>

          {/* Hashtag Optimizer */}
          <BouncyCard 
            onClick={() => onSelectTool(ToolMode.HASHTAGS)}
            className={`${cardClass} group hover:ring-4 ${settings.theme === Theme.LIGHT ? 'hover:ring-pink-500/20' : hoverRingClass} cursor-pointer relative overflow-hidden transition-all hover:-translate-y-1 ${settings.theme === Theme.RETRO_3D ? '!bg-pink-200 !rounded-lg' : ''}`}
          >
             <div className={`absolute top-0 right-0 w-32 h-32 ${settings.theme === Theme.LIGHT ? 'bg-pink-500/10' : decorationBgClass} rounded-full -mr-10 -mt-10 transition-transform group-hover:scale-150 duration-500`}></div>
            <div className={`w-14 h-14 rounded-2xl ${settings.theme === Theme.LIGHT ? 'bg-pink-100 text-pink-600' : iconBgClass} flex items-center justify-center mb-6 transition-transform group-hover:scale-110 duration-300 ${settings.theme === Theme.RETRO_3D ? '!rounded-lg' : ''}`}>
              <Hash size={28} />
            </div>
            <h3 className="text-xl font-bold mb-2">Hashtag Optimizer</h3>
            <p className="opacity-60 text-sm">Boost visibility with AI-driven SEO tags based on real-time search trends.</p>
          </BouncyCard>

           {/* Placeholder for future tool */}
           <BouncyCard 
            className={`${cardClass} opacity-50 cursor-not-allowed relative overflow-hidden grayscale hover:grayscale-0 transition-all ${settings.theme === Theme.RETRO_3D ? '!bg-gray-200 !rounded-lg !opacity-100 !grayscale-0' : ''}`}
          >
            <div className={`w-14 h-14 rounded-2xl ${settings.theme === Theme.LIGHT ? 'bg-emerald-100 text-emerald-600' : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400'} flex items-center justify-center mb-6 ${settings.theme === Theme.RETRO_3D ? 'bg-white border-2 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] !rounded-lg' : ''}`}>
              <Mic size={28} />
            </div>
            <div className={`absolute top-4 right-4 px-2 py-1 bg-slate-200 dark:bg-slate-700 rounded-md text-xs font-bold ${settings.theme === Theme.RETRO_3D ? '!bg-black !text-white !rounded-sm' : ''}`}>
              SOON
            </div>
            <h3 className="text-xl font-bold mb-2">Script to Audio</h3>
            <p className="opacity-60 text-sm">Generate realistic voiceovers from your text instantly.</p>
          </BouncyCard>

        </div>
      </div>
    </div>
  );
};
