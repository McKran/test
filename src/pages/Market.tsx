import { useState, useEffect } from "react";
import {
  TrendingUp,
  TrendingDown,
  Search,
  BarChart3,
  ArrowUpRight,
  Minus,
} from "lucide-react";
import { motion } from "motion/react";
import { marketService } from "../services/api";
import { MarketPrice, UserPrefs } from "../types";

const CATEGORIES = ["All", "Grain", "Fruit", "Vegetable", "Cash Crop"];

const CROP_CATEGORIES: Record<string, string> = {
  Rice: "Grain", Corn: "Grain", Wheat: "Grain", Soybeans: "Grain", Cassava: "Grain",
  Potatoes: "Vegetable", Tomatoes: "Vegetable",
  Durian: "Fruit",
  Cashews: "Cash Crop", Tea: "Cash Crop",
};

const MiniSparkline = ({ up, stable }: { up: boolean; stable: boolean }) => {
  const heights = stable
    ? [50, 55, 48, 52, 50, 54, 51, 53]
    : up
    ? [30, 38, 35, 50, 55, 62, 70, 85]
    : [85, 75, 70, 60, 55, 48, 40, 32];

  const color = stable ? "bg-stone-300 dark:bg-stone-600" : up ? "bg-emerald-500" : "bg-red-400";
  const dimColor = stable ? "bg-stone-200/50 dark:bg-stone-700/40" : up ? "bg-emerald-500/20" : "bg-red-400/20";

  return (
    <div className="flex items-end gap-0.5 h-8 w-14">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm ${i === heights.length - 1 ? color : dimColor}`}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
};

const MOCK_CHANGES: Record<string, string> = {
  Rice: "+2.1%", Corn: "-0.8%", Wheat: "+1.4%", Soybeans: "+3.2%", Cassava: "-1.1%",
  Potatoes: "+0.5%", Tomatoes: "-2.4%", Durian: "+5.7%", Cashews: "+1.9%", Tea: "-0.3%",
};

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

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <div className="flex gap-1 items-end h-8">
        {[0.4, 0.7, 0.5, 0.9, 0.6].map((h, i) => (
          <motion.div
            key={i}
            animate={{ scaleY: [h, 1 - h + 0.2, h] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.12 }}
            style={{ originY: 1 }}
            className="w-1.5 bg-sage-600 rounded-full h-8"
          />
        ))}
      </div>
      <p className="text-sm text-stone-400 font-medium">Loading markets...</p>
    </div>
  );

  const filteredPrices = prices.filter(p => {
    const matchSearch = p.crop.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || CROP_CATEGORIES[p.crop] === filter;
    return matchSearch && matchFilter;
  });

  const featured = filteredPrices.slice(0, 3);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-8 space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <BarChart3 size={16} className="text-sage-600" />
            <h1 className="text-xl font-bold text-stone-900 dark:text-white">Markets</h1>
          </div>
          <p className="text-sm text-stone-400">
            Commodity prices in <span className="font-semibold text-stone-600 dark:text-stone-300">{userPrefs?.currency}</span>
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            placeholder="Search crop..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm bg-white dark:bg-[#111113] border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-600/30 focus:border-sage-500 dark:text-white transition-all w-48"
          />
        </div>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              filter === c
                ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900"
                : "bg-white dark:bg-[#111113] border border-stone-200 dark:border-stone-800 text-stone-500 hover:border-stone-300 dark:hover:border-stone-700"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {/* === FEATURED TICKER CARDS (TradingView Style) === */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {featured.map((p, i) => {
          const changeStr = MOCK_CHANGES[p.crop] ?? "+0.0%";
          const isUp = changeStr.startsWith("+");
          const isStable = p.trend === "stable";
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-sage-300 dark:hover:border-sage-700 transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Spot Price</p>
                  <p className="text-base font-bold text-stone-900 dark:text-white mt-0.5 flex items-center gap-1">
                    {p.crop}
                    <ArrowUpRight size={13} className="text-stone-300 group-hover:text-sage-500 transition-colors" />
                  </p>
                </div>
                <MiniSparkline up={isUp} stable={isStable} />
              </div>
              <p className="text-xl font-bold text-stone-900 dark:text-white">
                {p.currency} {p.price.toFixed(2)}
              </p>
              <div className="flex items-center justify-between mt-1.5">
                <span className="text-[11px] text-stone-400">per {p.unit}</span>
                <span className={`text-[11px] font-semibold flex items-center gap-0.5 px-1.5 py-0.5 rounded-md ${
                  isStable ? "text-stone-500 bg-stone-50 dark:bg-stone-800"
                  : isUp ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                  : "text-red-500 bg-red-50 dark:bg-red-900/20"
                }`}>
                  {isStable ? <Minus size={10} /> : isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                  {changeStr}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* === MAIN TABLE (Binance/TradingView Style) === */}
      <div className="bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-stone-100 dark:border-stone-800/60">
          <div className="col-span-5">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest"># Name</p>
          </div>
          <div className="col-span-3 text-right">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">Price / kg</p>
          </div>
          <div className="col-span-2 text-right hidden sm:block">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">24h %</p>
          </div>
          <div className="col-span-2 hidden sm:block" />
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-stone-100/80 dark:divide-stone-800/40">
          {filteredPrices.length === 0 ? (
            <div className="py-12 text-center text-sm text-stone-400">No results for "{search}"</div>
          ) : (
            filteredPrices.map((p, i) => {
              const changeStr = MOCK_CHANGES[p.crop] ?? "+0.0%";
              const isUp = changeStr.startsWith("+");
              const isStable = p.trend === "stable";
              const isUserCrop = p.crop === userPrefs?.crop;

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="grid grid-cols-12 gap-2 px-4 py-3.5 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors cursor-pointer items-center"
                >
                  {/* Name */}
                  <div className="col-span-5 flex items-center gap-3">
                    <span className="text-xs text-stone-300 dark:text-stone-600 w-4 font-mono">{i + 1}</span>
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                      isUp
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                        : "bg-red-50 dark:bg-red-900/20 text-red-500"
                    }`}>
                      {p.crop.charAt(0)}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${isUserCrop ? "text-sage-600 dark:text-sage-400" : "text-stone-900 dark:text-white"}`}>
                        {p.crop}
                        {isUserCrop && <span className="ml-1.5 text-[9px] font-bold bg-sage-100 dark:bg-sage-900/30 text-sage-600 dark:text-sage-400 px-1.5 py-0.5 rounded-full uppercase">Your Crop</span>}
                      </p>
                      <p className="text-[11px] text-stone-400">{CROP_CATEGORIES[p.crop] ?? "Other"}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="col-span-3 text-right">
                    <p className="text-sm font-semibold text-stone-900 dark:text-white tabular-nums">
                      {p.currency} {p.price.toFixed(2)}
                    </p>
                    <p className="text-[11px] text-stone-400">per {p.unit}</p>
                  </div>

                  {/* Change */}
                  <div className="col-span-2 text-right hidden sm:block">
                    <span className={`inline-flex items-center gap-0.5 text-xs font-semibold px-2 py-0.5 rounded-md ${
                      isStable ? "text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800"
                      : isUp ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20"
                      : "text-red-500 bg-red-50 dark:bg-red-900/20"
                    }`}>
                      {isStable ? <Minus size={10} /> : isUp ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {changeStr}
                    </span>
                  </div>

                  {/* Sparkline */}
                  <div className="col-span-2 hidden sm:flex justify-end">
                    <MiniSparkline up={isUp} stable={isStable} />
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Footer note */}
      <p className="text-xs text-stone-400 text-center pb-2">
        Prices are simulated for demonstration. Data refreshes on page load.
      </p>
    </div>
  );
}
