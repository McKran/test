import { useState, useEffect } from "react";
import {
  CloudSun,
  Droplets,
  Wind,
  Sun,
  Cloud,
  CloudRain,
  MapPin,
  Sunrise,
  Sunset,
  Eye,
  Gauge,
  Leaf,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { motion } from "motion/react";
import { weatherService } from "../services/api";
import { WeatherData, UserPrefs } from "../types";

const hourlyData = Array.from({ length: 12 }, (_, i) => ({
  time: i === 0 ? "Now" : `${(i + 1) % 12 || 12}${i < 10 ? "PM" : "AM"}`,
  temp: 28 + Math.round(Math.sin(i * 0.5) * 4),
  icon: i % 4 === 0 ? "rain" : i % 3 === 0 ? "cloud" : "sun",
  precip: i % 4 === 0 ? 80 : Math.round(Math.random() * 20),
}));

const farmingImpacts = [
  { label: "Irrigation Need", value: "Moderate", status: "caution", desc: "Soil moisture at 62% — supplement in 2 days" },
  { label: "Pest Risk", value: "Low", status: "good", desc: "Cool nights reduce aphid activity" },
  { label: "Harvest Window", value: "Optimal", status: "good", desc: "Clear skies predicted through weekend" },
  { label: "Frost Risk", value: "None", status: "good", desc: "Temperatures stay above 18°C all week" },
];

const WeatherIcon = ({ type, size = 20 }: { type: string; size?: number }) => {
  if (type === "rain") return <CloudRain size={size} className="text-sky-400" />;
  if (type === "cloud") return <Cloud size={size} className="text-stone-400" />;
  return <Sun size={size} className="text-amber-400" />;
};

export default function Weather() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPrefs, setUserPrefs] = useState<UserPrefs | null>(null);

  useEffect(() => {
    const prefs = JSON.parse(localStorage.getItem("user_prefs") || "{}");
    setUserPrefs(prefs);
    weatherService.getWeather(prefs.location).then(res => {
      setWeather(res);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-sm text-stone-400 font-medium">Loading weather...</p>
    </div>
  );

  const temp = weather?.temp ?? 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-8 space-y-4">

      {/* === APPLE WEATHER STYLE HERO === */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-sky-500 to-blue-700 dark:from-sky-900 dark:to-blue-950 text-white text-center px-6 py-10 shadow-lg shadow-sky-200/30 dark:shadow-none"
      >
        <div className="flex items-center justify-center gap-1.5 mb-4 opacity-80">
          <MapPin size={14} />
          <span className="text-sm font-medium">{userPrefs?.location}</span>
        </div>

        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="flex justify-center mb-2"
        >
          <CloudSun size={80} className="opacity-90 drop-shadow-2xl" />
        </motion.div>

        <p className="text-7xl font-bold tracking-tighter leading-none">{temp}°</p>
        <p className="text-lg font-medium mt-2 opacity-80">Mostly Clear</p>
        <p className="text-sm mt-1 opacity-50">H:{temp + 4}° · L:{temp - 3}°</p>

        <div className="absolute -top-12 -right-12 w-40 h-40 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl" />
      </motion.div>

      {/* === HOURLY FORECAST === */}
      <div className="bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-4 pt-4 pb-2">
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">Hourly Forecast</p>
        </div>
        <div className="flex gap-1 overflow-x-auto px-3 pb-4 pt-1 scrollbar-hide">
          {hourlyData.map((h, i) => (
            <div
              key={i}
              className={`flex flex-col items-center gap-2 px-3 py-3 rounded-xl shrink-0 transition-colors ${
                i === 0 ? "bg-sky-50 dark:bg-sky-900/20" : "hover:bg-stone-50 dark:hover:bg-stone-800/40"
              }`}
            >
              <span className={`text-[11px] font-semibold ${i === 0 ? "text-sky-600 dark:text-sky-400" : "text-stone-400"}`}>{h.time}</span>
              <WeatherIcon type={h.icon} size={18} />
              {h.precip > 30 && (
                <span className="text-[10px] font-medium text-sky-500">{h.precip}%</span>
              )}
              <span className="text-sm font-semibold text-stone-800 dark:text-stone-200">{h.temp}°</span>
            </div>
          ))}
        </div>
      </div>

      {/* === DETAIL CARDS GRID === */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Droplets, label: "Humidity", value: `${weather?.humidity}%`, sub: "Dew point 14°C", color: "text-sky-500" },
          { icon: Wind, label: "Wind", value: "12 km/h", sub: "From SW · Gusts 18", color: "text-stone-400" },
          { icon: Sun, label: "UV Index", value: "4 · Moderate", sub: "Protection until 4 PM", color: "text-amber-400" },
          { icon: Eye, label: "Visibility", value: "16 km", sub: "Clear conditions", color: "text-emerald-500" },
          { icon: Gauge, label: "Pressure", value: "1013 hPa", sub: "Rising steadily", color: "text-purple-400" },
          { icon: Sunrise, label: "Sun", value: "5:42 / 7:15", sub: "Rise · Set", color: "text-orange-400" },
        ].map(({ icon: Icon, label, value, sub, color }) => (
          <div key={label} className="bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2">
              <Icon size={13} className={color} />
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
          {weather?.forecast.map((day, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5">
              <span className="text-sm font-medium text-stone-700 dark:text-stone-300 w-14">{i === 0 ? "Today" : day.day}</span>
              <div className="flex items-center gap-1.5 flex-1">
                <WeatherIcon type={day.condition === "Sunny" ? "sun" : day.condition === "Rain" ? "rain" : "cloud"} size={16} />
                <span className="text-xs text-stone-400 font-medium">{day.condition}</span>
              </div>
              <div className="flex items-center gap-2 w-32">
                <span className="text-xs text-stone-400 font-medium w-6 text-right">{temp - 3}°</span>
                <div className="flex-1 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-amber-400" style={{ marginLeft: "20%", marginRight: "15%" }} />
                </div>
                <span className="text-xs font-semibold text-stone-700 dark:text-stone-200 w-6">{temp + 4}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* === FARMING IMPACT INDICATORS === */}
      <div>
        <h3 className="text-sm font-semibold text-stone-900 dark:text-white mb-3">Farming Impact</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {farmingImpacts.map((item) => (
            <div
              key={item.label}
              className="bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-stone-800/80 rounded-xl p-4 shadow-sm flex items-start gap-3"
            >
              {item.status === "good" ? (
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              )}
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-stone-900 dark:text-white">{item.label}</p>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                    item.status === "good"
                      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400"
                  }`}>
                    {item.value}
                  </span>
                </div>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* === AGRICULTURAL INSIGHT === */}
      <div className="bg-sage-900 dark:bg-sage-950 rounded-2xl p-5 text-white shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-sage-700 rounded-lg flex items-center justify-center shrink-0">
            <Leaf size={15} className="text-sage-300" />
          </div>
          <div>
            <p className="text-sm font-semibold">Agricultural Advisory</p>
            <p className="text-sm text-sage-200 mt-1.5 leading-relaxed">
              Wednesday's temperature drop may trigger early flowering in {userPrefs?.crop} plots. Increase phosphorus ratio in your next soil treatment cycle.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
