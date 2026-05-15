import { useState, useEffect } from "react";
import {
  MapPin,
  Globe,
  Moon,
  Sun,
  ChevronRight,
  LogOut,
  HelpCircle,
  Brain,
  Scale,
  Type,
  CloudLightning,
  RefreshCw,
  Eye,
  Sprout,
  User,
  ShieldCheck,
} from "lucide-react";
import { UserPrefs } from "../types";

interface ToggleProps {
  active: boolean;
  onClick: () => void;
}

function Toggle({ active, onClick }: ToggleProps) {
  return (
    <button
      onClick={onClick}
      className={`relative w-11 h-6 rounded-full transition-colors duration-200 focus:outline-none ${active ? "bg-sage-600" : "bg-stone-200 dark:bg-stone-700"}`}
      role="switch"
      aria-checked={active}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${active ? "translate-x-5" : ""}`}
      />
    </button>
  );
}

interface RowProps {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  children: React.ReactNode;
  divider?: boolean;
}

function Row({ icon, iconBg, label, children, divider = true }: RowProps) {
  return (
    <div className={`flex items-center justify-between px-4 py-3.5 ${divider ? "border-b border-stone-100 dark:border-stone-800/60" : ""}`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 ${iconBg} rounded-lg flex items-center justify-center text-white shrink-0`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-stone-900 dark:text-stone-100">{label}</span>
      </div>
      <div className="flex items-center gap-2 text-stone-400">
        {children}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-1 text-xs font-semibold text-stone-400 uppercase tracking-widest mb-1.5">{children}</p>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl overflow-hidden shadow-sm">
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [prefs, setPrefs] = useState<UserPrefs | null>(null);
  const [isDark, setIsDark] = useState(false);
  const [fontTheme, setFontTheme] = useState("Inter");
  const [dataRefresh, setDataRefresh] = useState(true);
  const [modelVisibility, setModelVisibility] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("user_prefs");
    if (saved) setPrefs(JSON.parse(saved));
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const updatePref = (key: keyof UserPrefs, value: any) => {
    if (!prefs) return;
    const newPrefs = { ...prefs, [key]: value };
    setPrefs(newPrefs);
    localStorage.setItem("user_prefs", JSON.stringify(newPrefs));
    if (key === "theme") {
      document.documentElement.classList.toggle("dark", value === "dark");
      setIsDark(value === "dark");
    }
  };

  const toggleDark = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    if (prefs) updatePref("theme", next ? "dark" : "light");
  };

  const handleReset = () => {
    if (confirm("Reset all settings? This will restart the setup wizard.")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  if (!prefs) return null;

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-8 space-y-6">

      {/* Profile Header */}
      <div className="flex items-center gap-4 p-4 bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl shadow-sm">
        <div className="w-12 h-12 bg-sage-50 dark:bg-sage-900/20 rounded-xl flex items-center justify-center">
          <User size={24} className="text-sage-600 dark:text-sage-400" />
        </div>
        <div>
          <p className="text-base font-semibold text-stone-900 dark:text-white">{prefs.location}</p>
          <p className="text-xs text-stone-400 mt-0.5 font-medium">
            {prefs.country} · {prefs.currency} · {prefs.crop}
          </p>
        </div>
      </div>

      {/* === LOCATION & IDENTITY === */}
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
          <Row icon={<CloudLightning size={14} />} iconBg="bg-amber-500" label="Currency" divider={false}>
            <span className="text-sm text-stone-400 font-medium">{prefs.currency}</span>
            <ChevronRight size={15} />
          </Row>
        </Card>
      </div>

      {/* === APPEARANCE === */}
      <div className="space-y-1.5">
        <SectionLabel>Appearance</SectionLabel>
        <Card>
          <Row icon={isDark ? <Moon size={14} /> : <Sun size={14} />} iconBg="bg-indigo-500" label="Dark Mode">
            <Toggle active={isDark} onClick={toggleDark} />
          </Row>
          <Row icon={<Type size={14} />} iconBg="bg-slate-500" label="Font Style" divider={false}>
            <div className="flex gap-1">
              {["Inter", "System", "Mono"].map(f => (
                <button
                  key={f}
                  onClick={() => setFontTheme(f)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                    fontTheme === f
                      ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-500"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </Row>
        </Card>
      </div>

      {/* === AI & INTELLIGENCE === */}
      <div className="space-y-1.5">
        <SectionLabel>AI & Intelligence</SectionLabel>
        <Card>
          <Row icon={<Brain size={14} />} iconBg="bg-purple-500" label="AI Mode">
            <div className="flex gap-1">
              {(["fast", "balanced", "expert"] as const).map(m => (
                <button
                  key={m}
                  onClick={() => updatePref("aiMode", m)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-all ${
                    prefs.aiMode === m
                      ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-500"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </Row>
          <Row icon={<Eye size={14} />} iconBg="bg-pink-500" label="Show Model Routing">
            <Toggle active={modelVisibility} onClick={() => setModelVisibility(v => !v)} />
          </Row>
          <Row icon={<ShieldCheck size={14} />} iconBg="bg-orange-500" label="AI Flexibility" divider={false}>
            <div className="flex gap-1">
              {(["strict", "flexible"] as const).map(f => (
                <button
                  key={f}
                  onClick={() => updatePref("aiFlexibility", f)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg capitalize transition-all ${
                    prefs.aiFlexibility === f
                      ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-500"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </Row>
        </Card>
      </div>

      {/* === DATA & PREFERENCES === */}
      <div className="space-y-1.5">
        <SectionLabel>Data & Preferences</SectionLabel>
        <Card>
          <Row icon={<Scale size={14} />} iconBg="bg-stone-500" label="Units">
            <div className="flex gap-1">
              {(["kg", "ton", "gram"] as const).map(u => (
                <button
                  key={u}
                  onClick={() => updatePref("units", u)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-all ${
                    prefs.units === u
                      ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900"
                      : "bg-stone-100 dark:bg-stone-800 text-stone-500"
                  }`}
                >
                  {u}
                </button>
              ))}
            </div>
          </Row>
          <Row icon={<RefreshCw size={14} />} iconBg="bg-teal-500" label="Auto Refresh Data" divider={false}>
            <Toggle active={dataRefresh} onClick={() => setDataRefresh(v => !v)} />
          </Row>
        </Card>
      </div>

      {/* === ACCOUNT === */}
      <div className="space-y-1.5">
        <SectionLabel>Account</SectionLabel>
        <Card>
          <Row icon={<HelpCircle size={14} />} iconBg="bg-blue-400" label="Documentation" divider={false}>
            <ChevronRight size={15} />
          </Row>
        </Card>
      </div>

      {/* Reset */}
      <button
        onClick={handleReset}
        className="w-full flex items-center justify-center gap-2 py-3.5 text-sm font-semibold text-red-500 bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors shadow-sm"
      >
        <LogOut size={15} />
        Reset All Settings
      </button>

      <p className="text-center text-[11px] text-stone-300 dark:text-stone-600 font-medium">AgriAI · Version 2.4.1</p>
    </div>
  );
}
