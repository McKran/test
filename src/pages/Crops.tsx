import { useState, useEffect } from "react";
import { 
  Sprout, 
  Calendar, 
  Search,
  Droplets,
  Zap,
  TrendingUp,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { motion } from "motion/react";
import { cropService } from "../services/api";
import { CropRecommendation, Crop } from "../types";

const STAGES = [
  { id: "soil", title: "Soil Preparation", icon: <Sprout />, color: "bg-orange-500", desc: "Analyze pH levels and enrich with organic matter." },
  { id: "planting", title: "Precision Planting", icon: <ShieldCheck />, color: "bg-sage-600", desc: "Optimal seed depth and spacing based on data." },
  { id: "growth", title: "Vegetative Phase", icon: <Zap />, color: "bg-sky-500", desc: "Monitor leaf health and nutrient uptake." },
  { id: "irrigation", title: "Water Management", icon: <Droplets />, color: "bg-blue-600", desc: "Scheduled irrigation based on evapotranspiration." },
  { id: "harvest", title: "Strategic Harvest", icon: <TrendingUp />, color: "bg-yellow-500", desc: "Max brix and moisture content alignment." }
];

export default function Crops() {
  const [crops, setCrops] = useState<CropRecommendation[]>([]);
  const [seasonalPlan, setSeasonalPlan] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<Crop[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [userPrefs, setUserPrefs] = useState<any>(null);

  useEffect(() => {
    const prefs = JSON.parse(localStorage.getItem("user_prefs") || "{}");
    setUserPrefs(prefs);
    
    const fetchCrops = async () => {
      const res = await cropService.getRecommendations();
      const sorted = [...res].sort((a, b) => a.name === prefs.crop ? -1 : b.name === prefs.crop ? 1 : 0);
      setCrops(sorted);
      
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
    } else {
      setSearchResults([]);
    }
  };

  if (loading) return <div className="p-8 text-stone-500">Compiling agronomic intelligence...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20 mt-10">
      {/* Search Header */}
      <div className="relative group px-4">
        <Search className="absolute left-10 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-sage-600 transition-colors" size={24} />
        <input 
          type="text"
          placeholder="Explore the global plant database..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full pl-16 pr-8 py-6 bg-white dark:bg-stone-900 border-2 border-stone-100 dark:border-stone-800 rounded-[2rem] focus:outline-none focus:border-sage-600 dark:text-white shadow-xl shadow-stone-100 dark:shadow-none text-xl font-bold transition-all"
        />
        {searchResults.length > 0 && (
          <div className="absolute top-full left-4 right-4 mt-4 bg-white dark:bg-stone-900 border-2 border-stone-100 dark:border-stone-800 rounded-[2.5rem] shadow-2xl z-50 p-4 max-h-[400px] overflow-y-auto overflow-x-hidden animate-in fade-in slide-in-from-top-2">
            {searchResults.map((crop) => (
              <div key={crop.name} className="p-6 hover:bg-sage-50 dark:hover:bg-sage-900/20 cursor-pointer rounded-3xl transition-all border-b border-stone-50 dark:border-stone-800/10 last:border-0 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-black">{crop.name}</span>
                    <span className="text-[10px] bg-stone-100 dark:bg-stone-800 text-stone-500 px-2 py-0.5 rounded-full uppercase font-black tracking-widest">{crop.category}</span>
                  </div>
                  <p className="text-sm text-stone-400 mt-2 font-medium">{crop.description}</p>
                </div>
                <ChevronRight size={20} className="text-stone-300" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main Progression Section - Duolingo Style */}
      <div className="flex flex-col items-center">
        <div className="w-full max-w-xl space-y-14 relative py-8">
          
          {/* Vertical Path Line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-3 bg-stone-100 dark:bg-stone-800 -translate-x-1/2 rounded-full" />
          
          {STAGES.map((stage, i) => (
            <motion.div 
              key={stage.id}
              initial={{ opacity: 0, scale: 0.8, y: 30 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              className="relative z-10 flex flex-col items-center group"
            >
              <div 
                className={`w-24 h-24 ${stage.color} text-white rounded-[2.2rem] flex items-center justify-center shadow-2xl shadow-${stage.color.split('-')[1]}-200 dark:shadow-none cursor-pointer transform transition-all hover:scale-110 active:scale-95 hover:-rotate-6 border-b-[6px] border-black/10`}
              >
                <div className="scale-[2]">
                  {stage.icon}
                </div>
              </div>
              
              <div className="mt-6 glass-card p-6 w-full text-center border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 shadow-xl group-hover:border-sage-400 transition-colors">
                <h3 className="text-lg font-black uppercase tracking-widest text-stone-900 dark:text-stone-100 mb-1">{stage.title}</h3>
                <p className="text-sm text-stone-500 dark:text-stone-400 font-medium px-4">{stage.desc}</p>
              </div>

              <div className="absolute top-1/2 -translate-y-1/2 left-[calc(100%+2rem)] hidden lg:flex flex-col gap-3">
                 <div className="w-3 h-3 rounded-full bg-sage-500" />
                 <div className="w-2 h-2 rounded-full bg-stone-200 dark:bg-stone-700" />
                 <div className="w-2 h-2 rounded-full bg-stone-200 dark:bg-stone-700" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Global Calendar Card */}
      <div className="mx-4 p-12 bg-sage-900 rounded-[3.5rem] text-white relative overflow-hidden shadow-2xl">
        <div className="relative z-10">
          <h3 className="text-4xl font-black tracking-tighter mb-4">Seasonal Horizon</h3>
          <p className="text-sage-200 font-medium mb-12 max-w-lg leading-relaxed text-lg">
            Coordinated global planting windows for <span className="text-white font-bold">{userPrefs?.country}</span>. Automated sync with meteorological cycles.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {seasonalPlan && Object.entries(seasonalPlan).map(([season, activity]) => (
              <div key={season} className="p-6 bg-white/10 backdrop-blur-md rounded-3xl border border-white/10 group hover:bg-white/20 transition-all text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2 opacity-60">{season}</p>
                <p className="text-xl font-bold">{activity as string}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-sage-400/20 rounded-full blur-[100px]" />
      </div>

       {/* Recommended Section Card - Notion Style */}
       <section className="mx-4 glass-card p-12 bg-white dark:bg-stone-950 border-stone-200 dark:border-stone-800">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
            <div>
              <h2 className="text-4xl font-black tracking-tighter">Strategic Substitutions</h2>
              <p className="text-stone-500 font-medium text-lg mt-1">Alternative crops optimized for <span className="text-sage-600 font-bold">{userPrefs?.location}</span>.</p>
            </div>
            <div className="hidden md:block p-5 bg-stone-50 dark:bg-stone-900 rounded-3xl text-stone-400"><Calendar size={32} /></div>
         </div>
         
         <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {crops.filter(c => c.name !== userPrefs?.crop).map((c, i) => (
              <div key={i} className="group p-8 bg-stone-50 dark:bg-stone-900/50 rounded-[2.5rem] border-2 border-transparent hover:border-sage-600 hover:bg-white dark:hover:bg-stone-900 transition-all cursor-pointer shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <h4 className="text-2xl font-black tracking-tight">{c.name}</h4>
                  <span className="px-4 py-1.5 bg-sage-600 text-white rounded-full text-[10px] font-black tracking-widest uppercase">{c.suitability}% MATCH</span>
                </div>
                <div className="flex-1 h-2 bg-stone-200 dark:bg-stone-800 rounded-full overflow-hidden mb-6">
                   <motion.div initial={{ width: 0 }} whileInView={{ width: `${c.suitability}%` }} transition={{ duration: 1.5, ease: "easeOut" }} className="h-full bg-sage-600" />
                </div>
                <p className="text-sm text-stone-500 leading-relaxed font-medium">Excellent yield potential with {userPrefs?.aiMode} reasoning prioritizing drought resistance for this region.</p>
              </div>
            ))}
         </div>
      </section>
    </div>
  );
}
