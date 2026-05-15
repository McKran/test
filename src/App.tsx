import { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  CloudSun,
  Sprout,
  TrendingUp,
  MessageSquare,
  Settings,
  Leaf,
  Moon,
  Sun,
  X,
  Menu,
} from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Weather from "./pages/Weather";
import Crops from "./pages/Crops";
import Market from "./pages/Market";
import Chat from "./pages/Chat";
import SettingsPage from "./pages/Settings";
import Onboarding from "./components/Onboarding";
import { UserPrefs } from "./types";

const navItems = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard" },
  { to: "/weather", icon: CloudSun, label: "Weather" },
  { to: "/crops", icon: Sprout, label: "Crop Advisor" },
  { to: "/market", icon: TrendingUp, label: "Markets" },
  { to: "/chat", icon: MessageSquare, label: "AI Chat" },
];

const AppContent = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [isOnboarded, setIsOnboarded] = useState(() => !!localStorage.getItem("user_prefs"));
  const location = useLocation();

  useEffect(() => { setMobileMenuOpen(false); }, [location]);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const handleOnboardingComplete = (data: UserPrefs) => {
    localStorage.setItem("user_prefs", JSON.stringify(data));
    setIsOnboarded(true);
  };

  if (!isOnboarded) return <Onboarding onComplete={handleOnboardingComplete} />;

  return (
    <div className="min-h-screen bg-[#f5f5f7] dark:bg-[#0a0a0b] text-stone-900 dark:text-stone-100 transition-colors duration-300">

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-60 bg-white dark:bg-[#111113] border-r border-stone-200/80 dark:border-stone-800/80 z-40">
        {/* Logo */}
        <div className="px-6 py-5 flex items-center gap-2.5 border-b border-stone-100 dark:border-stone-800/60">
          <div className="w-8 h-8 bg-sage-600 rounded-lg flex items-center justify-center shadow-sm">
            <Leaf size={16} className="text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight text-stone-900 dark:text-white">AgriAI</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-sage-50 dark:bg-sage-900/20 text-sage-700 dark:text-sage-400"
                    : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-200"
                }`
              }
            >
              <Icon size={17} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-stone-100 dark:border-stone-800/60 space-y-0.5">
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-200 transition-all"
          >
            {isDarkMode ? <Sun size={17} /> : <Moon size={17} />}
            {isDarkMode ? "Light Mode" : "Dark Mode"}
          </button>
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                isActive
                  ? "bg-sage-50 dark:bg-sage-900/20 text-sage-700 dark:text-sage-400"
                  : "text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800/60 hover:text-stone-900 dark:hover:text-stone-200"
              }`
            }
          >
            <Settings size={17} />
            Settings
          </NavLink>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-50 flex items-center justify-between px-4 h-14 bg-white/90 dark:bg-[#111113]/90 backdrop-blur-xl border-b border-stone-200/80 dark:border-stone-800/80">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-sage-600 rounded-md flex items-center justify-center">
            <Leaf size={14} className="text-white" />
          </div>
          <span className="font-bold text-base tracking-tight">AgriAI</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setMobileMenuOpen(!isMobileMenuOpen)} className="p-2 rounded-lg text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
            {isMobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </header>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 top-14 bg-black/20 z-40"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="lg:hidden fixed top-14 left-0 right-0 z-50 bg-white dark:bg-[#111113] border-b border-stone-200 dark:border-stone-800 px-3 py-2 space-y-0.5"
            >
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? "bg-sage-50 dark:bg-sage-900/20 text-sage-700 dark:text-sage-400"
                        : "text-stone-600 dark:text-stone-400"
                    }`
                  }
                >
                  <Icon size={17} />
                  {label}
                </NavLink>
              ))}
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive ? "bg-sage-50 dark:bg-sage-900/20 text-sage-700 dark:text-sage-400" : "text-stone-600 dark:text-stone-400"
                  }`
                }
              >
                <Settings size={17} />
                Settings
              </NavLink>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main className="lg:pl-60 min-h-screen">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="min-h-screen"
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/weather" element={<Weather />} />
              <Route path="/crops" element={<Crops />} />
              <Route path="/market" element={<Market />} />
              <Route path="/chat" element={<Chat />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="*" element={<Dashboard />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile Bottom Bar */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/90 dark:bg-[#111113]/90 backdrop-blur-xl border-t border-stone-200/80 dark:border-stone-800/80 flex items-center justify-around px-2 h-16">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all ${
                isActive ? "text-sage-600 dark:text-sage-400" : "text-stone-400 dark:text-stone-500"
              }`
            }
          >
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label.split(" ")[0]}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
