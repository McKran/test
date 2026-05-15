import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Droplets,
  Wind,
  Sun,
  MapPin,
  TrendingUp,
  TrendingDown,
  Sprout,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  MessageSquare,
  Thermometer,
} from "lucide-react";
import { Link } from "react-router-dom";
import { weatherService, marketService, cropService } from "../services/api";
import { WeatherData, MarketPrice, CropRecommendation, UserPrefs } from "../types";

const StatPill = ({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) => (
  <div className="flex flex-col gap-1 p-4 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20">
    <Icon size={16} className="opacity-70" />
    <p className="text-lg font-semibold">{value}</p>
    <p className="text-[11px] font-medium opacity-60 uppercase tracking-wider">{label}</p>
  </div>
);

const MiniSparkline = ({ up }: { up: boolean }) => {
  const heights = [30, 50, 40, 65, 55, 80, 70, 90];
  return (
    <div className="flex items-end gap-0.5 h-8 w-16">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm transition-all ${up ? "bg-emerald-500/30" : "bg-red-400/30"} ${i === heights.length - 1 ? (up ? "bg-emerald-500" : "bg-red-400") : ""}`}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [crops, setCrops] = useState<CropRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPrefs, setUserPrefs] = useState<UserPrefs | null>(null);

  useEffect(() => {
    const prefs = JSON.parse(localStorage.getItem("user_prefs") || "{}");
    setUserPrefs(prefs);
    Promise.all([
      weatherService.getWeather(prefs.location),
      marketService.getPrices(prefs.currency),
      cropService.getRecommendations(),
    ]).then(([w, p, c]) => {
      setWeather(w);
      setPrices(p);
      setCrops(c);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <div className="w-8 h-8 border-2 border-sage-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-stone-400 font-medium">Loading dashboard...</p>
    </div>
  );

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-8 space-y-5">

      {/* Page Header */}
      <div>
        <p className="text-xs font-medium text-stone-400 uppercase tracking-widest">{today}</p>
        <h1 className="text-2xl font-bold text-stone-900 dark:text-white mt-0.5">Good morning, Farmer</h1>
      </div>

      {/* === WEATHER HERO — Google Weather Style === */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-sky-500 to-blue-600 dark:from-sky-800 dark:via-sky-900 dark:to-blue-950 text-white p-6 shadow-lg shadow-sky-200/40 dark:shadow-none"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 mb-3">
              <MapPin size={13} className="opacity-70" />
              <span className="text-sm font-medium opacity-80">{userPrefs?.location}</span>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-7xl font-bold tracking-tighter leading-none">{weather?.temp}°</span>
              <div className="mb-1">
                <p className="text-lg font-semibold">Mostly Sunny</p>
                <p className="text-sm opacity-60">Feels like {(weather?.temp ?? 0) + 2}°C</p>
              </div>
            </div>
            <p className="text-sm mt-2 opacity-60 font-medium">
              H:{(weather?.temp ?? 0) + 4}° · L:{(weather?.temp ?? 0) - 3}°
            </p>
          </div>
          <Sun size={72} className="opacity-20 shrink-0 mt-1" />
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <StatPill icon={Droplets} label="Humidity" value={`${weather?.humidity}%`} color="" />
          <StatPill icon={Wind} label="Wind" value="14 km/h" color="" />
          <StatPill icon={Thermometer} label="Rainfall" value={`${weather?.rainfall}mm`} color="" />
        </div>

        {/* Forecast pills */}
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1 scrollbar-hide">
          {weather?.forecast.map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1 px-3 py-2 bg-white/10 rounded-xl shrink-0">
              <span className="text-[11px] font-medium opacity-70">{i === 0 ? "Today" : day.day}</span>
              <Sun size={14} className="opacity-80" />
              <span className="text-sm font-semibold">{day.temp}°</span>
            </div>
          ))}
        </div>

        {/* Background glow */}
        <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      </motion.div>

      {/* === TWO COLUMN GRID === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Market Preview */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111113] rounded-2xl border border-stone-200/80 dark:border-stone-800/80 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-800/60">
            <div>
              <h2 className="text-sm font-semibold text-stone-900 dark:text-white">Market Overview</h2>
              <p className="text-xs text-stone-400 mt-0.5">Live commodity prices · {userPrefs?.currency}</p>
            </div>
            <Link to="/market" className="flex items-center gap-1 text-xs font-medium text-sage-600 hover:text-sage-700 transition-colors">
              Full view <ArrowRight size={13} />
            </Link>
          </div>
          <div className="divide-y divide-stone-100 dark:divide-stone-800/50">
            {prices.slice(0, 5).map((price, i) => {
              const isUp = price.trend === "up";
              const change = isUp ? "+3.12%" : "-1.84%";
              return (
                <div key={i} className="flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${isUp ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "bg-red-50 dark:bg-red-900/20 text-red-500"}`}>
                      {price.crop.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900 dark:text-white">{price.crop}</p>
                      <p className="text-[11px] text-stone-400">per {price.unit}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <MiniSparkline up={isUp} />
                    <div className="text-right min-w-[80px]">
                      <p className="text-sm font-semibold text-stone-900 dark:text-white">{price.currency} {price.price.toFixed(2)}</p>
                      <p className={`text-xs font-medium flex items-center justify-end gap-0.5 ${isUp ? "text-emerald-600" : "text-red-500"}`}>
                        {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
                        {change}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">

          {/* AI Insight Card */}
          <div className="bg-sage-900 dark:bg-sage-950 rounded-2xl p-5 text-white shadow-sm">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-7 h-7 bg-sage-700 rounded-lg flex items-center justify-center">
                <Sprout size={14} className="text-sage-300" />
              </div>
              <div>
                <p className="text-[11px] font-medium text-sage-400 uppercase tracking-wider">AI Insight</p>
                <p className="text-sm font-semibold text-white">Field Advisory</p>
              </div>
            </div>
            <p className="text-sm text-sage-200 leading-relaxed">
              Soil moisture in <span className="text-white font-medium">{userPrefs?.location}</span> is optimal for{" "}
              <span className="text-white font-medium">{userPrefs?.crop}</span> growth. Consider nitrogen enrichment within 48h.
            </p>
            <Link
              to="/chat"
              className="mt-4 flex items-center justify-between p-3 bg-sage-800 hover:bg-sage-700 rounded-xl transition-colors group"
            >
              <span className="text-sm font-medium">Ask AI Assistant</span>
              <MessageSquare size={15} className="group-hover:scale-110 transition-transform" />
            </Link>
          </div>

          {/* Alert Card */}
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">Weather Alert</p>
                <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                  Light rain expected Wednesday. Adjust irrigation schedule for {userPrefs?.crop}.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === CROP STATUS CARDS === */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-white">Crop Recommendations</h2>
          <Link to="/crops" className="flex items-center gap-1 text-xs font-medium text-sage-600 hover:text-sage-700 transition-colors">
            Details <ArrowRight size={13} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {crops.map((crop, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              className="bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-sage-300 dark:hover:border-sage-700 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-sage-50 dark:bg-sage-900/20 rounded-lg flex items-center justify-center group-hover:bg-sage-600 transition-colors">
                    <Sprout size={15} className="text-sage-600 group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-sm font-semibold text-stone-900 dark:text-white">{crop.name}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  crop.risk === "Low"
                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                }`}>
                  {crop.risk} risk
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex-1 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${crop.suitability}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-sage-600 rounded-full"
                  />
                </div>
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 shrink-0">{crop.suitability}%</span>
              </div>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed">{crop.advice}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* === QUICK ACTIONS === */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Check Weather", icon: Sun, to: "/weather", color: "bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400" },
          { label: "Market Prices", icon: TrendingUp, to: "/market", color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400" },
          { label: "Crop Planner", icon: Sprout, to: "/crops", color: "bg-sage-50 dark:bg-sage-900/20 text-sage-600 dark:text-sage-400" },
          { label: "AI Assistant", icon: MessageSquare, to: "/chat", color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400" },
        ].map(({ label, icon: Icon, to, color }) => (
          <Link
            key={to}
            to={to}
            className="flex items-center gap-2.5 p-3.5 bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-stone-800/80 rounded-xl hover:shadow-sm hover:border-stone-300 dark:hover:border-stone-700 transition-all"
          >
            <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${color}`}>
              <Icon size={14} />
            </div>
            <span className="text-xs font-medium text-stone-700 dark:text-stone-300">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
