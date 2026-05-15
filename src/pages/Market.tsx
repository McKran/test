import { useState, useEffect, useCallback } from "react";
import {
  TrendingUp,
  TrendingDown,
  Search,
  BarChart3,
  ArrowUpRight,
  Minus,
  RefreshCw,
  Globe,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { marketService, currencyService } from "../services/api";
import { MarketPrice, UserPrefs, CurrencyRates } from "../types";

const ALL_CATEGORIES = ["All", "Grain", "Legume", "Vegetable", "Fruit", "Cash Crop", "Oilseed", "Nut", "Spice"];

const CURRENCIES = ["USD", "EUR", "GBP", "INR", "CNY", "JPY", "PHP", "BRL", "AUD", "CAD", "KRW", "THB", "VND", "IDR", "MYR", "NGN", "KES", "ZAR", "EGP", "TRY", "SAR"];

const MiniSparkline = ({ up, stable }: { up: boolean; stable: boolean }) => {
  const heights = stable
    ? [50, 52, 48, 53, 50, 54, 51, 53]
    : up
    ? [28, 36, 33, 50, 58, 68, 76, 88]
    : [88, 76, 68, 58, 50, 40, 34, 26];
  return (
    <div className="flex items-end gap-0.5 h-7 w-14">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`flex-1 rounded-sm ${
            i === heights.length - 1
              ? stable ? "bg-stone-400 dark:bg-stone-500" : up ? "bg-emerald-500" : "bg-red-400"
              : stable ? "bg-stone-200 dark:bg-stone-700" : up ? "bg-emerald-500/20" : "bg-red-400/20"
          }`}
          style={{ height: `${h}%` }}
        />
      ))}
    </div>
  );
};

const ChangeTag = ({ value, stable }: { value: number; stable: boolean }) => {
  if (stable || Math.abs(value) < 0.5) {
    return (
      <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400">
        <Minus size={9} />stable
      </span>
    );
  }
  const isUp = value > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md ${
      isUp ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "bg-red-50 dark:bg-red-900/20 text-red-500"
    }`}>
      {isUp ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      {value > 0 ? "+" : ""}{value.toFixed(2)}%
    </span>
  );
};

export default function Market() {
  const [prices, setPrices] = useState<MarketPrice[]>([]);
  const [rates, setRates] = useState<CurrencyRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userPrefs, setUserPrefs] = useState<UserPrefs | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "change">("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const loadData = useCallback(async (cur: string, cat: string, prefs: UserPrefs) => {
    const [p, r] = await Promise.all([
      marketService.getPrices(cur, prefs.country, cat === "All" ? undefined : cat),
      currencyService.getRates(),
    ]);
    setPrices(p);
    setRates(r);
  }, []);

  useEffect(() => {
    const prefs = JSON.parse(localStorage.getItem("user_prefs") || "{}") as UserPrefs;
    setUserPrefs(prefs);
    const defaultCurrency = prefs.currency || "USD";
    setCurrency(defaultCurrency);
    loadData(defaultCurrency, "All", prefs).finally(() => setLoading(false));
  }, []);

  const handleCurrencyChange = async (newCurrency: string) => {
    if (!userPrefs) return;
    setCurrency(newCurrency);
    setRefreshing(true);
    await loadData(newCurrency, category, userPrefs).catch(() => {});
    setRefreshing(false);
  };

  const handleCategoryChange = async (newCat: string) => {
    if (!userPrefs) return;
    setCategory(newCat);
    setRefreshing(true);
    await loadData(currency, newCat, userPrefs).catch(() => {});
    setRefreshing(false);
  };

  const handleRefresh = async () => {
    if (!userPrefs || refreshing) return;
    setRefreshing(true);
    await loadData(currency, category, userPrefs).catch(() => {});
    setRefreshing(false);
  };

  const handleSort = (col: "name" | "price" | "change") => {
    if (sortBy === col) {
      setSortDir(d => d === "asc" ? "desc" : "asc");
    } else {
      setSortBy(col);
      setSortDir("asc");
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
      <div className="flex gap-1 items-end h-8">
        {[0.4, 0.7, 0.5, 0.9, 0.6].map((h, i) => (
          <motion.div key={i} animate={{ scaleY: [h, 1 - h + 0.2, h] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.12 }}
            style={{ originY: 1 }} className="w-1.5 bg-sage-600 rounded-full h-8" />
        ))}
      </div>
      <p className="text-sm text-stone-400 font-medium">Loading market data...</p>
    </div>
  );

  const filtered = prices
    .filter(p => {
      const s = search.toLowerCase();
      return (
        p.crop.toLowerCase().includes(s) ||
        p.category.toLowerCase().includes(s) ||
        (p.regions ?? []).some(r => r.toLowerCase().includes(s))
      );
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === "name") cmp = a.crop.localeCompare(b.crop);
      else if (sortBy === "price") cmp = a.price - b.price;
      else cmp = a.changePercent - b.changePercent;
      return sortDir === "asc" ? cmp : -cmp;
    });

  const featured = filtered.slice(0, 3);
  const exchangeRate = rates?.rates[currency] ?? 1;

  const SortHeader = ({ col, label }: { col: "name" | "price" | "change"; label: string }) => (
    <button onClick={() => handleSort(col)} className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest hover:text-stone-600 dark:hover:text-stone-300 flex items-center gap-0.5 transition-colors">
      {label}
      {sortBy === col && <span className="text-sage-500">{sortDir === "asc" ? " ↑" : " ↓"}</span>}
    </button>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 lg:pb-8 space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <BarChart3 size={16} className="text-sage-600" />
            <h1 className="text-xl font-bold text-stone-900 dark:text-white">Markets</h1>
            {refreshing && <RefreshCw size={13} className="animate-spin text-stone-400" />}
          </div>
          <p className="text-xs text-stone-400">
            {filtered.length} commodities · Live prices ·{" "}
            {rates && <span className="font-medium text-stone-500 dark:text-stone-400">1 USD = {exchangeRate.toFixed(3)} {currency}</span>}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Currency selector */}
          <div className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-[#111113] border border-stone-200 dark:border-stone-800 rounded-xl">
            <Globe size={13} className="text-stone-400 shrink-0" />
            <select
              value={currency}
              onChange={e => handleCurrencyChange(e.target.value)}
              className="text-xs font-semibold bg-transparent text-stone-900 dark:text-white focus:outline-none cursor-pointer"
            >
              {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Search */}
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-8 pr-3 py-2 text-xs bg-white dark:bg-[#111113] border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-sage-600/30 dark:text-white transition-all w-36"
            />
          </div>

          <button onClick={handleRefresh} disabled={refreshing}
            className="p-2 rounded-xl bg-white dark:bg-[#111113] border border-stone-200 dark:border-stone-800 text-stone-400 hover:text-stone-600 transition-colors">
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
        <Filter size={14} className="text-stone-400 shrink-0 mt-1.5" />
        {ALL_CATEGORIES.map(c => (
          <button key={c} onClick={() => handleCategoryChange(c)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all ${
              category === c
                ? "bg-stone-900 dark:bg-white text-white dark:text-stone-900"
                : "bg-white dark:bg-[#111113] border border-stone-200 dark:border-stone-800 text-stone-500 hover:border-stone-300"
            }`}>
            {c}
          </button>
        ))}
      </div>

      {/* === FEATURED TICKER CARDS === */}
      {featured.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {featured.map((p, i) => {
            const isUp = p.changePercent > 0.5;
            const isStable = Math.abs(p.changePercent) <= 0.5;
            return (
              <motion.div key={i} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                className="bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all group cursor-pointer">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Spot Price</p>
                    <p className="text-sm font-bold text-stone-900 dark:text-white mt-0.5 flex items-center gap-1">
                      {p.crop}
                      <ArrowUpRight size={12} className="text-stone-300 group-hover:text-sage-500 transition-colors" />
                    </p>
                    <p className="text-[10px] text-stone-400">{p.category}</p>
                  </div>
                  <MiniSparkline up={isUp} stable={isStable} />
                </div>
                <p className="text-xl font-bold text-stone-900 dark:text-white tabular-nums">
                  {currency} {p.price.toFixed(3)}
                </p>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px] text-stone-400">per {p.unit}</span>
                  <ChangeTag value={p.changePercent} stable={isStable} />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* === MAIN TABLE === */}
      <div className="bg-white dark:bg-[#111113] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl overflow-hidden shadow-sm">
        {/* Table header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-stone-100 dark:border-stone-800/60">
          <div className="col-span-1">
            <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-widest">#</p>
          </div>
          <div className="col-span-4">
            <SortHeader col="name" label="Commodity" />
          </div>
          <div className="col-span-3 text-right">
            <SortHeader col="price" label={`Price / kg`} />
          </div>
          <div className="col-span-2 text-right hidden sm:block">
            <SortHeader col="change" label="24h %" />
          </div>
          <div className="col-span-2 hidden sm:block" />
        </div>

        {/* Rows */}
        <AnimatePresence>
          <div className="divide-y divide-stone-100/80 dark:divide-stone-800/40">
            {filtered.length === 0 ? (
              <div className="py-14 text-center text-sm text-stone-400">No results matching "{search}"</div>
            ) : (
              filtered.map((p, i) => {
                const isUp = p.changePercent > 0.5;
                const isStable = Math.abs(p.changePercent) <= 0.5;
                const isUserCrop = p.crop === userPrefs?.crop;
                return (
                  <motion.div key={p.crop} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                    className="grid grid-cols-12 gap-2 px-4 py-3.5 hover:bg-stone-50 dark:hover:bg-stone-800/30 transition-colors cursor-pointer items-center">
                    {/* # */}
                    <div className="col-span-1">
                      <span className="text-xs text-stone-300 dark:text-stone-600 font-mono">{i + 1}</span>
                    </div>
                    {/* Name */}
                    <div className="col-span-4 flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                        isUp ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                        : isStable ? "bg-stone-100 dark:bg-stone-800 text-stone-500"
                        : "bg-red-50 dark:bg-red-900/20 text-red-500"
                      }`}>
                        {p.crop.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${isUserCrop ? "text-sage-600 dark:text-sage-400" : "text-stone-900 dark:text-white"}`}>
                          {p.crop}
                          {isUserCrop && (
                            <span className="ml-1.5 text-[9px] font-bold bg-sage-100 dark:bg-sage-900/30 text-sage-600 px-1.5 py-0.5 rounded-full">Yours</span>
                          )}
                        </p>
                        <p className="text-[11px] text-stone-400">{p.category}</p>
                      </div>
                    </div>
                    {/* Price */}
                    <div className="col-span-3 text-right">
                      <p className="text-sm font-semibold text-stone-900 dark:text-white tabular-nums">
                        {currency} {p.price.toFixed(3)}
                      </p>
                      <p className="text-[11px] text-stone-400">per {p.unit}</p>
                    </div>
                    {/* Change */}
                    <div className="col-span-2 text-right hidden sm:flex justify-end">
                      <ChangeTag value={p.changePercent} stable={isStable} />
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
        </AnimatePresence>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between">
          <p className="text-xs text-stone-400">
            {filtered.length} of {prices.length} commodities shown
            {rates && ` · Rates updated ${new Date(rates.timestamp).toLocaleTimeString()}`}
          </p>
          <p className="text-xs text-stone-300 dark:text-stone-600 italic">Prices simulated from global baselines</p>
        </div>
      </div>
    </div>
  );
}
