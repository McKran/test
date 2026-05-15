import { useState, useEffect } from "react";
import { 
  TrendingUp, 
  TrendingDown, 
  Search, 
  Globe, 
  ArrowUpRight,
  BarChart3,
  ArrowRight
} from "lucide-react";
import { motion } from "motion/react";
import { marketService } from "../services/api";
import { MarketPrice, UserPrefs } from "../types";

const CATEGORIES = ["All", "Grain", "Fruit", "Vegetable", "Cash Crop"];

export default function Market() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [userPrefs, setUserPrefs] = useState<UserPrefs | null>(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    const prefs = JSON.parse(localStorage.getItem("user_prefs") || "{}");
    setUserPrefs(prefs);
    marketService.getPrices(prefs.currency).then(res => {
      setPrices(res);
      setLoading(false);
    });
  }, []);

  const getConvertedPrice = (base: number) => base.toLocaleString(undefined, { minimumFractionDigits: 2 });

  const filteredPrices = prices.filter(p => {
    const matchesSearch = p.crop.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
      <div className="flex gap-1 h-8 items-end">
         {[0.4, 0.7, 0.3, 0.9, 0.5].map((h, i) => (
           <motion.div 
            key={i}
            animate={{ height: [`${h*100}%`, `${(1-h)*100}%`, `${h*100}%`] }}
            transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.1 }}
            className="w-2 bg-sage-600 rounded-t-sm"
           />
         ))}
      </div>
      <p className="text-stone-500 font-bold tracking-widest uppercase text-xs">Streaming Global Exchanges...</p>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 mt-10">
      
      {/* TradingView Style Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 px-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <div className="p-1.5 bg-sage-900 text-white rounded-lg"><BarChart3 size={18} /></div>
             <h1 className="text-3xl font-black tracking-tight uppercase">Terminal <span className="text-stone-400">Markets</span></h1>
          </div>
          <p className="text-stone-500 font-medium">Real-time agricultural commodity streaming in <span className="text-sage-600 font-black">{userPrefs?.currency}</span>.</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
            <input 
              type="text"
              placeholder="Search ticker..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-12 pr-6 py-3 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-600 font-bold dark:text-white"
            />
          </div>
          <div className="flex p-1 bg-stone-100 dark:bg-stone-800 rounded-xl border border-stone-200 dark:border-stone-700">
             {CATEGORIES.map(c => (
               <button 
                 key={c}
                 onClick={() => setFilter(c)}
                 className={`px-4 py-2 text-xs font-black uppercase rounded-lg transition-all ${filter === c ? 'bg-white dark:bg-stone-700 text-sage-600 shadow-sm' : 'text-stone-500'}`}
               >
                 {c}
               </button>
             ))}
          </div>
        </div>
      </div>

      {/* Featured Tickertape Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4">
        {filteredPrices.slice(0, 3).map((p, i) => (
          <div key={i} className="glass-card p-6 bg-white dark:bg-stone-900 border-stone-100 dark:border-stone-800 flex justify-between items-center group cursor-pointer hover:border-sage-400 transition-all shadow-sm">
            <div>
               <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Spot Price</p>
               <h3 className="text-xl font-bold flex items-center gap-2">
                 {p.crop}
                 <ArrowUpRight size={14} className="text-stone-300 group-hover:text-sage-600" />
               </h3>
               <div className="flex items-center gap-2 mt-2">
                  <span className="text-2xl font-black">{p.currency} {getConvertedPrice(p.price)}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${p.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {p.trend === 'up' ? '+3.12%' : '-0.84%'}
                  </span>
               </div>
            </div>
            <div className="h-12 w-20 flex items-end gap-1 px-1">
               {[0.3, 0.5, 0.4, 0.7, 0.6, 0.9].map((h, j) => (
                 <div key={j} className={`flex-1 rounded-t-sm ${p.trend === 'up' ? 'bg-green-500/20' : 'bg-red-500/20'} ${j === 5 ? (p.trend === 'up' ? 'bg-green-500' : 'bg-red-500') : ''}`} style={{ height: `${h * 100}%` }} />
               ))}
            </div>
          </div>
        ))}
      </div>

      {/* Main Table Content - Binance/Finance Style */}
      <div className="bg-white dark:bg-stone-900 rounded-[2rem] border border-stone-200 dark:border-stone-800 overflow-hidden mx-4 shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-stone-100 dark:border-stone-800">
                <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest">Commodity / Assets</th>
                <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right">Last Price</th>
                <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right">24h Change</th>
                <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right hidden md:table-cell">Market Cap</th>
                <th className="px-8 py-6 text-[10px] font-black text-stone-400 uppercase tracking-widest text-right">Activity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 dark:divide-stone-800/50">
              {filteredPrices.map((p, i) => (
                <tr key={i} className="group hover:bg-stone-50 dark:hover:bg-stone-800/20 transition-all cursor-pointer">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${p.trend === 'up' ? 'bg-green-50 dark:bg-green-900/30 text-green-600' : 'bg-red-50 dark:bg-red-900/30 text-red-600'}`}>
                        {p.crop.charAt(0)}
                      </div>
                      <div>
                        <p className="font-black text-stone-900 dark:text-white">{p.crop}</p>
                        <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{userPrefs?.marketScope} Standard</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <p className={`font-black tracking-tighter text-xl ${p.crop === userPrefs?.crop ? 'text-sage-600' : 'text-stone-900 dark:text-white'}`}>
                      {p.currency} {getConvertedPrice(p.price)}
                    </p>
                    <p className="text-[10px] font-medium text-stone-400 uppercase italic">per {userPrefs?.units}</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className={`inline-flex items-center gap-1 font-black text-sm px-2 py-1 rounded-lg ${p.trend === 'up' ? 'text-green-600 bg-green-50 dark:bg-green-900/10' : 'text-red-600 bg-red-50 dark:bg-red-900/10'}`}>
                      {p.trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                      {p.trend === 'up' ? '+5.4%' : '-2.1%'}
                    </div>
                  </td>
                  <td className="px-8 py-6 text-right hidden md:table-cell">
                    <p className="font-bold text-stone-700 dark:text-stone-300">$14.2M</p>
                    <p className="text-[10px] font-medium text-stone-400 uppercase">Volume</p>
                  </td>
                  <td className="px-8 py-6 text-right">
                    <button className="px-6 py-2.5 bg-stone-900 dark:bg-white dark:text-stone-900 text-white rounded-xl text-xs font-black uppercase hover:scale-105 active:scale-95 transition-all">Trade</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Global Intel Footer */}
      <div className="px-4 pb-20">
        <div className="p-10 bg-gradient-to-br from-white to-stone-100 dark:from-stone-900 dark:to-stone-950 rounded-[3rem] border border-stone-200 dark:border-stone-800 flex flex-col md:flex-row items-center justify-between gap-8 shadow-sm">
           <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-sage-900 text-white rounded-full flex items-center justify-center shadow-2xl"><Globe size={32} /></div>
              <div>
                <h3 className="text-2xl font-black tracking-tight">Open Intelligence Network</h3>
                <p className="text-stone-500 font-medium max-w-sm">Aggregating data from international agricultural exchanges via modular API routing.</p>
              </div>
           </div>
           <button className="px-10 py-5 bg-white dark:bg-stone-800 border-2 border-stone-100 dark:border-stone-700 rounded-2xl font-black uppercase text-xs tracking-[0.2em] hover:bg-sage-600 hover:text-white hover:border-sage-600 transition-all flex items-center gap-3 group">
              Audit Data Sources <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
           </button>
        </div>
      </div>
    </div>
  );
}
