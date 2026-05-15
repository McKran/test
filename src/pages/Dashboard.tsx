import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { 
  CloudSun, 
  TrendingUp, 
  Sprout, 
  MessageSquare, 
  ArrowRight,
  Droplets,
  Thermometer,
  Wind,
  MapPin,
  TrendingDown,
  AlertCircle
} from "lucide-react";
import { Link } from "react-router-dom";
import { weatherService, marketService, cropService } from "../services/api";
import { WeatherData, MarketPrice, CropRecommendation, UserPrefs } from "../types";

export default function Dashboard() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [crops, setCrops] = useState<CropRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPrefs, setUserPrefs] = useState<UserPrefs | null>(null);

  useEffect(() => {
    const prefs = JSON.parse(localStorage.getItem("user_prefs") || "{}");
    setUserPrefs(prefs);

    const fetchData = async () => {
      try {
        const [w, p, c] = await Promise.all([
          weatherService.getWeather(prefs.location),
          marketService.getPrices(prefs.currency),
          cropService.getRecommendations()
        ]);
        setWeather(w);
        setPrices(p);
        setCrops(c);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="w-12 h-12 border-4 border-sage-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-stone-500 font-black tracking-widest uppercase text-xs">Synchronizing Agronomic Data...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-10 pb-24 mt-4 px-4">
      
      {/* Google Weather Style Hero Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative p-10 bg-gradient-to-br from-sky-400 to-sky-600 dark:from-stone-800 dark:to-sky-900/50 rounded-[3rem] text-white shadow-2xl overflow-hidden group"
      >
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div className="space-y-4">
             <div className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 w-fit">
                <MapPin size={18} className="text-sky-100" />
                <span className="font-black uppercase tracking-widest text-xs uppercase">{userPrefs?.location}</span>
             </div>
             <div className="flex items-end gap-1">
                <h2 className="text-8xl font-black tracking-tighter">{weather?.temp}°</h2>
                <div className="mb-4">
                   <p className="text-2xl font-bold">Mostly Sunny</p>
                   <p className="text-sky-100 opacity-60 text-sm font-medium">Feels like {weather?.temp! + 2}°</p>
                </div>
             </div>
          </div>
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="p-4 bg-white/5 backdrop-blur-xl rounded-[2.5rem] border border-white/10"
          >
            <CloudSun size={120} className="text-white drop-shadow-2xl" />
          </motion.div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 relative z-10">
           <div className="p-6 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-md hover:bg-white/20 transition-all">
              <Droplets size={24} className="mb-2 opacity-60" />
              <p className="text-2xl font-black">{weather?.humidity}%</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Humidity</p>
           </div>
           <div className="p-6 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-md hover:bg-white/20 transition-all">
              <Wind size={24} className="mb-2 opacity-60" />
              <p className="text-2xl font-black">14<span className="text-sm">km/h</span></p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Wind Flow</p>
           </div>
           <div className="p-6 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-md hover:bg-white/20 transition-all">
              <Thermometer size={24} className="mb-2 opacity-60" />
              <p className="text-2xl font-black">1.2<span className="text-sm">UV</span></p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Radiation</p>
           </div>
           <div className="p-6 bg-white/10 rounded-3xl border border-white/10 backdrop-blur-md hover:bg-white/20 transition-all">
              <AlertCircle size={24} className="mb-2 opacity-60" />
              <p className="text-2xl font-black">Stable</p>
              <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Atmosphere</p>
           </div>
        </div>
        
        {/* Background decorative elements */}
        <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-white/5 rounded-full blur-[100px]" />
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Market Trend Preview */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-black tracking-tight uppercase">Market Intelligence</h3>
              <Link to="/market" className="text-sage-600 font-bold text-sm flex items-center gap-1 group">
                 Terminal View <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {prices.slice(0, 2).map((price, i) => (
                <div key={i} className="glass-card p-8 bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800 flex justify-between items-center group cursor-pointer hover:border-sage-400 transition-all shadow-sm">
                   <div>
                      <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">{price.crop} Market</p>
                      <h4 className="text-2xl font-black tracking-tighter">{price.currency} {price.price.toLocaleString()}</h4>
                      <div className={`mt-2 inline-flex items-center gap-1 text-xs font-black px-2 py-1 rounded-lg ${price.trend === 'up' ? 'text-green-600 bg-green-50 dark:bg-green-900/10' : 'text-red-600 bg-red-50 dark:bg-red-900/10'}`}>
                         {price.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                         {price.trend === 'up' ? '+3.1%' : '-0.8%'}
                      </div>
                   </div>
                   <div className="h-12 w-20 flex items-end gap-1 px-1">
                      {[0.3, 0.5, 0.4, 0.7, 0.6, 0.9].map((h, j) => (
                        <div key={j} className={`flex-1 rounded-t-sm ${price.trend === 'up' ? 'bg-green-500/20' : 'bg-red-500/20'} ${j === 5 ? (price.trend === 'up' ? 'bg-green-500' : 'bg-red-50') : ''}`} style={{ height: `${h * 100}%` }} />
                      ))}
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* AI Insight Sidebar */}
        <div className="space-y-6">
           <h3 className="text-xl font-black tracking-tight uppercase px-2 text-sage-600">Neural Insight</h3>
           <div className="p-8 bg-sage-900 rounded-[2.5rem] text-white space-y-6 relative overflow-hidden shadow-2xl">
              <div className="flex items-center gap-3 relative z-10">
                 <div className="p-3 bg-sage-800 rounded-2xl"><Sprout size={24} className="text-sage-400" /></div>
                 <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-sage-500">Routing: {userPrefs?.aiMode}</p>
                    <p className="font-bold">Next Harvest Window</p>
                 </div>
              </div>
              <p className="text-sage-200 font-medium leading-relaxed relative z-10">
                 The current soil moisture index in <span className="text-white font-bold">{userPrefs?.location}</span> is optimal. Based on meteorological patterns, consider nitrogen enrichment for your <span className="text-white font-bold">{userPrefs?.crop}</span> field within 48 hours.
              </p>
              <Link to="/chat" className="flex items-center justify-between p-4 bg-sage-800 hover:bg-sage-700 transition-all rounded-3xl group relative z-10">
                 <span className="font-bold text-sm">Deploy Deep Assistant</span>
                 <MessageSquare size={20} className="group-hover:scale-110 transition-transform" />
              </Link>
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-sage-600/20 rounded-full blur-[80px]" />
           </div>
        </div>
      </div>

      {/* Recommended Grid - Bento Style */}
      <section className="space-y-6">
         <h3 className="text-xl font-black tracking-tight uppercase px-2">Adaptive Recommendations</h3>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop, i) => (
              <motion.div 
                key={i}
                whileHover={{ y: -5 }}
                className="p-8 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-[2.5rem] flex flex-col justify-between shadow-sm group cursor-pointer"
              >
                <div className="flex justify-between items-start mb-6">
                   <div className="w-14 h-14 bg-stone-50 dark:bg-stone-800 rounded-2xl flex items-center justify-center text-sage-600 group-hover:bg-sage-600 group-hover:text-white transition-all">
                      <Sprout size={28} />
                   </div>
                   <div className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${crop.risk === 'Low' ? 'bg-green-50 text-green-700 dark:bg-green-900/20' : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20'}`}>
                      {crop.risk} Risk
                   </div>
                </div>
                <div>
                   <h4 className="text-2xl font-black mb-1">{crop.name}</h4>
                   <p className="text-sm text-stone-500 font-medium mb-4">Strategic match for your biome.</p>
                   <div className="flex items-center gap-4">
                      <div className="flex-1 h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                         <motion.div initial={{ width: 0 }} whileInView={{ width: `${crop.suitability}%` }} className="h-full bg-sage-600" />
                      </div>
                      <span className="text-sm font-black text-stone-900 dark:text-white">{crop.suitability}%</span>
                   </div>
                </div>
              </motion.div>
            ))}
         </div>
      </section>

    </div>
  );
}
