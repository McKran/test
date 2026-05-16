import { useState, useEffect } from "react";
import {
  MapPin, Globe, Moon, Sun, ChevronRight, LogOut, HelpCircle,
  Brain, Scale, Type, RefreshCw, Eye, Sprout, User, ShieldCheck,
} from "lucide-react";
import { UserPrefs } from "../types";

interface ToggleProps { active: boolean; onClick: () => void; }
function Toggle({ active, onClick }: ToggleProps) {
  return (
    <button onClick={onClick}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${active ? "bg-sage-600" : "bg-stone-200 dark:bg-stone-700"}`}
      role="switch" aria-checked={active}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${active ? "translate-x-5" : ""}`} />
    </button>
  );
}

function Row({ icon, iconBg, label, children, divider = true }: {
  icon: React.ReactNode; iconBg: string; label: string; children: React.ReactNode; divider?: boolean;
}) {
  return (
    <div className={`flex items-center justify-between px-4 py-3.5 ${divider ? "border-b border-stone-100 dark:border-stone-800/50" : ""}`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center text-white shrink-0`}>{icon}</div>
        <span className="text-sm font-medium text-stone-900 dark:text-stone-100">{label}</span>
      </div>
      <div className="flex items-center gap-2 text-stone-400">{children}</div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="px-1 text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">{children}</p>;
}
function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white dark:bg-[#16161a] border border-stone-200/80 dark:border-stone-800/50 rounded-2xl overflow-hidden shadow-sm">{children}</div>;
}

const FONT_OPTIONS = [
  { key: "inter", label: "Inter", family: '"Inter", sans-serif' },
  { key: "dm", label: "DM Sans", family: '"DM Sans", sans-serif' },
  { key: "nunito", label: "Nunito", family: '"Nunito", sans-serif' },
  { key: "system", label: "System", family: 'system-ui, sans-serif' },
  { key: "mono", label: "Mono", family: 'ui-monospace, monospace' },
];

const FONT_CLASSES = ["font-theme-inter","font-theme-dm","font-theme-nunito","font-theme-system","font-theme-mono"];

interface Props { onFontChange?: (font: string) => void; }

export default function SettingsPage({ onFontChange }: Props) {
  const [prefs, setPrefs] = useState<UserPrefs | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [fontKey, setFontKey] = useState("inter");
  const [dataRefresh, setDataRefresh] = useState(true);
  const [modelVisibility, setModelVisibility] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("user_prefs");
    if (saved) setPrefs(JSON.parse(saved));
    setIsDark(document.documentElement.classList.contains("dark"));
    setFontKey(localStorage.getItem("font_pref") || "inter");
  }, []);

  const applyFont = (key: string) => {
    setFontKey(key);
    localStorage.setItem("font_pref", key);
    FONT_CLASSES.forEach(c => document.documentElement.classList.remove(c));
    document.documentElement.classList.add(`font-theme-${key}`);
    onFontChange?.(key);
  };

  const updatePref = (key: keyof UserPrefs, value: any) => {
    if (!prefs) return;
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    localStorage.setItem("user_prefs", JSON.stringify(next));
    if (key === "theme") {
      document.documentElement.classList.toggle("dark", value === "dark");
      localStorage.setItem("theme", value);
      setIsDark(value === "dark");
    }
  };

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    if (prefs) { const p = { ...prefs, theme: next ? "dark" : "light" }; setPrefs(p as any); localStorage.setItem("user_prefs", JSON.stringify(p)); }
  };

  if (!prefs) return null;

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-8 space-y-6">

      {/* Profile */}
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-[#16161a] border border-stone-200/80 dark:border-stone-800/50 rounded-2xl shadow-sm">
        <div className="w-12 h-12 bg-sage-50 dark:bg-sage-900/20 rounded-xl flex items-center justify-center">
          <User size={24} className="text-sage-600 dark:text-sage-400" />
        </div>
        <div>
          <p className="text-base font-semibold text-stone-900 dark:text-white">{prefs.location}</p>
          <p className="text-xs text-stone-400 mt-0.5 font-medium">{prefs.country} · {prefs.currency} · {prefs.crop}</p>
        </div>
      </div>

      {/* LOCATION */}
      <div className="space-y-1.5">
        <SectionLabel>Location & Identity</SectionLabel>
        <Card>
          <Row icon={<MapPin size={14} />} iconBg="bg-blue-500" label="Farm Location">
            <span className="text-sm text-stone-400 font-medium truncate max-w-[140px]">{prefs.location}</span>
            <ChevronRight size={15} />
          </Row>
          <Row icon={<Globe size={14} />} iconBg="bg-emerald-500" label="Country">
            <span className="text-sm text-stone-400 font-medium">{prefs.country}</span>
            <ChevronRight size={15} />
          </Row>
          <Row icon={<Sprout size={14} />} iconBg="bg-sage-600" label="Primary Crop">
            <span className="text-sm text-stone-400 font-medium">{prefs.crop}</span>
            <ChevronRight size={15} />
          </Row>
          <Row icon={<Globe size={14} />} iconBg="bg-amber-500" label="Currency" divider={false}>
            <span className="text-sm text-stone-400 font-medium">{prefs.currency}</span>
            <ChevronRight size={15} />
          </Row>
        </Card>
      </div>

      {/* APPEARANCE */}
      <div className="space-y-1.5">
        <SectionLabel>Appearance</SectionLabel>
        <Card>
          <Row icon={isDark ? <Moon size={14} /> : <Sun size={14} />} iconBg="bg-indigo-500" label="Dark Mode">
            <Toggle active={isDark} onClick={toggleDark} />
          </Row>
          <div className="px-4 py-3.5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-slate-500 rounded-lg flex items-center justify-center text-white shrink-0">
                <Type size={14} />
              </div>
              <span className="text-sm font-medium text-stone-900 dark:text-stone-100">Font Style</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {FONT_OPTIONS.map(({ key, label, family }) => (
                <button key={key} onClick={() => applyFont(key)}
                  style={{ fontFamily: family }}
                  className={`flex flex-col items-center gap-1 px-2 py-2.5 rounded-xl text-center transition-all border ${
                    fontKey === key
                      ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900 border-transparent"
                      : "bg-stone-50 dark:bg-stone-800/60 text-stone-600 dark:text-stone-400 border-stone-200 dark:border-stone-700/60 hover:border-stone-300"
                  }`}>
                  <span className="text-base font-semibold leading-none">Aa</span>
                  <span className="text-[10px] font-medium">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </div>

      {/* AI */}
      <div className="space-y-1.5">
        <SectionLabel>AI & Intelligence</SectionLabel>
        <Card>
          <Row icon={<Brain size={14} />} iconBg="bg-purple-500" label="AI Mode">
            <div className="flex gap-1">
              {(["fast", "balanced", "expert"] as const).map(m => (
                <button key={m} onClick={() => updatePref("aiMode", m)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-all ${
                    prefs.aiMode === m ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900" : "bg-stone-100 dark:bg-stone-800 text-stone-500"
                  }`}>{m}</button>
              ))}
            </div>
          </Row>
          <Row icon={<Eye size={14} />} iconBg="bg-pink-500" label="Show Model Labels">
            <Toggle active={modelVisibility} onClick={() => setModelVisibility(v => !v)} />
          </Row>
          <Row icon={<ShieldCheck size={14} />} iconBg="bg-orange-500" label="AI Flexibility" divider={false}>
            <div className="flex gap-1">
              {(["strict", "flexible"] as const).map(f => (
                <button key={f} onClick={() => updatePref("aiFlexibility", f)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-all ${
                    prefs.aiFlexibility === f ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900" : "bg-stone-100 dark:bg-stone-800 text-stone-500"
                  }`}>{f}</button>
              ))}
            </div>
          </Row>
        </Card>
      </div>

      {/* DATA */}
      <div className="space-y-1.5">
        <SectionLabel>Data & Units</SectionLabel>
        <Card>
          <Row icon={<Scale size={14} />} iconBg="bg-stone-500" label="Weight Units">
            <div className="flex gap-1">
              {(["kg", "ton", "gram"] as const).map(u => (
                <button key={u} onClick={() => updatePref("units", u)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                    prefs.units === u ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900" : "bg-stone-100 dark:bg-stone-800 text-stone-500"
                  }`}>{u}</button>
              ))}
            </div>
          </Row>
          <Row icon={<RefreshCw size={14} />} iconBg="bg-teal-500" label="Auto Refresh Data" divider={false}>
            <Toggle active={dataRefresh} onClick={() => setDataRefresh(v => !v)} />
          </Row>
        </Card>
      </div>

      {/* ACCOUNT */}
      <div className="space-y-1.5">
        <SectionLabel>Account</SectionLabel>
        <Card>
          <Row icon={<HelpCircle size={14} />} iconBg="bg-blue-400" label="Documentation" divider={false}>
            <ChevronRight size={15} />
          </Row>
        </Card>
      </div>

      <button onClick={() => { if (confirm("Reset all settings? This will restart the setup wizard.")) { localStorage.clear(); window.location.reload(); } }}
        className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-red-500 bg-white dark:bg-[#16161a] border border-stone-200/80 dark:border-stone-800/50 rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors shadow-sm">
        <LogOut size={15} /> Reset All Settings
      </button>

      <p className="text-center text-[11px] text-stone-300 dark:text-stone-600 font-medium">AgriAI · Open-Source Edition · v3.0</p>
    </div>
  );
}
