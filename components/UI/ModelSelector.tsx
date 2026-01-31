
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Zap, Brain, Cpu } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AIModelId, AI_MODELS, Theme } from '../../types';

interface Props {
  selectedModel: AIModelId;
  onSelect: (model: AIModelId) => void;
}

export const ModelSelector: React.FC<Props> = ({ selectedModel, onSelect }) => {
  const { settings } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedModelData = AI_MODELS.find(m => m.id === selectedModel) || AI_MODELS[2];

  // Styling Logic
  let buttonClass = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white';
  let dropdownClass = 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl';
  let itemHoverClass = 'hover:bg-slate-100 dark:hover:bg-white/5';
  let accentColor = 'text-indigo-500';

  if (settings.theme === Theme.GLASS) {
    buttonClass = 'bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20';
    dropdownClass = 'bg-glass backdrop-blur-xl border border-glass-border shadow-2xl text-white';
    itemHoverClass = 'hover:bg-white/10';
    accentColor = 'text-pink-400';
  } else if (settings.theme === Theme.ONE_UI_DARK) {
    buttonClass = 'bg-[#2c2c2c] border border-[#333] text-[#e0e0e0] hover:bg-[#3c3c3c]';
    dropdownClass = 'bg-[#1e1e1e] border border-[#333] shadow-xl text-[#e0e0e0]';
    itemHoverClass = 'hover:bg-[#333]';
    accentColor = 'text-[#7c4dff]';
  } else if (settings.theme === Theme.LIGHT) {
    buttonClass = 'bg-white border border-sky-200 text-slate-900 hover:border-sky-400 shadow-sm';
    accentColor = 'text-sky-500';
  }

  const getIcon = (id: AIModelId) => {
    if (id === 'gemini-3-pro-preview') return <Brain size={16} />;
    if (id === 'gemini-2.5-flash') return <Zap size={16} />;
    return <Cpu size={16} />;
  };

  return (
    <div className="relative z-30" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium transition-all duration-200 active:scale-95 ${buttonClass}`}
      >
        <span className={`${accentColor}`}>{getIcon(selectedModel)}</span>
        <span>{selectedModelData.name}</span>
        <ChevronDown size={14} className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className={`absolute top-full left-0 mt-2 w-64 rounded-2xl overflow-hidden p-1 animate-in fade-in zoom-in-95 duration-200 ${dropdownClass}`}>
          {AI_MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => {
                onSelect(model.id);
                setIsOpen(false);
              }}
              className={`w-full flex items-start gap-3 p-3 rounded-xl text-left transition-colors ${itemHoverClass}`}
            >
              <div className={`mt-1 ${model.id === selectedModel ? accentColor : 'opacity-50'}`}>
                {getIcon(model.id)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className={`text-sm font-bold ${model.id === selectedModel ? accentColor : ''}`}>
                    {model.name}
                  </span>
                  {model.id === selectedModel && <Check size={14} className={accentColor} />}
                </div>
                <p className="text-[10px] opacity-60 leading-tight mt-1">{model.description}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
