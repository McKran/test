import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Leaf, 
  MapPin, 
  Sprout, 
  ArrowRight, 
  CheckCircle2, 
  Globe, 
  Zap, 
  Users, 
  ShieldCheck,
  Settings,
  Scale,
  CloudLightning
} from "lucide-react";
import { UserPrefs } from "../types";

interface OnboardingProps {
  onComplete: (data: UserPrefs) => void;
}

const CROPS = ["Rice", "Corn", "Wheat", "Soybeans", "Potatoes", "Tomatoes", "Coffee", "Cotton", "Grapes", "Sugarcane"];
const COUNTRIES = [
  { name: "USA", currency: "USD" },
  { name: "India", currency: "INR" },
  { name: "China", currency: "CNY" },
  { name: "Japan", currency: "JPY" },
  { name: "UK", currency: "GBP" },
  { name: "Philippines", currency: "PHP" },
  { name: "Brazil", currency: "BRL" },
  { name: "Vietnam", currency: "VND" }
];

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [step, setStep] = useState(1);
  const [prefs, setPrefs] = useState<Partial<UserPrefs>>({
    units: "kg",
    marketScope: "both",
    realtimeData: true,
    aiMode: "balanced",
    aiFlexibility: "flexible"
  });

  const totalSteps = 6;

  const updatePrefs = (newPrefs: Partial<UserPrefs>) => {
    setPrefs(prev => ({ ...prev, ...newPrefs }));
  };

  const nextStep = () => setStep(s => Math.min(s + 1, totalSteps));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleComplete = () => {
    if (prefs.crop && prefs.location && prefs.country) {
      onComplete(prefs as UserPrefs);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] bg-stone-50 dark:bg-[#0f1115] flex items-center justify-center p-4">
      <div className="max-w-xl w-full">
        <motion.div 
          layout
          className="bg-white dark:bg-stone-900 p-8 rounded-[2.5rem] shadow-2xl border border-stone-200 dark:border-stone-800"
        >
          {/* Progress Bar */}
          <div className="flex gap-1 mb-10 h-1 rounded-full bg-stone-100 dark:bg-stone-800 overflow-hidden">
            <motion.div 
              className="bg-sage-600 h-full"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-sage-600 text-white rounded-2xl shadow-lg shadow-sage-200 dark:shadow-none">
                    <Leaf />
                  </div>
                  <h1 className="text-3xl font-bold tracking-tighter">AgriAI</h1>
                </div>
                <h2 className="text-3xl font-bold mb-4">Professional Farming Setup</h2>
                <p className="text-stone-500 dark:text-stone-400 mb-10 leading-relaxed text-lg">
                  Welcome to your independent agricultural intelligence suite. Let's configure your workspace for peak efficiency.
                </p>
                <button 
                  onClick={nextStep}
                  className="w-full py-5 bg-sage-600 hover:bg-sage-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-xl shadow-sage-100 dark:shadow-none"
                >
                  Start Configuration <ArrowRight size={20} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Globe className="text-sage-600" />
                  Regional Intelligence
                </h2>
                <p className="text-stone-500 dark:text-stone-400 mb-8">
                  Specify your region and currency for localized market analysis.
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {COUNTRIES.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => updatePrefs({ country: c.name, currency: c.currency })}
                      className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all text-left ${
                        prefs.country === c.name 
                          ? "border-sage-600 bg-sage-50 text-sage-600 dark:bg-sage-900/30" 
                          : "border-stone-100 dark:border-stone-800 text-stone-500"
                      }`}
                    >
                      <div className="text-xs uppercase text-stone-400 mb-1 tracking-widest">{c.currency}</div>
                      {c.name}
                    </button>
                  ))}
                </div>

                <input 
                  type="text"
                  value={prefs.location || ""}
                  onChange={(e) => updatePrefs({ location: e.target.value })}
                  placeholder="Specific Area (e.g. San Joaquin County, CA)"
                  className="w-full p-5 bg-stone-50 dark:bg-stone-800 border-2 border-transparent focus:border-sage-600 rounded-2xl mb-8 outline-none transition-all dark:text-white"
                />

                <div className="flex gap-4">
                  <button onClick={prevStep} className="flex-1 py-4 font-bold text-stone-400">Back</button>
                  <button 
                    disabled={!prefs.location || !prefs.country}
                    onClick={nextStep}
                    className="flex-[2] py-4 bg-sage-600 text-white rounded-2xl font-bold shadow-lg disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Sprout className="text-sage-600" />
                  Crop & Market Focus
                </h2>
                <p className="text-stone-500 dark:text-stone-400 mb-8">
                  Your primary focus shapes recommendations and seasonal alerts.
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  {CROPS.map((crop) => (
                    <button
                      key={crop}
                      onClick={() => updatePrefs({ crop })}
                      className={`p-4 rounded-2xl border-2 text-sm font-bold transition-all flex items-center justify-between ${
                        prefs.crop === crop 
                          ? "border-sage-600 bg-sage-50 text-sage-600 dark:bg-sage-900/30" 
                          : "border-stone-100 dark:border-stone-800 text-stone-500"
                      }`}
                    >
                      {crop}
                      {prefs.crop === crop && <CheckCircle2 size={16} />}
                    </button>
                  ))}
                </div>

                <div className="space-y-4 mb-8">
                  <p className="font-bold text-sm text-stone-400 uppercase tracking-widest px-1">Market Scope</p>
                  <div className="flex p-1 bg-stone-100 dark:bg-stone-800 rounded-2xl">
                    {(["local", "international", "both"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => updatePrefs({ marketScope: s })}
                        className={`flex-1 py-3 text-xs font-bold rounded-xl transition-all capitalize ${prefs.marketScope === s ? "bg-white dark:bg-stone-700 shadow-sm text-sage-600" : "text-stone-500"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={prevStep} className="flex-1 py-4 font-bold text-stone-400">Back</button>
                  <button 
                    disabled={!prefs.crop}
                    onClick={nextStep}
                    className="flex-[2] py-4 bg-sage-600 text-white rounded-2xl font-bold shadow-lg"
                  >
                    Next Step
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Zap className="text-sage-600" />
                  AI & Analysis Config
                </h2>
                <p className="text-stone-500 dark:text-stone-400 mb-8">
                  Tune the Open-Source AI engine to your specific farming style.
                </p>

                <div className="space-y-6 mb-10">
                  <div className="p-5 bg-sage-50 dark:bg-sage-900/10 rounded-3xl border border-sage-100 dark:border-sage-900/30">
                    <div className="flex justify-between items-center mb-4">
                      <p className="font-bold">Real-time Internet Sync</p>
                      <button 
                        onClick={() => updatePrefs({ realtimeData: !prefs.realtimeData })}
                        className={`w-12 h-6 rounded-full transition-all relative ${prefs.realtimeData ? "bg-sage-600" : "bg-stone-300"}`}
                      >
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-all ${prefs.realtimeData ? "translate-x-6" : ""}`} />
                      </button>
                    </div>
                    <p className="text-xs text-sage-700/70 dark:text-sage-300/50 leading-relaxed">
                      Fetches live weather, market fluctuations, and global news via web-search modules.
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {(["fast", "balanced", "expert"] as const).map((m) => (
                      <button
                        key={m}
                        onClick={() => updatePrefs({ aiMode: m })}
                        className={`p-4 rounded-2xl border-2 text-xs font-bold transition-all text-center ${
                          prefs.aiMode === m 
                            ? "border-sage-600 bg-sage-50 text-sage-600 dark:bg-sage-900/30" 
                            : "border-stone-100 dark:border-stone-800 text-stone-500"
                        }`}
                      >
                        <div className="mb-2 opacity-60">
                          {m === 'fast' && <Zap size={16} className="mx-auto" />}
                          {m === 'balanced' && <Scale size={16} className="mx-auto" />}
                          {m === 'expert' && <ShieldCheck size={16} className="mx-auto" />}
                        </div>
                        <span className="capitalize">{m} Mode</span>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    {(["strict", "flexible"] as const).map((f) => (
                      <button
                        key={f}
                        onClick={() => updatePrefs({ aiFlexibility: f })}
                        className={`flex-1 p-4 rounded-2xl border-2 text-xs font-bold transition-all text-center ${
                          prefs.aiFlexibility === f 
                            ? "border-sage-600 bg-sage-50 text-sage-600 dark:bg-sage-900/30" 
                            : "border-stone-100 dark:border-stone-800 text-stone-500"
                        }`}
                      >
                        {f === 'strict' ? 'Strict seasonal rules' : 'Flexible AI advice'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={prevStep} className="flex-1 py-4 font-bold text-stone-400">Back</button>
                  <button onClick={nextStep} className="flex-[2] py-4 bg-sage-600 text-white rounded-2xl font-bold shadow-lg">Next</button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Scale className="text-sage-600" />
                  Units & Measurements
                </h2>
                <p className="text-stone-500 dark:text-stone-400 mb-8">
                  Set your preferred defaults for inventory and market display.
                </p>

                <div className="grid grid-cols-3 gap-4 mb-10">
                  {(["kg", "ton", "gram"] as const).map((u) => (
                    <button
                      key={u}
                      onClick={() => updatePrefs({ units: u })}
                      className={`p-6 rounded-3xl border-2 transition-all text-center ${
                        prefs.units === u 
                          ? "border-sage-600 bg-sage-50 text-sage-600 dark:bg-sage-900/30" 
                          : "border-stone-100 dark:border-stone-800 text-stone-500"
                      }`}
                    >
                      <div className="text-2xl font-black mb-1 uppercase">{u}</div>
                      <div className="text-xs opacity-60">Professional</div>
                    </button>
                  ))}
                </div>

                <div className="p-6 bg-stone-50 dark:bg-stone-800 rounded-3xl mb-10 border border-stone-200 dark:border-stone-700">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white dark:bg-stone-700 rounded-2xl text-sage-600">
                      <Settings size={24} />
                    </div>
                    <div>
                      <p className="font-bold mb-1">Global Standard</p>
                      <p className="text-xs text-stone-500 leading-relaxed">
                        These units will be used for all internal calculations, profit margins, and AI reasoning. You can swap them per-view in the market page later.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={prevStep} className="flex-1 py-4 font-bold text-stone-400">Back</button>
                  <button onClick={nextStep} className="flex-[2] py-4 bg-sage-600 text-white rounded-2xl font-bold shadow-lg">Finalize Setup</button>
                </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div
                key="step6"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <div className="w-24 h-24 bg-sage-100 dark:bg-sage-900/30 text-sage-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
                  <CloudLightning size={44} />
                </div>
                <h2 className="text-3xl font-bold mb-4">Independent Engine Ready</h2>
                <p className="text-stone-500 dark:text-stone-400 mb-12 leading-relaxed text-lg max-w-sm mx-auto">
                  Your modular agriculture environment is fully configured and ready for production use.
                </p>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleComplete}
                  className="w-full py-6 bg-sage-900 text-white rounded-[2rem] font-bold text-lg shadow-2xl transition-all"
                >
                  Enter Command Center
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
