import { useState, useRef, useEffect } from "react";
import {
  Bot, User, Sparkles, ArrowUp, Sprout, CloudSun, TrendingUp,
  Droplets, RotateCcw, BrainCircuit, BookOpen, MessageCircle, AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { aiService } from "../services/api";
import { ChatMessage } from "../types";
import ReactMarkdown from "react-markdown";

const SUGGESTIONS = [
  { icon: Sprout, label: "Best crop for this season?", color: "text-sage-600" },
  { icon: CloudSun, label: "How does rain affect my harvest?", color: "text-sky-600" },
  { icon: TrendingUp, label: "Market outlook this week", color: "text-emerald-600" },
  { icon: Droplets, label: "Irrigation schedule advice", color: "text-blue-600" },
];

const MODEL_META: Record<string, { icon: typeof BrainCircuit; label: string; color: string; bg: string }> = {
  "DeepSeek-R1": {
    icon: BrainCircuit, label: "DeepSeek-R1",
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800/40",
  },
  "Qwen-2.5": {
    icon: BookOpen, label: "Qwen-2.5",
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40",
  },
  "LLaMA-3": {
    icon: MessageCircle, label: "LLaMA-3",
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40",
  },
};

function getTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

const INITIAL_MESSAGE: ChatMessage = {
  role: "ai",
  content: "Hello! I'm your AI Agriculture Assistant powered by open-source models. I intelligently route your questions:\n\n- **DeepSeek-R1** — reasoning, analysis & farming decisions\n- **Qwen-2.5** — crop knowledge, facts & technical details\n- **LLaMA-3** — conversational farming advice\n\nWhat can I help you with today?",
  time: getTime(),
  model: "LLaMA-3",
};

export default function Chat() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const userPrefs = JSON.parse(localStorage.getItem("user_prefs") || "{}");

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isTyping]);

  const handleSend = async (text?: string) => {
    const msg = text ?? input;
    if (!msg.trim() || isTyping) return;
    const userMsg: ChatMessage = { role: "user", content: msg, time: getTime() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setError(null);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }));
      const { content, model } = await aiService.chat(msg, history, userPrefs);
      setMessages(prev => [...prev, { role: "ai", content, time: getTime(), model }]);
    } catch {
      setError("Could not reach the AI service. Please check your connection.");
      setMessages(prev => [...prev, {
        role: "ai",
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        time: getTime(), model: "LLaMA-3",
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] lg:h-screen max-w-3xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-stone-200/80 dark:border-stone-800/60 bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-sage-600 rounded-xl flex items-center justify-center shadow-sm">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900 dark:text-white">AgriAI Assistant</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              <p className="text-[11px] text-stone-400 font-medium">Open-source · Intelligent routing</p>
            </div>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5">
          {Object.entries(MODEL_META).map(([key, m]) => {
            const Icon = m.icon;
            return (
              <div key={key} className={`flex items-center gap-1 px-2 py-1 rounded-lg border text-[10px] font-semibold ${m.bg} ${m.color}`}>
                <Icon size={10} /> {m.label}
              </div>
            );
          })}
        </div>
        <button onClick={() => { setMessages([INITIAL_MESSAGE]); setError(null); }}
          className="p-2 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors ml-2">
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-950/20 border-b border-red-200 dark:border-red-800/40">
            <AlertCircle size={13} className="text-red-500 shrink-0" />
            <p className="text-xs text-red-600 dark:text-red-400 font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5 scroll-smooth">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => {
            const modelMeta = m.model ? MODEL_META[m.model] : null;
            const ModelIcon = modelMeta?.icon;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}
                className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                  m.role === "ai" ? "bg-sage-600 text-white" : "bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300"
                }`}>
                  {m.role === "ai" ? <Bot size={14} /> : <User size={14} />}
                </div>
                <div className={`flex flex-col gap-1.5 max-w-[82%] ${m.role === "user" ? "items-end" : "items-start"}`}>
                  <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                    m.role === "ai"
                      ? "bg-white dark:bg-[#1e1e22] border border-stone-200/80 dark:border-stone-800/60 text-stone-800 dark:text-stone-200 shadow-sm"
                      : "bg-sage-600 text-white"
                  }`}>
                    {m.role === "ai" ? (
                      <div className="markdown-body prose prose-sm dark:prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5">
                        <ReactMarkdown>{m.content}</ReactMarkdown>
                      </div>
                    ) : m.content}
                  </div>
                  <div className={`flex items-center gap-2 px-1 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                    <span className="text-[10px] text-stone-400 font-medium">{m.time}</span>
                    {m.role === "ai" && m.model && modelMeta && ModelIcon && (
                      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border text-[10px] font-semibold ${modelMeta.bg} ${modelMeta.color}`}>
                        <ModelIcon size={9} /> {modelMeta.label}
                      </div>
                    )}
                    {m.role === "ai" && <Sparkles size={10} className="text-sage-400" />}
                  </div>
                </div>
              </motion.div>
            );
          })}
          {isTyping && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-3">
              <div className="w-7 h-7 rounded-lg bg-sage-600 text-white flex items-center justify-center shrink-0">
                <Bot size={14} />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white dark:bg-[#1e1e22] border border-stone-200/80 dark:border-stone-800/60 shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-sage-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-sage-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-sage-400 rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <AnimatePresence>
        {messages.length <= 1 && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }}
            className="px-4 sm:px-6 pb-3 shrink-0">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-2">Quick prompts</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(({ icon: Icon, label, color }) => (
                <button key={label} onClick={() => handleSend(label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-stone-200/80 dark:border-stone-800/60 bg-white dark:bg-[#1e1e22] hover:border-sage-400 dark:hover:border-sage-700 transition-all ${color}`}>
                  <Icon size={12} /> {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input */}
      <div className="px-4 sm:px-6 pb-5 pt-2 shrink-0 border-t border-stone-100 dark:border-stone-800/60 bg-white/90 dark:bg-[#18181b]/90 backdrop-blur-xl">
        <div className={`flex items-end gap-2 bg-white dark:bg-[#1e1e22] border rounded-2xl px-4 py-3 shadow-sm transition-all ${
          input.trim() ? "border-sage-400 dark:border-sage-700" : "border-stone-200 dark:border-stone-800"
        }`}>
          <textarea ref={textareaRef} rows={1}
            placeholder="Ask about crops, markets, weather, or farming strategy..."
            value={input} onChange={handleTextareaChange} onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 resize-none focus:outline-none leading-relaxed"
            style={{ maxHeight: "160px" }} />
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => handleSend()} disabled={!input.trim() || isTyping}
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
              input.trim() && !isTyping ? "bg-sage-600 hover:bg-sage-700 text-white shadow-sm" : "bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-not-allowed"
            }`}>
            <ArrowUp size={15} strokeWidth={2.5} />
          </motion.button>
        </div>
        <p className="text-[10px] text-center text-stone-400 mt-2 font-medium">
          DeepSeek-R1 · Qwen-2.5 · LLaMA-3 · Open-source routing · Verify critical decisions
        </p>
      </div>
    </div>
  );
}
