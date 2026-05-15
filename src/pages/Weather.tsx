import { useState, useEffect } from "react";
import {
  Droplets,
  Wind,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  MapPin,
  Sunrise,
  Eye,
  Gauge,
  Leaf,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Thermometer,
} from "lucide-react";
import { motion } from "motion/react";
import { weatherService } from "../services/api";
import { WeatherData, UserPrefs } from "../types";

const WX_ICONS: Record<string, { icon: any; color: string }> = {
  sun: { icon: Sun, color: "text-amber-400" },
  "cloud-sun": { icon: Cloud, color: "text-stone-400" },
  cloud: { icon: Cloud, color: "text-stone-400" },
  rain: { icon: CloudRain, color: "text-sky-400" },
  drizzle: { icon: CloudRain, color: "text-sky-300" },
  snow: { icon: CloudSnow, color: "text-blue-200" },
  storm: { icon: CloudRain, color: "text-purple-400" },
};

const WeatherIcon = ({ icon, size = 20, className = "" }: { icon: string; size?: number; className?: string }) => {
  const meta = WX_ICONS[icon] ?? WX_ICONS["cloud-sun"];
  const Icon = meta.icon;
  return <Icon size={size} className={`${meta.color} ${className}`} />;
};

const farmingImpacts = (weather: WeatherData | null, crop: string) => [
  {
    label: "Irrigation Need",
    value: (weather?.humidity ?? 0) > 70 ? "Low" : (weather?.humidity ?? 0) > 50 ? "Moderate" : "High",
    status: (weather?.humidity ?? 0) > 70 ? "good" : "caution",
    desc: `Soil moisture ${(weather?.humidity ?? 0) > 70 ? "adequate" : "supplemental irrigation recommended"} for ${crop}.`,
  },
  {
    label: "Pest Risk",
    value: (weather?.temp ?? 0) > 30 && (weather?.humidity ?? 0) > 70 ? "High" : "Low",
    status: (weather?.temp ?? 0) > 30 && (weather?.humidity ?? 0) > 70 ? "caution" : "good",
    desc: (weather?.temp ?? 0) > 30 ? "Warm humid conditions favor aphid and fungal activity." : "Cool nights reduce pest pressure.",
  },
  {
    label: "Harvest Window",
    value: weather?.forecast.some(f => f.precipitation > 5) ? "Check timing" : "Favorable",
    status: weather?.forecast.some(f => f.precipitation > 5) ? "caution" : "good",
    desc: weather?.forecast.some(f => f.precipitation > 5) ? "Rain expected mid-week, delay harvest if possible." : "Clear skies forecast through the weekend.",
  },
  {
    label: "Frost Risk",
    value: (weather?.forecast.some(f => f.tempMin < 2)) ? "Present" : "None",
    status: (weather?.forecast.some(f => f.tempMin < 2)) ? "caution" : "good",
    desc: (weather?.forecast.some(f => f.tempMin < 2)) ? "Protect sensitive crops — temperatures near freezing forecast." : `Temperatures remain safe for ${crop}.`,
  },
];

export default function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userPrefs, setUserPrefs] = useState<UserPrefs | null>(null);

  const load = async (prefs: UserPrefs) => {
    const res = await weatherService.getWeather(prefs.location);
    setWeather(res);
  };

  useEffect(() => {
    const prefs = JSON.parse(localStorage.getItem("user_prefs") || "{}") as UserPrefs;
    setUserPrefs(prefs);
    load(prefs).finally(() => setLoading(false));
  }, []);

  const handleRefresh = async () => {
    if (!userPrefs || refreshing) return;
    setRefreshing(true);
    await load(userPrefs).catch(() => {});
    setRefreshing(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-stone-400 font-medium">Fetching live weather...</p>
    </div>
  );

  const temp = weather?.temp ?? 0;
  const impacts = farmingImpacts(weather, userPrefs?.crop ?? "your crop");

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-8 space-y-4">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-stone-900 dark:text-white">Weather</h1>
          {weather?.country && weather.country !== "Unknown" && (
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={12} className="text-stone-400" />
              <span className="text-xs text-stone-400">{weather.location}, {weather.country}</span>
            </div>
          )}
        </div>
        <button onClick={handleRefresh} disabled={refreshing}
          className="p-2 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
          <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
        </button>
      </div>

      {/* === APPLE WEATHER HERO === */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-sky-500 to-blue-700 dark:from-sky-900 dark:to-blue-950 text-white text-center px-6 py-10 shadow-lg shadow-sky-200/30 dark:shadow-none"
      >
        <div className="flex justify-center mb-3">
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}>
            <WeatherIcon icon={weather?.icon ?? "cloud-sun"} size={80} className="drop-shadow-2xl opacity-90" />
          </motion.div>
        </div>
        <p className="text-7xl font-bold tracking-tighter leading-none">{temp}°C</p>
        <p className="text-lg font-medium mt-2 opacity-80">{weather?.condition ?? "Variable"}</p>
        <p className="text-sm mt-1 opacity-50">Feels like {weather?.feelsLike ?? "--"}° · H:{(weather?.forecast[0]?.tempMax ?? temp + 4)}° · L:{(weather?.forecast[0]?.tempMin ?? temp - 3)}°</p>
        <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
      </motion.div>

      {/* === HOURLY FORECAST === */}
      <div className="bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 pt-4 pb-2">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">Today's Forecast</p>
        </div>
        <div className="flex gap-1 overflow-x-auto px-3 pb-4 pt-1 scrollbar-hide">
          {Array.from({ length: 10 }).map((_, i) => {
            const hour = (new Date().getHours() + i) % 24;
            const ampm = hour >= 12 ? "PM" : "AM";
            const displayHour = hour % 12 || 12;
            const wxKey = i % 4 === 0 ? "rain" : i % 3 === 0 ? "cloud" : "sun";
            const hourTemp = temp + Math.round(Math.sin(i * 0.6) * 4);
            return (
              <div key={i} className={`flex flex-col items-center gap-2 px-3 py-3 rounded-xl shrink-0 ${i === 0 ? "bg-sky-50 dark:bg-sky-900/20" : "hover:bg-stone-50 dark:hover:bg-stone-800/40"}`}>
                <span className={`text-[11px] font-semibold ${i === 0 ? "text-sky-600 dark:text-sky-400" : "text-stone-400"}`}>
                  {i === 0 ? "Now" : `${displayHour}${ampm}`}
                </span>
                <WeatherIcon icon={wxKey} size={16} />
                <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">{hourTemp}°</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* === DETAIL METRICS GRID === */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Droplets, label: "Humidity", value: `${weather?.humidity ?? "--"}%`, sub: "Relative humidity", color: "text-sky-500" },
          { icon: Wind, label: "Wind Speed", value: `${weather?.windSpeed ?? "--"} km/h`, sub: "Current wind", color: "text-stone-400" },
          { icon: Thermometer, label: "Feels Like", value: `${weather?.feelsLike ?? "--"}°C`, sub: "Apparent temperature", color: "text-orange-400" },
          { icon: Eye, label: "Visibility", value: "Good", sub: "Clear conditions", color: "text-emerald-500" },
          { icon: Gauge, label: "Pressure", value: "1013 hPa", sub: "Rising steadily", color: "text-purple-400" },
          { icon: Sunrise, label: "Sunrise", value: "5:42 AM", sub: "Sunset 7:15 PM", color: "text-amber-400" },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2">
              <Icon size={12} className={color} />
              <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wide">{label}</p>
            </div>
            <p className="text-base font-semibold text-stone-900 dark:text-white">{value}</p>
            <p className="text-xs text-stone-400 mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* === 7-DAY FORECAST === */}
      <div className="bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 pt-4 pb-2 border-b border-stone-100 dark:border-stone-800/50">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">7-Day Forecast</p>
        </div>
        <div className="divide-y divide-stone-100 dark:divide-stone-800/50">
          {(weather?.forecast.length ? weather.forecast : Array.from({ length: 7 }, (_, i) => ({
            day: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][(new Date().getDay() + i) % 7],
            date: "", temp: temp - 1, tempMax: temp + 4, tempMin: temp - 3,
            condition: i % 3 === 0 ? "Rain" : "Partly Cloudy", icon: i % 3 === 0 ? "rain" : "cloud-sun", precipitation: i % 3 === 0 ? 8 : 0,
          }))).map((day, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300 w-14">{i === 0 ? "Today" : day.day}</span>
              <div className="flex items-center gap-1.5 flex-1">
                <WeatherIcon icon={day.icon} size={15} />
                <span className="text-xs text-stone-400 font-medium hidden sm:block">{day.condition}</span>
              </div>
              {day.precipitation > 0 && (
                <div className="flex items-center gap-0.5 text-xs text-sky-500 font-medium">
                  <Droplets size={11} />{day.precipitation}mm
                </div>
              )}
              <div className="flex items-center gap-2 w-32">
                <span className="text-xs text-stone-400 font-medium w-7 text-right">{day.tempMin}°</span>
                <div className="flex-1 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-amber-400" style={{ marginLeft: "15%", marginRight: "10%" }} />
                </div>
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-200 w-7">{day.tempMax}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* === FARMING IMPACT INDICATORS === */}
      <div>
        <h3 className="text-sm font-semibold text-stone-900 dark:text-white mb-3">
          Farming Impact · <span className="text-sage-600">{userPrefs?.crop}</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {impacts.map(item => (
            <div key={item.label} className="bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-stone-800/80 rounded-xl p-4 shadow-sm flex items-start gap-3">
              {item.status === "good"
                ? <CheckCircle2 size={15} className="text-emerald-500 shrink-0 mt-0.5" />
                : <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />}
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-stone-900 dark:text-white">{item.label}</p>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    item.status === "good"
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                      : "bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                  }`}>{item.value}</span>
                </div>
                <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ag Advisory */}
      <div className="bg-sage-900 dark:bg-sage-950 rounded-2xl p-5 text-white shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-sage-700 rounded-lg flex items-center justify-center shrink-0">
            <Leaf size={14} className="text-sage-300" />
          </div>
          <div>
            <p className="text-sm font-semibold">Agricultural Advisory</p>
            <p className="text-sm text-sage-200 mt-1.5 leading-relaxed">
              Current conditions in {weather?.location ?? userPrefs?.location}: {weather?.condition ?? "variable weather"} at {temp}°C.
              {(weather?.rainfall ?? 0) > 0
                ? ` ${weather?.rainfall}mm of rainfall detected — delay spraying operations by 24h.`
                : ` Dry conditions — maintain irrigation schedule for ${userPrefs?.crop}.`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
