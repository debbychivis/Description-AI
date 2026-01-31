
import React, { useEffect, useState } from 'react';
import { X, LogOut, Volume2, VolumeX, Sliders, Activity, Trash2, Download, RefreshCw, Box, FlaskConical, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AnimationStyle, Theme } from '../../types';
import { BouncyButton } from '../UI/BouncyComponents';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { settings, updateSettings, user, updateUser, resetAppData, history } = useApp();
  const [shouldRender, setShouldRender] = useState(isOpen);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const exportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ settings, user, history }));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "content_buddy_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Theme-based styling
  let modalClass = 'bg-white text-slate-900';
  let toggleCheckClass = 'checked:bg-indigo-600';
  let dataBtnClass = 'bg-white text-slate-900 border border-slate-200';
  let resetBtnClass = 'bg-white text-red-500 border border-slate-200';
  
  if (settings.theme === Theme.GLASS) {
    modalClass = 'bg-glass backdrop-blur-2xl border border-glass-border text-white shadow-2xl';
    toggleCheckClass = 'checked:bg-white checked:border-white';
    dataBtnClass = 'bg-white/5 border border-white/10 hover:bg-white/10 text-white';
    resetBtnClass = 'bg-white/5 border border-white/10 hover:bg-red-500/20 text-red-400';
  } else if (settings.theme === Theme.DARK) {
    modalClass = 'bg-slate-800 text-white';
    toggleCheckClass = 'checked:bg-indigo-600';
    dataBtnClass = 'bg-slate-700 border-slate-600 text-white hover:bg-slate-600';
    resetBtnClass = 'bg-slate-700 border-slate-600 text-red-400 hover:bg-slate-600';
  } else if (settings.theme === Theme.ONE_UI_DARK) {
    modalClass = 'bg-[#1e1e1e] text-[#e0e0e0] border border-[#333]';
    toggleCheckClass = 'checked:bg-[#7c4dff]';
    dataBtnClass = 'bg-[#2c2c2c] border border-[#333] text-[#e0e0e0] hover:bg-[#3c3c3c]';
    resetBtnClass = 'bg-[#2c2c2c] border border-[#333] text-[#ff5252] hover:bg-[#ff5252]/10';
  } else if (settings.theme === Theme.LIGHT) {
    toggleCheckClass = 'checked:bg-sky-500';
  } else if (settings.theme === Theme.RETRO_3D) {
    modalClass = 'bg-white text-black border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] rounded-none';
    toggleCheckClass = 'checked:bg-black rounded-none before:rounded-none checked:before:border-2 checked:before:border-black';
    dataBtnClass = 'bg-white border-2 border-black text-black hover:bg-gray-100 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]';
    resetBtnClass = 'bg-red-100 border-2 border-black text-red-600 hover:bg-red-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]';
  }

  const baseToggleClass = `w-12 h-6 rounded-full appearance-none bg-slate-300 ${toggleCheckClass} relative transition-colors duration-200 cursor-pointer before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:top-1 before:left-1 checked:before:left-7 before:transition-all ${settings.theme === Theme.RETRO_3D ? '!rounded-md before:!rounded-sm border-2 border-black bg-white checked:!bg-yellow-400 before:!border-2 before:!border-black' : ''}`;

  // Universal 3D styling for modal
  if (settings.experimentalFeatures && settings.enable3DMode && settings.theme !== Theme.RETRO_3D) {
      modalClass += " shadow-[0_15px_30px_rgba(0,0,0,0.3)] border-b-4 border-r-4 border-black/20";
  }

  // Neon Mode styling for modal
  if (settings.experimentalFeatures && settings.enableNeon && settings.theme !== Theme.RETRO_3D) {
      modalClass += " animate-neon-flow border-2 border-transparent";
  }

  let animationClass = '';
  if (settings.bouncingAnimation) {
    animationClass = isOpen ? 'animate-pop-in' : 'animate-pop-out';
  } else {
    animationClass = isOpen ? 'animate-in fade-in zoom-in-95 duration-200' : 'animate-out fade-out zoom-out-95 duration-200';
  }

  const overlayAnimation = isOpen ? 'animate-in fade-in duration-200' : 'animate-out fade-out duration-200';
  
  // Container for internal sections
  const sectionClass = `bg-black/5 dark:bg-white/5 rounded-2xl p-4 ${settings.theme === Theme.RETRO_3D ? '!bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] !rounded-lg' : ''}`;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm ${overlayAnimation} ${settings.theme === Theme.RETRO_3D ? '!bg-black/50 !backdrop-blur-none' : ''}`}>
      <div className={`
        w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl p-6 shadow-2xl
        ${animationClass}
        ${modalClass}
      `}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Settings</h2>
          <BouncyButton variant="ghost" onClick={onClose} className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 active:scale-90 transition-transform">
            <X size={24} />
          </BouncyButton>
        </div>

        <div className="space-y-6">
          {/* Account */}
          <section>
            <h3 className="text-sm font-semibold opacity-70 mb-3 uppercase tracking-wider">Account</h3>
            <div className={`${sectionClass} flex justify-between items-center`}>
              <div className="flex items-center gap-3">
                <img src={user.avatarUrl} alt="Profile" className={`w-10 h-10 rounded-full object-cover ${settings.theme === Theme.RETRO_3D ? 'border-2 border-black rounded-none' : ''}`} />
                <div className="flex flex-col">
                  <span className="font-medium">{user.name}</span>
                  <span className="text-xs opacity-60">{user.isLoggedIn ? 'Logged In' : 'Guest'}</span>
                </div>
              </div>
              <BouncyButton 
                variant={user.isLoggedIn ? 'danger' : 'primary'} 
                className="px-4 py-2 text-sm"
                onClick={() => updateUser({ isLoggedIn: !user.isLoggedIn })}
              >
                {user.isLoggedIn ? <LogOut size={16} /> : 'Log In'}
                {user.isLoggedIn ? 'Log Out' : ''}
              </BouncyButton>
            </div>
          </section>

          {/* Preferences */}
          <section>
            <h3 className="text-sm font-semibold opacity-70 mb-3 uppercase tracking-wider">Preferences</h3>
            <div className={`${sectionClass} space-y-4`}>
              
              {/* Audio */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  {settings.audioEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  <span>Audio Effects</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.audioEnabled}
                  onChange={() => updateSettings({ audioEnabled: !settings.audioEnabled })}
                  className={baseToggleClass}
                />
              </div>

              {/* Slide Feature */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Sliders size={20} />
                  <span>Slide Navigation</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.slideEnabled}
                  onChange={() => updateSettings({ slideEnabled: !settings.slideEnabled })}
                  className={baseToggleClass}
                />
              </div>

               {/* Bouncing Animation */}
               <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Activity size={20} />
                  <span>Bouncing Animation</span>
                </div>
                <input 
                  type="checkbox" 
                  checked={settings.bouncingAnimation}
                  onChange={() => updateSettings({ bouncingAnimation: !settings.bouncingAnimation })}
                  className={baseToggleClass}
                />
              </div>

              {/* Animation Style */}
              {settings.slideEnabled && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-2 duration-200">
                  <label className="block text-sm mb-2 opacity-80">Animation Style</label>
                  <select 
                    value={settings.animationStyle}
                    onChange={(e) => updateSettings({ animationStyle: e.target.value as AnimationStyle })}
                    className={`w-full p-3 rounded-xl bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 outline-none focus:border-indigo-500 text-sm ${settings.theme === Theme.RETRO_3D ? '!border-2 !border-black !rounded-lg !bg-white' : ''}`}
                  >
                    <option value={AnimationStyle.FLUID_BLUR}>Fluid Blur Slide</option>
                    <option value={AnimationStyle.FADEOUT_OVERLAY}>Fadeout Overlay</option>
                    <option value={AnimationStyle.FREE_FALL}>Free Fall Slide</option>
                    <option value={AnimationStyle.ELASTIC_SLIDE}>Elastic Snap Slide</option>
                  </select>
                </div>
              )}
            </div>
          </section>
          
          {/* Experimental Features Toggle */}
          <section>
            <h3 className="text-sm font-semibold opacity-70 mb-3 uppercase tracking-wider flex items-center gap-2">
               Experimental <FlaskConical size={14} />
            </h3>
            <div className={`${sectionClass} space-y-4`}>
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <FlaskConical size={20} />
                        <span>Experimental Features</span>
                    </div>
                    <input 
                    type="checkbox" 
                    checked={settings.experimentalFeatures}
                    onChange={() => updateSettings({ experimentalFeatures: !settings.experimentalFeatures })}
                    className={baseToggleClass}
                    />
                </div>

                {/* Experimental Sub-Toggles - ONLY VISIBLE IF EXPERIMENTAL IS ON */}
                {settings.experimentalFeatures && (
                    <div className="space-y-4 pl-2 animate-in slide-in-from-top-2 fade-in">
                        {/* True 3D Toggle */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Box size={20} />
                                <span>True 3D Depth</span>
                            </div>
                            <input 
                                type="checkbox" 
                                checked={settings.enable3DMode}
                                onChange={() => updateSettings({ enable3DMode: !settings.enable3DMode, enableNeon: false })}
                                className={baseToggleClass}
                            />
                        </div>

                        {/* Neon Mode Toggle */}
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <Zap size={20} />
                                <span>NEON Mode</span>
                            </div>
                            <input 
                                type="checkbox" 
                                checked={settings.enableNeon}
                                onChange={() => updateSettings({ enableNeon: !settings.enableNeon, enable3DMode: false })}
                                className={baseToggleClass}
                            />
                        </div>
                    </div>
                )}
            </div>
          </section>

          {/* Data Management */}
          <section>
            <h3 className="text-sm font-semibold opacity-70 mb-3 uppercase tracking-wider">Data Management</h3>
            <div className={`${sectionClass} grid grid-cols-2 gap-4 !bg-transparent !p-0`}>
               <BouncyButton variant="secondary" className={`py-3 text-sm justify-center ${dataBtnClass}`} onClick={exportData}>
                 <Download size={16} /> Export Data
               </BouncyButton>
               <BouncyButton variant="secondary" className={`py-3 text-sm justify-center ${resetBtnClass}`} onClick={resetAppData}>
                 <RefreshCw size={16} /> Reset App
               </BouncyButton>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
