import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

// ================================================================
// COMPREHENSIVE INTERNATIONAL CROP DATABASE (65+ crops)
// ================================================================
const CROP_DATABASE = [
  // --- Grains & Cereals ---
  { name: "Rice", category: "Grain", description: "Staple grain, thrives in flooded paddies and wetlands.", growthCycle: "120-150 days", basePricePerKg: 0.38, regions: ["Asia", "Africa", "Americas", "Global"], climateZones: ["TROPICAL_WET", "TROPICAL_MONSOON", "SUBTROPICAL"] },
  { name: "Corn (Maize)", category: "Grain", description: "Versatile cereal used for food, feed, and biofuel.", growthCycle: "90-120 days", basePricePerKg: 0.22, regions: ["Global"], climateZones: ["TEMPERATE_NORTH", "SUBTROPICAL", "TROPICAL_MONSOON", "MEDITERRANEAN"] },
  { name: "Wheat", category: "Grain", description: "Major cereal crop used for flour and bread worldwide.", growthCycle: "120-180 days", basePricePerKg: 0.28, regions: ["Global"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "MEDITERRANEAN", "ARID"] },
  { name: "Barley", category: "Grain", description: "Hardy cereal used for malt, beer, and animal feed.", growthCycle: "90-120 days", basePricePerKg: 0.24, regions: ["Europe", "Americas", "Asia"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "MEDITERRANEAN"] },
  { name: "Sorghum", category: "Grain", description: "Drought-tolerant cereal, key in arid regions.", growthCycle: "90-130 days", basePricePerKg: 0.20, regions: ["Africa", "Asia", "Americas"], climateZones: ["ARID", "TROPICAL_MONSOON", "SUBTROPICAL"] },
  { name: "Millet", category: "Grain", description: "Fast-growing drought-resistant grain for dry regions.", growthCycle: "60-90 days", basePricePerKg: 0.30, regions: ["Africa", "Asia"], climateZones: ["ARID", "TROPICAL_MONSOON"] },
  { name: "Oats", category: "Grain", description: "Cool-season cereal used for oatmeal and animal fodder.", growthCycle: "60-100 days", basePricePerKg: 0.35, regions: ["Europe", "Americas"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL"] },
  { name: "Rye", category: "Grain", description: "Cold-hardy grain used for bread and whiskey.", growthCycle: "120-150 days", basePricePerKg: 0.26, regions: ["Europe", "Americas"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL"] },
  { name: "Teff", category: "Grain", description: "Ancient Ethiopian grain, highly nutritious, gluten-free.", growthCycle: "60-90 days", basePricePerKg: 1.20, regions: ["Africa"], climateZones: ["TROPICAL_MONSOON", "SUBTROPICAL"] },
  { name: "Quinoa", category: "Grain", description: "Andean super-grain, complete protein source.", growthCycle: "90-120 days", basePricePerKg: 3.50, regions: ["South America", "Americas"], climateZones: ["SUBTROPICAL", "TEMPERATE_SOUTH"] },
  // --- Legumes ---
  { name: "Soybeans", category: "Legume", description: "Protein-rich legume, major source of oil and livestock feed.", growthCycle: "100-120 days", basePricePerKg: 0.48, regions: ["Global"], climateZones: ["TEMPERATE_NORTH", "SUBTROPICAL", "TROPICAL_MONSOON"] },
  { name: "Chickpeas", category: "Legume", description: "Drought-tolerant pulse, staple in South Asian and Middle Eastern cuisine.", growthCycle: "90-120 days", basePricePerKg: 0.80, regions: ["Asia", "Middle East", "Mediterranean"], climateZones: ["ARID", "MEDITERRANEAN", "TROPICAL_MONSOON"] },
  { name: "Lentils", category: "Legume", description: "Fast-cooking pulse, high in iron and protein.", growthCycle: "80-110 days", basePricePerKg: 0.90, regions: ["Asia", "Middle East", "Americas"], climateZones: ["ARID", "CONTINENTAL", "TEMPERATE_NORTH"] },
  { name: "Peanuts", category: "Legume", description: "Underground legume, dual-use for food and oil.", growthCycle: "90-130 days", basePricePerKg: 0.75, regions: ["Africa", "Asia", "Americas"], climateZones: ["TROPICAL_MONSOON", "SUBTROPICAL", "ARID"] },
  { name: "Cowpeas", category: "Legume", description: "Heat-tolerant bean, vital protein source in West Africa.", growthCycle: "60-90 days", basePricePerKg: 0.65, regions: ["Africa", "Asia"], climateZones: ["TROPICAL_WET", "TROPICAL_MONSOON", "ARID"] },
  { name: "Pigeon Peas", category: "Legume", description: "Tropical perennial legume, drought-resistant.", growthCycle: "120-180 days", basePricePerKg: 0.70, regions: ["Asia", "Africa", "Caribbean"], climateZones: ["TROPICAL_MONSOON", "SUBTROPICAL"] },
  { name: "Mung Beans", category: "Legume", description: "Small green legume used in Asian cuisine.", growthCycle: "60-75 days", basePricePerKg: 0.85, regions: ["Asia"], climateZones: ["TROPICAL_WET", "TROPICAL_MONSOON", "SUBTROPICAL"] },
  // --- Root Vegetables ---
  { name: "Potatoes", category: "Vegetable", description: "Underground tuber, world's fourth-largest food crop.", growthCycle: "70-120 days", basePricePerKg: 0.18, regions: ["Global"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "SUBTROPICAL", "TEMPERATE_SOUTH"] },
  { name: "Sweet Potatoes", category: "Vegetable", description: "Tropical root vegetable, rich in beta-carotene.", growthCycle: "90-120 days", basePricePerKg: 0.30, regions: ["Asia", "Africa", "Americas"], climateZones: ["TROPICAL_WET", "SUBTROPICAL", "TROPICAL_MONSOON"] },
  { name: "Cassava", category: "Vegetable", description: "Starchy root, primary carbohydrate source in tropical Africa.", growthCycle: "180-365 days", basePricePerKg: 0.14, regions: ["Africa", "Asia", "Americas"], climateZones: ["TROPICAL_WET", "TROPICAL_MONSOON"] },
  { name: "Yam", category: "Vegetable", description: "Large tropical tuber, culturally important in West Africa.", growthCycle: "180-270 days", basePricePerKg: 0.55, regions: ["Africa", "Asia", "Caribbean"], climateZones: ["TROPICAL_WET", "TROPICAL_MONSOON"] },
  { name: "Taro", category: "Vegetable", description: "Wetland root crop, staple across Pacific Islands and Asia.", growthCycle: "180-240 days", basePricePerKg: 0.60, regions: ["Asia", "Pacific", "Africa"], climateZones: ["TROPICAL_WET", "SUBTROPICAL"] },
  // --- Vegetables ---
  { name: "Tomatoes", category: "Vegetable", description: "High-value fruiting vegetable, globally traded.", growthCycle: "60-90 days", basePricePerKg: 0.85, regions: ["Global"], climateZones: ["MEDITERRANEAN", "SUBTROPICAL", "TEMPERATE_NORTH", "TROPICAL_MONSOON"] },
  { name: "Onions", category: "Vegetable", description: "Bulb vegetable, essential in global cuisines.", growthCycle: "90-120 days", basePricePerKg: 0.35, regions: ["Global"], climateZones: ["TEMPERATE_NORTH", "MEDITERRANEAN", "TROPICAL_MONSOON", "ARID"] },
  { name: "Garlic", category: "Vegetable", description: "Aromatic bulb with culinary and medicinal uses.", growthCycle: "180-210 days", basePricePerKg: 2.00, regions: ["Global"], climateZones: ["MEDITERRANEAN", "TEMPERATE_NORTH", "SUBTROPICAL"] },
  { name: "Cabbage", category: "Vegetable", description: "Cool-season leafy vegetable, rich in vitamin C.", growthCycle: "70-120 days", basePricePerKg: 0.25, regions: ["Global"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "SUBTROPICAL"] },
  { name: "Carrots", category: "Vegetable", description: "Root vegetable, rich in beta-carotene.", growthCycle: "70-100 days", basePricePerKg: 0.45, regions: ["Global"], climateZones: ["TEMPERATE_NORTH", "MEDITERRANEAN", "SUBTROPICAL"] },
  { name: "Bell Peppers", category: "Vegetable", description: "Fruiting vegetable available in red, yellow, and green.", growthCycle: "70-90 days", basePricePerKg: 1.20, regions: ["Global"], climateZones: ["MEDITERRANEAN", "SUBTROPICAL", "TROPICAL_MONSOON"] },
  { name: "Eggplant", category: "Vegetable", description: "Tropical fruiting vegetable popular in Asian and Mediterranean cooking.", growthCycle: "65-80 days", basePricePerKg: 0.55, regions: ["Asia", "Mediterranean"], climateZones: ["TROPICAL_MONSOON", "SUBTROPICAL", "MEDITERRANEAN"] },
  { name: "Cucumber", category: "Vegetable", description: "Warm-season fruiting vegetable with high water content.", growthCycle: "55-70 days", basePricePerKg: 0.40, regions: ["Global"], climateZones: ["TEMPERATE_NORTH", "SUBTROPICAL", "MEDITERRANEAN"] },
  { name: "Spinach", category: "Vegetable", description: "Leafy green vegetable, high in iron and vitamins.", growthCycle: "45-60 days", basePricePerKg: 1.10, regions: ["Global"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "MEDITERRANEAN"] },
  { name: "Broccoli", category: "Vegetable", description: "Cool-season vegetable rich in fiber and vitamins.", growthCycle: "80-100 days", basePricePerKg: 1.30, regions: ["Americas", "Europe", "Asia"], climateZones: ["TEMPERATE_NORTH", "MEDITERRANEAN", "SUBTROPICAL"] },
  // --- Fruits ---
  { name: "Bananas", category: "Fruit", description: "Tropical fruit, world's most exported food crop.", growthCycle: "270-360 days", basePricePerKg: 0.28, regions: ["Asia", "Africa", "Americas"], climateZones: ["TROPICAL_WET", "TROPICAL_MONSOON", "SUBTROPICAL"] },
  { name: "Mangoes", category: "Fruit", description: "King of tropical fruits, high demand globally.", growthCycle: "120-150 days", basePricePerKg: 0.90, regions: ["Asia", "Africa", "Americas"], climateZones: ["TROPICAL_WET", "TROPICAL_MONSOON", "SUBTROPICAL"] },
  { name: "Apples", category: "Fruit", description: "Temperate deciduous fruit, globally top-traded.", growthCycle: "150-180 days", basePricePerKg: 1.10, regions: ["Europe", "Americas", "Asia"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "TEMPERATE_SOUTH"] },
  { name: "Oranges", category: "Fruit", description: "Citrus fruit, major vitamin C source globally.", growthCycle: "180-240 days", basePricePerKg: 0.55, regions: ["Mediterranean", "Americas", "Asia"], climateZones: ["MEDITERRANEAN", "SUBTROPICAL", "TROPICAL_MONSOON"] },
  { name: "Grapes", category: "Fruit", description: "Versatile fruit for fresh eating, wine, and raisins.", growthCycle: "150-180 days", basePricePerKg: 1.80, regions: ["Mediterranean", "Americas", "Asia"], climateZones: ["MEDITERRANEAN", "TEMPERATE_NORTH", "SUBTROPICAL"] },
  { name: "Pineapples", category: "Fruit", description: "Tropical fruit with a sweet-tart flavor, rich in bromelain.", growthCycle: "450-600 days", basePricePerKg: 0.45, regions: ["Asia", "Americas", "Africa"], climateZones: ["TROPICAL_WET", "SUBTROPICAL"] },
  { name: "Papaya", category: "Fruit", description: "Fast-growing tropical fruit, rich in enzymes.", growthCycle: "90-120 days", basePricePerKg: 0.50, regions: ["Asia", "Africa", "Americas"], climateZones: ["TROPICAL_WET", "TROPICAL_MONSOON", "SUBTROPICAL"] },
  { name: "Avocado", category: "Fruit", description: "High-value subtropical fruit rich in healthy fats.", growthCycle: "365-548 days", basePricePerKg: 2.10, regions: ["Americas", "Africa", "Mediterranean"], climateZones: ["SUBTROPICAL", "MEDITERRANEAN", "TROPICAL_MONSOON"] },
  { name: "Watermelon", category: "Fruit", description: "Large warm-season fruit with high water content.", growthCycle: "70-90 days", basePricePerKg: 0.25, regions: ["Global"], climateZones: ["SUBTROPICAL", "MEDITERRANEAN", "TROPICAL_MONSOON", "ARID"] },
  { name: "Strawberries", category: "Fruit", description: "High-value berry with short growing season.", growthCycle: "90-110 days", basePricePerKg: 3.20, regions: ["Americas", "Europe", "Asia"], climateZones: ["TEMPERATE_NORTH", "MEDITERRANEAN", "SUBTROPICAL"] },
  { name: "Durian", category: "Fruit", description: "King of fruits in Southeast Asia, strong aroma.", growthCycle: "90-120 days", basePricePerKg: 4.50, regions: ["Asia"], climateZones: ["TROPICAL_WET"] },
  { name: "Lychee", category: "Fruit", description: "Subtropical fruit with sweet floral flavor.", growthCycle: "80-120 days", basePricePerKg: 3.80, regions: ["Asia"], climateZones: ["SUBTROPICAL", "TROPICAL_MONSOON"] },
  { name: "Jackfruit", category: "Fruit", description: "World's largest tree fruit, versatile in cooking.", growthCycle: "90-180 days", basePricePerKg: 0.80, regions: ["Asia", "Africa"], climateZones: ["TROPICAL_WET", "TROPICAL_MONSOON"] },
  { name: "Guava", category: "Fruit", description: "Tropical fruit rich in vitamin C.", growthCycle: "120-150 days", basePricePerKg: 0.70, regions: ["Asia", "Americas", "Africa"], climateZones: ["TROPICAL_WET", "SUBTROPICAL"] },
  { name: "Passion Fruit", category: "Fruit", description: "Tropical vine fruit with intense aroma.", growthCycle: "180-240 days", basePricePerKg: 2.50, regions: ["Americas", "Africa", "Asia"], climateZones: ["TROPICAL_WET", "SUBTROPICAL"] },
  { name: "Plantain", category: "Fruit", description: "Cooking banana, staple starch in tropical Africa and Americas.", growthCycle: "270-360 days", basePricePerKg: 0.30, regions: ["Africa", "Americas", "Asia"], climateZones: ["TROPICAL_WET", "TROPICAL_MONSOON"] },
  { name: "Coconuts", category: "Fruit", description: "Tropical palm fruit, used for oil, milk, and fiber.", growthCycle: "365-480 days", basePricePerKg: 0.55, regions: ["Asia", "Pacific", "Americas"], climateZones: ["TROPICAL_WET", "TROPICAL_MONSOON"] },
  // --- Cash Crops ---
  { name: "Coffee", category: "Cash Crop", description: "Global beverage crop, second most traded commodity.", growthCycle: "730-1095 days", basePricePerKg: 5.80, regions: ["Americas", "Africa", "Asia"], climateZones: ["TROPICAL_WET", "SUBTROPICAL"] },
  { name: "Tea", category: "Cash Crop", description: "Most consumed beverage globally after water.", growthCycle: "365-730 days", basePricePerKg: 3.20, regions: ["Asia", "Africa"], climateZones: ["TROPICAL_MONSOON", "SUBTROPICAL"] },
  { name: "Cacao", category: "Cash Crop", description: "Source of chocolate, grown in equatorial tropics.", growthCycle: "730-1095 days", basePricePerKg: 5.20, regions: ["Africa", "Americas", "Asia"], climateZones: ["TROPICAL_WET"] },
  { name: "Cotton", category: "Cash Crop", description: "Major textile fiber crop globally.", growthCycle: "150-180 days", basePricePerKg: 1.50, regions: ["Global"], climateZones: ["SUBTROPICAL", "TROPICAL_MONSOON", "ARID", "CONTINENTAL"] },
  { name: "Sugarcane", category: "Cash Crop", description: "Primary source of sugar and ethanol globally.", growthCycle: "365-540 days", basePricePerKg: 0.10, regions: ["Asia", "Americas", "Africa"], climateZones: ["TROPICAL_WET", "SUBTROPICAL", "TROPICAL_MONSOON"] },
  { name: "Rubber", category: "Cash Crop", description: "Natural latex-producing tree, vital for industry.", growthCycle: "2190-2555 days", basePricePerKg: 1.80, regions: ["Asia", "Africa"], climateZones: ["TROPICAL_WET"] },
  { name: "Tobacco", category: "Cash Crop", description: "High-value leaf crop used in cigarettes and cigars.", growthCycle: "90-120 days", basePricePerKg: 3.50, regions: ["Asia", "Americas", "Africa"], climateZones: ["SUBTROPICAL", "TROPICAL_MONSOON", "CONTINENTAL"] },
  { name: "Vanilla", category: "Cash Crop", description: "World's most popular flavor, expensive orchid vine.", growthCycle: "540-730 days", basePricePerKg: 250.00, regions: ["Madagascar", "Asia", "Americas"], climateZones: ["TROPICAL_WET"] },
  // --- Oilseeds & Nuts ---
  { name: "Sunflower", category: "Oilseed", description: "Major oilseed crop, source of edible and industrial oil.", growthCycle: "75-110 days", basePricePerKg: 0.60, regions: ["Europe", "Americas", "Asia"], climateZones: ["CONTINENTAL", "TEMPERATE_NORTH", "SUBTROPICAL", "ARID"] },
  { name: "Rapeseed (Canola)", category: "Oilseed", description: "Cool-season oilseed, third most important vegetable oil.", growthCycle: "90-150 days", basePricePerKg: 0.55, regions: ["Europe", "Americas", "Asia"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "SUBTROPICAL"] },
  { name: "Palm Oil", category: "Oilseed", description: "World's most produced vegetable oil, tropical palm tree.", growthCycle: "1095-1460 days", basePricePerKg: 0.75, regions: ["Asia", "Africa"], climateZones: ["TROPICAL_WET"] },
  { name: "Cashews", category: "Nut", description: "Tropical tree nut with high global demand.", growthCycle: "60-90 days", basePricePerKg: 5.20, regions: ["Africa", "Asia", "Americas"], climateZones: ["TROPICAL_MONSOON", "SUBTROPICAL"] },
  { name: "Sesame", category: "Oilseed", description: "Ancient oilseed, drought-tolerant, used for oil and tahini.", growthCycle: "80-120 days", basePricePerKg: 1.40, regions: ["Asia", "Africa", "Middle East"], climateZones: ["ARID", "TROPICAL_MONSOON", "SUBTROPICAL"] },
  // --- Spices ---
  { name: "Turmeric", category: "Spice", description: "Rhizome spice with medicinal and culinary uses.", growthCycle: "270-300 days", basePricePerKg: 1.80, regions: ["Asia"], climateZones: ["TROPICAL_MONSOON", "SUBTROPICAL"] },
  { name: "Ginger", category: "Spice", description: "Aromatic rhizome, widely used in cooking and medicine.", growthCycle: "240-270 days", basePricePerKg: 1.60, regions: ["Asia", "Africa", "Americas"], climateZones: ["TROPICAL_WET", "SUBTROPICAL"] },
  { name: "Black Pepper", category: "Spice", description: "King of spices, most traded spice globally.", growthCycle: "180-240 days", basePricePerKg: 4.50, regions: ["Asia"], climateZones: ["TROPICAL_WET", "TROPICAL_MONSOON"] },
  { name: "Chili Peppers", category: "Spice", description: "Pungent fruits used as spice worldwide.", growthCycle: "70-100 days", basePricePerKg: 1.10, regions: ["Global"], climateZones: ["TROPICAL_MONSOON", "SUBTROPICAL", "MEDITERRANEAN"] },
  { name: "Saffron", category: "Spice", description: "World's most expensive spice by weight.", growthCycle: "90-150 days", basePricePerKg: 3500.00, regions: ["Middle East", "Mediterranean"], climateZones: ["ARID", "MEDITERRANEAN"] },
];

// ================================================================
// COUNTRY → CLIMATE ZONE MAPPING
// ================================================================
const COUNTRY_CLIMATE: Record<string, { zone: string; hemisphere: "N" | "S"; growing_season: string }> = {
  "USA": { zone: "TEMPERATE_NORTH", hemisphere: "N", growing_season: "Spring–Fall (Apr–Oct)" },
  "Canada": { zone: "CONTINENTAL", hemisphere: "N", growing_season: "Late Spring–Early Fall (May–Sep)" },
  "UK": { zone: "TEMPERATE_NORTH", hemisphere: "N", growing_season: "Spring–Fall (Apr–Oct)" },
  "Germany": { zone: "TEMPERATE_NORTH", hemisphere: "N", growing_season: "Spring–Fall (Apr–Oct)" },
  "France": { zone: "MEDITERRANEAN", hemisphere: "N", growing_season: "Spring–Fall (Mar–Oct)" },
  "Italy": { zone: "MEDITERRANEAN", hemisphere: "N", growing_season: "Spring–Fall (Mar–Oct)" },
  "Spain": { zone: "MEDITERRANEAN", hemisphere: "N", growing_season: "Spring–Fall (Mar–Oct)" },
  "Netherlands": { zone: "TEMPERATE_NORTH", hemisphere: "N", growing_season: "Spring–Fall (Apr–Oct)" },
  "Poland": { zone: "CONTINENTAL", hemisphere: "N", growing_season: "Spring–Fall (Apr–Sep)" },
  "Russia": { zone: "CONTINENTAL", hemisphere: "N", growing_season: "Late Spring–Summer (May–Aug)" },
  "Ukraine": { zone: "CONTINENTAL", hemisphere: "N", growing_season: "Spring–Fall (Apr–Oct)" },
  "India": { zone: "TROPICAL_MONSOON", hemisphere: "N", growing_season: "Kharif (Jun–Nov), Rabi (Oct–Mar)" },
  "Pakistan": { zone: "TROPICAL_MONSOON", hemisphere: "N", growing_season: "Kharif (Jun–Nov), Rabi (Oct–Mar)" },
  "Bangladesh": { zone: "TROPICAL_MONSOON", hemisphere: "N", growing_season: "Year-round, 3 seasons" },
  "China": { zone: "SUBTROPICAL", hemisphere: "N", growing_season: "Spring–Fall (Mar–Nov), varies by region" },
  "Japan": { zone: "TEMPERATE_NORTH", hemisphere: "N", growing_season: "Spring–Fall (Apr–Oct)" },
  "South Korea": { zone: "TEMPERATE_NORTH", hemisphere: "N", growing_season: "Spring–Fall (Apr–Oct)" },
  "Vietnam": { zone: "TROPICAL_MONSOON", hemisphere: "N", growing_season: "Year-round, 2-3 rice seasons" },
  "Thailand": { zone: "TROPICAL_MONSOON", hemisphere: "N", growing_season: "Wet season (May–Oct)" },
  "Philippines": { zone: "TROPICAL_WET", hemisphere: "N", growing_season: "Year-round, 2 rice seasons" },
  "Indonesia": { zone: "TROPICAL_WET", hemisphere: "S", growing_season: "Year-round" },
  "Malaysia": { zone: "TROPICAL_WET", hemisphere: "N", growing_season: "Year-round" },
  "Brazil": { zone: "SUBTROPICAL", hemisphere: "S", growing_season: "Summer (Oct–Mar in South), Year-round in North" },
  "Argentina": { zone: "TEMPERATE_SOUTH", hemisphere: "S", growing_season: "Spring–Summer (Oct–Mar)" },
  "Mexico": { zone: "SUBTROPICAL", hemisphere: "N", growing_season: "Spring (Mar–Jun), Fall (Sep–Dec)" },
  "Nigeria": { zone: "TROPICAL_WET", hemisphere: "N", growing_season: "Wet season (Apr–Sep)" },
  "Kenya": { zone: "TROPICAL_MONSOON", hemisphere: "S", growing_season: "Long rains (Mar–May), Short rains (Oct–Dec)" },
  "Ethiopia": { zone: "TROPICAL_MONSOON", hemisphere: "N", growing_season: "Main season (Jun–Sep)" },
  "Ghana": { zone: "TROPICAL_WET", hemisphere: "N", growing_season: "Major (Mar–Jun), Minor (Sep–Nov)" },
  "South Africa": { zone: "SUBTROPICAL", hemisphere: "S", growing_season: "Summer (Oct–Mar)" },
  "Egypt": { zone: "ARID", hemisphere: "N", growing_season: "Winter crops (Oct–Mar), Summer crops (Apr–Aug)" },
  "Turkey": { zone: "MEDITERRANEAN", hemisphere: "N", growing_season: "Spring–Fall (Mar–Oct)" },
  "Saudi Arabia": { zone: "ARID", hemisphere: "N", growing_season: "Winter (Oct–Mar), greenhouses year-round" },
  "Australia": { zone: "SUBTROPICAL", hemisphere: "S", growing_season: "Varies: Winter wheat (Apr–Nov), Summer crops (Oct–Mar)" },
  "New Zealand": { zone: "TEMPERATE_SOUTH", hemisphere: "S", growing_season: "Spring–Fall (Sep–Apr)" },
  "Colombia": { zone: "TROPICAL_WET", hemisphere: "N", growing_season: "Year-round, varies by altitude" },
  "Peru": { zone: "SUBTROPICAL", hemisphere: "S", growing_season: "Summer (Oct–Mar)" },
  "Sri Lanka": { zone: "TROPICAL_WET", hemisphere: "N", growing_season: "Yala (Apr–Aug), Maha (Oct–Feb)" },
  "Myanmar": { zone: "TROPICAL_MONSOON", hemisphere: "N", growing_season: "Monsoon (May–Oct)" },
  "Cambodia": { zone: "TROPICAL_MONSOON", hemisphere: "N", growing_season: "Wet (May–Nov)" },
};

// ================================================================
// SEASONAL CALENDAR BY CLIMATE ZONE AND CROP
// ================================================================
// Month arrays are 1-indexed (1=Jan, 12=Dec)
const SEASONAL_DATA: Record<string, Record<string, { plantMonths: number[]; harvestMonths: number[]; growthDays: number; waterReq: string; soilType: string; tip: string }>> = {
  TEMPERATE_NORTH: {
    "Rice": { plantMonths: [4, 5, 6], harvestMonths: [9, 10], growthDays: 135, waterReq: "High", soilType: "Clay-loam, flooded fields", tip: "Flood field 2 weeks before transplanting" },
    "Corn (Maize)": { plantMonths: [4, 5, 6], harvestMonths: [9, 10], growthDays: 100, waterReq: "Medium", soilType: "Well-drained loam", tip: "Plant when soil temp exceeds 10°C" },
    "Wheat": { plantMonths: [3, 4, 9, 10], harvestMonths: [6, 7, 8], growthDays: 150, waterReq: "Low-Medium", soilType: "Well-drained loam", tip: "Spring wheat: plant Mar-Apr. Winter wheat: plant Sep-Oct." },
    "Soybeans": { plantMonths: [5, 6], harvestMonths: [9, 10], growthDays: 105, waterReq: "Medium", soilType: "Well-drained loam", tip: "Inoculate seeds with Rhizobium for nitrogen fixation" },
    "Potatoes": { plantMonths: [3, 4, 5], harvestMonths: [7, 8, 9], growthDays: 100, waterReq: "Medium", soilType: "Loose sandy loam", tip: "Hill soil around plants as they grow" },
    "Tomatoes": { plantMonths: [4, 5, 6], harvestMonths: [8, 9, 10], growthDays: 75, waterReq: "Medium-High", soilType: "Rich, well-drained loam", tip: "Start seeds indoors 6-8 weeks before last frost" },
    "Cabbage": { plantMonths: [3, 4, 8, 9], harvestMonths: [6, 7, 11, 12], growthDays: 90, waterReq: "Medium", soilType: "Fertile, well-drained", tip: "Cool-season crop; can tolerate light frost" },
    "Apples": { plantMonths: [3, 4], harvestMonths: [8, 9, 10], growthDays: 175, waterReq: "Medium", soilType: "Deep, well-drained loam", tip: "Requires 500-1000 chill hours below 7°C" },
    "Grapes": { plantMonths: [3, 4], harvestMonths: [8, 9, 10], growthDays: 165, waterReq: "Low-Medium", soilType: "Well-drained gravelly loam", tip: "Prune vines in late winter before bud break" },
    "Strawberries": { plantMonths: [3, 4, 5], harvestMonths: [6, 7, 8], growthDays: 95, waterReq: "Medium", soilType: "Sandy loam, slightly acidic", tip: "Remove runners in first season to boost yield" },
    "Barley": { plantMonths: [3, 4], harvestMonths: [7, 8], growthDays: 100, waterReq: "Low", soilType: "Well-drained loam", tip: "Earlier planting yields better quality malt barley" },
    "Oats": { plantMonths: [3, 4], harvestMonths: [7, 8], growthDays: 80, waterReq: "Medium", soilType: "Moderately acidic, well-drained", tip: "Plant as early as possible in spring" },
  },
  TROPICAL_MONSOON: {
    "Rice": { plantMonths: [6, 7], harvestMonths: [10, 11], growthDays: 130, waterReq: "High", soilType: "Clay-loam, flooded paddies", tip: "Kharif crop: sow with onset of monsoon" },
    "Corn (Maize)": { plantMonths: [6, 7, 11], harvestMonths: [9, 10, 2], growthDays: 90, waterReq: "Medium", soilType: "Well-drained loam", tip: "Avoid waterlogging during germination" },
    "Wheat": { plantMonths: [10, 11], harvestMonths: [2, 3, 4], growthDays: 145, waterReq: "Low-Medium", soilType: "Clay loam, well-drained", tip: "Rabi crop: plant after monsoon recession" },
    "Sugarcane": { plantMonths: [2, 3, 10, 11], harvestMonths: [11, 12, 1, 2], growthDays: 365, waterReq: "High", soilType: "Deep, fertile loam", tip: "Plant ratoon setts 3-4 nodes deep" },
    "Soybeans": { plantMonths: [6, 7], harvestMonths: [10, 11], growthDays: 100, waterReq: "Medium", soilType: "Well-drained, slightly acidic", tip: "Kharif crop in India; inoculate with Rhizobium" },
    "Chickpeas": { plantMonths: [10, 11], harvestMonths: [2, 3], growthDays: 100, waterReq: "Low", soilType: "Sandy loam, well-drained", tip: "Rabi crop; sensitive to waterlogging" },
    "Peanuts": { plantMonths: [6, 7], harvestMonths: [10, 11], growthDays: 110, waterReq: "Medium", soilType: "Sandy loam, loose soil", tip: "Loosen soil before pegging stage" },
    "Cotton": { plantMonths: [5, 6], harvestMonths: [10, 11, 12], growthDays: 160, waterReq: "Medium", soilType: "Deep, black cotton soil", tip: "Kharif crop; needs 160+ frost-free days" },
    "Bananas": { plantMonths: [3, 4, 9, 10], harvestMonths: [9, 10, 3, 4], growthDays: 300, waterReq: "High", soilType: "Rich, well-drained loam", tip: "Remove male bud after last hand forms" },
    "Mangoes": { plantMonths: [7, 8], harvestMonths: [4, 5, 6], growthDays: 120, waterReq: "Low-Medium", soilType: "Deep loam or laterite", tip: "Trees need dry spell to initiate flowering" },
    "Turmeric": { plantMonths: [4, 5, 6], harvestMonths: [12, 1, 2], growthDays: 270, waterReq: "Medium", soilType: "Loamy, well-drained", tip: "Rhizomes develop best in warm, moist soil" },
    "Ginger": { plantMonths: [4, 5], harvestMonths: [11, 12, 1], growthDays: 240, waterReq: "Medium", soilType: "Loamy, sandy, well-drained", tip: "Plant fresh rhizomes with active buds" },
    "Pigeon Peas": { plantMonths: [6, 7], harvestMonths: [12, 1, 2], growthDays: 165, waterReq: "Low", soilType: "Sandy loam, well-drained", tip: "Deep-rooted, drought-tolerant after establishment" },
    "Lentils": { plantMonths: [10, 11], harvestMonths: [3, 4], growthDays: 100, waterReq: "Low", soilType: "Sandy loam, well-drained", tip: "Rabi crop; avoid heavy clay soils" },
    "Tea": { plantMonths: [3, 4, 9, 10], harvestMonths: [4, 5, 6, 7, 8, 9, 10], growthDays: 365, waterReq: "High", soilType: "Acidic, well-drained hillside soil", tip: "Pluck every 7-14 days at 2-leaf-and-bud stage" },
  },
  TROPICAL_WET: {
    "Rice": { plantMonths: [1, 2, 6, 7], harvestMonths: [4, 5, 10, 11], growthDays: 120, waterReq: "High", soilType: "Clay, flooded paddies", tip: "Year-round possible; 2-3 crops per year" },
    "Cassava": { plantMonths: [3, 4, 9, 10], harvestMonths: [9, 10, 3, 4], growthDays: 270, waterReq: "Low-Medium", soilType: "Sandy loam, well-drained", tip: "Stake cuttings at 45° angle for best yield" },
    "Bananas": { plantMonths: [1, 2, 3, 7, 8, 9], harvestMonths: [7, 8, 9, 1, 2, 3], growthDays: 280, waterReq: "High", soilType: "Rich, moist, well-drained", tip: "Maintain 3-4 suckers per plant for continuous harvest" },
    "Pineapples": { plantMonths: [1, 2, 7, 8], harvestMonths: [5, 6, 11, 12], growthDays: 540, waterReq: "Low-Medium", soilType: "Sandy, well-drained, acidic", tip: "Apply ethephon to induce uniform flowering" },
    "Yam": { plantMonths: [3, 4, 5], harvestMonths: [10, 11, 12], growthDays: 200, waterReq: "Medium", soilType: "Deep, loose loam", tip: "Stake vines for better air circulation" },
    "Palm Oil": { plantMonths: [4, 5, 10, 11], harvestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], growthDays: 1460, waterReq: "High", soilType: "Deep, well-drained, acidic", tip: "Year-round harvest; first bunch in 3-4 years" },
    "Cacao": { plantMonths: [1, 2, 7, 8], harvestMonths: [10, 11, 12, 3, 4, 5], growthDays: 1095, waterReq: "High", soilType: "Rich, deep, moist loam", tip: "Grows best under shade trees (agroforestry)" },
    "Rubber": { plantMonths: [5, 6, 11, 12], harvestMonths: [4, 5, 6, 7, 8, 9, 10], growthDays: 2190, waterReq: "High", soilType: "Deep, well-drained, acidic", tip: "Tapping begins at 5-7 years; use proper tapping angle" },
    "Coffee": { plantMonths: [3, 4, 9, 10], harvestMonths: [10, 11, 12, 1, 2], growthDays: 1095, waterReq: "Medium-High", soilType: "Volcanic, well-drained, acidic", tip: "Shade-grown coffee improves flavor complexity" },
    "Coconuts": { plantMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], harvestMonths: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], growthDays: 365, waterReq: "Medium", soilType: "Sandy, coastal, well-drained", tip: "First nuts in 5-6 years; harvest every 45-60 days" },
    "Durian": { plantMonths: [6, 7, 12, 1], harvestMonths: [4, 5, 6, 11, 12], growthDays: 110, waterReq: "High", soilType: "Deep, fertile, well-drained", tip: "Stress tree with dry period to initiate flowering" },
    "Jackfruit": { plantMonths: [3, 4, 9, 10], harvestMonths: [3, 4, 5, 6, 7, 8], growthDays: 150, waterReq: "Medium", soilType: "Deep, well-drained loam", tip: "Thin fruits on trunk for better sizing" },
    "Sweet Potatoes": { plantMonths: [3, 4, 9, 10], harvestMonths: [6, 7, 12, 1], growthDays: 100, waterReq: "Medium", soilType: "Sandy loam, well-drained", tip: "Mound soil for better tuber development" },
    "Cowpeas": { plantMonths: [4, 5, 9, 10], harvestMonths: [7, 8, 12, 1], growthDays: 75, waterReq: "Low", soilType: "Sandy, well-drained", tip: "Drought-tolerant; intercrop with maize" },
    "Taro": { plantMonths: [2, 3, 4], harvestMonths: [8, 9, 10, 11], growthDays: 210, waterReq: "High", soilType: "Wetland or waterlogged soil", tip: "Flooded taro requires consistent water management" },
  },
  MEDITERRANEAN: {
    "Wheat": { plantMonths: [10, 11, 12], harvestMonths: [5, 6, 7], growthDays: 180, waterReq: "Low", soilType: "Clay loam, well-drained", tip: "Winter wheat thrives with mild Mediterranean winters" },
    "Tomatoes": { plantMonths: [3, 4, 5], harvestMonths: [7, 8, 9, 10], growthDays: 80, waterReq: "Medium", soilType: "Rich, well-drained sandy loam", tip: "Drip irrigation is ideal in dry summers" },
    "Olives": { plantMonths: [3, 4, 10, 11], harvestMonths: [10, 11, 12], growthDays: 180, waterReq: "Low", soilType: "Well-drained limestone or clay", tip: "Trees are productive for 500+ years; harvest before over-ripening" },
    "Grapes": { plantMonths: [2, 3, 4], harvestMonths: [8, 9, 10], growthDays: 160, waterReq: "Low-Medium", soilType: "Well-drained, poor to medium fertility", tip: "Stress vines slightly to concentrate sugars" },
    "Oranges": { plantMonths: [10, 11, 12], harvestMonths: [11, 12, 1, 2, 3], growthDays: 240, waterReq: "Medium", soilType: "Deep, well-drained sandy loam", tip: "Avoid frost; irrigate during fruit development" },
    "Chickpeas": { plantMonths: [11, 12, 1], harvestMonths: [4, 5], growthDays: 90, waterReq: "Low", soilType: "Sandy loam, well-drained", tip: "Winter chickpeas perform best in Mediterranean climate" },
    "Barley": { plantMonths: [10, 11], harvestMonths: [4, 5, 6], growthDays: 150, waterReq: "Low", soilType: "Wide range, tolerates dryness", tip: "Most drought-tolerant cereal for Mediterranean" },
    "Avocado": { plantMonths: [3, 4], harvestMonths: [9, 10, 11, 12], growthDays: 365, waterReq: "Medium", soilType: "Deep, well-drained", tip: "Sensitive to frost and waterlogging" },
    "Saffron": { plantMonths: [6, 7, 8], harvestMonths: [10, 11], growthDays: 90, waterReq: "Low", soilType: "Well-drained, slightly alkaline", tip: "Harvest stigmas at dawn before flowers open" },
  },
  CONTINENTAL: {
    "Wheat": { plantMonths: [9, 10], harvestMonths: [6, 7, 8], growthDays: 250, waterReq: "Low-Medium", soilType: "Chernozem or dark loam", tip: "Winter wheat benefits from snow cover insulation" },
    "Soybeans": { plantMonths: [5, 6], harvestMonths: [9, 10], growthDays: 100, waterReq: "Medium", soilType: "Well-drained loam", tip: "Rotate with corn for best nitrogen benefit" },
    "Sunflower": { plantMonths: [4, 5, 6], harvestMonths: [8, 9, 10], growthDays: 90, waterReq: "Low-Medium", soilType: "Deep, well-drained loam", tip: "Face rows N-S for maximum light interception" },
    "Corn (Maize)": { plantMonths: [4, 5], harvestMonths: [9, 10], growthDays: 100, waterReq: "Medium-High", soilType: "Deep, fertile loam", tip: "High moisture demand at silking stage" },
    "Rapeseed (Canola)": { plantMonths: [8, 9], harvestMonths: [6, 7], growthDays: 270, waterReq: "Medium", soilType: "Well-drained loam", tip: "Swath when 60% seeds turn brown" },
    "Barley": { plantMonths: [4, 5], harvestMonths: [7, 8], growthDays: 90, waterReq: "Low", soilType: "Well-drained loam", tip: "Spring barley; most cold-tolerant cereal" },
    "Potatoes": { plantMonths: [4, 5], harvestMonths: [8, 9], growthDays: 100, waterReq: "Medium", soilType: "Loose, sandy loam", tip: "Earth up plants to prevent greening" },
    "Tobacco": { plantMonths: [4, 5], harvestMonths: [8, 9, 10], growthDays: 100, waterReq: "Medium", soilType: "Light, well-drained sandy loam", tip: "Top plants at 12-16 leaves for leaf quality" },
    "Lentils": { plantMonths: [4, 5], harvestMonths: [7, 8], growthDays: 100, waterReq: "Low", soilType: "Sandy loam, well-drained", tip: "Spring lentils in continental climate" },
  },
  SUBTROPICAL: {
    "Rice": { plantMonths: [5, 6], harvestMonths: [10, 11], growthDays: 140, waterReq: "High", soilType: "Clay, flooded fields", tip: "Long-grain varieties preferred in subtropical zones" },
    "Soybeans": { plantMonths: [11, 12, 1], harvestMonths: [3, 4, 5], growthDays: 120, waterReq: "Medium", soilType: "Well-drained loam", tip: "Summer crop in southern hemisphere" },
    "Sugarcane": { plantMonths: [9, 10], harvestMonths: [7, 8, 9], growthDays: 365, waterReq: "High", soilType: "Deep, fertile loam", tip: "Plant fall sets for summer harvest" },
    "Cotton": { plantMonths: [10, 11, 12], harvestMonths: [4, 5, 6], growthDays: 180, waterReq: "Medium", soilType: "Well-drained loam", tip: "Defoliate before mechanical harvest" },
    "Corn (Maize)": { plantMonths: [9, 10, 11], harvestMonths: [1, 2, 3], growthDays: 100, waterReq: "Medium", soilType: "Well-drained loam", tip: "Summer crop in subtropical S. hemisphere" },
    "Bananas": { plantMonths: [3, 4, 9, 10], harvestMonths: [9, 10, 3, 4], growthDays: 300, waterReq: "High", soilType: "Rich, moist, well-drained", tip: "Wind protection is critical in cyclone zones" },
    "Mangoes": { plantMonths: [8, 9, 10], harvestMonths: [11, 12, 1, 2], growthDays: 120, waterReq: "Low-Medium", soilType: "Deep, well-drained loam", tip: "Stress with dry period to trigger flowering" },
    "Avocado": { plantMonths: [3, 4, 9, 10], harvestMonths: [6, 7, 8, 12, 1, 2], growthDays: 365, waterReq: "Medium", soilType: "Well-drained, slightly acidic", tip: "Cross-pollination between type A and B flowers" },
    "Coffee": { plantMonths: [9, 10, 11], harvestMonths: [5, 6, 7, 8], growthDays: 1095, waterReq: "Medium", soilType: "Volcanic, well-drained, acidic", tip: "High-altitude subtropical: excellent cup quality" },
    "Papaya": { plantMonths: [3, 4, 9, 10], harvestMonths: [9, 10, 3, 4], growthDays: 100, waterReq: "Medium", soilType: "Sandy loam, well-drained", tip: "First fruit in 9-12 months" },
    "Tomatoes": { plantMonths: [2, 3, 8, 9], harvestMonths: [5, 6, 11, 12], growthDays: 80, waterReq: "Medium", soilType: "Rich, well-drained loam", tip: "Avoid outdoor planting in peak summer heat" },
    "Sweet Potatoes": { plantMonths: [9, 10, 3, 4], harvestMonths: [1, 2, 7, 8], growthDays: 110, waterReq: "Medium", soilType: "Sandy loam, well-drained", tip: "Can grow year-round in frost-free areas" },
  },
  ARID: {
    "Wheat": { plantMonths: [10, 11], harvestMonths: [3, 4], growthDays: 150, waterReq: "Low-Medium", soilType: "Sandy loam, irrigated", tip: "Winter crop; use furrow irrigation" },
    "Barley": { plantMonths: [10, 11], harvestMonths: [3, 4], growthDays: 120, waterReq: "Low", soilType: "Sandy, well-drained", tip: "Most drought-tolerant cereal; best for arid zones" },
    "Sorghum": { plantMonths: [3, 4, 5], harvestMonths: [8, 9, 10], growthDays: 100, waterReq: "Low", soilType: "Sandy to clay loam", tip: "Summer crop after winter cereals" },
    "Dates": { plantMonths: [2, 3], harvestMonths: [8, 9, 10], growthDays: 180, waterReq: "Low", soilType: "Sandy, well-drained", tip: "Needs 100+ days above 38°C for proper ripening" },
    "Watermelon": { plantMonths: [3, 4], harvestMonths: [6, 7], growthDays: 80, waterReq: "Medium", soilType: "Sandy loam, well-drained", tip: "Drip irrigation under plastic mulch is ideal" },
    "Onions": { plantMonths: [10, 11], harvestMonths: [2, 3, 4], growthDays: 120, waterReq: "Medium", soilType: "Sandy loam, well-drained", tip: "Winter crop in arid regions" },
    "Garlic": { plantMonths: [10, 11], harvestMonths: [3, 4, 5], growthDays: 180, waterReq: "Low-Medium", soilType: "Sandy loam", tip: "Winter crop; harvest when leaves start yellowing" },
    "Sesame": { plantMonths: [4, 5, 6], harvestMonths: [9, 10], growthDays: 100, waterReq: "Low", soilType: "Sandy, well-drained, sandy loam", tip: "Extremely drought-tolerant; minimal inputs needed" },
    "Saffron": { plantMonths: [6, 7], harvestMonths: [10, 11], growthDays: 90, waterReq: "Low", soilType: "Well-drained, calcareous", tip: "Arid highland conditions produce highest quality" },
    "Chickpeas": { plantMonths: [10, 11], harvestMonths: [3, 4], growthDays: 90, waterReq: "Low", soilType: "Sandy loam, alkaline", tip: "Needs minimal water; winter crop" },
  },
  TEMPERATE_SOUTH: {
    "Wheat": { plantMonths: [5, 6], harvestMonths: [11, 12], growthDays: 150, waterReq: "Low-Medium", soilType: "Deep, fertile loam", tip: "Winter wheat planted mid-year for Nov-Dec harvest" },
    "Corn (Maize)": { plantMonths: [10, 11], harvestMonths: [3, 4], growthDays: 100, waterReq: "Medium", soilType: "Well-drained loam", tip: "Southern hemisphere summer crop" },
    "Soybeans": { plantMonths: [10, 11], harvestMonths: [3, 4], growthDays: 105, waterReq: "Medium", soilType: "Well-drained loam", tip: "October planting for April harvest in S hemisphere" },
    "Rapeseed (Canola)": { plantMonths: [4, 5], harvestMonths: [10, 11], growthDays: 150, waterReq: "Medium", soilType: "Well-drained loam", tip: "Winter canola in S hemisphere" },
    "Apples": { plantMonths: [9, 10], harvestMonths: [2, 3, 4, 5], growthDays: 175, waterReq: "Medium", soilType: "Deep, well-drained loam", tip: "Spring planting in S hemisphere; harvest autumn" },
    "Grapes": { plantMonths: [8, 9, 10], harvestMonths: [2, 3, 4], growthDays: 165, waterReq: "Low-Medium", soilType: "Well-drained, poor to medium", tip: "Vintage February-April in southern hemisphere" },
    "Potatoes": { plantMonths: [9, 10, 11], harvestMonths: [1, 2, 3], growthDays: 100, waterReq: "Medium", soilType: "Loose, sandy loam", tip: "Summer crop in S hemisphere" },
    "Strawberries": { plantMonths: [7, 8, 9], harvestMonths: [11, 12, 1], growthDays: 95, waterReq: "Medium", soilType: "Sandy loam, slightly acidic", tip: "Spring planting (Aug-Sep) for December harvest" },
  },
};

// ================================================================
// CURRENCY CACHE (1-hour TTL)
// ================================================================
let currencyCache: { rates: Record<string, number>; timestamp: number } | null = null;
const CURRENCY_CACHE_TTL = 60 * 60 * 1000; // 1 hour

const FALLBACK_RATES: Record<string, number> = {
  USD: 1, EUR: 0.92, GBP: 0.82, INR: 83.5, CNY: 7.24, JPY: 149.8,
  PHP: 56.8, BRL: 4.97, AUD: 1.53, CAD: 1.36, KRW: 1325, THB: 35.2,
  VND: 24450, IDR: 15600, MYR: 4.72, NGN: 1310, KES: 129, ZAR: 18.6,
  EGP: 30.9, TRY: 32.1, SAR: 3.75, AED: 3.67, MXN: 17.1, ARS: 870,
  PKR: 279, BDT: 110, LKR: 312, MMK: 2100, KHR: 4050, VUV: 119
};

async function getCurrencyRates(base: string = "USD"): Promise<Record<string, number>> {
  const now = Date.now();
  if (currencyCache && (now - currencyCache.timestamp) < CURRENCY_CACHE_TTL) {
    return currencyCache.rates;
  }
  try {
    const res = await axios.get(`https://open.er-api.com/v6/latest/USD`, { timeout: 5000 });
    if (res.data?.rates) {
      currencyCache = { rates: res.data.rates, timestamp: now };
      return res.data.rates;
    }
  } catch {
    console.warn("[Currency] Using fallback rates (API unavailable)");
  }
  return FALLBACK_RATES;
}

// ================================================================
// WEATHER HELPERS (Open-Meteo — free, no key)
// ================================================================
const WMO_CODES: Record<number, { condition: string; icon: string }> = {
  0: { condition: "Clear Sky", icon: "sun" },
  1: { condition: "Mainly Clear", icon: "sun" },
  2: { condition: "Partly Cloudy", icon: "cloud-sun" },
  3: { condition: "Overcast", icon: "cloud" },
  45: { condition: "Fog", icon: "cloud" },
  48: { condition: "Icy Fog", icon: "cloud" },
  51: { condition: "Light Drizzle", icon: "drizzle" },
  53: { condition: "Moderate Drizzle", icon: "drizzle" },
  55: { condition: "Heavy Drizzle", icon: "drizzle" },
  61: { condition: "Light Rain", icon: "rain" },
  63: { condition: "Moderate Rain", icon: "rain" },
  65: { condition: "Heavy Rain", icon: "rain" },
  71: { condition: "Light Snow", icon: "snow" },
  73: { condition: "Moderate Snow", icon: "snow" },
  75: { condition: "Heavy Snow", icon: "snow" },
  80: { condition: "Rain Showers", icon: "rain" },
  81: { condition: "Moderate Showers", icon: "rain" },
  82: { condition: "Violent Showers", icon: "rain" },
  95: { condition: "Thunderstorm", icon: "storm" },
  96: { condition: "Thunderstorm + Hail", icon: "storm" },
  99: { condition: "Thunderstorm + Heavy Hail", icon: "storm" },
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

async function fetchRealWeather(location: string) {
  // Step 1: Geocoding
  const geoRes = await axios.get(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1&language=en`,
    { timeout: 5000 }
  );
  if (!geoRes.data?.results?.length) return null;

  const { latitude, longitude, timezone, country } = geoRes.data.results[0];

  // Step 2: Forecast
  const wxRes = await axios.get(
    `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}` +
    `&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code,apparent_temperature` +
    `&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code` +
    `&timezone=${encodeURIComponent(timezone)}&forecast_days=7`,
    { timeout: 6000 }
  );

  const wx = wxRes.data;
  const cur = wx.current;
  const daily = wx.daily;

  const forecast = daily.time.map((dateStr: string, i: number) => {
    const d = new Date(dateStr);
    return {
      day: DAYS[d.getDay()],
      date: dateStr,
      temp: Math.round((daily.temperature_2m_max[i] + daily.temperature_2m_min[i]) / 2),
      tempMax: Math.round(daily.temperature_2m_max[i]),
      tempMin: Math.round(daily.temperature_2m_min[i]),
      condition: WMO_CODES[daily.weather_code[i]]?.condition ?? "Variable",
      icon: WMO_CODES[daily.weather_code[i]]?.icon ?? "cloud-sun",
      precipitation: daily.precipitation_sum[i] ?? 0,
    };
  });

  return {
    location,
    country,
    latitude,
    longitude,
    temp: Math.round(cur.temperature_2m),
    feelsLike: Math.round(cur.apparent_temperature),
    humidity: cur.relative_humidity_2m,
    rainfall: cur.precipitation,
    windSpeed: cur.wind_speed_10m,
    condition: WMO_CODES[cur.weather_code]?.condition ?? "Variable",
    icon: WMO_CODES[cur.weather_code]?.icon ?? "cloud-sun",
    forecast,
  };
}

function getMockWeather(location: string) {
  return {
    location, country: "Unknown", latitude: 0, longitude: 0,
    temp: 28, feelsLike: 30, humidity: 65, rainfall: 4, windSpeed: 14,
    condition: "Partly Cloudy", icon: "cloud-sun",
    forecast: DAYS.map((day, i) => ({
      day, date: "", temp: 26 + i % 4, tempMax: 30 + i % 3, tempMin: 22 - i % 3,
      condition: i % 3 === 0 ? "Rain" : i % 2 === 0 ? "Partly Cloudy" : "Sunny",
      icon: i % 3 === 0 ? "rain" : "cloud-sun", precipitation: i % 3 === 0 ? 8 : 0,
    })),
  };
}

// ================================================================
// AI — GEMINI WITH MODEL ROUTING
// ================================================================
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

type ModelPersona = "DeepSeek-R1" | "Qwen-2.5" | "LLaMA-3";

function routeModel(message: string): ModelPersona {
  const lc = message.toLowerCase();
  const reasoningKeywords = ["analyze", "analyse", "calculate", "compare", "decision", "strategy", "risk", "optimize", "optimize", "reason", "plan", "budget", "forecast", "estimate"];
  const knowledgeKeywords = ["how to grow", "disease", "pest", "fertilizer", "soil", "knowledge", "fact", "what is", "tell me about", "stages", "cycle", "nutrient", "irrigation", "details"];
  if (reasoningKeywords.some(k => lc.includes(k))) return "DeepSeek-R1";
  if (knowledgeKeywords.some(k => lc.includes(k))) return "Qwen-2.5";
  return "LLaMA-3";
}

function getSystemPrompt(persona: ModelPersona, userContext: any): string {
  const currentMonth = new Date().toLocaleString("en-US", { month: "long" });
  const ctx = `
User Context:
- Location: ${userContext?.location || "Unknown"}
- Country: ${userContext?.country || "Unknown"}
- Primary Crop: ${userContext?.crop || "Unknown"}
- Currency: ${userContext?.currency || "USD"}
- Current Month: ${currentMonth}
- AI Mode: ${userContext?.aiMode || "balanced"}
`;

  if (persona === "DeepSeek-R1") {
    return `You are DeepSeek-R1, an advanced agricultural reasoning AI. You provide detailed, data-driven analysis with clear step-by-step reasoning.
${ctx}
Instructions:
- Provide structured, logical analysis with numbered steps
- Back claims with agricultural science and data
- Consider local climate, season, and crop-specific factors
- Be precise with numbers (yields, costs, timelines)
- End with a clear recommendation or conclusion
Format: Use markdown with headers and bullet points where appropriate.`;
  }
  if (persona === "Qwen-2.5") {
    return `You are Qwen-2.5, a comprehensive agricultural knowledge base AI. You provide structured, accurate, technical information.
${ctx}
Instructions:
- Provide well-organized factual information with clear categories
- Include specific data: pH ranges, temperature requirements, growth stages
- Reference crop-specific best practices and regional considerations
- Use tables or bullet points for structured data
- Include pest/disease identification and management where relevant
Format: Use markdown with clear sections, bullet points, and any relevant tables.`;
  }
  return `You are LLaMA-3, a friendly and helpful farming assistant AI.
${ctx}
Instructions:
- Be warm, conversational, and encouraging
- Keep responses concise and practical (3-5 sentences typically)
- Relate advice to the farmer's specific context (crop, location, season)
- Use simple language; avoid excessive jargon
- If uncertain, acknowledge it and suggest consulting local extension services
Format: Natural conversational text, brief paragraphs.`;
}

// ================================================================
// EXPRESS SERVER
// ================================================================
async function startServer() {
  const app = express();
  const PORT = 5000;

  app.use(cors());
  app.use(express.json());

  // --- WEATHER ---
  app.get("/api/weather", async (req, res) => {
    const location = (req.query.location as string) || "London";
    try {
      const data = await fetchRealWeather(location);
      res.json(data || getMockWeather(location));
    } catch (err) {
      console.error("[Weather]", err instanceof Error ? err.message : err);
      res.json(getMockWeather(location));
    }
  });

  // --- CURRENCY RATES ---
  app.get("/api/currency-rates", async (req, res) => {
    try {
      const rates = await getCurrencyRates("USD");
      res.json({ base: "USD", rates, timestamp: Date.now() });
    } catch {
      res.json({ base: "USD", rates: FALLBACK_RATES, timestamp: Date.now() });
    }
  });

  // --- MARKET PRICES (with live currency conversion) ---
  app.get("/api/market", async (req, res) => {
    const targetCurrency = (req.query.currency as string) || "USD";
    const countryFilter = req.query.country as string;
    const categoryFilter = req.query.category as string;
    const rates = await getCurrencyRates();
    const rate = rates[targetCurrency] || 1;

    let crops = CROP_DATABASE;
    if (categoryFilter && categoryFilter !== "All") {
      crops = crops.filter(c => c.category === categoryFilter);
    }
    if (countryFilter) {
      const countryInfo = COUNTRY_CLIMATE[countryFilter];
      if (countryInfo) {
        crops = crops.filter(c => c.climateZones.includes(countryInfo.zone));
      }
    }

    const marketData = crops.map(crop => {
      const volatility = (Math.random() - 0.48) * 0.08;
      const changePercent = parseFloat((volatility * 100).toFixed(2));
      const trend = changePercent > 0.5 ? "up" : changePercent < -0.5 ? "down" : "stable";
      return {
        crop: crop.name,
        category: crop.category,
        price: parseFloat((crop.basePricePerKg * rate).toFixed(3)),
        priceUSD: crop.basePricePerKg,
        changePercent,
        trend,
        unit: "kg",
        currency: targetCurrency,
        regions: crop.regions,
        growthCycle: crop.growthCycle,
      };
    });

    res.json(marketData);
  });

  // --- CROP DATABASE SEARCH ---
  app.get("/api/crops", async (req, res) => {
    const query = (req.query.q as string || "").toLowerCase();
    const category = req.query.category as string;
    const country = req.query.country as string;

    let results = CROP_DATABASE;
    if (query) {
      results = results.filter(c =>
        c.name.toLowerCase().includes(query) ||
        c.category.toLowerCase().includes(query) ||
        c.description.toLowerCase().includes(query)
      );
    }
    if (category && category !== "All") {
      results = results.filter(c => c.category === category);
    }
    if (country && COUNTRY_CLIMATE[country]) {
      const zone = COUNTRY_CLIMATE[country].zone;
      results = results.filter(c => c.climateZones.includes(zone));
    }

    res.json(results);
  });

  // --- SEASONAL CALENDAR ---
  app.get("/api/seasonal-calendar", async (req, res) => {
    const crop = (req.query.crop as string) || "Rice";
    const country = (req.query.country as string) || "USA";

    const countryInfo = COUNTRY_CLIMATE[country] || COUNTRY_CLIMATE["USA"];
    const zone = countryInfo.zone;
    const zoneData = SEASONAL_DATA[zone] || SEASONAL_DATA["TEMPERATE_NORTH"];

    // Find crop data — try exact match first, then partial
    let cropKey = Object.keys(zoneData).find(k => k.toLowerCase() === crop.toLowerCase());
    if (!cropKey) cropKey = Object.keys(zoneData).find(k => k.toLowerCase().includes(crop.toLowerCase()));

    const cropData = cropKey ? zoneData[cropKey] : null;

    const currentMonth = new Date().getMonth() + 1;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const monthlyStatus = months.map((name, i) => {
      const monthNum = i + 1;
      const isPlanting = cropData?.plantMonths.includes(monthNum) ?? false;
      const isHarvest = cropData?.harvestMonths.includes(monthNum) ?? false;
      const isGrowing = !isPlanting && !isHarvest;
      const isCurrent = monthNum === currentMonth;
      return {
        month: name,
        monthNum,
        isPlanting,
        isHarvest,
        isGrowing: cropData ? isGrowing : false,
        isCurrent,
        status: isPlanting ? "plant" : isHarvest ? "harvest" : cropData ? "growing" : "none",
      };
    });

    res.json({
      crop,
      country,
      climateZone: zone,
      hemisphere: countryInfo.hemisphere,
      growingSeason: countryInfo.growing_season,
      plantingMonths: cropData?.plantMonths.map(m => months[m - 1]) ?? [],
      harvestMonths: cropData?.harvestMonths.map(m => months[m - 1]) ?? [],
      growthDays: cropData?.growthDays ?? 120,
      waterRequirement: cropData?.waterReq ?? "Medium",
      soilType: cropData?.soilType ?? "Well-drained loam",
      tip: cropData?.tip ?? "Consult your local agricultural extension for region-specific advice.",
      monthlyStatus,
      availableInZone: !!cropData,
    });
  });

  // --- SEASONAL PLAN (legacy endpoint) ---
  app.get("/api/seasonal-plan", async (req, res) => {
    const country = (req.query.country as string) || "USA";
    const countryInfo = COUNTRY_CLIMATE[country] || { growing_season: "Varies by region" };
    const plans: Record<string, Record<string, string>> = {
      TEMPERATE_NORTH: { Spring: "Planting", Summer: "Growing", Autumn: "Harvest", Winter: "Preparation" },
      TROPICAL_MONSOON: { Kharif: "Sow & Grow", Rabi: "Harvest & Plant", "Pre-Monsoon": "Preparation", "Post-Monsoon": "Harvest" },
      TROPICAL_WET: { "Wet Season 1": "Planting", "Dry Season 1": "Harvest", "Wet Season 2": "Replanting", "Dry Season 2": "Harvest" },
      MEDITERRANEAN: { Winter: "Wheat & Legumes", Spring: "Vegetables", Summer: "Fruits & Harvest", Autumn: "Planting" },
      CONTINENTAL: { Spring: "Planting", Summer: "Peak Growth", Autumn: "Harvest", Winter: "Soil Prep" },
      SUBTROPICAL: { Summer: "Planting", Autumn: "Growing", Winter: "Harvest", Spring: "Replanting" },
      ARID: { Winter: "Main Crop Season", Spring: "Harvest", Summer: "Fallow / Heat", Autumn: "Preparation" },
      TEMPERATE_SOUTH: { Spring: "Planting", Summer: "Growing", Autumn: "Harvest", Winter: "Preparation" },
    };
    const zone = countryInfo.zone ?? "TEMPERATE_NORTH";
    res.json(plans[zone] ?? plans["TEMPERATE_NORTH"]);
  });

  // --- RECOMMENDATIONS ---
  app.get("/api/recommendations", async (req, res) => {
    const country = (req.query.country as string) || "USA";
    const countryInfo = COUNTRY_CLIMATE[country];
    const zone = countryInfo?.zone || "TEMPERATE_NORTH";
    const zoneCrops = CROP_DATABASE.filter(c => c.climateZones.includes(zone));
    const topCrops = zoneCrops.slice(0, 6).map((crop, i) => ({
      name: crop.name,
      suitability: 95 - i * 5,
      risk: i < 2 ? "Low" : i < 4 ? "Medium" : "High",
      advice: `${crop.description} Growth cycle: ${crop.growthCycle}.`,
    }));
    res.json(topCrops);
  });

  // --- AI CHAT (Gemini + Model Routing) ---
  app.post("/api/ai/chat", async (req, res) => {
    const { message, history = [], userPrefs = {} } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: "Message is required" });

    if (!process.env.GEMINI_API_KEY) {
      return res.json({
        content: `[AI Offline — No API key configured] Based on your query about "${message}", I recommend consulting local agricultural extension services for ${userPrefs.crop || "your crops"} in ${userPrefs.location || "your region"}.`,
        model: "LLaMA-3",
      });
    }

    try {
      const persona = routeModel(message);
      const systemInstruction = getSystemPrompt(persona, userPrefs);

      const chat = ai.chats.create({
        model: "gemini-2.0-flash",
        config: { systemInstruction },
        history: history.map((m: any) => ({
          role: m.role === "ai" ? "model" : "user",
          parts: [{ text: m.content }],
        })),
      });

      const response = await chat.sendMessage({ message });
      res.json({ content: response.text, model: persona });
    } catch (err) {
      console.error("[AI Chat]", err instanceof Error ? err.message : err);
      res.status(500).json({
        error: "AI service error",
        content: "I encountered an issue processing your request. Please try again.",
        model: "LLaMA-3",
      });
    }
  });

  // --- COUNTRY INFO ---
  app.get("/api/country-info", async (req, res) => {
    const country = (req.query.country as string) || "USA";
    const info = COUNTRY_CLIMATE[country];
    if (!info) return res.json({ zone: "TEMPERATE_NORTH", hemisphere: "N", growing_season: "Spring–Fall" });
    res.json({ ...info, country });
  });

  // --- Vite / Static ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: "spa" });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => res.sendFile(path.join(distPath, "index.html")));
  }

  app.listen(PORT, "0.0.0.0", () => console.log(`Server running on http://localhost:${PORT}`));
}

startServer();
