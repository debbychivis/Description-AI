
import React from 'react';
import { Home, Mic2, User } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AppView, Theme } from '../../types';

export const BottomNav: React.FC = () => {
  const { currentView, setCurrentView, settings } = useApp();

  let navClass = settings.theme === 'GLASS' 
    ? 'bg-glass backdrop-blur-xl border-t border-glass-border' 
    : settings.theme === Theme.ONE_UI_DARK
      ? 'bg-[#000000] border-t border-[#333]' // Pure black for One UI
      : 'bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800';
  
  if (settings.theme === Theme.RETRO_3D) {
      navClass = 'bg-white border-t-4 border-black';
  } else if (settings.experimentalFeatures && settings.enable3DMode) {
      // Universal 3D Nav - just adds a hard border
      navClass += " border-t-4 border-b-0";
  } else if (settings.experimentalFeatures && settings.enableNeon) {
      // NEON Nav - pulsating border
      navClass += " border-t-2 border-transparent animate-neon-flow bg-black";
  }

  const NavItem = ({ view, icon: Icon, label }: { view: AppView, icon: React.ElementType, label: string }) => {
    const isActive = currentView === view;
    
    // Stronger bounce effect for nav items
    const bounceClass = settings.bouncingAnimation 
      ? 'active:scale-75 duration-100' 
      : 'duration-300';

    let activeColorClass = 'text-indigo-600 dark:text-indigo-400';
    let indicatorClass = 'bg-indigo-500';

    // Theme Specific Active Colors
    if (settings.theme === Theme.ONE_UI_DARK) {
        activeColorClass = 'text-[#7c4dff]'; // One UI Purple
        indicatorClass = 'bg-[#7c4dff]';
    } else if (settings.theme === Theme.LIGHT) {
        // Sky Blue for Light
        activeColorClass = 'text-sky-600';
        indicatorClass = 'bg-sky-500';
    } else if (settings.theme === Theme.RETRO_3D) {
        activeColorClass = 'text-black translate-y-[-4px]';
        indicatorClass = 'bg-black h-1.5 w-full rounded-none bottom-0';
    } else if (settings.experimentalFeatures && settings.enableNeon) {
        activeColorClass = 'text-white drop-shadow-[0_0_5px_rgba(255,255,255,0.8)]';
        indicatorClass = 'bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]';
    }

    return (
      <button
        onClick={() => setCurrentView(view)}
        className={`flex flex-col items-center justify-center w-full h-full transition-all relative outline-none ${bounceClass}
          ${isActive 
            ? activeColorClass
            : 'text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300'}
          ${settings.theme === Theme.RETRO_3D && !isActive ? 'text-gray-400' : ''}
        `}
      >
        <div className={`transition-transform duration-300 ${isActive && settings.theme !== Theme.RETRO_3D ? '-translate-y-1' : ''} ${settings.theme === Theme.RETRO_3D ? 'p-2 border-2 border-transparent' : ''} ${isActive && settings.theme === Theme.RETRO_3D ? 'bg-yellow-300 border-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg' : ''}`}>
          <Icon size={isActive ? 28 : 24} strokeWidth={isActive || settings.theme === Theme.RETRO_3D ? 2.5 : 2} />
        </div>
        <span className={`text-[10px] font-medium mt-1 transition-opacity duration-300 ${isActive ? 'opacity-100 -translate-y-1' : 'opacity-0'} ${settings.theme === Theme.RETRO_3D ? 'hidden' : ''}`}>{label}</span>
        {isActive && settings.theme !== Theme.RETRO_3D && (
            <span className={`absolute -bottom-2 w-1 h-1 rounded-full ${indicatorClass}`}></span>
        )}
      </button>
    );
  };

  return (
    <div className={`fixed bottom-0 left-0 w-full h-20 z-40 ${navClass} transition-all duration-300 pb-safe`}>
      <div className="max-w-md mx-auto h-full flex justify-around items-center px-2">
        <NavItem view={AppView.HOME} icon={Home} label="Home" />
        <NavItem view={AppView.STUDIO} icon={Mic2} label="Studio" />
        <NavItem view={AppView.USER} icon={User} label="User" />
      </div>
    </div>
  );
};
