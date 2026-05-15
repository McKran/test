import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";

// Mock Services (will move to separate files later)
const getWeatherData = async (location: string) => {
  // Simulated weather data
  return {
    location,
    temp: 28,
    humidity: 65,
    rainfall: 12,
    forecast: [
      { day: "Mon", temp: 29, condition: "Sunny" },
      { day: "Tue", temp: 27, condition: "Partly Cloudy" },
      { day: "Wed", temp: 25, condition: "Rain" },
    ]
  };
};

// Expanded Global Crop Database
const CROP_DATABASE = [
  { name: "Rice", category: "Grain", description: "A staple grain, thrives in wetlands.", growthCycle: "120-150 days", basePricePerKg: 0.35, regions: ["Global", "Asia", "Africa"] },
  { name: "Corn", category: "Grain", description: "Versatile cereal, needs well-drained soil.", growthCycle: "90-120 days", basePricePerKg: 0.22, regions: ["Global", "Americas", "Africa"] },
  { name: "Wheat", category: "Grain", description: "Major cereal used for flour.", growthCycle: "120-180 days", basePricePerKg: 0.28, regions: ["Global", "Europe", "Asia"] },
  { name: "Soybeans", category: "Grain", description: "Protein-rich legume, used for oil and feed.", growthCycle: "100-120 days", basePricePerKg: 0.48, regions: ["Global", "Americas"] },
  { name: "Potatoes", category: "Vegetable", description: "Underground tuber staple.", growthCycle: "70-120 days", basePricePerKg: 0.15, regions: ["Global", "Europe", "Americas"] },
  { name: "Tomatoes", category: "Vegetable", description: "Nutrient-dense fruit used as vegetable.", growthCycle: "60-80 days", basePricePerKg: 0.85, regions: ["Global"] },
  { name: "Durian", category: "Fruit", description: "Tropical fruit known for its strong smell.", growthCycle: "90-120 days", basePricePerKg: 4.50, regions: ["Asia", "Southeast Asia"] },
  { name: "Cashews", category: "Cash Crop", description: "Nut seed that grows on trees.", growthCycle: "3-5 years", basePricePerKg: 5.20, regions: ["Africa", "Asia", "Americas"] },
  { name: "Tea", category: "Cash Crop", description: "Evergreen shrub used for beverage.", growthCycle: "3 years", basePricePerKg: 8.50, regions: ["Asia", "Africa"] },
  { name: "Cassava", category: "Grain", description: "Root vegetable, major source of carbs.", growthCycle: "6-12 months", basePricePerKg: 0.12, regions: ["Africa", "Americas", "Asia"] },
];

const CURRENCY_DATABASE: Record<string, number> = {
  "USD": 1,
  "EUR": 0.92,
  "GBP": 0.79,
  "INR": 83.50,
  "CNY": 7.24,
  "JPY": 155.80,
  "PHP": 58.20,
};

const getMarketPrices = async (targetCurrency: string = "USD") => {
  const rate = CURRENCY_DATABASE[targetCurrency] || 1;
  return CROP_DATABASE.map(crop => ({
    crop: crop.name,
    price: parseFloat((crop.basePricePerKg * rate).toFixed(2)),
    trend: Math.random() > 0.5 ? "up" : (Math.random() > 0.5 ? "down" : "stable"),
    unit: "kg",
    currency: targetCurrency
  }));
};

const getSeasonalPlan = (crop: string, country: string) => {
  // Simple logic for seasonal planning
  const plans: Record<string, any> = {
    "USA": { spring: "Planting", summer: "Growing", autumn: "Harvest", winter: "Dormant" },
    "India": { monsoon: "Sowing", postMonsoon: "Vegetative", winter: "Harvest", summer: "Pre-Sowing" },
    "Philippines": { wet: "Planting", dry: "Harvest" },
    "Global": { spring: "Planting", summer: "Maintenance", autumn: "Harvest", winter: "Preparation" }
  };
  return plans[country] || plans["Global"];
};

const getCropRecommendations = (weather: any) => {
  if (weather.rainfall > 10) {
    return [
      { name: "Rice", suitability: 95, risk: "Low", advice: "Ideal conditions for paddy rice." },
      { name: "Sugarcane", suitability: 80, risk: "Medium", advice: "Ensure good drainage." }
    ];
  }
  return [
    { name: "Corn", suitability: 90, risk: "Low", advice: "Perfect for current moderate conditions." },
    { name: "Millet", suitability: 85, risk: "Low", advice: "Drought resistant choice." }
  ];
};

async function startServer() {
  const app = express();
  const PORT = 5000;

  app.use(cors());
  app.use(express.json());

  // API Routes
  app.get("/api/weather", async (req, res) => {
    const location = (req.query.location as string) || "Central Valley";
    const data = await getWeatherData(location);
    res.json(data);
  });

  app.get("/api/market", async (req, res) => {
    const currency = (req.query.currency as string) || "USD";
    const data = await getMarketPrices(currency);
    res.json(data);
  });

  app.get("/api/seasonal-plan", async (req, res) => {
    const crop = (req.query.crop as string) || "Corn";
    const country = (req.query.country as string) || "Global";
    const plan = getSeasonalPlan(crop, country);
    res.json(plan);
  });

  app.get("/api/crops", async (req, res) => {
    const query = (req.query.q as string || "").toLowerCase();
    const results = CROP_DATABASE.filter(c => 
      c.name.toLowerCase().includes(query) || 
      c.category.toLowerCase().includes(query)
    );
    res.json(results);
  });

  app.get("/api/recommendations", async (req, res) => {
    const location = (req.query.location as string) || "Central Valley";
    const weather = await getWeatherData(location);
    const recommendations = getCropRecommendations(weather);
    res.json(recommendations);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
