import { useState, useRef, useEffect } from "react";
import {
  Bot,
  User,
  Sparkles,
  ArrowUp,
  Sprout,
  CloudSun,
  TrendingUp,
  Droplets,
  RotateCcw,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface Message {
  role: "user" | "ai";
  content: string;
  time?: string;
}

const SUGGESTIONS = [
  { icon: Sprout, label: "Best crop for this season?", color: "text-sage-600 bg-sage-50 dark:bg-sage-900/20" },
  { icon: CloudSun, label: "Rain impact on harvest", color: "text-sky-600 bg-sky-50 dark:bg-sky-900/20" },
  { icon: TrendingUp, label: "Market outlook this week", color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" },
  { icon: Droplets, label: "Irrigation schedule advice", color: "text-blue-600 bg-blue-50 dark:bg-blue-900/20" },
];

const MOCK_RESPONSES: Record<string, string> = {
  default: "Based on your farm's current conditions, I'd recommend monitoring soil moisture levels closely over the next 48 hours. The forecasted temperature drop on Wednesday could affect nutrient uptake in your crops. Consider a light phosphorus supplement before the weekend.",
  season: "For this season in your region, the top-performing crops are Corn (92% suitability), Millet (85%), and Soybeans (78%). Corn has the highest yield potential given current soil moisture and temperature forecasts.",
  rain: "The expected rainfall on Wednesday (12–18mm) will be beneficial but watch for waterlogging in low-lying areas. I'd suggest postponing any fertilizer application by at least 24 hours after rainfall to prevent nutrient runoff.",
  market: "This week, Wheat prices are up 1.4% and Soybeans showing a strong +3.2% gain. Rice remains stable. If you're planning a sale, the next 5–7 days look favorable for Soybeans based on current commodity trends.",
  irrigation: "Based on current evapotranspiration rates and soil moisture readings, your next full irrigation cycle should begin in approximately 2 days. Early morning (5–7 AM) irrigation reduces evaporation loss by up to 30% in your climate zone.",
};

function getResponse(input: string): string {
  const lower = input.toLowerCase();
  if (lower.includes("season") || lower.includes("crop")) return MOCK_RESPONSES.season;
  if (lower.includes("rain") || lower.includes("harvest")) return MOCK_RESPONSES.rain;
  if (lower.includes("market") || lower.includes("price")) return MOCK_RESPONSES.market;
  if (lower.includes("irrigation") || lower.includes("water")) return MOCK_RESPONSES.irrigation;
  return MOCK_RESPONSES.default;
}

function getTime() {
  return new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Hello! I'm your AI Agriculture Assistant. Ask me anything about your crops, weather impact, market trends, or farming advice.",
      time: getTime(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const userPrefs = JSON.parse(localStorage.getItem("user_prefs") || "{}");

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text?: string) => {
    const msg = text ?? input;
    if (!msg.trim() || isTyping) return;

    setMessages(prev => [...prev, { role: "user", content: msg, time: getTime() }]);
    setInput("");
    setIsTyping(true);

    if (textareaRef.current) textareaRef.current.style.height = "auto";

    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: "ai", content: getResponse(msg), time: getTime() },
      ]);
      setIsTyping(false);
    }, 1200 + Math.random() * 600);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
  };

  const showSuggestions = messages.length <= 1;

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] lg:h-screen max-w-3xl mx-auto w-full">

      {/* Header */}
      <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-stone-200/80 dark:border-stone-800/80 bg-white/80 dark:bg-[#111113]/80 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-sage-600 rounded-xl flex items-center justify-center shadow-sm">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-stone-900 dark:text-white">AgriAI Assistant</p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <p className="text-[11px] text-stone-400 font-medium">
                {userPrefs?.aiMode ? `${userPrefs.aiMode} mode` : "Active"}
              </p>
            </div>
          </div>
        </div>
        <button
          onClick={() => setMessages([{ role: "ai", content: "Hello! I'm your AI Agriculture Assistant. Ask me anything about your crops, weather impact, market trends, or farming advice.", time: getTime() }])}
          className="p-2 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title="Clear conversation"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5 space-y-5 scroll-smooth">

        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
            >
              {/* Avatar */}
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                m.role === "ai" ? "bg-sage-600 text-white" : "bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300"
              }`}>
                {m.role === "ai" ? <Bot size={14} /> : <User size={14} />}
              </div>

              {/* Bubble */}
              <div className={`flex flex-col gap-1 max-w-[80%] ${m.role === "user" ? "items-end" : "items-start"}`}>
                <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  m.role === "ai"
                    ? "bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-stone-800/80 text-stone-800 dark:text-stone-200 shadow-sm"
                    : "bg-sage-600 text-white"
                }`}>
                  {m.content}
                </div>
                <div className={`flex items-center gap-1.5 px-1 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  {m.role === "ai" && <Sparkles size={10} className="text-sage-500" />}
                  <span className="text-[10px] text-stone-400 font-medium">{m.time}</span>
                </div>
              </div>
            </motion.div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex gap-3"
            >
              <div className="w-7 h-7 rounded-lg bg-sage-600 text-white flex items-center justify-center shrink-0">
                <Bot size={14} />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-stone-800/80 shadow-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-stone-300 dark:bg-stone-600 rounded-full animate-bounce [animation-delay:-0.3s]" />
                <span className="w-1.5 h-1.5 bg-stone-300 dark:bg-stone-600 rounded-full animate-bounce [animation-delay:-0.15s]" />
                <span className="w-1.5 h-1.5 bg-stone-300 dark:bg-stone-600 rounded-full animate-bounce" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Suggestions (show on fresh chat) */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="px-4 sm:px-6 pb-3 shrink-0"
          >
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest mb-2">Quick prompts</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map(({ icon: Icon, label, color }) => (
                <button
                  key={label}
                  onClick={() => handleSend(label)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-[#111113] hover:border-sage-400 dark:hover:border-sage-700 transition-all ${color.split(" ")[0]}`}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Input Bar — ChatGPT Style */}
      <div className="px-4 sm:px-6 pb-5 pt-2 shrink-0 border-t border-stone-100 dark:border-stone-800/60 bg-white/80 dark:bg-[#111113]/80 backdrop-blur-xl">
        <div className={`flex items-end gap-2 bg-white dark:bg-[#111113] border rounded-2xl px-4 py-3 shadow-sm transition-all ${
          input.trim() ? "border-sage-400 dark:border-sage-700" : "border-stone-200 dark:border-stone-800"
        }`}>
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Ask about your crops, markets, or weather..."
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            className="flex-1 bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 resize-none focus:outline-none leading-relaxed"
            style={{ maxHeight: "160px" }}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all ${
              input.trim() && !isTyping
                ? "bg-sage-600 hover:bg-sage-700 text-white shadow-sm"
                : "bg-stone-100 dark:bg-stone-800 text-stone-400 cursor-not-allowed"
            }`}
          >
            <ArrowUp size={15} strokeWidth={2.5} />
          </motion.button>
        </div>
        <p className="text-[10px] text-center text-stone-400 mt-2 font-medium">
          AI responses are for guidance only · Verify critical decisions
        </p>
      </div>
    </div>
  );
}
