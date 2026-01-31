
import React from 'react';
import { useApp } from '../../context/AppContext';
import { Theme } from '../../types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
}

export const BouncyButton: React.FC<ButtonProps> = ({ 
  children, 
  className = '', 
  variant = 'primary', 
  onClick,
  ...props 
}) => {
  const { settings } = useApp();
  
  const isRetro = settings.theme === Theme.RETRO_3D;
  // Experimental Flags
  const isUniversal3D = settings.experimentalFeatures && settings.enable3DMode && !isRetro;
  const isNeon = settings.experimentalFeatures && settings.enableNeon && !isRetro;

  // Base Styling Logic
  let baseStyle = "relative rounded-xl font-medium flex items-center justify-center gap-2 select-none transition-all ";
  let hoverEffect = "";
  let activeEffect = "";

  if (isRetro) {
    baseStyle = "relative rounded-lg border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold flex items-center justify-center gap-2 select-none transition-all ";
    hoverEffect = "hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ";
    activeEffect = "active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ";
  } else if (isNeon) {
    // NEON MODE: Fluid RGB Glow
    baseStyle = "relative rounded-xl font-bold flex items-center justify-center gap-2 select-none transition-all animate-neon-flow border-2 border-transparent bg-clip-padding ";
    hoverEffect = "hover:brightness-125 ";
    activeEffect = "active:scale-95 duration-75 ";
  } else if (isUniversal3D) {
    // TRUE 3D SKEUOMORPHISM: Realistic lighting and depth
    // Uses complex shadows for bevel and drop shadow
    baseStyle = "relative rounded-xl font-bold flex items-center justify-center gap-2 select-none transition-all mb-1.5 ";
    // The shadow logic needs to be dynamic based on color, handled below
    activeEffect = "active:translate-y-[4px] duration-100 ease-out ";
  } else if (settings.bouncingAnimation) {
    activeEffect = "active:scale-95 duration-75 ";
  }

  // Color Logic
  let primaryClass = "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 hover:bg-indigo-700";
  let secondaryClass = "bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-white dark:border-slate-700 dark:hover:bg-slate-700";
  let ghostClass = "bg-transparent hover:bg-black/5 dark:hover:bg-white/10 text-inherit";
  let dangerClass = "bg-red-500 text-white hover:bg-red-600 shadow-red-500/30";

  // Theme Specific Overrides
  if (settings.theme === Theme.ONE_UI_DARK) {
      primaryClass = "bg-[#7c4dff] text-white shadow-lg shadow-purple-900/30 hover:bg-[#651fff]";
  } else if (settings.theme === Theme.LIGHT) {
      primaryClass = "bg-sky-500 text-white shadow-lg shadow-sky-500/30 hover:bg-sky-600";
  } else if (isRetro) {
      primaryClass = "bg-yellow-400 text-black hover:bg-yellow-300";
      secondaryClass = "bg-white text-black hover:bg-gray-100";
      ghostClass = "bg-transparent border-none shadow-none hover:bg-black/10";
      dangerClass = "bg-red-500 text-white hover:bg-red-400";
  }

  // Modify colors for Neon Mode (Make them darker to pop with the glow)
  if (isNeon) {
     primaryClass = "bg-slate-900 text-white"; 
     secondaryClass = "bg-slate-900 text-white";
     dangerClass = "bg-slate-900 text-red-500";
  }

  // True 3D Logic - Adding Skeuomorphic Shadows
  if (isUniversal3D) {
     // Remove default soft blurs
     primaryClass = primaryClass.replace(/shadow-[\w-/]+/g, '');
     secondaryClass = secondaryClass.replace(/shadow-[\w-/]+/g, '');
     dangerClass = dangerClass.replace(/shadow-[\w-/]+/g, '');
     
     // Helper for 3D shadow string
     // Inset top highlight (light source), Drop shadow (depth), Inset bottom shadow (curve)
     const create3DShadow = (colorHex: string, depthColorHex: string) => {
        return `shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_4px_0_${depthColorHex},0_8px_10px_rgba(0,0,0,0.3)] active:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_0px_0_${depthColorHex},inset_0_2px_5px_rgba(0,0,0,0.2)]`;
     };

     if (settings.theme === Theme.LIGHT) {
        if (variant === 'primary') primaryClass += ` ${create3DShadow('', '#0369a1')}`; // sky-700 depth
        if (variant === 'danger') dangerClass += ` ${create3DShadow('', '#b91c1c')}`; // red-700
        if (variant === 'secondary') secondaryClass += ` ${create3DShadow('', '#94a3b8')}`; // slate-400
     } else if (settings.theme === Theme.ONE_UI_DARK) {
        if (variant === 'primary') primaryClass += ` ${create3DShadow('', '#451ab5')}`; // darker purple
        if (variant === 'danger') dangerClass += ` ${create3DShadow('', '#b71c1c')}`; 
        if (variant === 'secondary') secondaryClass += ` ${create3DShadow('', '#000000')}`; 
     } else if (settings.theme === Theme.GLASS) {
        baseStyle += " border border-white/20 ";
        if (variant === 'primary') primaryClass += ` shadow-[0_4px_0_rgba(255,255,255,0.1)] active:shadow-none active:translate-y-[4px]`;
        if (variant === 'secondary') secondaryClass += ` shadow-[0_4px_0_rgba(0,0,0,0.5)] active:shadow-none active:translate-y-[4px]`;
     } else {
        // Default Dark/Light fallback
        if (variant === 'primary') primaryClass += ` ${create3DShadow('', '#3730a3')}`; // indigo-800
        if (variant === 'danger') dangerClass += ` ${create3DShadow('', '#991b1b')}`; // red-800
        if (variant === 'secondary') secondaryClass += ` ${create3DShadow('', '#475569')}`; // slate-600
     }
  }

  const variants = {
    primary: primaryClass,
    secondary: secondaryClass,
    ghost: ghostClass,
    danger: dangerClass
  };

  if (variant === 'ghost' && (isRetro || isNeon)) {
     return (
        <button 
        className={`relative rounded-lg font-bold flex items-center justify-center gap-2 select-none hover:bg-black/10 dark:hover:bg-white/10 transition-colors ${className}`}
        onClick={onClick}
        {...props}
      >
        {children}
      </button>
     )
  }

  return (
    <button 
      className={`${baseStyle} ${variants[variant]} ${hoverEffect} ${activeEffect} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const BouncyCard: React.FC<CardProps> = ({ children, className = '', onClick }) => {
  const { settings } = useApp();
  
  const isRetro = settings.theme === Theme.RETRO_3D;
  const isUniversal3D = settings.experimentalFeatures && settings.enable3DMode && !isRetro;
  const isNeon = settings.experimentalFeatures && settings.enableNeon && !isRetro;
  
  let baseStyle = "rounded-2xl p-6 transition-all duration-300";
  let activeStyle = "";

  if (isRetro) {
    baseStyle = "rounded-xl border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-6 transition-all duration-200";
    if (onClick) activeStyle = "cursor-pointer active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
  } else if (isNeon) {
    baseStyle = "rounded-2xl p-6 transition-all duration-300 animate-neon-flow border-2 border-transparent bg-clip-padding bg-black/80 text-white";
    if (onClick) activeStyle = "cursor-pointer active:scale-98";
  } else if (isUniversal3D) {
    // True 3D Card - Skeuomorphic Depth
    baseStyle = `rounded-xl p-6 transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_6px_0_rgba(0,0,0,0.3),0_12px_15px_rgba(0,0,0,0.2)] mb-2`;
    if (onClick) activeStyle = "cursor-pointer active:shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_1px_0_rgba(0,0,0,0.3)] active:translate-y-[5px]";
    
    // Specific Shadows for 3D Mode
    if (settings.theme === Theme.ONE_UI_DARK) baseStyle += " shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_6px_0_#000000,0_12px_15px_rgba(0,0,0,0.5)]";
    if (settings.theme === Theme.LIGHT) baseStyle += " shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_6px_0_#cbd5e1,0_10px_10px_rgba(0,0,0,0.05)]";
    if (settings.theme === Theme.GLASS) baseStyle += " shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_6px_0_rgba(0,0,0,0.4),0_12px_15px_rgba(0,0,0,0.3)]";
  } else {
    // Default Standard
    if (settings.bouncingAnimation && onClick) {
        activeStyle = "transition-transform duration-75 active:scale-98 cursor-pointer transform";
    }
  }

  return (
    <div onClick={onClick} className={`${baseStyle} ${activeStyle} ${className}`}>
      {children}
    </div>
  );
};
