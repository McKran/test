import { useState, useEffect } from "react";
import {
  Sprout,
  Search,
  Droplets,
  Zap,
  TrendingUp,
  ChevronRight,
  CheckCircle2,
  Leaf,
  Calendar,
  AlertTriangle,
  Info,
  Globe,
  Clock,
  Thermometer,
  RefreshCw,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { cropService } from "../services/api";
import { CropRecommendation, Crop, SeasonalCalendar } from "../types";

const STAGES = [
  { id: "soil", title: "Soil Preparation", icon: Leaf, desc: "Analyze pH levels and enrich with organic matter before planting." },
  { id: "planting", title: "Planting", icon: Sprout, desc: "Optimal seed depth and row spacing based on regional field data." },
  { id: "growth", title: "Vegetative Growth", icon: Zap, desc: "Monitor leaf health, nutrient uptake, and canopy development." },
  { id: "irrigation", title: "Water Management", icon: Droplets, desc: "Scheduled irrigation based on evapotranspiration and soil moisture." },
  { id: "harvest", title: "Harvest", icon: TrendingUp, desc: "Maximize yield at peak maturity with optimal timing." },
];

const MONTH_STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  plant: { bg: "bg-emerald-500", text: "text-white", label: "Plant" },
  harvest: { bg: "bg-amber-500", text: "text-white", label: "Harvest" },
  growing: { bg: "bg-sky-500", text: "text-white", label: "Growing" },
  none: { bg: "bg-stone-100 dark:bg-stone-800", text: "text-stone-400", label: "" },
};

export default function Crops() {
  const [crops, setCrops] = useState<CropRecommendation[]>([]);
  const [calendar, setCalendar] = useState<SeasonalCalendar | null>(null);
  const [searchResults, setSearchResults] = useState<Crop[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [calendarLoading, setCalendarLoading] = useState(false);
  const [userPrefs, setUserPrefs] = useState<any>(null);
  const [selectedCrop, setSelectedCrop] = useState<string>("");

  useEffect(() => {
    const prefs = JSON.parse(localStorage.getItem("user_prefs") || "{}");
    setUserPrefs(prefs);
    setSelectedCrop(prefs.crop || "");

    const init = async () => {
      const [rec, cal] = await Promise.all([
        cropService.getRecommendations(prefs.country),
        prefs.crop && prefs.country ? cropService.getSeasonalCalendar(prefs.crop, prefs.country) : Promise.resolve(null),
      ]);
      setCrops(rec);
      setCalendar(cal);
      setLoading(false);
    };
    init();
  }, []);

  const loadCalendar = async (crop: string) => {
    if (!userPrefs?.country || !crop) return;
    setCalendarLoading(true);
    try {
      const cal = await cropService.getSeasonalCalendar(crop, userPrefs.country);
      setCalendar(cal);
      setSelectedCrop(crop);
    } finally {
      setCalendarLoading(false);
    }
  };

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length > 1) {
      const results = await cropService.searchCrops(q);
      setSearchResults(results);
      setShowSearchResults(true);
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const selectCrop = (cropName: string) => {
    setShowSearchResults(false);
    setSearchQuery("");
    loadCalendar(cropName);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <div className="w-8 h-8 border-2 border-sage-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-stone-400 font-medium">Loading crop data...</p>
    </div>
  );

  const currentMonth = new Date().getMonth(); // 0-indexed

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-8 space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-stone-900 dark:text-white">Crop Advisor</h1>
        <p className="text-sm text-stone-400 mt-0.5">
          Seasonal planning for{" "}
          <span className="font-semibold text-stone-600 dark:text-stone-300">{selectedCrop || userPrefs?.crop}</span>
          {" "}·{" "}{userPrefs?.country}
        </p>
      </div>

      {/* === CROP SEARCH === */}
      <div className="relative">
        <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
        <input
          type="text"
          placeholder="Search 200+ crops by name or category..."
          value={searchQuery}
          onChange={e => handleSearch(e.target.value)}
          onFocus={() => searchResults.length > 0 && setShowSearchResults(true)}
          className="w-full pl-10 pr-10 py-3 text-sm bg-white dark:bg-[#111113] border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-600/30 focus:border-sage-500 dark:text-white transition-all shadow-sm"
        />
        {searchQuery && (
          <button onClick={() => { setSearchQuery(""); setSearchResults([]); setShowSearchResults(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
            <X size={15} />
          </button>
        )}

        <AnimatePresence>
          {showSearchResults && searchResults.length > 0 && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              className="absolute top-full mt-1.5 left-0 right-0 bg-white dark:bg-[#111113] border border-stone-200 dark:border-stone-800 rounded-xl shadow-xl z-50 overflow-hidden max-h-72 overflow-y-auto">
              {searchResults.map(crop => (
                <button key={crop.name} onClick={() => selectCrop(crop.name)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-sage-50 dark:hover:bg-sage-900/20 transition-colors border-b border-stone-100 dark:border-stone-800/40 last:border-0 text-left">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-stone-900 dark:text-white">{crop.name}</span>
                      <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-500 px-1.5 py-0.5 rounded-md font-semibold">{crop.category}</span>
                    </div>
                    <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{crop.description}</p>
                    <p className="text-[10px] text-stone-300 dark:text-stone-600 mt-0.5">{crop.growthCycle}</p>
                  </div>
                  <ChevronRight size={13} className="text-stone-300 shrink-0 ml-2" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* === SEASONAL CALENDAR === */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-white flex items-center gap-2">
            <Calendar size={15} className="text-sage-600" />
            Crop Calendar · {selectedCrop || userPrefs?.crop}
          </h2>
          {calendarLoading && <RefreshCw size={13} className="animate-spin text-stone-400" />}
        </div>

        <div className="bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl overflow-hidden shadow-sm">

          {/* Calendar Header Info */}
          {calendar && (
            <div className="px-4 py-3 border-b border-stone-100 dark:border-stone-800/60 bg-stone-50/50 dark:bg-stone-900/30">
              <div className="flex flex-wrap gap-3 text-xs">
                <div className="flex items-center gap-1.5">
                  <Globe size={12} className="text-stone-400" />
                  <span className="text-stone-500">{calendar.country} · {calendar.climateZone.replace(/_/g, " ")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock size={12} className="text-stone-400" />
                  <span className="text-stone-500">{calendar.growthDays} days to harvest</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Droplets size={12} className="text-stone-400" />
                  <span className="text-stone-500">{calendar.waterRequirement} water</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Thermometer size={12} className="text-stone-400" />
                  <span className="text-stone-500">{calendar.soilType}</span>
                </div>
              </div>
              {!calendar.availableInZone && (
                <div className="flex items-center gap-2 mt-2 text-xs text-amber-600 dark:text-amber-400">
                  <AlertTriangle size={11} />
                  <span>This crop may not be optimal for {calendar.climateZone.replace(/_/g, " ")} climate. Data shown is a general estimate.</span>
                </div>
              )}
            </div>
          )}

          {/* Month Grid */}
          <div className="p-4">
            <div className="grid grid-cols-12 gap-1">
              {(calendar?.monthlyStatus ?? Array.from({ length: 12 }, (_, i) => ({
                month: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][i],
                monthNum: i + 1, isPlanting: false, isHarvest: false, isGrowing: false,
                isCurrent: i === currentMonth, status: "none" as const,
              }))).map((ms, i) => {
                const colors = MONTH_STATUS_COLORS[ms.status];
                return (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <span className={`text-[9px] font-semibold ${ms.isCurrent ? "text-sage-600" : "text-stone-400"}`}>
                      {ms.month}
                    </span>
                    <div className={`w-full h-8 rounded-lg flex items-center justify-center text-[9px] font-bold transition-all ${
                      ms.isCurrent ? "ring-2 ring-sage-500 ring-offset-1 ring-offset-white dark:ring-offset-[#111113]" : ""
                    } ${colors.bg} ${colors.text}`}>
                      {ms.status !== "none" && colors.label.charAt(0)}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-stone-100 dark:border-stone-800/50">
              {[
                { color: "bg-emerald-500", label: "Plant" },
                { color: "bg-sky-500", label: "Growing" },
                { color: "bg-amber-500", label: "Harvest" },
                { color: "bg-stone-100 dark:bg-stone-800", label: "Off season" },
              ].map(({ color, label }) => (
                <div key={label} className="flex items-center gap-1.5 text-xs text-stone-500">
                  <div className={`w-3 h-3 rounded-sm ${color}`} />
                  {label}
                </div>
              ))}
              <div className="flex items-center gap-1.5 text-xs text-stone-500 ml-auto">
                <div className="w-3 h-3 rounded-sm ring-2 ring-sage-500 bg-transparent" />
                Current month
              </div>
            </div>
          </div>

          {/* Key Dates */}
          {calendar && calendar.availableInZone && (
            <div className="px-4 pb-4 grid grid-cols-2 gap-2">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-xl p-3">
                <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-1">Planting Window</p>
                <p className="text-sm font-semibold text-stone-900 dark:text-white">{calendar.plantingMonths.join(", ") || "Varies"}</p>
              </div>
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 rounded-xl p-3">
                <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider mb-1">Harvest Window</p>
                <p className="text-sm font-semibold text-stone-900 dark:text-white">{calendar.harvestMonths.join(", ") || "Varies"}</p>
              </div>
            </div>
          )}

          {/* Pro Tip */}
          {calendar?.tip && (
            <div className="mx-4 mb-4 flex items-start gap-2.5 p-3 bg-sage-50 dark:bg-sage-900/20 border border-sage-200 dark:border-sage-800/40 rounded-xl">
              <Info size={13} className="text-sage-600 shrink-0 mt-0.5" />
              <p className="text-xs text-sage-800 dark:text-sage-300 leading-relaxed">{calendar.tip}</p>
            </div>
          )}
        </div>
      </div>

      {/* === DUOLINGO-STYLE FARMING STAGES === */}
      <div>
        <h2 className="text-sm font-semibold text-stone-900 dark:text-white mb-4">Farming Stages</h2>
        <div className="relative">
          <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-stone-200 dark:bg-stone-800 rounded-full" />
          <div className="space-y-3">
            {STAGES.map((stage, i) => {
              const Icon = stage.icon;
              const isDone = i < 2;
              const isCurrent = i === 2;
              return (
                <motion.div key={stage.id} initial={{ opacity: 0, x: -8 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07 }}
                  className="relative flex items-start gap-4">
                  <div className={`relative z-10 shrink-0 w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${
                    isDone ? "bg-sage-600 text-white" :
                    isCurrent ? "bg-sky-500 text-white ring-4 ring-sky-200/50 dark:ring-sky-800/50" :
                    "bg-stone-100 dark:bg-stone-800 text-stone-400"
                  }`}>
                    {isDone ? <CheckCircle2 size={18} /> : <Icon size={17} />}
                  </div>
                  <div className={`flex-1 p-4 rounded-xl border transition-all ${
                    isCurrent ? "bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-800/40" :
                    isDone ? "bg-stone-50 dark:bg-stone-900/50 border-stone-100 dark:border-stone-800/50" :
                    "bg-white dark:bg-[#111113] border-stone-200/80 dark:border-stone-800/80"
                  }`}>
                    <div className="flex items-center justify-between mb-0.5">
                      <p className={`text-sm font-semibold ${
                        isCurrent ? "text-sky-700 dark:text-sky-300" :
                        isDone ? "text-stone-400" : "text-stone-900 dark:text-white"
                      }`}>{stage.title}</p>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-900/40 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800/40">
                          In Progress
                        </span>
                      )}
                      {isDone && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border border-emerald-200 dark:border-emerald-800/40">
                          Complete
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 leading-relaxed">{stage.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* === ALTERNATIVE CROP RECOMMENDATIONS (Notion-style) === */}
      <div>
        <h2 className="text-sm font-semibold text-stone-900 dark:text-white mb-3">
          Top Crops for {userPrefs?.country}
        </h2>
        <div className="bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl overflow-hidden shadow-sm divide-y divide-stone-100 dark:divide-stone-800/50">
          {crops.map((c, i) => (
            <button key={i} onClick={() => loadCalendar(c.name)}
              className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors group text-left">
              <div className="w-8 h-8 bg-sage-50 dark:bg-sage-900/20 rounded-lg flex items-center justify-center shrink-0 group-hover:bg-sage-600 transition-colors">
                <Sprout size={14} className="text-sage-600 group-hover:text-white transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className={`text-sm font-semibold ${c.name === selectedCrop ? "text-sage-600 dark:text-sage-400" : "text-stone-900 dark:text-white"}`}>
                    {c.name}
                    {c.name === selectedCrop && <span className="ml-1.5 text-[9px] font-bold bg-sage-100 dark:bg-sage-900/30 text-sage-600 px-1.5 py-0.5 rounded-full">Viewing</span>}
                  </p>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    c.risk === "Low" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" :
                    c.risk === "Medium" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600" :
                    "bg-red-50 dark:bg-red-900/20 text-red-500"
                  }`}>{c.risk}</span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">{c.advice}</p>
              </div>
              <div className="shrink-0 flex items-center gap-2">
                <div className="w-16 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} whileInView={{ width: `${c.suitability}%` }}
                    transition={{ duration: 0.8 }} className="h-full bg-sage-600 rounded-full" />
                </div>
                <span className="text-xs font-semibold text-stone-400 w-8">{c.suitability}%</span>
              </div>
            </button>
          ))}
        </div>
        <p className="text-xs text-center text-stone-400 mt-2">Tap a crop to view its seasonal calendar</p>
      </div>
    </div>
  );
}
