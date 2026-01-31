
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { createChatSession } from '../../services/geminiService';
import { ChatMessage, Theme } from '../../types';
import { Chat, GenerateContentResponse } from '@google/genai';

export const ChatWidget: React.FC = () => {
  const { settings } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: 'Hi! I am your Content Buddy assistant. How can I help you today?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  
  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && !chatSessionRef.current) {
      try {
        chatSessionRef.current = createChatSession();
      } catch (e) {
        console.error("Failed to init chat", e);
      }
    }
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !chatSessionRef.current) return;
    
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const result = await chatSessionRef.current.sendMessage({ message: userMsg });
      const responseText = (result as GenerateContentResponse).text || "I couldn't generate a response.";
      setMessages(prev => [...prev, { role: 'model', text: responseText }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Theme Logic
  let containerClass = 'bg-white text-slate-900 border border-slate-200 shadow-xl';
  let headerClass = 'bg-indigo-600 text-white';
  let inputAreaClass = 'bg-black/5';
  let userBubbleClass = 'bg-indigo-600 text-white';
  let modelBubbleClass = 'bg-black/5';
  let toggleButtonClass = 'bg-indigo-600 text-white';

  if (settings.theme === Theme.GLASS) {
    containerClass = 'bg-glass backdrop-blur-2xl border border-glass-border text-white shadow-2xl';
    headerClass = 'bg-white/10 border-b border-white/10 text-white';
    inputAreaClass = 'bg-white/5 border-t border-white/10';
    userBubbleClass = 'bg-white/20 text-white backdrop-blur-sm';
    modelBubbleClass = 'bg-black/20 text-white/90 backdrop-blur-sm';
    toggleButtonClass = 'bg-white/10 backdrop-blur-md border border-white/20 text-white';
  } else if (settings.theme === Theme.DARK) {
    containerClass = 'bg-slate-800 text-white border border-slate-700 shadow-xl';
    modelBubbleClass = 'bg-white/10';
    inputAreaClass = 'bg-white/5 border-t border-slate-700';
  } else if (settings.theme === Theme.ONE_UI_DARK) {
    containerClass = 'bg-[#1a1a1a] text-[#e0e0e0] border border-[#333] shadow-xl';
    headerClass = 'bg-[#7c4dff] text-white';
    inputAreaClass = 'bg-[#121212] border-t border-[#333]';
    userBubbleClass = 'bg-[#7c4dff] text-white';
    modelBubbleClass = 'bg-[#2c2c2c] text-[#e0e0e0]';
    toggleButtonClass = 'bg-[#7c4dff] text-white';
  } else if (settings.theme === Theme.LIGHT) {
    headerClass = 'bg-sky-500 text-white';
    userBubbleClass = 'bg-sky-500 text-white';
    toggleButtonClass = 'bg-sky-500 text-white';
  } else if (settings.theme === Theme.RETRO_3D) {
    containerClass = 'bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-lg';
    headerClass = 'bg-yellow-400 text-black border-b-2 border-black';
    inputAreaClass = 'bg-white border-t-2 border-black';
    userBubbleClass = 'bg-blue-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none';
    modelBubbleClass = 'bg-white text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-none';
    toggleButtonClass = 'bg-yellow-400 text-black border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rounded-lg';
  }

  // Universal 3D Override
  if (settings.experimentalFeatures && settings.enable3DMode && settings.theme !== Theme.RETRO_3D) {
      containerClass += " shadow-[0_8px_0_rgba(0,0,0,0.2)] mb-2 rounded-xl";
      toggleButtonClass += " shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none active:translate-y-1";
  }

  return (
    <div className="fixed bottom-24 right-6 z-50">
      {/* Chat Window */}
      {isOpen && (
        <div className={`mb-4 w-[90vw] md:w-80 h-[500px] rounded-3xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300 ${containerClass}`}>
          
          {/* Header */}
          <div className={`p-4 flex justify-between items-center ${headerClass}`}>
             <div className="flex items-center gap-2">
               <Sparkles size={18} />
               <span className="font-bold">Content Buddy AI</span>
             </div>
             <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-black/20 rounded-full transition-colors">
               <X size={20} />
             </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
             {messages.map((msg, idx) => (
               <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`
                   max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed
                   ${msg.role === 'user' 
                     ? `${userBubbleClass} rounded-tr-none` 
                     : `${modelBubbleClass} rounded-tl-none`}
                 `}>
                   {msg.text}
                 </div>
               </div>
             ))}
             {isLoading && (
               <div className="flex justify-start">
                 <div className={`p-3 rounded-2xl rounded-tl-none ${modelBubbleClass}`}>
                   <Loader2 size={16} className="animate-spin opacity-50" />
                 </div>
               </div>
             )}
             <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={`p-3 ${inputAreaClass}`}>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask anything..."
                className={`flex-1 bg-transparent outline-none text-sm px-2 ${settings.theme === Theme.GLASS ? 'placeholder-white/50' : ''}`}
              />
              <button 
                disabled={!input.trim() || isLoading}
                onClick={handleSend}
                className={`p-2 rounded-xl hover:opacity-90 disabled:opacity-50 transition-colors 
                    ${settings.theme === Theme.GLASS ? 'bg-white/20 text-white' : 'bg-indigo-600 text-white'} 
                    ${settings.theme === Theme.ONE_UI_DARK ? '!bg-[#7c4dff]' : ''} 
                    ${settings.theme === Theme.LIGHT ? '!bg-sky-500' : ''}
                    ${settings.theme === Theme.RETRO_3D ? '!bg-green-400 !text-black !border-2 !border-black !shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:!translate-x-[1px] active:!translate-y-[1px] active:!shadow-none !rounded-lg' : ''}
                `}
              >
                <Send size={16} />
              </button>
            </div>
             <div className="text-[10px] text-center mt-2 opacity-40">Powered by Gemini 3 Pro</div>
          </div>
        </div>
      )}

      {/* Toggle Button */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className={`
            w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95
            ${settings.bouncingAnimation && settings.theme !== Theme.RETRO_3D ? 'animate-bounce-short' : ''}
            ${toggleButtonClass}
          `}
        >
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
};
