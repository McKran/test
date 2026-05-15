/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, NavLink, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { LayoutDashboard, 
  CloudSun, 
  Sprout, 
  TrendingUp, 
  MessageSquare, 
  Settings, 
  Menu, 
  X,
  Leaf,
  Moon,
  Sun
} from "lucide-react";

import Dashboard from "./pages/Dashboard";
import Weather from "./pages/Weather";
import Crops from "./pages/Crops";
import Market from "./pages/Market";
import Chat from "./pages/Chat";
import SettingsPage from "./pages/Settings";
import Onboarding from "./components/Onboarding";
import { UserPrefs } from "./types";

const NavItem = ({ to, icon: Icon, children, onClick }: { to: string, icon: any, children?: React.ReactNode, onClick?: () => void }) => (
  <NavLink 
    to={to} 
    onClick={onClick}
    className={({ isActive }) => `
      flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
      ${isActive 
        ? "bg-sage-600 text-white shadow-lg shadow-sage-200 dark:shadow-none" 
        : "text-stone-600 dark:text-stone-400 hover:bg-sage-50 dark:hover:bg-stone-800 hover:text-sage-700"}
    `}
  >
    <Icon size={20} />
    {children && <span className="font-medium">{children}</span>}
  </NavLink>
);

const AppContent = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => localStorage.getItem("theme") === "dark");
  const [fontTheme, setFontTheme] = useState(() => localStorage.getItem("font_theme") || "font-inter");
  const [isOnboarded, setIsOnboarded] = useState(() => !!localStorage.getItem("user_prefs"));
  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location]);

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

  if (!isOnboarded) {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className={`min-h-screen bg-stone-50 dark:bg-[#0f1115] text-stone-900 dark:text-stone-200 ${fontTheme} transition-colors duration-300`}>
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between p-4 bg-white dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 sticky top-0 z-50">
        <div className="flex items-center gap-2 text-sage-700">
          <Leaf className="fill-sage-600" />
          <span className="font-bold text-xl tracking-tight">AgriAI</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button 
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-2 text-stone-600 dark:text-stone-400 active:scale-95 transition-transform"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <div className="flex h-[calc(100vh-64px)] lg:h-screen overflow-hidden">
        {/* Sidebar (Desktop) */}
        <aside className={`
          fixed lg:relative z-40 w-64 h-full bg-white dark:bg-stone-900 border-r border-stone-200 dark:border-stone-800 transition-transform duration-300
          ${isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}>
          <div className="p-6 hidden lg:flex items-center justify-between gap-2 text-sage-700 mb-8">
            <div className="flex items-center gap-2">
              <Leaf size={32} className="fill-sage-600" />
              <span className="font-extrabold text-2xl tracking-tighter">AgriAI</span>
            </div>
          </div>

          <nav className="px-4 space-y-1">
            <NavItem to="/" icon={LayoutDashboard}>Dashboard</NavItem>
            <NavItem to="/weather" icon={CloudSun}>Weather</NavItem>
            <NavItem to="/crops" icon={Sprout}>Crop Advice</NavItem>
            <NavItem to="/market" icon={TrendingUp}>Market Trends</NavItem>
            <NavItem to="/chat" icon={MessageSquare}>AI Assistant</NavItem>
          </nav>

          <div className="absolute bottom-8 left-0 right-0 px-4 space-y-2">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="w-full flex items-center gap-3 px-4 py-3 text-stone-600 dark:text-stone-400 hover:bg-sage-50 dark:hover:bg-stone-800 rounded-xl transition-all"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
              <span className="font-medium">{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
            </button>
            <NavItem to="/settings" icon={Settings}>Settings</NavItem>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-stone-50 dark:bg-stone-900 relative pb-20 lg:pb-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="p-4 lg:p-8 max-w-7xl mx-auto w-full"
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
      </div>

      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 px-6 py-3 z-50 flex justify-between items-center">
        <NavItem to="/" icon={LayoutDashboard} />
        <NavItem to="/weather" icon={CloudSun} />
        <NavItem to="/chat" icon={MessageSquare} />
        <NavItem to="/crops" icon={Sprout} />
        <NavItem to="/market" icon={TrendingUp} />
      </nav>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-stone-900/20 backdrop-blur-sm z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
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

