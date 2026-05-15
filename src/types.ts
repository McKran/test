export interface WeatherData {
  location: string;
  temp: number;
  humidity: number;
  rainfall: number;
  forecast: Array<{
    day: string;
    temp: number;
    condition: string;
  }>;
}

export interface Crop {
  name: string;
  category: "Grain" | "Vegetable" | "Fruit" | "Cash Crop" | "Other";
  description: string;
  growthCycle: string;
  basePricePerKg: number;
}

export interface UserPrefs {
  crop: string;
  location: string;
  country: string;
  currency: string;
  units: "kg" | "ton" | "gram";
  marketScope: "local" | "international" | "both";
  realtimeData: boolean;
  aiMode: "Analytical" | "Creative" | "fast" | "balanced" | "expert";
  aiFlexibility: "strict" | "flexible";
  theme: "light" | "dark";
}

export interface MarketPrice {
  crop: string;
  price: number; 
  unit: "kg" | "ton" | "gram";
  trend: "up" | "down" | "stable";
  currency: string;
}

export interface CropRecommendation {
  name: string;
  suitability: number;
  risk: string;
  advice: string;
}

export interface ChatMessage {
  role: "user" | "model";
  text: string;
}
