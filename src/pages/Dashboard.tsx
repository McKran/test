import { useState, useEffect } from "react";
import { motion } from "motion/react";
import {
  Droplets,
  Wind,
  TrendingUp,
  TrendingDown,
  Sprout,
  ArrowRight,
  AlertTriangle,
  MessageSquare,
  Thermometer,
  Minus,
  Sun,
  Cloud,
  CloudRain,
  MapPin,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";
import { weatherService, marketService, cropService } from "../services/api";
import { WeatherData, MarketPrice, CropRecommendation, UserPrefs } from "../types";

const WeatherIcon = ({ icon, size = 18 }: { icon: string; size?: number }) => {
  if (icon === "rain" || icon === "drizzle") return <CloudRain size={size} className="text-sky-400" />;
  if (icon === "cloud") return <Cloud size={size} className="text-stone-400" />;
  if (icon === "storm") return <CloudRain size={size} className="text-purple-400" />;
  return <Sun size={size} className="text-amber-400" />;
};

const MiniSparkline = ({ up, stable }: { up: boolean; stable: boolean }) => {
  const heights = stable ? [50, 52, 48, 53, 50, 51, 52, 50] : up ? [30, 38, 35, 55, 60, 70, 78, 88] : [88, 75, 68, 58, 50, 42, 35, 28];
  return (
    <div className="flex items-end gap-0.5 h-7 w-14">
      {heights.map((h, i) => (
        <div key={i} className={`flex-1 rounded-sm ${i === heights.length - 1 ? (stable ? "bg-stone-400" : up ? "bg-emerald-500" : "bg-red-400") : (stable ? "bg-stone-200 dark:bg-stone-700" : up ? "bg-emerald-500/20" : "bg-red-400/20")}`}
          style={{ height: `${h}%` }} />
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [crops, setCrops] = useState<CropRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userPrefs, setUserPrefs] = useState<UserPrefs | null>(null);

  const fetchData = async (prefs: UserPrefs) => {
    const [w, p, c] = await Promise.all([
      weatherService.getWeather(prefs.location),
      marketService.getPrices(prefs.currency, prefs.country),
      cropService.getRecommendations(prefs.country),
    ]);
    setWeather(w);
    setPrices(p);
    setCrops(c);
  };

  useEffect(() => {
    const prefs = JSON.parse(localStorage.getItem("user_prefs") || "{}") as UserPrefs;
    setUserPrefs(prefs);
    fetchData(prefs).finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    if (!userPrefs || refreshing) return;
    setRefreshing(true);
    await fetchData(userPrefs).catch(() => {});
    setRefreshing(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <div className="w-8 h-8 border-2 border-sage-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-stone-400 font-medium">Loading your farm data...</p>
    </div>
  );

  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  const mainCondition = weather?.condition ?? "Clear Sky";
  const mainIcon = weather?.icon ?? "sun";

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-8 space-y-5">

      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-stone-400 uppercase tracking-widest">{today}</p>
          <h1 className="text-xl font-bold text-stone-900 dark:text-white mt-0.5">Dashboard</h1>
          {weather?.country && (
            <div className="flex items-center gap-1 mt-1">
              <MapPin size={12} className="text-stone-400" />
              <span className="text-xs text-stone-400">{weather.location}{weather.country !== "Unknown" ? `, ${weather.country}` : ""}</span>
            </div>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="p-2 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
          title="Refresh data"
        >
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* === WEATHER HERO === */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-sky-500 via-sky-500 to-blue-700 dark:from-sky-900 dark:to-blue-950 text-white p-6 shadow-lg shadow-sky-200/30 dark:shadow-none"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium opacity-70 mb-3">{mainCondition}</p>
            <div className="flex items-end gap-3">
              <span className="text-7xl font-bold tracking-tighter leading-none">{weather?.temp ?? "--"}°</span>
              <div className="mb-2 space-y-0.5">
                <p className="text-sm opacity-60">Feels like {weather?.feelsLike ?? "--"}°</p>
                <p className="text-sm opacity-60">H:{(weather?.temp ?? 0) + (weather?.forecast[0]?.tempMax ? weather.forecast[0].tempMax - weather.temp : 4)}° · L:{(weather?.temp ?? 0) - 3}°</p>
              </div>
            </div>
          </div>
          <div className="shrink-0 mt-1">
            <WeatherIcon icon={mainIcon} size={72} />
          </div>
        </div>

        {/* Stat row */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          {[
            { icon: Droplets, label: "Humidity", value: `${weather?.humidity ?? "--"}%` },
            { icon: Wind, label: "Wind", value: `${weather?.windSpeed ?? "--"} km/h` },
            { icon: Thermometer, label: "Rain", value: `${weather?.rainfall ?? "--"}mm` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex flex-col gap-1 p-3 bg-white/15 backdrop-blur-sm rounded-2xl border border-white/20">
              <Icon size={14} className="opacity-70" />
              <p className="text-base font-semibold">{value}</p>
              <p className="text-[11px] opacity-60 font-medium">{label}</p>
            </div>
          ))}
        </div>

        {/* 3-day mini forecast */}
        <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide">
          {weather?.forecast.slice(0, 5).map((day, i) => (
            <div key={i} className="flex flex-col items-center gap-1 px-3 py-2 bg-white/10 rounded-xl shrink-0">
              <span className="text-[11px] font-medium opacity-70">{i === 0 ? "Today" : day.day}</span>
              <WeatherIcon icon={day.icon} size={14} />
              <span className="text-sm font-semibold">{day.tempMax}°</span>
            </div>
          ))}
        </div>

        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />
      </motion.div>

      {/* === MARKET + AI SIDEBAR === */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Market Preview */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111113] rounded-2xl border border-stone-200/80 dark:border-stone-800/80 overflow-hidden shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-800/60">
            <div>
              <h2 className="text-sm font-semibold text-stone-900 dark:text-white">Market Overview</h2>
              <p className="text-xs text-stone-400 mt-0.5">Live prices · {userPrefs?.currency ?? "USD"}</p>
            </div>
            <Link to="/market" className="flex items-center gap-1 text-xs font-medium text-sage-600 hover:text-sage-700 transition-colors">
              All markets <ArrowRight size={13} />
            </Link>
          </div>
          <div className="divide-y divide-stone-100 dark:divide-stone-800/50">
            {prices.slice(0, 6).map((price, i) => {
              const isUp = price.trend === "up";
              const isStable = price.trend === "stable";
              return (
                <div key={i} className="flex items-center justify-between px-5 py-3 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                      isUp ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" :
                      isStable ? "bg-stone-100 dark:bg-stone-800 text-stone-500" :
                      "bg-red-50 dark:bg-red-900/20 text-red-500"
                    }`}>
                      {price.crop.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900 dark:text-white">{price.crop}</p>
                      <p className="text-[11px] text-stone-400">{price.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <MiniSparkline up={isUp} stable={isStable} />
                    <div className="text-right min-w-[90px]">
                      <p className="text-sm font-semibold text-stone-900 dark:text-white tabular-nums">
                        {price.currency} {price.price.toFixed(2)}
                      </p>
                      <p className={`text-xs font-medium flex items-center justify-end gap-0.5 ${
                        isStable ? "text-stone-400" : isUp ? "text-emerald-600" : "text-red-500"
                      }`}>
                        {isStable ? <Minus size={10} /> : isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                        {isStable ? "stable" : `${price.changePercent > 0 ? "+" : ""}${price.changePercent}%`}
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
          {/* AI Insight */}
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
              Optimal conditions detected in{" "}
              <span className="text-white font-medium">{userPrefs?.location}</span> for{" "}
              <span className="text-white font-medium">{userPrefs?.crop}</span>. Monitor moisture levels and consider nitrogen enrichment within 48h.
            </p>
            <Link to="/chat" className="mt-4 flex items-center justify-between p-3 bg-sage-800 hover:bg-sage-700 rounded-xl transition-colors group">
              <span className="text-sm font-medium">Ask AI Assistant</span>
              <MessageSquare size={15} className="group-hover:scale-110 transition-transform" />
            </Link>
          </div>

          {/* Weather Alert */}
          {(weather?.forecast.some(f => f.icon === "rain" || f.precipitation > 5)) && (
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-300">Rainfall Expected</p>
                  <p className="text-xs text-amber-700 dark:text-amber-400 mt-1 leading-relaxed">
                    Rain in the next 7-day forecast. Plan irrigation and field operations accordingly.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* === CROP RECOMMENDATIONS === */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-stone-900 dark:text-white">Crop Recommendations for {userPrefs?.country}</h2>
          <Link to="/crops" className="flex items-center gap-1 text-xs font-medium text-sage-600 hover:text-sage-700 transition-colors">
            Planner <ArrowRight size={13} />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {crops.slice(0, 6).map((crop, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-sage-300 dark:hover:border-sage-700 transition-all group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-sage-50 dark:bg-sage-900/20 rounded-lg flex items-center justify-center group-hover:bg-sage-600 transition-colors">
                    <Sprout size={14} className="text-sage-600 group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-sm font-semibold text-stone-900 dark:text-white">{crop.name}</p>
                </div>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  crop.risk === "Low" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" :
                  crop.risk === "Medium" ? "bg-amber-50 dark:bg-amber-900/20 text-amber-600" :
                  "bg-red-50 dark:bg-red-900/20 text-red-500"
                }`}>
                  {crop.risk}
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
                <span className="text-xs font-semibold text-stone-500 dark:text-stone-400 shrink-0 w-8">{crop.suitability}%</span>
              </div>
              <p className="text-xs text-stone-400 mt-2 leading-relaxed line-clamp-2">{crop.advice}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Weather Forecast", icon: CloudRain, to: "/weather", color: "bg-sky-50 dark:bg-sky-900/20 text-sky-600" },
          { label: "Market Prices", icon: TrendingUp, to: "/market", color: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" },
          { label: "Crop Calendar", icon: Sprout, to: "/crops", color: "bg-sage-50 dark:bg-sage-900/20 text-sage-600" },
          { label: "AI Assistant", icon: MessageSquare, to: "/chat", color: "bg-purple-50 dark:bg-purple-900/20 text-purple-600" },
        ].map(({ label, icon: Icon, to, color }) => (
          <Link key={to} to={to} className="flex items-center gap-2.5 p-3.5 bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-stone-800/80 rounded-xl hover:shadow-sm transition-all">
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
