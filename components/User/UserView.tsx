
import React, { useState, useRef } from 'react';
import { Settings, User as UserIcon, Sun, Moon, CloudLightning, Camera, Save, X, Edit3, Upload, Sparkles, Box } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BouncyButton, BouncyCard } from '../UI/BouncyComponents';
import { Theme } from '../../types';

interface Props {
  onOpenSettings: () => void;
}

export const UserView: React.FC<Props> = ({ onOpenSettings }) => {
  const { user, updateUser, settings, updateSettings } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [editAvatar, setEditAvatar] = useState(user.avatarUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic card classes based on theme
  let cardClass = 'bg-white dark:bg-slate-800 shadow-sm';
  if (settings.theme === Theme.GLASS) {
    cardClass = 'bg-glass backdrop-blur-md border border-glass-border shadow-2xl';
  } else if (settings.theme === Theme.ONE_UI_DARK) {
    cardClass = 'bg-[#1a1a1a] border border-[#333] shadow-lg text-[#e0e0e0]';
  } else if (settings.theme === Theme.RETRO_3D) {
    cardClass = ''; // BouncyCard handles the Retro style automatically
  }

  const handleSaveProfile = () => {
    updateUser({ name: editName, avatarUrl: editAvatar });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(user.name);
    setEditAvatar(user.avatarUrl);
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setEditAvatar(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="w-full h-full flex flex-col pt-12 px-6 pb-24 overflow-y-auto animate-in fade-in duration-500">
      <div className="flex justify-between items-start mb-8 max-w-4xl mx-auto w-full">
        <h1 className={`text-3xl font-bold ${settings.theme === Theme.GLASS || settings.theme === Theme.ONE_UI_DARK ? 'text-white' : ''} ${settings.theme === Theme.RETRO_3D ? 'text-black drop-shadow-[2px_2px_0px_rgba(0,0,0,0.2)]' : ''}`}>
          Profile
        </h1>
        <BouncyButton 
          variant="ghost" 
          onClick={onOpenSettings} 
          className={`p-2 rounded-full transition-transform active:scale-90 
            ${settings.theme === Theme.GLASS ? 'bg-white/10 text-white hover:bg-white/20' : ''}
            ${settings.theme === Theme.ONE_UI_DARK ? 'bg-[#2c2c2c] text-white hover:bg-[#3c3c3c]' : ''}
            ${settings.theme !== Theme.GLASS && settings.theme !== Theme.ONE_UI_DARK && settings.theme !== Theme.RETRO_3D ? 'bg-slate-100 dark:bg-slate-800' : ''}
            ${settings.theme === Theme.RETRO_3D ? 'bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:bg-gray-50 rounded-lg' : ''}
          `}
        >
          <Settings size={24} />
        </BouncyButton>
      </div>

      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Profile Card */}
        <BouncyCard className={`${cardClass} flex flex-col items-center p-8 transition-all`}>
          
          {isEditing ? (
            <div className="w-full flex flex-col items-center space-y-4 animate-in fade-in zoom-in duration-300">
               <input 
                 type="file" 
                 ref={fileInputRef} 
                 accept="image/*" 
                 className="hidden" 
                 onChange={handleImageUpload}
               />
               <div 
                 className="relative group cursor-pointer w-32 h-32"
                 onClick={() => fileInputRef.current?.click()}
               >
                 <img 
                   src={editAvatar} 
                   alt="Avatar Preview" 
                   className={`w-full h-full rounded-full object-cover border-4 shadow-lg transition-transform group-active:scale-95 ${settings.theme === Theme.RETRO_3D ? 'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'border-indigo-500/50'}`}
                   onError={(e) => e.currentTarget.src = 'https://picsum.photos/200'}
                 />
                 <div className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                    <Camera size={24} className="text-white mb-1" />
                    <span className="text-[10px] text-white font-bold uppercase tracking-wider">Change Photo</span>
                 </div>
               </div>
               
               <div className="w-full space-y-3">
                 <div>
                   <label className="text-xs font-bold opacity-70 ml-1 block text-center mb-1">Display Name</label>
                   <input 
                     type="text" 
                     value={editName}
                     onChange={(e) => setEditName(e.target.value)}
                     className={`w-full p-3 rounded-xl border outline-none text-center font-bold text-lg transition-all focus:scale-[1.02] 
                        ${settings.theme === Theme.RETRO_3D ? 'bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg' : 'bg-black/5 dark:bg-white/10 border-transparent focus:border-indigo-500'}
                     `}
                   />
                 </div>
               </div>

               <div className="flex gap-3 mt-4 w-full">
                 <BouncyButton variant="ghost" onClick={handleCancelEdit} className={`flex-1 py-3 ${settings.theme === Theme.RETRO_3D ? 'bg-white border-2 border-black' : 'bg-slate-200 dark:bg-slate-700/50'}`}>
                   <X size={18} /> Cancel
                 </BouncyButton>
                 <BouncyButton variant="primary" onClick={handleSaveProfile} className={`flex-1 py-3 ${settings.theme === Theme.RETRO_3D ? 'bg-green-400 text-black hover:bg-green-300' : 'bg-green-600 hover:bg-green-700 text-white shadow-green-500/30'}`}>
                   <Save size={18} /> Save
                 </BouncyButton>
               </div>
            </div>
          ) : (
            <>
              <div className="relative mb-4">
                <img 
                  src={user.avatarUrl} 
                  alt="User" 
                  className={`w-28 h-28 rounded-full object-cover border-4 shadow-2xl 
                    ${settings.theme === Theme.GLASS ? 'border-white/20' : ''}
                    ${settings.theme === Theme.ONE_UI_DARK ? 'border-[#7c4dff]/30' : ''}
                    ${settings.theme === Theme.LIGHT || settings.theme === Theme.DARK ? 'border-white dark:border-slate-700' : ''}
                    ${settings.theme === Theme.RETRO_3D ? 'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-full' : ''}
                  `}
                />
                <div className={`absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-4 
                  ${settings.theme === Theme.ONE_UI_DARK ? 'border-[#1a1a1a]' : 'border-white dark:border-slate-800'}
                  ${settings.theme === Theme.RETRO_3D ? 'border-black bg-green-400' : ''}
                `}></div>
              </div>
              
              <h2 className={`text-2xl font-bold mb-1 ${settings.theme === Theme.GLASS || settings.theme === Theme.ONE_UI_DARK ? 'text-white' : ''} ${settings.theme === Theme.RETRO_3D ? 'text-black' : ''}`}>{user.name}</h2>
              <p className={`opacity-60 mb-6 ${settings.theme === Theme.GLASS ? 'text-indigo-100' : ''} ${settings.theme === Theme.ONE_UI_DARK ? 'text-gray-400' : ''} ${settings.theme === Theme.RETRO_3D ? 'text-black font-mono' : ''}`}>
                {user.isLoggedIn ? 'Content Creator' : 'Guest User'}
              </p>
              
              <BouncyButton 
                variant="primary" 
                className={`px-8 py-2 rounded-full 
                  ${settings.theme === Theme.GLASS ? 'bg-white/10 text-white backdrop-blur-md border border-white/20 hover:bg-white/20 shadow-none' : ''}
                  ${settings.theme === Theme.ONE_UI_DARK ? 'bg-[#7c4dff] text-white hover:bg-[#651fff] border-none shadow-lg shadow-purple-900/20' : ''}
                  ${settings.theme === Theme.LIGHT ? 'bg-sky-500 text-white hover:bg-sky-600' : ''}
                  ${settings.theme === Theme.RETRO_3D ? '!bg-blue-400 !text-black !rounded-lg' : ''}
                `}
                onClick={() => setIsEditing(true)}
              >
                <Edit3 size={16} /> Edit Profile
              </BouncyButton>
            </>
          )}
        </BouncyCard>

        {/* Theme Selector */}
        <BouncyCard className={`${cardClass} p-6`}>
          <h3 className={`font-bold mb-4 flex items-center gap-2 ${settings.theme === Theme.GLASS || settings.theme === Theme.ONE_UI_DARK ? 'text-white' : ''} ${settings.theme === Theme.RETRO_3D ? 'text-black' : ''}`}>
            <CloudLightning size={20} className={
              settings.theme === Theme.GLASS ? 'text-pink-300' : 
              settings.theme === Theme.ONE_UI_DARK ? 'text-[#7c4dff]' : 
              settings.theme === Theme.LIGHT ? 'text-sky-500' : 
              settings.theme === Theme.RETRO_3D ? 'text-black' : 'text-indigo-500'
            } />
            Visual Theme
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            
            <button 
              onClick={() => updateSettings({ theme: Theme.LIGHT })}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all transform active:scale-90 duration-200
                ${settings.theme === Theme.LIGHT ? 'border-sky-500 bg-sky-50 text-sky-600' : 'border-transparent bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200'}
                ${settings.theme === Theme.RETRO_3D ? 'bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg text-black' : ''}
              `}
            >
              <Sun size={24} />
              <span className="text-xs font-bold">Light</span>
            </button>

            <button 
              onClick={() => updateSettings({ theme: Theme.DARK })}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all transform active:scale-90 duration-200
                ${settings.theme === Theme.DARK ? 'border-indigo-500 bg-slate-800 text-indigo-400' : 'border-transparent bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200'}
                ${settings.theme === Theme.RETRO_3D ? 'bg-black text-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,0.5)] rounded-lg' : ''}
              `}
            >
              <Moon size={24} />
              <span className="text-xs font-bold">Dark</span>
            </button>

             <button 
              onClick={() => updateSettings({ theme: Theme.GLASS })}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all transform active:scale-90 duration-200 overflow-hidden relative
                ${settings.theme === Theme.GLASS 
                  ? 'border-white/50 bg-white/10 backdrop-blur-md text-white shadow-lg shadow-indigo-500/20' 
                  : 'border-transparent bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200'
                }
                 ${settings.theme === Theme.RETRO_3D ? 'bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg text-black' : ''}
              `}
            >
              <div className={`absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-pink-500/20 opacity-50 ${settings.theme === Theme.RETRO_3D ? 'hidden' : ''}`}></div>
              <div className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-6 h-6 rounded-full bg-gradient-to-tr from-white/80 to-white/20 border border-white/50 shadow-inner ${settings.theme === Theme.RETRO_3D ? 'border-2 border-black bg-white shadow-none' : ''}`}></div>
                <span className="text-xs font-bold">Glass</span>
              </div>
            </button>

             <button 
              onClick={() => updateSettings({ theme: Theme.ONE_UI_DARK })}
              className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all transform active:scale-90 duration-200 overflow-hidden relative
                ${settings.theme === Theme.ONE_UI_DARK 
                  ? 'border-[#7c4dff] bg-[#121212] text-[#d1c4e9]' 
                  : 'border-transparent bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200'
                }
                ${settings.theme === Theme.RETRO_3D ? 'bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rounded-lg text-black' : ''}
              `}
            >
               <div className={`absolute inset-0 bg-gradient-to-br from-[#7c4dff]/10 to-transparent opacity-50 ${settings.theme === Theme.RETRO_3D ? 'hidden' : ''}`}></div>
              <div className="relative z-10 flex flex-col items-center gap-2">
                <Sparkles size={24} />
                <span className="text-xs font-bold">One UI</span>
              </div>
            </button>

            {/* Retro 3D Theme - ONLY VISIBLE IF EXPERIMENTAL IS ON */}
            {settings.experimentalFeatures && (
                <button 
                onClick={() => updateSettings({ theme: Theme.RETRO_3D })}
                className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all transform active:scale-90 duration-200 overflow-hidden relative animate-in fade-in zoom-in
                    ${settings.theme === Theme.RETRO_3D 
                    ? 'border-black bg-yellow-300 text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]' 
                    : 'border-transparent bg-slate-100 dark:bg-slate-900/50 hover:bg-slate-200'
                    }
                    rounded-lg
                `}
                >
                <div className="relative z-10 flex flex-col items-center gap-2">
                    <Box size={24} strokeWidth={2.5} />
                    <span className="text-xs font-bold">Retro 3D</span>
                </div>
                </button>
            )}

          </div>
        </BouncyCard>
      </div>
    </div>
  );
};
