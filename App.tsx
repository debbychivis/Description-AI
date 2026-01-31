
import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { BottomNav } from './components/Navigation/BottomNav';
import { MainLayout } from './components/Layout/MainLayout';
import { HomeView } from './components/Home/HomeView';
import { StudioView } from './components/Studio/StudioView';
import { UserView } from './components/User/UserView';
import { SettingsModal } from './components/Settings/SettingsModal';
import { SynopsisGenerator } from './components/Tools/SynopsisGenerator';
import { HashtagGenerator } from './components/Tools/HashtagGenerator';
import { ChatWidget } from './components/UI/ChatWidget';
import { AppView, ToolMode, Theme } from './types';

const AppContent: React.FC = () => {
  const { currentView, setCurrentView, settings } = useApp();
  const [activeTool, setActiveTool] = useState<ToolMode>(ToolMode.NONE);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Handle tool opening
  const handleSelectTool = (mode: ToolMode) => {
    setActiveTool(mode);
  };

  // Handle sliding/rendering logic
  // Note: We only render the tool if it's active, overriding the main layout
  if (activeTool !== ToolMode.NONE) {
    // Fix: If theme is GLASS, keep background transparent to show the body gradient
    const toolBgClass = settings.theme === Theme.GLASS 
      ? 'bg-transparent' 
      : 'bg-slate-50 dark:bg-slate-900';
    
    // One UI override for background
    const finalBgClass = settings.theme === Theme.ONE_UI_DARK 
      ? 'bg-black' 
      : toolBgClass;

    return (
      <div className={`w-full h-full ${finalBgClass} text-slate-900 dark:text-white transition-colors duration-300`}>
         {activeTool === ToolMode.SYNOPSIS && (
           <SynopsisGenerator onBack={() => setActiveTool(ToolMode.NONE)} />
         )}
         {activeTool === ToolMode.HASHTAGS && (
           <HashtagGenerator onBack={() => setActiveTool(ToolMode.NONE)} />
         )}
         {/* Chat Widget is HIDDEN here as per user request */}
      </div>
    );
  }

  // Standard sliding layout
  const viewClasses = "w-[100vw] h-full overflow-y-auto pb-20"; // 100vw because container is 300vw

  return (
    <div className="w-full h-full text-slate-900 dark:text-white transition-colors duration-300 font-sans selection:bg-indigo-500/30">
      
      {/* Main Slide/Tab Container */}
      <MainLayout>
        <div className={viewClasses} data-view={AppView.HOME}>
          <HomeView onSelectTool={handleSelectTool} />
        </div>
        <div className={viewClasses} data-view={AppView.STUDIO}>
          <StudioView />
        </div>
        <div className={viewClasses} data-view={AppView.USER}>
          <UserView onOpenSettings={() => setIsSettingsOpen(true)} />
        </div>
      </MainLayout>

      {/* Nav and Modals */}
      <BottomNav />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      
      {/* Chat Widget - Only accessible in main views AND when settings is NOT open */}
      {!isSettingsOpen && <ChatWidget />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};
