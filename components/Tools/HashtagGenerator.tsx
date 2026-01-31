
import React, { useState, useRef } from 'react';
import { ArrowLeft, Upload, Hash, Search, Loader2, Lightbulb } from 'lucide-react';
import { BouncyButton, BouncyCard } from '../UI/BouncyComponents';
import { generateHashtags } from '../../services/geminiService';
import { useApp } from '../../context/AppContext';
import { ModelSelector } from '../UI/ModelSelector';
import { AIModelId, Theme } from '../../types';

interface Props {
  onBack: () => void;
}

export const HashtagGenerator: React.FC<Props> = ({ onBack }) => {
  const { addToHistory, settings, history } = useApp();
  const [script, setScript] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [amount, setAmount] = useState<number>(30);
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
    if (!description) return;
    setIsLoading(true);
    try {
      // AI Learning: Filter favorites for context
      const favorites = history
        .filter(h => h.type === 'hashtags' && h.isFavorite)
        .map(h => h.content)
        .slice(0, 3);

      const generatedText = await generateHashtags(script || "No script provided", description, amount, favorites, modelId);
      setResult(generatedText);
      addToHistory({
        type: 'hashtags',
        content: generatedText,
        params: { amount, description, fileName, modelId },
        isFavorite: false
      });
    } catch (error) {
      alert("Failed to generate hashtags. Please check your internet connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Theme Logic
  let cardClass = 'bg-white dark:bg-slate-800 shadow-sm';
  let inputBgClass = 'bg-black/5 dark:bg-white/5';

  if (settings.theme === Theme.GLASS) {
    cardClass = 'bg-glass backdrop-blur-md border border-glass-border';
  } else if (settings.theme === Theme.ONE_UI_DARK) {
    cardClass = 'bg-[#1a1a1a] border border-[#333] shadow-lg text-[#e0e0e0]';
    inputBgClass = 'bg-[#121212] border border-[#333] focus:border-[#7c4dff]';
  } else if (settings.theme === Theme.RETRO_3D) {
    cardClass = ''; // Handled by BouncyCard
    inputBgClass = 'bg-white border-2 border-black focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow !rounded-lg';
  }

  return (
    <div className="w-full min-h-full flex flex-col p-4 pb-24 animate-in slide-in-from-right duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
            <BouncyButton variant="ghost" onClick={onBack} className="p-2 rounded-full">
            <ArrowLeft size={24} />
            </BouncyButton>
            <h1 className="text-2xl font-bold hidden md:block">Hashtag Generator</h1>
        </div>
        <ModelSelector selectedModel={modelId} onSelect={setModelId} />
      </div>

      {!result ? (
        <div className="space-y-6 max-w-2xl mx-auto w-full">
          
          <h1 className="text-2xl font-bold md:hidden text-center mb-2">Hashtag Generator</h1>
          
          {/* AI Learning Indicator */}
          {history.some(h => h.type === 'hashtags' && h.isFavorite) && (
            <div className="flex items-center gap-2 text-xs font-medium text-pink-500 dark:text-pink-400 px-4">
              <Lightbulb size={16} className="fill-current" />
              <span>AI Learning Active: Adapting to your preferred hashtag styles.</span>
            </div>
          )}

          {/* File Upload (Optional for Hashtags but useful for context) */}
          <BouncyCard className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-3xl ${cardClass} ${settings.theme === Theme.ONE_UI_DARK ? 'border-[#333]' : 'border-slate-300 dark:border-slate-600'} ${settings.theme === Theme.RETRO_3D ? '!border-black !rounded-lg' : ''}`}>
            <input 
              type="file" 
              ref={fileInputRef}
              accept=".txt"
              className="hidden"
              onChange={handleFileUpload}
            />
            <Upload size={32} className={`mb-3 ${settings.theme === Theme.ONE_UI_DARK ? 'text-[#7c4dff]' : 'text-pink-500'} ${settings.theme === Theme.RETRO_3D ? '!text-black' : ''}`} />
            <p className="text-base font-medium mb-1">{fileName || "Upload Script (Optional)"}</p>
            <BouncyButton onClick={() => fileInputRef.current?.click()} variant="ghost" className={`px-4 py-1 text-sm ${inputBgClass}`}>
              Choose File
            </BouncyButton>
          </BouncyCard>

          {/* Settings */}
          <BouncyCard className={`${cardClass} space-y-5`}>
            <div>
              <label className="block text-sm font-medium mb-2">Content Description</label>
              <textarea 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your video (e.g., A travel vlog visiting Kyoto focusing on street food)"
                className={`w-full p-3 rounded-xl outline-none focus:ring-2 ring-pink-500 h-32 resize-none ${inputBgClass} ${settings.theme === Theme.RETRO_3D ? '!ring-0' : ''}`}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 flex justify-between">
                <span>Hashtag Count</span>
                <span className={`${settings.theme === Theme.ONE_UI_DARK ? 'text-[#7c4dff]' : 'text-pink-500'} ${settings.theme === Theme.RETRO_3D ? '!text-black' : ''} font-bold`}>{amount}</span>
              </label>
              <input 
                type="range" 
                min="10" 
                max="100" 
                step="5" 
                value={amount}
                onChange={(e) => setAmount(parseInt(e.target.value))}
                className={`w-full h-2 rounded-lg appearance-none cursor-pointer ${settings.theme === Theme.ONE_UI_DARK ? 'bg-[#333] accent-[#7c4dff]' : 'bg-slate-200 dark:bg-slate-700 accent-pink-600'} ${settings.theme === Theme.RETRO_3D ? '!bg-white !border-2 !border-black !rounded-none !accent-black' : ''}`}
              />
              <div className="flex justify-between text-xs opacity-50 mt-1">
                <span>10</span>
                <span>100</span>
              </div>
            </div>
            
            <div className={`p-3 rounded-xl flex items-start gap-3 text-sm ${settings.theme === Theme.ONE_UI_DARK ? 'bg-[#2c2c2c] text-[#b388ff]' : 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'} ${settings.theme === Theme.RETRO_3D ? '!bg-blue-200 !text-black !border-2 !border-black !rounded-lg' : ''}`}>
               <Search size={16} className="mt-1 shrink-0" />
               <p>AI will analyze Google Trends data to find high-ranking keywords for your niche.</p>
            </div>
          </BouncyCard>

          <BouncyButton 
            disabled={!description || isLoading} 
            onClick={handleGenerate} 
            className={`w-full py-4 text-lg disabled:opacity-50 border-none ${settings.theme === Theme.ONE_UI_DARK ? 'bg-[#7c4dff] hover:bg-[#651fff] text-white' : 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700'} ${settings.theme === Theme.RETRO_3D ? '!bg-pink-400 !text-black !bg-none' : ''}`}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <Hash />}
            {isLoading ? 'Optimizing SEO...' : 'Generate Hashtags'}
          </BouncyButton>
        </div>
      ) : (
        <div className="max-w-2xl mx-auto w-full h-full flex flex-col animate-in fade-in slide-in-from-bottom-10 duration-500">
           <BouncyCard className={`${cardClass} flex-1 min-h-[50vh] overflow-auto`}>
              <h3 className={`text-lg font-bold mb-4 ${settings.theme === Theme.ONE_UI_DARK ? 'text-[#7c4dff]' : 'text-pink-500'} ${settings.theme === Theme.RETRO_3D ? '!text-black' : ''}`}>Optimized Hashtags</h3>
              <div className="flex flex-wrap gap-2">
                {result.split(' ').map((tag, idx) => (
                    tag.trim().startsWith('#') ? (
                        <span key={idx} className={`px-3 py-1 rounded-full text-sm ${settings.theme === Theme.ONE_UI_DARK ? 'bg-[#7c4dff]/20 text-[#b388ff]' : 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300'} ${settings.theme === Theme.RETRO_3D ? '!bg-white !text-black !border-2 !border-black !rounded-lg' : ''}`}>
                            {tag}
                        </span>
                    ) : (
                        <span key={idx}>{tag} </span>
                    )
                ))}
              </div>
              <div className={`mt-6 p-4 rounded-xl text-sm font-mono opacity-70 select-all ${inputBgClass}`}>
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
                className={`py-3 ${settings.theme === Theme.ONE_UI_DARK ? 'bg-[#7c4dff] hover:bg-[#651fff]' : 'bg-pink-600 hover:bg-pink-700'} ${settings.theme === Theme.RETRO_3D ? '!bg-green-400 !text-black' : ''}`}
             >
               Copy All
             </BouncyButton>
           </div>
        </div>
      )}
    </div>
  );
};
