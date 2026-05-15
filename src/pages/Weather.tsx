import { useState, useEffect } from "react";
import { 
  CloudSun, 
  Droplets, 
  Wind, 
  Sunrise, 
  Sunset, 
  MapPin,
  Calendar,
  CloudRain,
  Sun,
  Cloud,
  ArrowRight
} from "lucide-react";
import { motion } from "motion/react";
import { weatherService } from "../services/api";
import { WeatherData, UserPrefs } from "../types";

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
    <div className="flex flex-col items-center justify-center h-[70vh] gap-4">
      <div className="w-16 h-16 bg-sky-100 dark:bg-sky-900/30 rounded-full flex items-center justify-center animate-bounce">
         <CloudSun className="text-sky-600" size={32} />
      </div>
      <p className="text-stone-500 font-black tracking-widest uppercase text-xs">Calibrating Satellite Sensors...</p>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 mt-10">
      
      {/* Apple Weather Style Header */}
      <div className="text-center space-y-1 py-10 px-4">
        <h1 className="text-4xl font-bold tracking-tight text-stone-900 dark:text-white flex items-center justify-center gap-2">
          <MapPin size={24} className="text-sage-600" />
          {userPrefs?.location}
        </h1>
        <p className="text-8xl font-black tracking-tighter text-stone-900 dark:text-white">{weather?.temp}°</p>
        <p className="text-xl font-bold text-stone-500">Mostly Clear</p>
        <div className="flex items-center justify-center gap-4 text-stone-500 font-bold mt-2">
           <span>H: {weather?.temp! + 4}°</span>
           <span>L: {weather?.temp! - 2}°</span>
        </div>
      </div>

      {/* Hourly Forecast Horizontal Scroll */}
      <div className="bg-white/40 dark:bg-stone-900/40 backdrop-blur-xl border border-white/20 dark:border-stone-800 rounded-[2.5rem] p-6 mx-4 shadow-sm">
        <div className="flex items-center gap-2 mb-6 px-2 text-stone-400 font-bold uppercase text-[10px] tracking-[0.2em]">
           <Calendar size={14} />
           <span>Hourly Conditions</span>
        </div>
        <div className="flex overflow-x-auto gap-10 pb-4 scrollbar-hide px-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-3 shrink-0">
               <span className="text-sm font-black text-stone-500">{i === 0 ? 'Now' : `${(13 + i) % 12 || 12} ${i < 11 ? 'PM' : 'AM'}`}</span>
               <div className="text-sky-500">
                  {i % 3 === 0 ? <Sun size={24} /> : i % 2 === 0 ? <Cloud size={24} /> : <CloudSun size={24} />}
               </div>
               <span className="text-lg font-black">{weather?.temp! + (i % 2 === 0 ? 1 : -1)}°</span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid for Detailed Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 px-4">
        
        {/* Humidity Card */}
        <div className="glass-card p-6 bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800 flex flex-col justify-between shadow-sm">
           <div className="flex items-center gap-2 text-stone-400 font-bold uppercase text-[10px] tracking-widest">
              <Droplets size={14} />
              <span>Humidity</span>
           </div>
           <p className="text-3xl font-black mt-4">{weather?.humidity}%</p>
           <p className="text-xs text-stone-500 mt-2 font-medium">The dew point is 14° right now.</p>
        </div>

        {/* Wind Card */}
        <div className="glass-card p-6 bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800 flex flex-col justify-between shadow-sm">
           <div className="flex items-center gap-2 text-stone-400 font-bold uppercase text-[10px] tracking-widest">
              <Wind size={14} />
              <span>Wind</span>
           </div>
           <p className="text-3xl font-black mt-4">12 <span className="text-base font-bold text-stone-400 uppercase">km/h</span></p>
           <p className="text-xs text-stone-500 mt-2 font-medium">Coming from the SW.</p>
        </div>

        {/* UV Index Card */}
        <div className="glass-card p-6 bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800 flex flex-col justify-between shadow-sm">
           <div className="flex items-center gap-2 text-stone-400 font-bold uppercase text-[10px] tracking-widest">
              <Sun size={14} />
              <span>UV Index</span>
           </div>
           <p className="text-3xl font-black mt-4">4 <span className="text-base font-bold text-stone-400 uppercase text-xs">Mid</span></p>
           <p className="text-xs text-stone-500 mt-2 font-medium">Use sun protection until 4PM.</p>
        </div>

        {/* Sun Events Card */}
        <div className="glass-card p-6 bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800 flex flex-col justify-between shadow-sm">
           <div className="flex items-center gap-2 text-stone-400 font-bold uppercase text-[10px] tracking-widest">
              <Sunrise size={14} />
              <span>Sun Events</span>
           </div>
           <div className="mt-4 space-y-1">
              <p className="text-sm font-black flex items-center gap-2"><Sunrise size={14} /> 5:42 AM</p>
              <p className="text-sm font-black flex items-center gap-2 text-stone-400"><Sunset size={14} /> 7:15 PM</p>
           </div>
        </div>
      </div>

      {/* 10-Day Forecast List */}
      <div className="bg-white/40 dark:bg-stone-900/40 backdrop-blur-xl border border-white/20 dark:border-stone-800 rounded-[2.5rem] p-8 mx-4 shadow-sm">
        <div className="flex items-center gap-2 mb-8 text-stone-400 font-bold uppercase text-[10px] tracking-[0.2em]">
           <Calendar size={14} />
           <span>10-Day Precision Forecast</span>
        </div>
        <div className="space-y-6">
          {weather?.forecast.map((day, i) => (
            <div key={i} className="flex items-center justify-between group">
              <span className="w-20 font-black text-stone-700 dark:text-stone-300">{i === 0 ? 'Today' : day.day}</span>
              <div className="flex items-center gap-4 flex-1 justify-center">
                 <div className="text-sky-500">
                    {day.condition === 'Sunny' ? <Sun size={20} /> : day.condition === 'Showers' ? <CloudRain size={20} /> : <CloudSun size={20} />}
                 </div>
                 <div className="hidden md:flex items-center gap-1 text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-tighter w-16">
                    <Droplets size={12} />
                    {i*10 + 10}%
                 </div>
              </div>
              <div className="flex items-center gap-4 w-40 justify-end">
                 <span className="text-sm font-bold text-stone-400">{weather?.temp! - 4}°</span>
                 <div className="flex-1 h-1.5 bg-stone-100 dark:bg-stone-800 rounded-full relative overflow-hidden">
                    <div className="absolute inset-y-0 bg-gradient-to-r from-sky-400 to-orange-400 rounded-full" style={{ left: '20%', right: '20%' }} />
                 </div>
                 <span className="text-sm font-black dark:text-white">{weather?.temp! + 4}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Agricultural Insight Integration */}
      <div className="mx-4 p-10 bg-sage-900 rounded-[3rem] text-white flex flex-col md:flex-row items-center gap-8 shadow-2xl">
         <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center shrink-0"><CloudRain size={40} /></div>
         <div>
            <h3 className="text-2xl font-black tracking-tight mb-2">Atmospheric Impact Report</h3>
            <p className="text-sage-200 font-medium leading-relaxed">The predicted temperature drop on Wednesday might induce early flowering for the southern {userPrefs?.crop} plots. Increase phosphorous ratios in soil maintenance.</p>
         </div>
         <button className="p-5 bg-white text-sage-900 rounded-2xl shrink-0 hover:scale-110 active:scale-95 transition-all shadow-xl shadow-black/20"><ArrowRight size={24} /></button>
      </div>

    </div>
  );
}
