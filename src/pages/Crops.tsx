import { useState, useEffect } from "react";
import {
  Sprout,
  Search,
  Droplets,
  Zap,
  TrendingUp,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  Circle,
  Leaf,
  Calendar,
  Sun,
  AlertTriangle,
} from "lucide-react";
import { motion } from "motion/react";
import { cropService } from "../services/api";
import { CropRecommendation, Crop } from "../types";

const STAGES = [
  {
    id: "soil",
    title: "Soil Preparation",
    icon: Leaf,
    color: "bg-orange-500",
    lightColor: "bg-orange-50 dark:bg-orange-900/20",
    textColor: "text-orange-600 dark:text-orange-400",
    borderColor: "border-orange-200 dark:border-orange-800/40",
    desc: "Analyze pH levels and enrich with organic matter before planting season.",
    done: true,
  },
  {
    id: "planting",
    title: "Precision Planting",
    icon: Sprout,
    color: "bg-sage-600",
    lightColor: "bg-sage-50 dark:bg-sage-900/20",
    textColor: "text-sage-600 dark:text-sage-400",
    borderColor: "border-sage-200 dark:border-sage-800/40",
    desc: "Optimal seed depth and row spacing based on local field data.",
    done: true,
    current: false,
  },
  {
    id: "growth",
    title: "Vegetative Phase",
    icon: Zap,
    color: "bg-sky-500",
    lightColor: "bg-sky-50 dark:bg-sky-900/20",
    textColor: "text-sky-600 dark:text-sky-400",
    borderColor: "border-sky-200 dark:border-sky-800/40",
    desc: "Monitor leaf health, nutrient uptake, and canopy development.",
    current: true,
    done: false,
  },
  {
    id: "irrigation",
    title: "Water Management",
    icon: Droplets,
    color: "bg-blue-500",
    lightColor: "bg-blue-50 dark:bg-blue-900/20",
    textColor: "text-blue-600 dark:text-blue-400",
    borderColor: "border-blue-200 dark:border-blue-800/40",
    desc: "Scheduled irrigation based on evapotranspiration and soil sensors.",
    done: false,
  },
  {
    id: "harvest",
    title: "Strategic Harvest",
    icon: TrendingUp,
    color: "bg-amber-500",
    lightColor: "bg-amber-50 dark:bg-amber-900/20",
    textColor: "text-amber-600 dark:text-amber-400",
    borderColor: "border-amber-200 dark:border-amber-800/40",
    desc: "Maximise brix and moisture content alignment for optimal yield.",
    done: false,
  },
];

const SEASONAL_COLORS: Record<string, string> = {
  optimal: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800/40 text-emerald-700 dark:text-emerald-400",
  caution: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800/40 text-amber-700 dark:text-amber-400",
  risk: "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800/40 text-red-700 dark:text-red-400",
};

const seasonalStatus = ["optimal", "caution", "optimal", "optimal"];

export default function Crops() {
  const [crops, setCrops] = useState<CropRecommendation[]>([]);
  const [seasonalPlan, setSeasonalPlan] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<Crop[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [userPrefs, setUserPrefs] = useState<any>(null);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    const prefs = JSON.parse(localStorage.getItem("user_prefs") || "{}");
    setUserPrefs(prefs);
    const fetchCrops = async () => {
      const res = await cropService.getRecommendations();
      setCrops(res);
      if (prefs.crop && prefs.country) {
        const plan = await cropService.getSeasonalPlan(prefs.crop, prefs.country);
        setSeasonalPlan(plan);
      }
      setLoading(false);
    };
    fetchCrops();
  }, []);

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length > 1) {
      const results = await cropService.searchCrops(q);
      setSearchResults(results);
      setShowSearch(true);
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <div className="w-8 h-8 border-2 border-sage-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-stone-400 font-medium">Loading crop data...</p>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-8 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-stone-900 dark:text-white">Crop Advisor</h1>
        <p className="text-sm text-stone-400 mt-0.5">
          Farming guide for <span className="font-medium text-stone-600 dark:text-stone-300">{userPrefs?.crop}</span> · {userPrefs?.location}
        </p>
      </div>

      {/* === SEARCH BAR === */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          placeholder="Search crop database..."
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowSearch(true)}
          onBlur={() => setTimeout(() => setShowSearch(false), 150)}
          className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-[#111113] border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-600/30 focus:border-sage-500 dark:text-white transition-all shadow-sm"
        />
        {showSearch && searchResults.length > 0 && (
          <div className="absolute top-full mt-1.5 left-0 right-0 bg-white dark:bg-[#111113] border border-stone-200 dark:border-stone-800 rounded-xl shadow-xl z-50 overflow-hidden">
            {searchResults.map(crop => (
              <div
                key={crop.name}
                className="flex items-center justify-between px-4 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer border-b border-stone-100 dark:border-stone-800/40 last:border-0"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-stone-900 dark:text-white">{crop.name}</span>
                    <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-500 px-1.5 py-0.5 rounded-md font-semibold">{crop.category}</span>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">{crop.description}</p>
                </div>
                <ChevronRight size={14} className="text-stone-300 shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* === DUOLINGO-STYLE PROGRESSION TIMELINE === */}
      <div>
        <h2 className="text-sm font-semibold text-stone-900 dark:text-white mb-4">Farming Stages</h2>
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-stone-200 dark:bg-stone-800 rounded-full" />

          <div className="space-y-3">
            {STAGES.map((stage, i) => {
              const Icon = stage.icon;
              const isDone = stage.done;
              const isCurrent = stage.current;

              return (
                <motion.div
                  key={stage.id}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  className="relative flex items-start gap-4 pl-0"
                >
                  {/* Timeline node */}
                  <div className={`relative z-10 shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-all ${
                    isDone ? "bg-sage-600 text-white" :
                    isCurrent ? `${stage.color} text-white ring-4 ring-offset-2 ring-offset-[#f5f5f7] dark:ring-offset-[#0a0a0b] ring-stone-200 dark:ring-stone-700` :
                    "bg-stone-100 dark:bg-stone-800 text-stone-400"
                  }`}>
                    {isDone ? <CheckCircle2 size={18} /> : <Icon size={17} />}
                  </div>

                  {/* Content card */}
                  <div className={`flex-1 p-4 rounded-xl border transition-all ${
                    isCurrent
                      ? `${stage.lightColor} ${stage.borderColor}`
                      : isDone
                      ? "bg-stone-50 dark:bg-stone-900/50 border-stone-100 dark:border-stone-800/50"
                      : "bg-white dark:bg-[#111113] border-stone-200/80 dark:border-stone-800/80"
                  }`}>
                    <div className="flex items-center justify-between mb-1">
                      <p className={`text-sm font-semibold ${isCurrent ? stage.textColor : isDone ? "text-stone-500 dark:text-stone-400" : "text-stone-900 dark:text-white"}`}>
                        {stage.title}
                      </p>
                      {isCurrent && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stage.lightColor} ${stage.textColor} border ${stage.borderColor}`}>
                          In Progress
                        </span>
                      )}
                      {isDone && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                          Complete
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">{stage.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* === SEASONAL PLANNER — Google Calendar + Duolingo Style === */}
      <div>
        <h2 className="text-sm font-semibold text-stone-900 dark:text-white mb-3">Seasonal Planner</h2>
        <div className="bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl overflow-hidden shadow-sm">
          {/* Calendar Header */}
          <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-sage-600" />
              <p className="text-sm font-semibold text-stone-900 dark:text-white">{userPrefs?.crop} · {userPrefs?.country}</p>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-semibold">
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />Optimal</span>
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400"><span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />Caution</span>
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400"><span className="w-2 h-2 rounded-full bg-red-500 inline-block" />Risk</span>
            </div>
          </div>

          {/* Season Grid */}
          {seasonalPlan ? (
            <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(seasonalPlan).map(([season, activity], i) => (
                <div key={season} className={`p-3 rounded-xl border text-center transition-all hover:scale-[1.02] cursor-default ${SEASONAL_COLORS[seasonalStatus[i] ?? "optimal"]}`}>
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-70 mb-1 capitalize">{season}</p>
                  <p className="text-sm font-semibold">{activity as string}</p>
                  <div className="mt-2 flex justify-center">
                    {seasonalStatus[i] === "optimal" ? <CheckCircle2 size={12} className="opacity-60" /> :
                     seasonalStatus[i] === "caution" ? <AlertTriangle size={12} className="opacity-60" /> :
                     <Circle size={12} className="opacity-40" />}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-stone-400">No seasonal plan available</div>
          )}

          {/* Progress bar */}
          <div className="px-4 pb-4">
            <div className="flex items-center justify-between text-xs font-medium text-stone-500 mb-1.5">
              <span>Season Progress</span>
              <span>62% complete</span>
            </div>
            <div className="h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: "62%" }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-sage-500 to-emerald-500 rounded-full"
              />
            </div>
          </div>
        </div>
      </div>

      {/* === ALTERNATIVE CROPS — Notion Style === */}
      <div>
        <h2 className="text-sm font-semibold text-stone-900 dark:text-white mb-3">Alternative Crops</h2>
        <div className="bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl overflow-hidden shadow-sm divide-y divide-stone-100 dark:divide-stone-800/50">
          {crops.filter(c => c.name !== userPrefs?.crop).map((c, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3.5 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors cursor-pointer group">
              <div className="w-8 h-8 bg-sage-50 dark:bg-sage-900/20 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-sage-600 transition-colors">
                <Sprout size={15} className="text-sage-600 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-stone-900 dark:text-white">{c.name}</p>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    c.risk === "Low"
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                      : "bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                  }`}>
                    {c.risk} risk
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5 truncate">{c.advice}</p>
              </div>
              <div className="shrink-0 flex items-center gap-2.5">
                <div className="w-16 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${c.suitability}%` }}
                    transition={{ duration: 0.8 }}
                    className="h-full bg-sage-600 rounded-full"
                  />
                </div>
                <span className="text-xs font-semibold text-stone-500 w-8">{c.suitability}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
