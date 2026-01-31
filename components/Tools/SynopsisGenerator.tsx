
import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, FileText, Sparkles, Loader2, Lightbulb } from 'lucide-react';
import { BouncyButton, BouncyCard } from '../UI/BouncyComponents';
import { SynopsisMode, AIModelId, Theme } from '../../types';
import { generateSynopsis } from '../../services/geminiService';
import { useApp } from '../../context/AppContext';
import { ModelSelector } from '../UI/ModelSelector';

interface Props {
  onBack: () => void;
}

export const SynopsisGenerator: React.FC<Props> = ({ onBack }) => {
  const { addToHistory, settings, history } = useApp();
  const [script, setScript] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [wordCount, setWordCount] = useState<number>(300);
  const [title, setTitle] = useState<string>("");
  const [mode, setMode] = useState<SynopsisMode>(SynopsisMode.DEFAULT);
  const [modelId, setModelId] = useState<AIModelId>('gemini-2.5-flash');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        setScript(event.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleGenerate = async () => {
    if (!script) return;
    setIsLoading(true);
    try {
      // AI Learning: Filter favorites for context
      const favorites = history
        .filter(h => h.type === 'synopsis' && h.isFavorite)
        .map(h => h.content)
        .slice(0, 3); // Limit to last 3 favorites to save context

      const generatedText = await generateSynopsis(script, wordCount, mode, title, favorites, modelId);
      setResult(generatedText);
      addToHistory({
        type: 'synopsis',
        content: generatedText,
        params: { mode, wordCount, title, fileName, modelId },
        isFavorite: false
      });
    } catch (error: any) {
      console.error(error);
      alert(`Generation failed: ${error.message || "Unknown error"}. Please try a different model or check your connection.`);
    } finally {
      setIsLoading(false);
    }
  };

  // Theme handling helper
  let cardClass = 'bg-white dark:bg-slate-800 shadow-sm';
  let inputBgClass = 'bg-black/5 dark:bg-white/5';

  if (settings.theme === Theme.GLASS) {
    cardClass = 'bg-glass backdrop-blur-md border border-glass-border';
  } else if (settings.theme === Theme.ONE_UI_DARK) {
    cardClass = 'bg-[#1a1a1a] border border-[#333] shadow-lg text-[#e0e0e0]';
    inputBgClass = 'bg-[#121212] border border-[#333] focus:border-[#7c4dff]';
  } else if (settings.theme === Theme.RETRO_3D) {
    cardClass = ''; // Handled by BouncyCard
    inputBgClass = 'bg-white border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow';
  }

  return (
    <div className="w-full min-h-full flex flex-col p-4 pb-24 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
            <BouncyButton variant="ghost" onClick={onBack} className="p-2 rounded-full">
            <ArrowLeft size={24} />
            </BouncyButton>
            <h1 className="text-2xl font-bold hidden md:block">Synopsis Generator</h1>
        </div>
        <ModelSelector selectedModel={modelId} onSelect={setModelId} />
      </div>

      {!result ? (
        <div className="space-y-6 max-w-2xl mx-auto w-full">
          
          <h1 className="text-2xl font-bold md:hidden text-center mb-2">Synopsis Generator</h1>

          {/* AI Learning Indicator */}
          {history.some(h => h.type === 'synopsis' && h.isFavorite) && (
            <div className="flex items-center gap-2 text-xs font-medium text-amber-500 dark:text-amber-400 px-4">
              <Lightbulb size={16} className="fill-current" />
              <span>AI Learning Active: Using your past favorites to improve results.</span>
            </div>
          )}

          {/* File Upload */}
          <BouncyCard className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-3xl ${cardClass} ${settings.theme === Theme.ONE_UI_DARK ? 'border-[#333]' : 'border-slate-300 dark:border-slate-600'} ${settings.theme === Theme.RETRO_3D ? '!border-black !border-dashed !rounded-lg' : ''}`}>
            <input 
              type="file" 
              ref={fileInputRef}
              accept=".txt"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Upload size={40} className={`mb-4 ${settings.theme === Theme.ONE_UI_DARK ? 'text-[#7c4dff]' : 'text-indigo-500'} ${settings.theme === Theme.RETRO_3D ? '!text-black' : ''}`} />
            <p className="text-lg font-medium mb-2">{fileName || "Upload Script (.txt)"}</p>
            <p className="text-sm opacity-60 text-center mb-4">Select your video script file to analyze</p>
            <BouncyButton onClick={() => fileInputRef.current?.click()} variant="secondary" className={`px-6 py-2 ${settings.theme === Theme.ONE_UI_DARK ? 'bg-[#2c2c2c] border-[#333] text-[#e0e0e0]' : ''} ${settings.theme === Theme.RETRO_3D ? '!bg-white !border-2 !border-black' : ''}`}>
              Choose File
            </BouncyButton>
          </BouncyCard>

          {/* Settings */}
          <BouncyCard className={`${cardClass} space-y-4`}>
            <div>
              <label className="block text-sm font-medium mb-1">Video Title (Optional)</label>
              <input 
                type="text" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., My Vlog Ep. 1"
                className={`w-full p-3 rounded-xl outline-none focus:ring-2 ring-indigo-500 ${inputBgClass} ${settings.theme === Theme.RETRO_3D ? '!rounded-lg !ring-0' : ''}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex justify-between">
                <span>Word Count</span>
                <span className={`${settings.theme === Theme.ONE_UI_DARK ? 'text-[#7c4dff]' : 'text-indigo-500'} ${settings.theme === Theme.RETRO_3D ? '!text-black' : ''} font-bold`}>{wordCount}</span>
              </label>
              <input 
                type="range" 
                min="100" 
                max="1000" 
                step="50" 
                value={wordCount}
                onChange={(e) => setWordCount(parseInt(e.target.value))}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${settings.theme === Theme.ONE_UI_DARK ? 'bg-[#333] accent-[#7c4dff]' : 'bg-slate-200 dark:bg-slate-700 accent-indigo-600'} ${settings.theme === Theme.RETRO_3D ? '!bg-white !border-2 !border-black !rounded-none !accent-black' : ''}`}
              />
              <div className="flex justify-between text-xs opacity-50 mt-1">
                <span>100</span>
                <span>1000</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Mode</label>
              <div className="grid grid-cols-2 gap-2">
                {Object.values(SynopsisMode).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`p-3 rounded-xl text-sm font-medium transition-all text-left
                      ${mode === m 
                        ? (settings.theme === Theme.ONE_UI_DARK ? 'bg-[#7c4dff] text-white ring-2 ring-[#5e35b1]' : 
                           settings.theme === Theme.RETRO_3D ? 'bg-blue-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-x-[-1px] translate-y-[-1px]' :
                           'bg-indigo-600 text-white ring-2 ring-indigo-300 dark:ring-indigo-800')
                        : (settings.theme === Theme.RETRO_3D ? 'bg-white border-2 border-black hover:bg-gray-50' : inputBgClass + ' hover:opacity-80')
                      }
                      ${settings.theme === Theme.RETRO_3D ? '!rounded-lg' : ''}
                      `}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
          </BouncyCard>

          <BouncyButton 
            disabled={!script || isLoading} 
            onClick={handleGenerate} 
            className={`w-full py-4 text-lg disabled:opacity-50 ${settings.theme === Theme.RETRO_3D ? '!bg-yellow-400 !text-black' : ''}`}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            {isLoading ? 'Analyzing Script...' : 'Generate Synopsis'}
          </BouncyButton>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-500">
           <BouncyCard className={`${cardClass} flex-1 min-h-[50vh] overflow-auto`}>
              <h3 className={`text-lg font-bold mb-4 ${settings.theme === Theme.ONE_UI_DARK ? 'text-[#7c4dff]' : 'text-indigo-500'} ${settings.theme === Theme.RETRO_3D ? '!text-black' : ''}`}>Generated Synopsis</h3>
              <div className="whitespace-pre-wrap leading-relaxed opacity-90">
                {result}
              </div>
           </BouncyCard>
           <div className="mt-6 grid grid-cols-2 gap-4">
             <BouncyButton variant="secondary" onClick={() => setResult(null)} className={`py-3 ${settings.theme === Theme.ONE_UI_DARK ? 'bg-[#2c2c2c] border-[#333] text-[#e0e0e0]' : ''} ${settings.theme === Theme.RETRO_3D ? '!bg-white !border-2 !border-black' : ''}`}>
               Back to Edit
             </BouncyButton>
             <BouncyButton 
                variant="primary" 
                onClick={() => navigator.clipboard.writeText(result)} 
                className={`py-3 ${settings.theme === Theme.RETRO_3D ? '!bg-green-400 !text-black' : ''}`}
             >
               Copy Text
             </BouncyButton>
           </div>
        </div>
      )}
    </div>
  );
};
