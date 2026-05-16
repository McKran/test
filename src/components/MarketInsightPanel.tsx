import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Globe,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  RefreshCw,
  BarChart3,
  CloudRain,
  Ship,
  Landmark,
  ShoppingCart,
} from "lucide-react";
import { marketService } from "../services/api";
import { MarketPrice, MarketInsight } from "../types";

interface Props {
  crop: MarketPrice | null;
  country: string;
  currency: string;
  unit: string;
  unitMult: number;
  unitDec: number;
  onClose: () => void;
}

const FACTOR_ICONS: Record<string, any> = {
  Supply: BarChart3,
  Demand: ShoppingCart,
  Weather: CloudRain,
  Policy: Landmark,
  "Export/Import": Ship,
};

const impactColor = (impact: string) => {
  if (impact === "positive") return "text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 dark:text-emerald-400";
  if (impact === "negative") return "text-red-500 bg-red-50 dark:bg-red-900/20";
  return "text-stone-500 bg-stone-100 dark:bg-stone-800";
};

const impactLabel = (impact: string) => {
  if (impact === "positive") return "Bullish";
  if (impact === "negative") return "Bearish";
  return "Neutral";
};

const ConfidenceDot = ({ confidence }: { confidence: string }) => {
  const map: Record<string, string> = {
    high: "bg-emerald-500",
    medium: "bg-amber-400",
    low: "bg-red-400",
  };
  return <span className={`inline-block w-2 h-2 rounded-full ${map[confidence] ?? "bg-stone-400"}`} />;
};

export default function MarketInsightPanel({ crop, country, currency, unit, unitMult, unitDec, onClose }: Props) {
  const [insight, setInsight] = useState<MarketInsight | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const fetchInsight = async () => {
    if (!crop) return;
    setLoading(true);
    setError(false);
    try {
      const data = await marketService.getInsight(
        crop.crop,
        crop.category,
        country,
        currency,
        crop.price,
        crop.changePercent
      );
      setInsight(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (crop) fetchInsight();
    else setInsight(null);
  }, [crop?.crop]);

  const isUp = (crop?.changePercent ?? 0) > 0.5;
  const isStable = Math.abs(crop?.changePercent ?? 0) <= 0.5;
  const displayPrice = crop ? (crop.price * unitMult).toFixed(unitDec) : "--";

  return (
    <AnimatePresence>
      {crop && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            className="fixed right-0 top-0 bottom-0 z-50 w-full sm:w-[420px] bg-white dark:bg-[#0f1013] border-l border-stone-200 dark:border-stone-800/80 shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-start justify-between px-5 pt-5 pb-4 border-b border-stone-100 dark:border-stone-800/50 shrink-0">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                  isUp ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                  : isStable ? "bg-stone-100 dark:bg-stone-800 text-stone-500"
                  : "bg-red-50 dark:bg-red-900/20 text-red-500"
                }`}>
                  {crop.crop.charAt(0)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-stone-900 dark:text-white">{crop.crop}</h2>
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-stone-100 dark:bg-stone-800 text-stone-500 rounded-md">{crop.category}</span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={10} className="text-stone-400" />
                    <span className="text-xs text-stone-400">{country}</span>
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors">
                <X size={17} />
              </button>
            </div>

            {/* Price Hero */}
            <div className="px-5 py-4 bg-stone-50 dark:bg-stone-900/40 border-b border-stone-100 dark:border-stone-800/50 shrink-0">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-3xl font-bold text-stone-900 dark:text-white tabular-nums">
                    {currency} {displayPrice}
                  </p>
                  <p className="text-xs text-stone-400 mt-0.5">per {unit}</p>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold ${
                  isStable ? "bg-stone-100 dark:bg-stone-800 text-stone-500"
                  : isUp ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
                  : "bg-red-50 dark:bg-red-900/20 text-red-500"
                }`}>
                  {isStable ? <Minus size={14} /> : isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {isStable ? "Stable" : `${crop.changePercent > 0 ? "+" : ""}${crop.changePercent.toFixed(2)}%`}
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

              {/* AI Analysis label */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={13} className="text-sage-600" />
                  <span className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-widest">AI Market Analysis</span>
                </div>
                {insight && !loading && (
                  <button onClick={fetchInsight}
                    className="p-1 text-stone-400 hover:text-stone-600 transition-colors rounded">
                    <RefreshCw size={12} />
                  </button>
                )}
              </div>

              {/* Loading state */}
              {loading && (
                <div className="space-y-3">
                  {[1, 0.8, 0.6, 0.9].map((w, i) => (
                    <div key={i} className="h-3 rounded-full bg-stone-100 dark:bg-stone-800 animate-pulse" style={{ width: `${w * 100}%` }} />
                  ))}
                  <p className="text-xs text-stone-400 text-center pt-2">Analyzing {country} market conditions...</p>
                </div>
              )}

              {/* Error state */}
              {error && !loading && (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl text-xs text-red-500">
                  <AlertTriangle size={13} />
                  Failed to load analysis. <button onClick={fetchInsight} className="underline">Retry</button>
                </div>
              )}

              {/* Insight content */}
              {insight && !loading && (
                <>
                  {/* Summary */}
                  <div className={`p-4 rounded-xl border ${
                    insight.priceDirection === "rising" ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800/30"
                    : insight.priceDirection === "falling" ? "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800/30"
                    : "bg-stone-50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800/50"
                  }`}>
                    <div className="flex items-center gap-1.5 mb-2">
                      {insight.priceDirection === "rising" ? <TrendingUp size={13} className="text-emerald-600" />
                        : insight.priceDirection === "falling" ? <TrendingDown size={13} className="text-red-500" />
                        : <Minus size={13} className="text-stone-400" />}
                      <span className={`text-xs font-bold uppercase tracking-wide ${
                        insight.priceDirection === "rising" ? "text-emerald-600"
                        : insight.priceDirection === "falling" ? "text-red-500"
                        : "text-stone-400"
                      }`}>
                        Price {insight.priceDirection.charAt(0).toUpperCase() + insight.priceDirection.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">{insight.summary}</p>
                  </div>

                  {/* Local Factors */}
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <MapPin size={12} className="text-sage-600" />
                      <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Local Market · {country}</h3>
                    </div>
                    <div className="space-y-2">
                      {(insight.localFactors || []).map((f, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3 bg-stone-50 dark:bg-stone-900/40 rounded-xl border border-stone-100 dark:border-stone-800/40">
                          <ChevronRight size={13} className="text-sage-500 shrink-0 mt-0.5" />
                          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">{f}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Global Factors */}
                  <div>
                    <div className="flex items-center gap-2 mb-2.5">
                      <Globe size={12} className="text-sky-500" />
                      <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider">Global Market Factors</h3>
                    </div>
                    <div className="space-y-2">
                      {(insight.globalFactors || []).map((f, i) => (
                        <div key={i} className="flex items-start gap-2.5 p-3 bg-sky-50/50 dark:bg-sky-900/10 rounded-xl border border-sky-100 dark:border-sky-900/20">
                          <ChevronRight size={13} className="text-sky-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">{f}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Key Drivers */}
                  {insight.keyDrivers && insight.keyDrivers.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-2.5">Key Price Drivers</h3>
                      <div className="space-y-2">
                        {insight.keyDrivers.map((d, i) => {
                          const Icon = FACTOR_ICONS[d.factor] ?? BarChart3;
                          return (
                            <div key={i} className="flex items-start gap-3 p-3 bg-white dark:bg-stone-900/50 rounded-xl border border-stone-100 dark:border-stone-800/40">
                              <div className="w-7 h-7 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0">
                                <Icon size={13} className="text-stone-500" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-xs font-semibold text-stone-800 dark:text-stone-200">{d.factor}</span>
                                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${impactColor(d.impact)}`}>
                                    {impactLabel(d.impact)}
                                  </span>
                                </div>
                                <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">{d.description}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Price Prediction */}
                  <div className="p-4 bg-sage-900 dark:bg-sage-950 rounded-xl text-white">
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp size={13} className="text-sage-400" />
                      <span className="text-xs font-bold text-sage-400 uppercase tracking-wider">Near-Term Outlook</span>
                      <span className="ml-auto flex items-center gap-1 text-[10px] text-sage-500">
                        <ConfidenceDot confidence={insight.confidence} />
                        {insight.confidence} confidence
                      </span>
                    </div>
                    <p className="text-sm text-sage-100 leading-relaxed">{insight.prediction}</p>
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-1 pb-2">
                    <p className="text-[10px] text-stone-300 dark:text-stone-600">
                      Analysis by LLaMA-3 via Groq · {insight.generatedAt ? new Date(insight.generatedAt).toLocaleTimeString() : ""}
                    </p>
                    <div className="flex items-center gap-1">
                      <CheckCircle2 size={10} className="text-sage-500" />
                      <span className="text-[10px] text-stone-400">Local-first analysis</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
