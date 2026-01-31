
import React, { useState, useMemo, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Clock, Star, FileText, Hash, Trash, Filter, X, ChevronDown, Check, Calendar, Type, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BouncyButton, BouncyCard } from '../UI/BouncyComponents';
import { Theme, AIModelId, GenerationHistory } from '../../types';

interface FilterState {
  sortBy: 'date_desc' | 'date_asc' | 'length_desc';
  favoritesOnly: boolean;
  selectedModels: AIModelId[];
  contentType: 'all' | 'synopsis' | 'hashtags';
}

export const StudioView: React.FC = () => {
  const { history, toggleFavorite, clearHistory, settings } = useApp();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    sortBy: 'date_desc',
    favoritesOnly: false,
    selectedModels: [], // Empty means all
    contentType: 'all',
  });

  // Handle Animation Mounting/Unmounting
  useEffect(() => {
    if (isFilterOpen) {
      setShouldRender(true);
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 300); // Match animation duration
      return () => clearTimeout(timer);
    }
  }, [isFilterOpen]);

  // Theme Helpers
  const isGlass = settings.theme === Theme.GLASS;
  const isOneUI = settings.theme === Theme.ONE_UI_DARK;
  const isRetro = settings.theme === Theme.RETRO_3D;
  const isNeon = settings.experimentalFeatures && settings.enableNeon;

  // Base Styles
  let cardClass = 'bg-white dark:bg-slate-800 shadow-sm';
  let sheetClass = 'bg-white dark:bg-slate-800';
  let headerText = 'text-slate-900 dark:text-white';
  
  if (isGlass) {
    cardClass = 'bg-glass backdrop-blur-md border border-glass-border shadow-lg';
    sheetClass = 'bg-glass backdrop-blur-2xl border-t border-glass-border text-white';
    headerText = 'text-white';
  } else if (isOneUI) {
    cardClass = 'bg-[#1a1a1a] border border-[#333] shadow-lg text-[#e0e0e0]';
    sheetClass = 'bg-[#1e1e1e] border-t border-[#333] rounded-t-3xl text-[#e0e0e0]';
    headerText = 'text-white';
  } else if (isRetro) {
    cardClass = ''; // Handled by BouncyCard
    sheetClass = 'bg-white border-t-4 border-black text-black';
    headerText = 'text-black';
  }

  // --- Filter Logic ---

  const availableModels: AIModelId[] = ['gemini-3-pro-preview', 'gemini-2.5-flash', 'gemini-2.0-flash'];

  const toggleModelFilter = (modelId: AIModelId) => {
    setFilters(prev => {
      const exists = prev.selectedModels.includes(modelId);
      if (exists) {
        return { ...prev, selectedModels: prev.selectedModels.filter(m => m !== modelId) };
      } else {
        return { ...prev, selectedModels: [...prev.selectedModels, modelId] };
      }
    });
  };

  const filteredHistory = useMemo(() => {
    let result = [...history];

    // 1. Filter by Content Type
    if (filters.contentType !== 'all') {
      result = result.filter(item => item.type === filters.contentType);
    }

    // 2. Filter by Favorites
    if (filters.favoritesOnly) {
      result = result.filter(item => item.isFavorite);
    }

    // 3. Filter by Model
    if (filters.selectedModels.length > 0) {
      result = result.filter(item => {
        const modelUsed = item.params.modelId as AIModelId;
        return modelUsed && filters.selectedModels.includes(modelUsed);
      });
    }

    // 4. Sort
    result.sort((a, b) => {
      if (filters.sortBy === 'date_desc') {
        return b.timestamp - a.timestamp;
      }
      if (filters.sortBy === 'date_asc') {
        return a.timestamp - b.timestamp;
      }
      if (filters.sortBy === 'length_desc') {
        const lenA = a.content.length;
        const lenB = b.content.length;
        return lenB - lenA;
      }
      return 0;
    });

    return result;
  }, [history, filters]);

  // Helper to safely extract display fields
  const getDisplayData = (item: GenerationHistory) => {
    const scriptTitle = item.params.title || item.params.fileName || (item.type === 'synopsis' ? 'Untitled Script' : 'Hashtag Set');
    const modelUsed = item.params.modelId || 'gemini-2.5-flash';
    const createdAt = new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const isFavorite = item.isFavorite;
    const wordCount = item.content.split(/\s+/).length;

    return { scriptTitle, modelUsed, createdAt, isFavorite, wordCount };
  };

  // Portal Content for Filter Sheet
  const renderFilterSheet = () => {
    if (!shouldRender) return null;

    let animationClass = '';
    if (settings.bouncingAnimation) {
      animationClass = isFilterOpen ? 'animate-pop-in' : 'animate-pop-out';
    } else {
      animationClass = isFilterOpen ? 'animate-in slide-in-from-bottom duration-300' : 'animate-out slide-out-to-bottom duration-300';
    }
    
    // Background overlay animation
    const overlayClass = isFilterOpen ? 'animate-in fade-in duration-300' : 'animate-out fade-out duration-300';

    return ReactDOM.createPortal(
        <div className="fixed inset-0 z-[9999] flex flex-col justify-end">
          {/* Backdrop */}
          <div 
             className={`absolute inset-0 bg-black/40 backdrop-blur-sm ${overlayClass}`} 
             onClick={() => setIsFilterOpen(false)}
             onTouchStart={(e) => e.stopPropagation()} 
             onTouchMove={(e) => e.stopPropagation()}
          />
          
          {/* Sheet */}
          <div 
             className={`relative w-full p-6 rounded-t-3xl shadow-2xl ${animationClass} ${sheetClass}`}
             onTouchStart={(e) => e.stopPropagation()}
             onTouchMove={(e) => e.stopPropagation()}
          >
             <div className="flex justify-between items-center mb-6">
                <h3 className={`text-xl font-bold ${headerText} ${isRetro ? 'text-black' : ''}`}>Filter & Sort</h3>
                <button 
                  onClick={() => setIsFilterOpen(false)}
                  className={`p-2 rounded-full transition-colors ${isGlass ? 'hover:bg-white/20' : 'hover:bg-black/10 dark:hover:bg-white/10'} ${headerText} ${isRetro ? 'text-black' : ''}`}
                >
                  <X size={20} />
                </button>
             </div>

             <div className="space-y-6">
                
                {/* Content Type Filter */}
                <div>
                   <label className={`text-xs font-bold uppercase tracking-wider opacity-60 mb-3 block ${headerText} ${isRetro ? 'text-black' : ''}`}>Content Type</label>
                   <div className="flex gap-2">
                      <BouncyButton 
                         variant={filters.contentType === 'all' ? 'primary' : 'secondary'}
                         className={`text-xs px-4 py-2 flex-1 ${isRetro && filters.contentType !== 'all' ? '!bg-white' : ''}`}
                         onClick={() => setFilters(prev => ({ ...prev, contentType: 'all' }))}
                      >
                         <Layers size={14} /> All
                      </BouncyButton>
                      <BouncyButton 
                         variant={filters.contentType === 'synopsis' ? 'primary' : 'secondary'}
                         className={`text-xs px-4 py-2 flex-1 ${isRetro && filters.contentType !== 'synopsis' ? '!bg-white' : ''}`}
                         onClick={() => setFilters(prev => ({ ...prev, contentType: 'synopsis' }))}
                      >
                         <FileText size={14} /> Synopsis
                      </BouncyButton>
                      <BouncyButton 
                         variant={filters.contentType === 'hashtags' ? 'primary' : 'secondary'}
                         className={`text-xs px-4 py-2 flex-1 ${isRetro && filters.contentType !== 'hashtags' ? '!bg-white' : ''}`}
                         onClick={() => setFilters(prev => ({ ...prev, contentType: 'hashtags' }))}
                      >
                         <Hash size={14} /> Hashtags
                      </BouncyButton>
                   </div>
                </div>

                {/* Sort Options */}
                <div>
                   <label className={`text-xs font-bold uppercase tracking-wider opacity-60 mb-3 block ${headerText} ${isRetro ? 'text-black' : ''}`}>Sort By</label>
                   <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                      <BouncyButton 
                         variant={filters.sortBy === 'date_desc' ? 'primary' : 'secondary'}
                         className={`text-xs px-3 py-1.5 whitespace-nowrap ${isRetro && filters.sortBy !== 'date_desc' ? '!bg-white' : ''}`}
                         onClick={() => setFilters(prev => ({ ...prev, sortBy: 'date_desc' }))}
                      >
                         Newest
                      </BouncyButton>
                      <BouncyButton 
                         variant={filters.sortBy === 'date_asc' ? 'primary' : 'secondary'}
                         className={`text-xs px-3 py-1.5 whitespace-nowrap ${isRetro && filters.sortBy !== 'date_asc' ? '!bg-white' : ''}`}
                         onClick={() => setFilters(prev => ({ ...prev, sortBy: 'date_asc' }))}
                      >
                         Oldest
                      </BouncyButton>
                      <BouncyButton 
                         variant={filters.sortBy === 'length_desc' ? 'primary' : 'secondary'}
                         className={`text-xs px-3 py-1.5 whitespace-nowrap ${isRetro && filters.sortBy !== 'length_desc' ? '!bg-white' : ''}`}
                         onClick={() => setFilters(prev => ({ ...prev, sortBy: 'length_desc' }))}
                      >
                         Word Count
                      </BouncyButton>
                   </div>
                </div>

                {/* AI Model Filter */}
                <div>
                   <label className={`text-xs font-bold uppercase tracking-wider opacity-60 mb-3 block ${headerText} ${isRetro ? 'text-black' : ''}`}>AI Model</label>
                   <div className="flex flex-wrap gap-2">
                      {availableModels.map(model => {
                        const isSelected = filters.selectedModels.includes(model);
                        let modelBtnClass = '';
                        if (isGlass) {
                          modelBtnClass = isSelected ? 'bg-white text-black border-white' : 'bg-white/10 text-white border-white/20 hover:bg-white/20';
                        } else if (isOneUI) {
                           modelBtnClass = isSelected ? 'bg-[#7c4dff] border-[#7c4dff] text-white' : 'bg-[#2c2c2c] border-[#333] text-gray-400';
                        } else if (isRetro) {
                           modelBtnClass = isSelected ? '!bg-black !text-white !border-black' : '!bg-white !text-black !border-2 !border-black';
                        } else {
                           modelBtnClass = isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400';
                        }

                        return (
                          <button
                             key={model}
                             onClick={() => toggleModelFilter(model)}
                             className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${modelBtnClass}`}
                          >
                             {model.replace('gemini-', '').replace('-preview', '')}
                          </button>
                        )
                      })}
                   </div>
                </div>

                {/* Favorites Toggle */}
                <div className={`flex justify-between items-center p-4 rounded-xl transition-colors
                   ${isGlass ? 'bg-white/10 border border-white/10' : ''}
                   ${isOneUI ? 'bg-[#121212]' : ''}
                   ${!isGlass && !isOneUI && !isRetro ? 'bg-slate-50 dark:bg-white/5' : ''}
                   ${isRetro ? '!bg-white !border-2 !border-black' : ''}
                `}>
                   <div className="flex items-center gap-3">
                      <Star size={20} className={filters.favoritesOnly ? 'text-yellow-400 fill-yellow-400' : 'text-slate-400'} />
                      <span className={`font-bold text-sm ${headerText} ${isRetro ? 'text-black' : ''}`}>Favorites Only</span>
                   </div>
                   <div 
                      onClick={() => setFilters(prev => ({ ...prev, favoritesOnly: !prev.favoritesOnly }))}
                      className={`w-12 h-6 rounded-full relative cursor-pointer transition-colors
                         ${filters.favoritesOnly 
                            ? (isOneUI ? 'bg-[#7c4dff]' : isGlass ? 'bg-white' : 'bg-indigo-600') 
                            : (isGlass ? 'bg-white/20' : 'bg-slate-300 dark:bg-slate-600')
                         }
                         ${isRetro ? '!border-2 !border-black' : ''}
                         ${isRetro && filters.favoritesOnly ? '!bg-black' : ''}
                      `}
                   >
                      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full transition-transform 
                         ${filters.favoritesOnly ? 'translate-x-6' : ''} 
                         ${isGlass && filters.favoritesOnly ? 'bg-black' : 'bg-white'}
                         ${isRetro ? '!rounded-sm border border-black' : ''}
                      `} />
                   </div>
                </div>

                {/* Reset Action */}
                <div className="pt-4 pb-safe">
                  <BouncyButton 
                     variant="primary" 
                     className="w-full py-4 text-sm"
                     onClick={() => setIsFilterOpen(false)}
                  >
                     Show {filteredHistory.length} Results
                  </BouncyButton>
                </div>

             </div>
          </div>
        </div>,
        document.body
    );
  };

  return (
    <div className="w-full h-full flex flex-col relative animate-in fade-in duration-500">
      
      {/* Top App Bar */}
      <div className={`px-6 pt-12 pb-4 flex justify-between items-center z-10 sticky top-0 bg-opacity-90 backdrop-blur-sm transition-all
          ${isGlass ? 'bg-transparent' : 'bg-transparent'}
      `}>
        <div>
          <h1 className={`text-3xl font-bold ${headerText} ${isRetro ? 'drop-shadow-[2px_2px_0px_rgba(255,255,255,1)]' : ''}`}>The Studio</h1>
          <p className={`text-sm opacity-60 ${headerText}`}>Manage your creations</p>
        </div>
        
        <div className="flex gap-2">
           {/* Filter Button */}
           <BouncyButton 
             variant="secondary" 
             onClick={() => setIsFilterOpen(true)}
             className={`px-3 py-2 text-sm ${isOneUI ? 'bg-[#2c2c2c] border-[#333] text-white' : ''} ${isRetro ? '!bg-white !border-2 !border-black' : ''}`}
           >
             <Filter size={16} />
             <span className="hidden md:inline">Filter</span>
             {(filters.favoritesOnly || filters.selectedModels.length > 0 || filters.contentType !== 'all') && (
               <div className={`w-2 h-2 rounded-full absolute top-2 right-2 ${isNeon ? 'bg-cyan-400 shadow-[0_0_5px_cyan]' : 'bg-indigo-500'}`} />
             )}
           </BouncyButton>
        </div>
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto px-6 pb-24 space-y-4">
        {filteredHistory.length === 0 ? (
          <div className="text-center py-20 opacity-40 flex flex-col items-center">
            <Clock size={48} className={`mb-4 ${headerText} ${isRetro ? 'text-black' : ''}`} />
            <p className={`${headerText} ${isRetro ? 'text-black' : ''}`}>No results found.</p>
            {(filters.favoritesOnly || filters.selectedModels.length > 0 || filters.contentType !== 'all') && (
              <button 
                onClick={() => setFilters({ sortBy: 'date_desc', favoritesOnly: false, selectedModels: [], contentType: 'all' })}
                className="mt-4 text-indigo-500 underline"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          filteredHistory.map((item) => {
            const data = getDisplayData(item);
            
            return (
              <BouncyCard key={item.id} className={`${cardClass} flex flex-col gap-3 relative group`}>
                
                {/* Header Row: Title & Date */}
                <div className="flex justify-between items-start">
                   <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 
                         ${item.type === 'synopsis' 
                            ? (isOneUI ? 'bg-[#7c4dff]/20 text-[#b388ff]' : isGlass ? 'bg-white/20 text-white' : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300') 
                            : (isOneUI ? 'bg-pink-500/20 text-pink-300' : isGlass ? 'bg-white/20 text-white' : 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-300')
                         }
                         ${isRetro ? '!bg-white !border-2 !border-black !rounded-md' : ''}
                      `}>
                         {item.type === 'synopsis' ? <FileText size={20} /> : <Hash size={20} />}
                      </div>
                      <div className="min-w-0">
                         <h4 className={`font-bold text-lg leading-tight line-clamp-1 break-all ${isRetro ? 'text-black' : ''}`}>{data.scriptTitle}</h4>
                         <span className="text-xs opacity-50 font-medium">{data.createdAt}</span>
                      </div>
                   </div>
                   
                   {/* Favorite Toggle */}
                   <button 
                    onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }}
                    className={`p-2 rounded-full transition-transform active:scale-90 ${data.isFavorite ? 'text-yellow-400' : 'text-slate-300 dark:text-slate-600 hover:text-slate-400'}`}
                   >
                     <Star size={20} fill={data.isFavorite ? "currentColor" : "none"} />
                   </button>
                </div>

                {/* Metadata Badge Row */}
                <div className="flex flex-wrap gap-2 items-center text-[10px] font-mono uppercase tracking-wider">
                   <span className={`px-2 py-1 rounded-md flex items-center gap-1
                      ${isOneUI ? 'bg-[#2c2c2c] text-gray-300' : isGlass ? 'bg-white/10 text-white/80' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400'}
                      ${isRetro ? '!bg-gray-100 !border !border-black !text-black' : ''}
                   `}>
                      <span className={`w-1.5 h-1.5 rounded-full ${isNeon ? 'bg-cyan-400' : 'bg-emerald-500'}`}></span>
                      {data.modelUsed.replace('gemini-', '')}
                   </span>
                   
                   <span className={`px-2 py-1 rounded-md 
                      ${isOneUI ? 'bg-[#2c2c2c] text-gray-300' : isGlass ? 'bg-white/10 text-white/80' : 'bg-slate-100 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400'}
                      ${isRetro ? '!bg-gray-100 !border !border-black !text-black' : ''}
                   `}>
                      {data.wordCount} words
                   </span>
                </div>

                {/* Content Preview */}
                <div className={`p-3 rounded-lg text-sm opacity-80 line-clamp-3 font-mono leading-relaxed
                   ${isOneUI ? 'bg-[#121212]' : isGlass ? 'bg-white/5 border border-white/10' : 'bg-slate-50 dark:bg-black/20'}
                   ${isRetro ? '!bg-transparent' : ''}
                `}>
                   {item.content}
                </div>

                {/* Actions */}
                <div className={`flex justify-end pt-2 border-t ${isGlass ? 'border-white/10' : 'border-slate-100 dark:border-white/5'}`}>
                   <button 
                      onClick={() => navigator.clipboard.writeText(item.content)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors
                         ${isOneUI ? 'text-[#7c4dff] hover:bg-[#7c4dff]/10' : isGlass ? 'text-white hover:bg-white/10' : 'text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-white/5'}
                         ${isRetro ? '!text-black underline' : ''}
                      `}
                   >
                      COPY CONTENT
                   </button>
                </div>

              </BouncyCard>
            );
          })
        )}
      </div>

      {renderFilterSheet()}
    </div>
  );
};
    