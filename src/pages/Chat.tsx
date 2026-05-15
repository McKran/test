import { useState } from "react";
import { 
  Bot, 
  User, 
  Sparkles, 
  Paperclip, 
  ArrowUp,
  BrainCircuit,
  MessageSquare,
  Cpu
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  role: "user" | "ai";
  content: string;
  source?: string;
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "ai", content: "Greetings. I am the AI Agriculture Assistant, operating on the modular intelligence framework. How can I assist your farming operations today?", source: "DeepSeek-R1" }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMsg: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = { 
        role: "ai", 
        content: `Based on your request regarding "${input}", I've analyzed local soil data and current market volatility. I recommend early irrigation cycles this week.`,
        source: "Qwen-2.5"
      };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col relative mt-4">
      
      {/* Top Model Indicator */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4 p-2 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm">
         <div className="flex -space-x-2">
            <div className="w-8 h-8 rounded-lg bg-sage-600 flex items-center justify-center text-white shadow-sm"><Cpu size={14} /></div>
            <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white shadow-sm"><BrainCircuit size={14} /></div>
         </div>
         <span className="text-[10px] font-black uppercase tracking-widest text-stone-500 px-2">Agri-Neural Routing Active</span>
      </div>

      {/* Message History */}
      <div className="flex-1 overflow-y-auto pt-20 pb-40 space-y-8 px-4 scrollbar-hide">
        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-6 ${m.role === 'ai' ? 'max-w-3xl' : 'max-w-xl ml-auto flex-row-reverse'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${m.role === 'ai' ? 'bg-sage-600 text-white' : 'bg-stone-100 dark:bg-stone-800 text-stone-500'}`}>
                {m.role === 'ai' ? <Bot size={20} /> : <User size={20} />}
              </div>
              <div className="space-y-4">
                <div className={`p-6 rounded-[2.5rem] text-lg leading-relaxed shadow-sm ${m.role === 'ai' ? 'bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 border border-stone-100 dark:border-stone-800' : 'bg-sage-600 text-white font-medium'}`}>
                  {m.content}
                </div>
                {m.source && (
                  <div className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest px-4">
                     <Sparkles size={12} className="text-sage-500" />
                     Routed via {m.source}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <div className="flex gap-6 max-w-3xl">
              <div className="w-10 h-10 rounded-xl bg-sage-600 text-white flex items-center justify-center shrink-0 animate-pulse">
                <Bot size={20} />
              </div>
              <div className="flex gap-2 items-center p-6 bg-white dark:bg-stone-900 rounded-[2.5rem] border border-stone-100 dark:border-stone-800">
                 <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                 <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                 <div className="w-2 h-2 bg-stone-300 rounded-full animate-bounce" />
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* ChatGPT Style Input Bar */}
      <div className="absolute bottom-8 left-4 right-4 z-30">
        <div className="relative glass-card p-2 bg-white dark:bg-stone-900 border-2 border-stone-200 dark:border-stone-800 rounded-[2.5rem] shadow-2xl focus-within:border-sage-600 transition-all max-w-3xl mx-auto">
          <div className="flex items-center gap-4 px-4 py-2">
            <button className="p-2 text-stone-400 hover:text-sage-600 transition-colors">
              <Paperclip size={24} />
            </button>
            <textarea 
              rows={1}
              placeholder="Ask the AI about your crops..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
              className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-medium dark:text-white resize-none py-2"
            />
            <motion.button 
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSend}
              className={`p-4 rounded-full transition-all flex items-center justify-center ${input.trim() ? 'bg-sage-600 text-white shadow-lg shadow-sage-200' : 'bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-not-allowed'}`}
              disabled={!input.trim()}
            >
              <ArrowUp size={24} strokeWidth={3} />
            </motion.button>
          </div>
          <div className="flex items-center gap-6 px-6 py-2 border-t border-stone-50 dark:border-stone-800/30">
             <div className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                <MessageSquare size={12} />
                Global Knowledge base
             </div>
             <div className="flex items-center gap-2 text-[10px] font-black text-stone-400 uppercase tracking-widest">
                <BrainCircuit size={12} />
                Modular Routing
             </div>
          </div>
        </div>
        <p className="text-[10px] text-center mt-4 text-stone-400 font-bold uppercase tracking-widest">AI can make mistakes. Verify critical agronomic decisions.</p>
      </div>

    </div>
  );
}
