
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AppSettings, AppView, AnimationStyle, Theme, UserProfile, GenerationHistory } from '../types';

interface AppContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  user: UserProfile;
  updateUser: (newUser: Partial<UserProfile>) => void;
  history: GenerationHistory[];
  addToHistory: (item: Omit<GenerationHistory, 'id' | 'timestamp'>) => void;
  toggleFavorite: (id: string) => void;
  clearHistory: () => void;
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  resetAppData: () => void;
}

const defaultSettings: AppSettings = {
  theme: Theme.LIGHT,
  slideEnabled: true,
  animationStyle: AnimationStyle.FLUID_BLUR,
  bouncingAnimation: true,
  audioEnabled: true,
  enable3DMode: false,
  enableNeon: false,
  experimentalFeatures: false,
};

const defaultUser: UserProfile = {
  name: "Creator",
  avatarUrl: "https://picsum.photos/200/200",
  isLoggedIn: true,
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [history, setHistory] = useState<GenerationHistory[]>([]);
  const [currentView, setCurrentView] = useState<AppView>(AppView.HOME);

  // Kill Switch Logic: Monitor experimentalFeatures
  useEffect(() => {
    if (!settings.experimentalFeatures) {
      // If experimental features are turned off, disable dependent features
      if (settings.enable3DMode || settings.enableNeon || settings.theme === Theme.RETRO_3D) {
        setSettings(prev => ({
          ...prev,
          enable3DMode: false,
          enableNeon: false,
          theme: prev.theme === Theme.RETRO_3D ? Theme.LIGHT : prev.theme
        }));
      }
    }
  }, [settings.experimentalFeatures, settings.enable3DMode, settings.enableNeon, settings.theme]);

  // Apply Theme to Body
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('dark', 'glass', 'one-ui', 'retro-3d');
    
    // Reset styles
    document.body.style.background = '';
    document.body.style.backgroundImage = '';
    document.body.style.backgroundSize = '';
    document.body.style.backgroundAttachment = '';
    document.body.style.fontFamily = '';

    if (settings.theme === Theme.DARK) {
      root.classList.add('dark');
      document.body.style.background = '#0f172a'; // slate-900
    } else if (settings.theme === Theme.GLASS) {
      root.classList.add('dark');
      document.body.style.background = '#000000';
      document.body.style.backgroundImage = `
        radial-gradient(at 0% 0%, hsla(253,16%,7%,1) 0, transparent 50%), 
        radial-gradient(at 50% 0%, hsla(225,39%,30%,1) 0, transparent 50%), 
        radial-gradient(at 100% 0%, hsla(339,49%,30%,1) 0, transparent 50%),
        radial-gradient(at 0% 100%, hsla(253,16%,7%,1) 0, transparent 50%), 
        radial-gradient(at 100% 100%, hsla(339,49%,30%,1) 0, transparent 50%)
      `;
      document.body.style.backgroundAttachment = 'fixed';
      document.body.style.backgroundSize = 'cover';
    } else if (settings.theme === Theme.ONE_UI_DARK) {
      root.classList.add('dark');
      root.classList.add('one-ui');
      document.body.style.background = '#000000'; 
      document.body.style.backgroundImage = `
        radial-gradient(circle at 10% 10%, rgba(124, 77, 255, 0.08) 0%, transparent 50%),
        radial-gradient(circle at 90% 90%, rgba(124, 77, 255, 0.05) 0%, transparent 50%)
      `;
      document.body.style.backgroundAttachment = 'fixed';
    } else if (settings.theme === Theme.RETRO_3D && settings.experimentalFeatures) {
      root.classList.add('retro-3d');
      document.body.style.background = '#f0f0f0';
      document.body.style.backgroundImage = `radial-gradient(#000000 1px, transparent 1px)`;
      document.body.style.backgroundSize = '20px 20px';
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      // Light Theme
      document.body.style.background = '#f8fafc'; // slate-50
    }
  }, [settings.theme, settings.experimentalFeatures]);

  const updateSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateUser = (newUser: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...newUser }));
  };

  const addToHistory = (item: Omit<GenerationHistory, 'id' | 'timestamp'>) => {
    const newItem: GenerationHistory = {
      ...item,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    setHistory(prev => [newItem, ...prev]);
  };

  const toggleFavorite = (id: string) => {
    setHistory(prev => prev.map(h => h.id === id ? { ...h, isFavorite: !h.isFavorite } : h));
  };

  const clearHistory = () => setHistory([]);

  const resetAppData = () => {
    setSettings(defaultSettings);
    setUser(defaultUser);
    setHistory([]);
    setCurrentView(AppView.HOME);
  };

  return (
    <AppContext.Provider value={{
      settings,
      updateSettings,
      user,
      updateUser,
      history,
      addToHistory,
      toggleFavorite,
      clearHistory,
      currentView,
      setCurrentView,
      resetAppData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};
