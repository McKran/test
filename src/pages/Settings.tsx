import { useState, useEffect } from "react";
import { 
  User, 
  MapPin, 
  Globe, 
  Moon, 
  Sun, 
  ChevronRight, 
  LogOut, 
  HelpCircle,
  Zap,
  Brain,
  Scale,
  Type,
  CloudLightning
} from "lucide-react";
import { UserPrefs } from "../types";

export default function Settings() {
  const [prefs, setPrefs] = useState<UserPrefs | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("user_prefs");
    if (saved) setPrefs(JSON.parse(saved));
  }, []);

  const updatePref = (key: keyof UserPrefs, value: any) => {
    if (!prefs) return;
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    localStorage.setItem("user_prefs", JSON.stringify(newPrefs));
    if (key === 'theme') {
      document.documentElement.classList.toggle('dark', value === 'dark');
    }
  };

  if (!prefs) return null;

  return (
    <div className="max-w-xl mx-auto space-y-10 pb-32 mt-10 px-4">
      
      {/* Header */}
      <div className="flex flex-col items-center gap-4 text-center">
         <div className="w-24 h-24 bg-stone-100 dark:bg-stone-800 rounded-full flex items-center justify-center text-sage-600 shadow-inner">
            <User size={48} />
         </div>
         <div>
           <h1 className="text-3xl font-black tracking-tight">System Configuration</h1>
           <p className="text-stone-500 font-medium tracking-wide uppercase text-[10px] mt-1">Platform v2.4.1 (Stable)</p>
         </div>
      </div>

      {/* iOS Style Grouped List */}
      <div className="space-y-8">
        
        {/* Profile Group */}
        <div className="space-y-2">
          <p className="px-4 text-[10px] font-black uppercase text-stone-400 tracking-[0.2em]">Profile & Identity</p>
          <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-[2rem] overflow-hidden shadow-sm">
            <SettingsItem 
              icon={<MapPin size={20} />} 
              iconColor="bg-blue-500" 
              label="Farm Location" 
              value={prefs.location} 
            />
            <SettingsItem 
              icon={<Globe size={20} />} 
              iconColor="bg-green-500" 
              label="Country" 
              value={prefs.country} 
            />
             <SettingsItem 
              icon={<CloudLightning size={20} />} 
              iconColor="bg-yellow-500" 
              label="Market Currency" 
              value={prefs.currency} 
              isLast
            />
          </div>
        </div>

        {/* Intelligence Group */}
        <div className="space-y-2">
          <p className="px-4 text-[10px] font-black uppercase text-stone-400 tracking-[0.2em]">Intelligence Protocols</p>
          <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-[2rem] overflow-hidden shadow-sm">
            <SettingsToggle 
              icon={<Brain size={20} />} 
              iconColor="bg-purple-500" 
              label="Advanced Reasoning" 
              active={prefs.aiMode === 'Analytical' || prefs.aiMode === 'expert'}
              onClick={() => updatePref('aiMode', (prefs.aiMode === 'Analytical' || prefs.aiMode === 'expert') ? 'Creative' : 'Analytical')}
            />
            <SettingsItem 
              icon={<Zap size={20} />} 
              iconColor="bg-amber-500" 
              label="Routing Strategy" 
              value="Latency Optimized" 
              isLast
            />
          </div>
        </div>

        {/* Interface Group */}
        <div className="space-y-2">
          <p className="px-4 text-[10px] font-black uppercase text-stone-400 tracking-[0.2em]">Interface Engine</p>
          <div className="bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-[2rem] overflow-hidden shadow-sm">
            <SettingsToggle 
              icon={prefs.theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />} 
              iconColor="bg-indigo-500" 
              label="Dark Atmosphere" 
              active={prefs.theme === 'dark'}
              onClick={() => updatePref('theme', prefs.theme === 'dark' ? 'light' : 'dark')}
            />
            <SettingsItem 
              icon={<Scale size={20} />} 
              iconColor="bg-stone-500" 
              label="Measurement System" 
              value={prefs.units.toUpperCase()} 
            />
             <SettingsItem 
              icon={<Type size={20} />} 
              iconColor="bg-slate-500" 
              label="Typography" 
              value="Inter" 
              isLast
            />
          </div>
        </div>

        {/* System Group */}
        <div className="space-y-4 pt-4">
           <button className="w-full flex items-center justify-center gap-3 p-5 bg-white dark:bg-stone-900 border border-stone-100 dark:border-stone-800 rounded-[2rem] text-red-600 font-bold hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors shadow-sm">
              <LogOut size={20} />
              Reset All Telemetry
           </button>
           <button className="w-full flex items-center justify-center gap-3 p-5 text-stone-400 font-bold text-sm tracking-widest uppercase py-8 opacity-50 hover:opacity-100 transition-opacity">
              <HelpCircle size={20} />
              Open Global Protocol Docs
           </button>
        </div>
      </div>
    </div>
  );
}

function SettingsItem({ icon, iconColor, label, value, isLast = false }: { icon: React.ReactNode, iconColor: string, label: string, value: string, isLast?: boolean }) {
  return (
    <div className={`p-4 flex items-center justify-between hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-all cursor-pointer ${!isLast ? 'border-b border-stone-50 dark:border-stone-800/50' : ''}`}>
      <div className="flex items-center gap-4">
        <div className={`w-9 h-9 ${iconColor} text-white rounded-xl flex items-center justify-center shadow-sm`}>
          {icon}
        </div>
        <span className="font-bold text-stone-900 dark:text-white tracking-tight">{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-sm font-bold text-stone-400">{value}</span>
        <ChevronRight size={18} className="text-stone-200" />
      </div>
    </div>
  );
}

function SettingsToggle({ icon, iconColor, label, active, onClick }: { icon: React.ReactNode, iconColor: string, label: string, active: boolean, onClick: () => void }) {
  return (
    <div className="p-4 flex items-center justify-between border-b border-stone-50 dark:border-stone-800/50">
      <div className="flex items-center gap-4">
        <div className={`w-9 h-9 ${iconColor} text-white rounded-xl flex items-center justify-center shadow-sm`}>
          {icon}
        </div>
        <span className="font-bold text-stone-900 dark:text-white tracking-tight">{label}</span>
      </div>
      <button 
        onClick={onClick}
        className={`w-14 h-8 rounded-full transition-all relative ${active ? 'bg-sage-600' : 'bg-stone-200 dark:bg-stone-700'}`}
      >
        <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-md ${active ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );
}
