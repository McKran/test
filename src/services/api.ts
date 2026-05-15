import axios from "axios";
import {
  WeatherData,
  MarketPrice,
  CropRecommendation,
  SeasonalCalendar,
  CurrencyRates,
  Crop,
  ChatMessage,
} from "../types";

const api = axios.create({ baseURL: "/api" });

export const weatherService = {
  getWeather: async (location?: string): Promise<WeatherData> => {
    const res = await api.get<WeatherData>("/weather", { params: { location } });
    return res.data;
  },
};

export const marketService = {
  getPrices: async (currency?: string, country?: string, category?: string): Promise<MarketPrice[]> => {
    const res = await api.get<MarketPrice[]>("/market", {
      params: { currency, country, category },
    });
    return res.data;
  },
};

export const cropService = {
  getRecommendations: async (country?: string): Promise<CropRecommendation[]> => {
    const res = await api.get<CropRecommendation[]>("/recommendations", { params: { country } });
    return res.data;
  },
  searchCrops: async (q: string, category?: string, country?: string): Promise<Crop[]> => {
    const res = await api.get<Crop[]>("/crops", { params: { q, category, country } });
    return res.data;
  },
  getSeasonalCalendar: async (crop: string, country: string): Promise<SeasonalCalendar> => {
    const res = await api.get<SeasonalCalendar>("/seasonal-calendar", { params: { crop, country } });
    return res.data;
  },
  getSeasonalPlan: async (crop: string, country: string): Promise<Record<string, string>> => {
    const res = await api.get<Record<string, string>>("/seasonal-plan", { params: { crop, country } });
    return res.data;
  },
};

export const currencyService = {
  getRates: async (): Promise<CurrencyRates> => {
    const res = await api.get<CurrencyRates>("/currency-rates");
    return res.data;
  },
};

export const aiService = {
  chat: async (
    message: string,
    history: ChatMessage[],
    userPrefs: any
  ): Promise<{ content: string; model: string }> => {
    const res = await api.post("/ai/chat", { message, history, userPrefs });
    return res.data;
  },
};
