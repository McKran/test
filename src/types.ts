export interface WeatherData {
  location: string;
  country: string;
  latitude: number;
  longitude: number;
  temp: number;
  feelsLike: number;
  humidity: number;
  rainfall: number;
  windSpeed: number;
  condition: string;
  icon: string;
  forecast: ForecastDay[];
}

export interface ForecastDay {
  day: string;
  date: string;
  temp: number;
  tempMax: number;
  tempMin: number;
  condition: string;
  icon: string;
  precipitation: number;
}

export interface Crop {
  name: string;
  category: string;
  description: string;
  growthCycle: string;
  basePricePerKg: number;
  regions: string[];
  climateZones: string[];
}

export interface MarketPrice {
  crop: string;
  category: string;
  price: number;
  priceUSD: number;
  changePercent: number;
  trend: "up" | "down" | "stable";
  unit: string;
  currency: string;
  regions: string[];
  growthCycle: string;
}

export interface CropRecommendation {
  name: string;
  suitability: number;
  risk: string;
  advice: string;
}

export interface UserPrefs {
  crop: string;
  location: string;
  country: string;
  currency: string;
  units: "kg" | "ton" | "gram";
  marketScope: "local" | "international" | "both";
  realtimeData: boolean;
  aiMode: "fast" | "balanced" | "expert";
  aiFlexibility: "strict" | "flexible";
  theme: "light" | "dark";
}

export interface ChatMessage {
  role: "user" | "ai";
  content: string;
  time?: string;
  model?: string;
}

export interface SeasonalCalendar {
  crop: string;
  country: string;
  climateZone: string;
  hemisphere: "N" | "S";
  growingSeason: string;
  plantingMonths: string[];
  harvestMonths: string[];
  growthDays: number;
  waterRequirement: string;
  soilType: string;
  tip: string;
  availableInZone: boolean;
  monthlyStatus: MonthStatus[];
}

export interface MonthStatus {
  month: string;
  monthNum: number;
  isPlanting: boolean;
  isHarvest: boolean;
  isGrowing: boolean;
  isCurrent: boolean;
  status: "plant" | "harvest" | "growing" | "none";
}

export interface CurrencyRates {
  base: string;
  rates: Record<string, number>;
  timestamp: number;
}

export interface CountryInfo {
  zone: string;
  hemisphere: "N" | "S";
  growing_season: string;
  country: string;
}
