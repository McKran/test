import axios from "axios";
import { WeatherData, MarketPrice, CropRecommendation } from "../types";

const api = axios.create({
  baseURL: "/api",
});

export const weatherService = {
  getWeather: async (location?: string) => {
    const response = await api.get<WeatherData>("/weather", { params: { location } });
    return response.data;
  },
};

export const marketService = {
  getPrices: async (currency?: string) => {
    const response = await api.get<MarketPrice[]>("/market", { params: { currency } });
    return response.data;
  },
};

export const cropService = {
  getRecommendations: async (location?: string) => {
    const response = await api.get<CropRecommendation[]>("/recommendations", { params: { location } });
    return response.data;
  },
  searchCrops: async (q: string) => {
    const response = await api.get<any[]>("/crops", { params: { q } });
    return response.data;
  },
  getSeasonalPlan: async (crop: string, country: string) => {
    const response = await api.get<any>("/seasonal-plan", { params: { crop, country } });
    return response.data;
  }
};
