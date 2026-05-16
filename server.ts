import express from "express";
import path from "path";
import cors from "cors";
import { createServer as createViteServer } from "vite";
import axios from "axios";
import Groq from "groq-sdk";

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

  // --- Additional Grains ---
  { name: "Triticale", category: "Grain", description: "High-yielding hybrid of wheat and rye for food and feed.", growthCycle: "120-150 days", basePricePerKg: 0.22, regions: ["Europe", "Americas"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL"] },
  { name: "Buckwheat", category: "Grain", description: "Gluten-free pseudo-grain popular in Eastern Europe and Asia.", growthCycle: "70-90 days", basePricePerKg: 0.65, regions: ["Europe", "Asia", "Americas"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "SUBTROPICAL"] },
  { name: "Amaranth", category: "Grain", description: "Ancient Aztec pseudo-grain, high protein and naturally gluten-free.", growthCycle: "90-110 days", basePricePerKg: 2.50, regions: ["Americas", "Asia", "Africa"], climateZones: ["SUBTROPICAL", "TROPICAL_MONSOON", "ARID"] },
  { name: "Fonio", category: "Grain", description: "Ancient West African superfood grain, drought-tolerant and fast-growing.", growthCycle: "60-70 days", basePricePerKg: 1.80, regions: ["Africa"], climateZones: ["ARID", "TROPICAL_MONSOON"] },
  { name: "Spelt", category: "Grain", description: "Ancient wheat variety for specialty bread and health food markets.", growthCycle: "130-160 days", basePricePerKg: 0.90, regions: ["Europe", "Americas"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "MEDITERRANEAN"] },
  { name: "Emmer Wheat", category: "Grain", description: "Heritage grain ancestor of modern wheat, used for specialty markets.", growthCycle: "120-150 days", basePricePerKg: 1.10, regions: ["Middle East", "Europe", "Africa"], climateZones: ["MEDITERRANEAN", "ARID", "TEMPERATE_NORTH"] },
  { name: "Job's Tears", category: "Grain", description: "Asian grain used in herbal medicine and specialty foods.", growthCycle: "120-160 days", basePricePerKg: 2.00, regions: ["Asia"], climateZones: ["TROPICAL_WET", "TROPICAL_MONSOON", "SUBTROPICAL"] },
  { name: "Canary Grass", category: "Grain", description: "Hardy grain used for birdseed and specialty human consumption.", growthCycle: "90-120 days", basePricePerKg: 0.55, regions: ["Europe", "Americas", "Asia"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL"] },

  // --- Additional Legumes ---
  { name: "Black Beans", category: "Legume", description: "Common bean popular in Latin American and Caribbean cuisine.", growthCycle: "80-100 days", basePricePerKg: 1.10, regions: ["Americas", "Global"], climateZones: ["SUBTROPICAL", "TROPICAL_MONSOON", "TEMPERATE_NORTH"] },
  { name: "Kidney Beans", category: "Legume", description: "Large red bean widely used in stews, chili, and salads globally.", growthCycle: "80-100 days", basePricePerKg: 1.20, regions: ["Global"], climateZones: ["SUBTROPICAL", "TROPICAL_MONSOON", "TEMPERATE_NORTH", "MEDITERRANEAN"] },
  { name: "Navy Beans", category: "Legume", description: "Small white bean, the classic base for baked beans and soups.", growthCycle: "80-100 days", basePricePerKg: 1.00, regions: ["Americas", "Europe"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "SUBTROPICAL"] },
  { name: "Fava Beans", category: "Legume", description: "Large flat beans popular in Mediterranean and Middle Eastern cuisine.", growthCycle: "90-120 days", basePricePerKg: 0.95, regions: ["Mediterranean", "Middle East", "Americas"], climateZones: ["MEDITERRANEAN", "ARID", "TEMPERATE_NORTH"] },
  { name: "Adzuki Beans", category: "Legume", description: "Small red bean prized in East Asian desserts and confectionery.", growthCycle: "70-90 days", basePricePerKg: 1.50, regions: ["Asia"], climateZones: ["SUBTROPICAL", "TROPICAL_MONSOON", "TEMPERATE_NORTH"] },
  { name: "Lima Beans", category: "Legume", description: "Creamy butter bean grown widely in tropical Americas and Africa.", growthCycle: "75-100 days", basePricePerKg: 1.30, regions: ["Americas", "Africa", "Asia"], climateZones: ["SUBTROPICAL", "TROPICAL_MONSOON", "MEDITERRANEAN"] },
  { name: "Green Peas", category: "Legume", description: "Cool-season vegetable legume, widely consumed fresh and frozen.", growthCycle: "60-70 days", basePricePerKg: 0.60, regions: ["Global"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "MEDITERRANEAN"] },
  { name: "Moth Beans", category: "Legume", description: "Drought-tolerant pulse important in South Asian cooking.", growthCycle: "60-80 days", basePricePerKg: 0.85, regions: ["Asia"], climateZones: ["ARID", "TROPICAL_MONSOON"] },
  { name: "Tepary Beans", category: "Legume", description: "Drought-resistant Southwestern US bean, exceptionally high in protein.", growthCycle: "60-90 days", basePricePerKg: 2.00, regions: ["Americas"], climateZones: ["ARID", "SUBTROPICAL"] },

  // --- Additional Vegetables ---
  { name: "Lettuce", category: "Vegetable", description: "Most consumed salad leaf globally, cool-season crop.", growthCycle: "45-60 days", basePricePerKg: 1.20, regions: ["Global"], climateZones: ["TEMPERATE_NORTH", "MEDITERRANEAN", "CONTINENTAL"] },
  { name: "Kale", category: "Vegetable", description: "Nutrient-dense leafy green superfood rich in vitamins and antioxidants.", growthCycle: "50-65 days", basePricePerKg: 1.80, regions: ["Americas", "Europe"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "MEDITERRANEAN"] },
  { name: "Swiss Chard", category: "Vegetable", description: "Colorful-stemmed leafy green popular in European and Middle Eastern cooking.", growthCycle: "50-65 days", basePricePerKg: 1.50, regions: ["Europe", "Americas", "Asia"], climateZones: ["TEMPERATE_NORTH", "MEDITERRANEAN", "SUBTROPICAL"] },
  { name: "Leek", category: "Vegetable", description: "Mild onion-family vegetable, essential in European culinary tradition.", growthCycle: "80-120 days", basePricePerKg: 1.10, regions: ["Europe", "Americas"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "MEDITERRANEAN"] },
  { name: "Celery", category: "Vegetable", description: "Crunchy stalked vegetable used fresh in salads and cooked in stocks.", growthCycle: "80-100 days", basePricePerKg: 0.80, regions: ["Global"], climateZones: ["TEMPERATE_NORTH", "MEDITERRANEAN", "SUBTROPICAL"] },
  { name: "Fennel", category: "Vegetable", description: "Aromatic anise-flavored bulb vegetable, a Mediterranean staple.", growthCycle: "70-90 days", basePricePerKg: 1.40, regions: ["Mediterranean", "Europe"], climateZones: ["MEDITERRANEAN", "TEMPERATE_NORTH"] },
  { name: "Artichoke", category: "Vegetable", description: "Edible thistle flower bud, a prized Mediterranean gourmet vegetable.", growthCycle: "150-180 days", basePricePerKg: 2.50, regions: ["Mediterranean", "Americas"], climateZones: ["MEDITERRANEAN", "SUBTROPICAL"] },
  { name: "Brussels Sprouts", category: "Vegetable", description: "Miniature cabbage buds, cool-season brassica with strong flavor.", growthCycle: "90-120 days", basePricePerKg: 2.00, regions: ["Europe", "Americas"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL"] },
  { name: "Cauliflower", category: "Vegetable", description: "Versatile white brassica used fresh, roasted, or as a rice substitute.", growthCycle: "70-90 days", basePricePerKg: 1.20, regions: ["Global"], climateZones: ["TEMPERATE_NORTH", "MEDITERRANEAN", "SUBTROPICAL"] },
  { name: "Asparagus", category: "Vegetable", description: "Prized perennial spring vegetable with delicate, earthy flavor.", growthCycle: "365-730 days", basePricePerKg: 3.50, regions: ["Europe", "Americas", "Asia"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "MEDITERRANEAN"] },
  { name: "Pumpkin", category: "Vegetable", description: "Large winter squash, used for food, animal feed, and global celebrations.", growthCycle: "90-120 days", basePricePerKg: 0.35, regions: ["Global"], climateZones: ["TEMPERATE_NORTH", "SUBTROPICAL", "CONTINENTAL", "MEDITERRANEAN"] },
  { name: "Zucchini", category: "Vegetable", description: "Prolific summer squash harvested young, extremely versatile in cooking.", growthCycle: "45-60 days", basePricePerKg: 0.70, regions: ["Global"], climateZones: ["TEMPERATE_NORTH", "SUBTROPICAL", "MEDITERRANEAN"] },
  { name: "Okra", category: "Vegetable", description: "Tropical vegetable used in gumbo, curries, and stir-fries worldwide.", growthCycle: "60-75 days", basePricePerKg: 1.30, regions: ["Africa", "Asia", "Americas"], climateZones: ["TROPICAL_MONSOON", "SUBTROPICAL", "ARID"] },
  { name: "Radish", category: "Vegetable", description: "Fast-growing sharp-flavored root vegetable, one of the quickest crops.", growthCycle: "25-35 days", basePricePerKg: 0.55, regions: ["Global"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "SUBTROPICAL", "MEDITERRANEAN"] },
  { name: "Turnip", category: "Vegetable", description: "Cool-season root vegetable, both root and leafy tops are edible.", growthCycle: "40-60 days", basePricePerKg: 0.40, regions: ["Global"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "MEDITERRANEAN"] },
  { name: "Beetroot", category: "Vegetable", description: "Sweet earthy root vegetable rich in nitrates, used in salads and juice.", growthCycle: "55-70 days", basePricePerKg: 0.65, regions: ["Global"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "MEDITERRANEAN"] },
  { name: "Bok Choy", category: "Vegetable", description: "Crisp Chinese cabbage, cornerstone of East Asian vegetable cuisine.", growthCycle: "45-70 days", basePricePerKg: 0.90, regions: ["Asia", "Americas"], climateZones: ["TEMPERATE_NORTH", "SUBTROPICAL", "TROPICAL_MONSOON"] },
  { name: "Arugula", category: "Vegetable", description: "Peppery salad leaf, a staple of Italian cuisine and global salads.", growthCycle: "40-50 days", basePricePerKg: 3.00, regions: ["Mediterranean", "Europe", "Americas"], climateZones: ["MEDITERRANEAN", "TEMPERATE_NORTH"] },
  { name: "Watercress", category: "Vegetable", description: "Aquatic peppery herb, one of the most nutrient-dense vegetables known.", growthCycle: "30-50 days", basePricePerKg: 3.50, regions: ["Europe", "Americas", "Asia"], climateZones: ["TEMPERATE_NORTH", "SUBTROPICAL"] },
  { name: "Mustard Greens", category: "Vegetable", description: "Peppery leafy green important in Southern US, Indian, and African cuisines.", growthCycle: "40-50 days", basePricePerKg: 0.80, regions: ["Global"], climateZones: ["TEMPERATE_NORTH", "TROPICAL_MONSOON", "SUBTROPICAL"] },
  { name: "Bitter Gourd", category: "Vegetable", description: "Tropical vine vegetable valued for its medicinal hypoglycemic properties.", growthCycle: "60-70 days", basePricePerKg: 1.00, regions: ["Asia", "Africa"], climateZones: ["TROPICAL_WET", "TROPICAL_MONSOON", "SUBTROPICAL"] },
  { name: "Snake Gourd", category: "Vegetable", description: "Long tropical vine vegetable, a staple in South and Southeast Asian cuisine.", growthCycle: "55-70 days", basePricePerKg: 0.70, regions: ["Asia"], climateZones: ["TROPICAL_WET", "TROPICAL_MONSOON"] },
  { name: "Parsnip", category: "Vegetable", description: "Sweet nutty root vegetable, essential in European winter cooking.", growthCycle: "120-160 days", basePricePerKg: 0.90, regions: ["Europe", "Americas"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL"] },
  { name: "Kohlrabi", category: "Vegetable", description: "Mild cabbage-flavored stem vegetable popular in Central European cuisine.", growthCycle: "45-60 days", basePricePerKg: 0.80, regions: ["Europe", "Americas", "Asia"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "SUBTROPICAL"] },
  { name: "Celeriac", category: "Vegetable", description: "Knobby root celery used in European soups, mashes, and remoulade.", growthCycle: "120-150 days", basePricePerKg: 1.00, regions: ["Europe", "Americas"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL"] },

  // --- Additional Fruits ---
  { name: "Kiwi", category: "Fruit", description: "Fuzzy subtropical fruit exceptionally rich in vitamin C and antioxidants.", growthCycle: "150-180 days", basePricePerKg: 2.50, regions: ["Asia", "Europe", "Americas", "Oceania"], climateZones: ["SUBTROPICAL", "MEDITERRANEAN", "TEMPERATE_SOUTH"] },
  { name: "Lemon", category: "Fruit", description: "Sour citrus fruit, essential flavoring in global cuisines and beverages.", growthCycle: "180-240 days", basePricePerKg: 0.75, regions: ["Mediterranean", "Americas", "Asia"], climateZones: ["MEDITERRANEAN", "SUBTROPICAL"] },
  { name: "Lime", category: "Fruit", description: "Small sour citrus, key ingredient in tropical, Asian, and Mexican cuisines.", growthCycle: "180-240 days", basePricePerKg: 0.80, regions: ["Americas", "Asia", "Africa"], climateZones: ["TROPICAL_WET", "SUBTROPICAL", "MEDITERRANEAN"] },
  { name: "Fig", category: "Fruit", description: "Ancient Mediterranean fruit with sweet, honeyed flesh and edible seeds.", growthCycle: "90-120 days", basePricePerKg: 2.20, regions: ["Mediterranean", "Middle East", "Americas"], climateZones: ["MEDITERRANEAN", "ARID", "SUBTROPICAL"] },
  { name: "Pomegranate", category: "Fruit", description: "Ancient fruit rich in antioxidants, prized in Middle Eastern and Asian culture.", growthCycle: "150-180 days", basePricePerKg: 2.00, regions: ["Middle East", "Mediterranean", "Asia", "Americas"], climateZones: ["ARID", "MEDITERRANEAN", "SUBTROPICAL"] },
  { name: "Blueberry", category: "Fruit", description: "Top global superfood berry, extremely high in antioxidants and fiber.", growthCycle: "90-120 days", basePricePerKg: 5.50, regions: ["Americas", "Europe", "Oceania"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "TEMPERATE_SOUTH"] },
  { name: "Raspberry", category: "Fruit", description: "Delicate high-value cane berry, popular fresh, frozen, and for jams.", growthCycle: "90-110 days", basePricePerKg: 6.00, regions: ["Europe", "Americas"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL"] },
  { name: "Blackberry", category: "Fruit", description: "Wild and cultivated cane berry, high in vitamins C and K.", growthCycle: "90-120 days", basePricePerKg: 5.00, regions: ["Europe", "Americas"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "SUBTROPICAL"] },
  { name: "Cherry", category: "Fruit", description: "Sweet and sour stone fruit, a high-value temperate orchard crop.", growthCycle: "120-150 days", basePricePerKg: 4.00, regions: ["Europe", "Americas", "Asia"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "MEDITERRANEAN"] },
  { name: "Plum", category: "Fruit", description: "Juicy stone fruit used fresh and dried as prunes for digestive health.", growthCycle: "120-150 days", basePricePerKg: 1.80, regions: ["Europe", "Americas", "Asia"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "MEDITERRANEAN"] },
  { name: "Peach", category: "Fruit", description: "Sweet, fuzzy stone fruit requiring winter chill, widely cultivated.", growthCycle: "120-150 days", basePricePerKg: 1.50, regions: ["Americas", "Europe", "Asia"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "MEDITERRANEAN", "SUBTROPICAL"] },
  { name: "Pear", category: "Fruit", description: "Mild sweet fruit, the second most important temperate tree fruit globally.", growthCycle: "120-160 days", basePricePerKg: 0.90, regions: ["Europe", "Asia", "Americas"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "SUBTROPICAL"] },
  { name: "Apricot", category: "Fruit", description: "Small golden stone fruit used fresh, dried, and in preserves.", growthCycle: "90-120 days", basePricePerKg: 1.60, regions: ["Mediterranean", "Middle East", "Americas", "Asia"], climateZones: ["MEDITERRANEAN", "CONTINENTAL", "ARID"] },
  { name: "Persimmon", category: "Fruit", description: "Sweet orange autumn fruit native to East Asia and North America.", growthCycle: "120-150 days", basePricePerKg: 2.00, regions: ["Asia", "Americas", "Mediterranean"], climateZones: ["SUBTROPICAL", "TEMPERATE_NORTH", "MEDITERRANEAN"] },
  { name: "Dragon Fruit", category: "Fruit", description: "Vibrant tropical cactus fruit with mild sweet flavor, Instagram-famous.", growthCycle: "30-50 days", basePricePerKg: 3.00, regions: ["Asia", "Americas"], climateZones: ["TROPICAL_WET", "SUBTROPICAL", "ARID"] },
  { name: "Tamarind", category: "Fruit", description: "Sour tropical pod fruit used in sauces, chutneys, beverages, and candy.", growthCycle: "365-540 days", basePricePerKg: 1.50, regions: ["Africa", "Asia", "Americas"], climateZones: ["TROPICAL_WET", "TROPICAL_MONSOON", "ARID"] },
  { name: "Breadfruit", category: "Fruit", description: "Starchy tropical fruit, a staple carbohydrate crop in Pacific Island diets.", growthCycle: "90-120 days", basePricePerKg: 0.40, regions: ["Pacific", "Asia", "Americas", "Africa"], climateZones: ["TROPICAL_WET"] },
  { name: "Soursop", category: "Fruit", description: "Tropical fruit with custard-like flesh, studied for medicinal properties.", growthCycle: "120-150 days", basePricePerKg: 2.50, regions: ["Americas", "Africa", "Asia"], climateZones: ["TROPICAL_WET", "SUBTROPICAL"] },
  { name: "Longan", category: "Fruit", description: "Small sweet tropical fruit similar to lychee, highly prized in Asia.", growthCycle: "90-120 days", basePricePerKg: 2.80, regions: ["Asia"], climateZones: ["SUBTROPICAL", "TROPICAL_MONSOON"] },
  { name: "Rambutan", category: "Fruit", description: "Hairy red tropical fruit with sweet white flesh, Southeast Asian delicacy.", growthCycle: "90-120 days", basePricePerKg: 2.50, regions: ["Asia"], climateZones: ["TROPICAL_WET"] },
  { name: "Elderberry", category: "Fruit", description: "Dark medicinal berry used for immune-boosting syrups, wines, and jams.", growthCycle: "90-120 days", basePricePerKg: 4.00, regions: ["Europe", "Americas"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL"] },
  { name: "Mulberry", category: "Fruit", description: "Sweet fruit from silk-producing trees, eaten fresh and dried globally.", growthCycle: "60-90 days", basePricePerKg: 2.00, regions: ["Asia", "Mediterranean", "Americas"], climateZones: ["TEMPERATE_NORTH", "SUBTROPICAL", "MEDITERRANEAN"] },
  { name: "Carambola", category: "Fruit", description: "Star-shaped tropical fruit with refreshing sweet-sour flavor.", growthCycle: "60-90 days", basePricePerKg: 1.80, regions: ["Asia", "Americas"], climateZones: ["TROPICAL_WET", "SUBTROPICAL"] },
  { name: "Feijoa", category: "Fruit", description: "South American pineapple-guava flavored fruit popular in New Zealand.", growthCycle: "150-180 days", basePricePerKg: 3.50, regions: ["Americas", "Oceania", "Asia"], climateZones: ["SUBTROPICAL", "TEMPERATE_SOUTH"] },

  // --- Additional Cash Crops ---
  { name: "Hemp", category: "Cash Crop", description: "Industrial cannabis plant, source of fiber, seed oil, and CBD extracts.", growthCycle: "90-120 days", basePricePerKg: 3.00, regions: ["Americas", "Europe", "Asia"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "SUBTROPICAL"] },
  { name: "Jute", category: "Cash Crop", description: "Natural bast fiber plant for burlap sacks, rope, and eco-packaging.", growthCycle: "90-120 days", basePricePerKg: 0.35, regions: ["Asia", "Africa"], climateZones: ["TROPICAL_MONSOON", "SUBTROPICAL"] },
  { name: "Sisal", category: "Cash Crop", description: "Agave plant producing strong natural fiber for ropes and composites.", growthCycle: "365-545 days", basePricePerKg: 0.65, regions: ["Africa", "Americas", "Asia"], climateZones: ["ARID", "TROPICAL_MONSOON", "SUBTROPICAL"] },
  { name: "Flax", category: "Cash Crop", description: "Dual-use crop yielding fine linen fiber and nutritious linseed oil.", growthCycle: "90-110 days", basePricePerKg: 0.45, regions: ["Europe", "Americas", "Asia"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "MEDITERRANEAN"] },
  { name: "Agave", category: "Cash Crop", description: "Succulent used for tequila, mezcal, fiber, and natural sweeteners.", growthCycle: "3650-5475 days", basePricePerKg: 0.80, regions: ["Americas"], climateZones: ["ARID", "SUBTROPICAL"] },
  { name: "Hops", category: "Cash Crop", description: "Climbing vine providing essential bitterness and aroma to beer globally.", growthCycle: "120-150 days", basePricePerKg: 7.00, regions: ["Europe", "Americas"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL"] },
  { name: "Moringa", category: "Cash Crop", description: "Miracle tree with highly nutritious leaves, seeds, pods, and root bark.", growthCycle: "90-180 days", basePricePerKg: 5.00, regions: ["Asia", "Africa", "Americas"], climateZones: ["TROPICAL_WET", "TROPICAL_MONSOON", "ARID"] },
  { name: "Stevia", category: "Cash Crop", description: "Natural zero-calorie sweetener, 200x sweeter than sugar by weight.", growthCycle: "120-150 days", basePricePerKg: 8.00, regions: ["Americas", "Asia"], climateZones: ["SUBTROPICAL", "TROPICAL_MONSOON"] },
  { name: "Pyrethrum", category: "Cash Crop", description: "Chrysanthemum-derived natural insecticide, major export from East Africa.", growthCycle: "120-180 days", basePricePerKg: 12.00, regions: ["Africa", "Asia"], climateZones: ["SUBTROPICAL", "TROPICAL_MONSOON"] },
  { name: "Kenaf", category: "Cash Crop", description: "Fast-growing tropical plant producing bast fiber for paper and composites.", growthCycle: "90-120 days", basePricePerKg: 0.40, regions: ["Asia", "Africa", "Americas"], climateZones: ["SUBTROPICAL", "TROPICAL_MONSOON", "ARID"] },

  // --- Additional Oilseeds & Nuts ---
  { name: "Flaxseed", category: "Oilseed", description: "Omega-3 rich seed used for oil, health supplements, and functional baking.", growthCycle: "90-110 days", basePricePerKg: 0.85, regions: ["Canada", "Europe", "Asia"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "ARID"] },
  { name: "Mustard Seed", category: "Oilseed", description: "Pungent seed pressed for cooking oil and ground into mustard condiment.", growthCycle: "85-110 days", basePricePerKg: 0.55, regions: ["Asia", "Europe", "Americas"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "ARID"] },
  { name: "Castor Bean", category: "Oilseed", description: "Tropical plant yielding castor oil for lubricants, cosmetics, and biodiesel.", growthCycle: "120-180 days", basePricePerKg: 0.45, regions: ["Asia", "Africa", "Americas"], climateZones: ["TROPICAL_MONSOON", "SUBTROPICAL", "ARID"] },
  { name: "Safflower", category: "Oilseed", description: "Drought-tolerant thistle-like crop for cooking oil and natural red-yellow dyes.", growthCycle: "100-120 days", basePricePerKg: 0.65, regions: ["Asia", "Americas", "Europe"], climateZones: ["ARID", "CONTINENTAL", "SUBTROPICAL"] },
  { name: "Niger Seed", category: "Oilseed", description: "Small black seed, key oilseed in Ethiopia and popular birdseed globally.", growthCycle: "90-120 days", basePricePerKg: 1.00, regions: ["Africa", "Asia"], climateZones: ["TROPICAL_MONSOON", "SUBTROPICAL"] },
  { name: "Almonds", category: "Nut", description: "Most consumed tree nut globally, rich in protein, healthy fats, and vitamin E.", growthCycle: "180-210 days", basePricePerKg: 7.50, regions: ["Mediterranean", "Americas", "Asia"], climateZones: ["MEDITERRANEAN", "ARID", "SUBTROPICAL"] },
  { name: "Walnuts", category: "Nut", description: "Brain-healthy nut rich in omega-3 fatty acids, used worldwide in cooking.", growthCycle: "150-180 days", basePricePerKg: 5.00, regions: ["Americas", "Europe", "Asia"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "MEDITERRANEAN"] },
  { name: "Pistachios", category: "Nut", description: "Open-shell green nut from arid regions, a premium global commodity.", growthCycle: "150-180 days", basePricePerKg: 12.00, regions: ["Middle East", "Americas", "Mediterranean"], climateZones: ["ARID", "MEDITERRANEAN", "CONTINENTAL"] },
  { name: "Macadamia", category: "Nut", description: "Rich buttery nut native to Australia, among the world's most expensive nuts.", growthCycle: "180-210 days", basePricePerKg: 15.00, regions: ["Oceania", "Americas", "Asia", "Africa"], climateZones: ["SUBTROPICAL", "TROPICAL_WET"] },
  { name: "Hazelnuts", category: "Nut", description: "Sweet round nut used in chocolate spreads, confectionery, and baking.", growthCycle: "120-150 days", basePricePerKg: 4.50, regions: ["Europe", "Americas", "Asia"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "MEDITERRANEAN"] },
  { name: "Chestnuts", category: "Nut", description: "Starchy sweet nut used in stuffings, desserts, and specialty flours.", growthCycle: "120-150 days", basePricePerKg: 3.00, regions: ["Europe", "Asia", "Americas"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "MEDITERRANEAN"] },
  { name: "Pine Nuts", category: "Nut", description: "Seeds from pine cones, key ingredient in pesto and Middle Eastern cuisine.", growthCycle: "365-1095 days", basePricePerKg: 25.00, regions: ["Mediterranean", "Middle East", "Americas", "Asia"], climateZones: ["MEDITERRANEAN", "CONTINENTAL", "ARID"] },
  { name: "Brazil Nuts", category: "Nut", description: "Huge rainforest nuts, world's richest selenium source, wild-harvested in Amazon.", growthCycle: "365-730 days", basePricePerKg: 8.00, regions: ["South America"], climateZones: ["TROPICAL_WET"] },
  { name: "Pecans", category: "Nut", description: "Buttery American tree nut, centerpiece of Southern pies and confectionery.", growthCycle: "180-210 days", basePricePerKg: 7.00, regions: ["Americas"], climateZones: ["SUBTROPICAL", "TEMPERATE_NORTH"] },

  // --- Additional Spices ---
  { name: "Cardamom", category: "Spice", description: "Queen of spices, fragrant pods essential in South Asian and Scandinavian cuisine.", growthCycle: "270-365 days", basePricePerKg: 30.00, regions: ["Asia", "Middle East", "Americas"], climateZones: ["TROPICAL_WET", "SUBTROPICAL"] },
  { name: "Cinnamon", category: "Spice", description: "Aromatic bark spice from the Cinnamomum tree, the world's most traded sweet spice.", growthCycle: "730-1095 days", basePricePerKg: 8.00, regions: ["Asia", "Americas"], climateZones: ["TROPICAL_WET", "SUBTROPICAL"] },
  { name: "Cloves", category: "Spice", description: "Intensely pungent dried flower buds, Indonesia's most important export spice.", growthCycle: "365-540 days", basePricePerKg: 12.00, regions: ["Asia", "Americas"], climateZones: ["TROPICAL_WET"] },
  { name: "Nutmeg", category: "Spice", description: "Warm tropical spice from Banda Islands, essential in baking and festive drinks.", growthCycle: "180-270 days", basePricePerKg: 10.00, regions: ["Asia", "Americas", "Africa"], climateZones: ["TROPICAL_WET"] },
  { name: "Star Anise", category: "Spice", description: "Star-shaped spice with licorice flavor, key ingredient in Chinese five spice.", growthCycle: "180-240 days", basePricePerKg: 9.00, regions: ["Asia"], climateZones: ["TROPICAL_WET", "SUBTROPICAL"] },
  { name: "Cumin", category: "Spice", description: "Earthy aromatic seed, foundational in Middle Eastern, Indian, and Mexican cooking.", growthCycle: "90-120 days", basePricePerKg: 3.00, regions: ["Middle East", "Asia", "Mediterranean", "Americas"], climateZones: ["ARID", "MEDITERRANEAN", "TROPICAL_MONSOON"] },
  { name: "Coriander Seed", category: "Spice", description: "Aromatic dried seeds of the cilantro plant, used whole or ground globally.", growthCycle: "60-90 days", basePricePerKg: 2.50, regions: ["Global"], climateZones: ["TROPICAL_MONSOON", "MEDITERRANEAN", "TEMPERATE_NORTH", "ARID"] },
  { name: "Fenugreek", category: "Spice", description: "Bitter aromatic seed important in South Asian, Ethiopian, and Middle Eastern cuisine.", growthCycle: "90-120 days", basePricePerKg: 2.00, regions: ["Asia", "Middle East", "Africa"], climateZones: ["ARID", "TROPICAL_MONSOON", "MEDITERRANEAN"] },
  { name: "Allspice", category: "Spice", description: "Dried berry tasting like a blend of cloves, cinnamon, and nutmeg.", growthCycle: "180-270 days", basePricePerKg: 8.00, regions: ["Americas", "Asia"], climateZones: ["TROPICAL_WET", "SUBTROPICAL"] },
  { name: "Caraway", category: "Spice", description: "Aromatic seed used in rye bread, sauerkraut, and Central European cooking.", growthCycle: "180-240 days", basePricePerKg: 4.50, regions: ["Europe", "Middle East"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "MEDITERRANEAN"] },
  { name: "Paprika", category: "Spice", description: "Ground sweet red pepper spice, essential in Hungarian goulash and Spanish cuisine.", growthCycle: "70-90 days", basePricePerKg: 5.00, regions: ["Europe", "Americas", "Asia"], climateZones: ["MEDITERRANEAN", "SUBTROPICAL", "CONTINENTAL"] },
  { name: "Mace", category: "Spice", description: "Delicate outer lace of the nutmeg seed, a warm aromatic baking spice.", growthCycle: "180-270 days", basePricePerKg: 18.00, regions: ["Asia", "Americas"], climateZones: ["TROPICAL_WET"] },
  { name: "Bay Leaf", category: "Spice", description: "Aromatic laurel leaf used in slow-cooked dishes and stocks globally.", growthCycle: "730-1095 days", basePricePerKg: 6.00, regions: ["Mediterranean", "Americas", "Asia"], climateZones: ["MEDITERRANEAN", "SUBTROPICAL", "TEMPERATE_NORTH"] },
  { name: "Sumac", category: "Spice", description: "Tangy reddish-purple spice from dried sumac berries, a Middle Eastern staple.", growthCycle: "180-240 days", basePricePerKg: 7.00, regions: ["Middle East", "Mediterranean"], climateZones: ["MEDITERRANEAN", "ARID"] },
  { name: "Annatto", category: "Spice", description: "Natural red-orange colorant from achiote seeds, used in Latin American cuisine.", growthCycle: "120-150 days", basePricePerKg: 5.00, regions: ["Americas", "Asia", "Africa"], climateZones: ["TROPICAL_WET", "SUBTROPICAL"] },

  // --- Herbs ---
  { name: "Basil", category: "Herb", description: "Cornerstone aromatic herb of Italian pesto and Southeast Asian cuisines.", growthCycle: "60-90 days", basePricePerKg: 8.00, regions: ["Global"], climateZones: ["MEDITERRANEAN", "SUBTROPICAL", "TROPICAL_MONSOON", "TEMPERATE_NORTH"] },
  { name: "Mint", category: "Herb", description: "Refreshing aromatic herb used in beverages, desserts, and Middle Eastern food.", growthCycle: "60-90 days", basePricePerKg: 5.00, regions: ["Global"], climateZones: ["TEMPERATE_NORTH", "MEDITERRANEAN", "SUBTROPICAL"] },
  { name: "Oregano", category: "Herb", description: "Essential Mediterranean herb for pizza, pasta, and grilled meats.", growthCycle: "60-90 days", basePricePerKg: 7.00, regions: ["Mediterranean", "Americas", "Asia"], climateZones: ["MEDITERRANEAN", "TEMPERATE_NORTH", "SUBTROPICAL"] },
  { name: "Thyme", category: "Herb", description: "Woody aromatic herb used in European cooking and traditional medicine.", growthCycle: "60-90 days", basePricePerKg: 6.00, regions: ["Mediterranean", "Americas", "Europe"], climateZones: ["MEDITERRANEAN", "TEMPERATE_NORTH"] },
  { name: "Rosemary", category: "Herb", description: "Fragrant evergreen herb essential in Mediterranean and European cuisine.", growthCycle: "60-90 days", basePricePerKg: 7.00, regions: ["Mediterranean", "Americas", "Europe"], climateZones: ["MEDITERRANEAN", "SUBTROPICAL"] },
  { name: "Parsley", category: "Herb", description: "Versatile garnish and flavoring herb, one of the most widely used globally.", growthCycle: "70-90 days", basePricePerKg: 4.00, regions: ["Global"], climateZones: ["TEMPERATE_NORTH", "MEDITERRANEAN", "SUBTROPICAL"] },
  { name: "Cilantro", category: "Herb", description: "Bright pungent herb essential in Asian, Latin American, and Middle Eastern cuisine.", growthCycle: "45-70 days", basePricePerKg: 5.00, regions: ["Global"], climateZones: ["TROPICAL_MONSOON", "SUBTROPICAL", "MEDITERRANEAN", "TEMPERATE_NORTH"] },
  { name: "Dill", category: "Herb", description: "Feathery herb used in pickles, seafood, and Eastern European cuisine.", growthCycle: "60-90 days", basePricePerKg: 4.00, regions: ["Europe", "Americas", "Asia"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "MEDITERRANEAN"] },
  { name: "Lemongrass", category: "Herb", description: "Tropical citrus-scented grass, key flavoring in Thai and Vietnamese cuisine.", growthCycle: "75-90 days", basePricePerKg: 2.50, regions: ["Asia", "Africa", "Americas"], climateZones: ["TROPICAL_WET", "TROPICAL_MONSOON", "SUBTROPICAL"] },
  { name: "Lavender", category: "Herb", description: "Aromatic purple flower used in culinary, cosmetic, and therapeutic applications.", growthCycle: "90-180 days", basePricePerKg: 15.00, regions: ["Mediterranean", "Europe", "Americas"], climateZones: ["MEDITERRANEAN", "TEMPERATE_NORTH", "ARID"] },
  { name: "Chamomile", category: "Herb", description: "Daisy-like flower with calming properties, one of the most popular herbal teas.", growthCycle: "60-90 days", basePricePerKg: 20.00, regions: ["Europe", "Americas", "Asia"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "MEDITERRANEAN"] },
  { name: "Peppermint", category: "Herb", description: "Intensely aromatic mint hybrid used in tea, candy, toothpaste, and medicine.", growthCycle: "60-90 days", basePricePerKg: 8.00, regions: ["Europe", "Americas", "Asia"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL", "SUBTROPICAL"] },

  // --- Fiber Crops ---
  { name: "Ramie", category: "Fiber Crop", description: "East Asian bast fiber plant producing exceptionally strong, lustrous textiles.", growthCycle: "90-120 days", basePricePerKg: 0.75, regions: ["Asia"], climateZones: ["SUBTROPICAL", "TROPICAL_MONSOON"] },
  { name: "Abaca", category: "Fiber Crop", description: "Philippine banana relative, source of Manila hemp rope fiber for marine use.", growthCycle: "365-540 days", basePricePerKg: 1.20, regions: ["Asia", "Americas"], climateZones: ["TROPICAL_WET"] },
  { name: "Kapok", category: "Fiber Crop", description: "Tropical tree producing silky, waterproof fiber for pillows and insulation.", growthCycle: "1825-2190 days", basePricePerKg: 0.80, regions: ["Asia", "Africa", "Americas"], climateZones: ["TROPICAL_WET", "TROPICAL_MONSOON"] },
  { name: "Coir", category: "Fiber Crop", description: "Coconut husk fiber used for mats, rope, and growing media in horticulture.", growthCycle: "365-1095 days", basePricePerKg: 0.25, regions: ["Asia", "Africa"], climateZones: ["TROPICAL_WET", "SUBTROPICAL"] },

  // --- Medicinal ---
  { name: "Aloe Vera", category: "Medicinal", description: "Succulent with healing gel, major crop for cosmetics and health industry.", growthCycle: "180-365 days", basePricePerKg: 3.00, regions: ["Global"], climateZones: ["ARID", "SUBTROPICAL", "MEDITERRANEAN"] },
  { name: "Ginseng", category: "Medicinal", description: "Prized adaptogenic root, most valuable medicinal crop in traditional Asian medicine.", growthCycle: "1825-2190 days", basePricePerKg: 60.00, regions: ["Asia", "Americas"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL"] },
  { name: "Neem", category: "Medicinal", description: "Multi-purpose tropical tree used in medicine, natural pesticides, and cosmetics.", growthCycle: "730-1095 days", basePricePerKg: 2.00, regions: ["Asia", "Africa", "Americas"], climateZones: ["TROPICAL_MONSOON", "ARID", "SUBTROPICAL"] },
  { name: "Echinacea", category: "Medicinal", description: "Purple coneflower with immune-boosting properties, top herbal supplement globally.", growthCycle: "90-120 days", basePricePerKg: 15.00, regions: ["Americas", "Europe"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL"] },
  { name: "Ashwagandha", category: "Medicinal", description: "Ayurvedic adaptogenic root, fastest-growing supplement in global wellness market.", growthCycle: "150-180 days", basePricePerKg: 8.00, regions: ["Asia", "Africa", "Americas"], climateZones: ["ARID", "TROPICAL_MONSOON"] },
  { name: "Kratom", category: "Medicinal", description: "Southeast Asian tree leaf used for pain management and energy stimulation.", growthCycle: "365-730 days", basePricePerKg: 20.00, regions: ["Asia"], climateZones: ["TROPICAL_WET"] },
  { name: "Valerian", category: "Medicinal", description: "Perennial herb with sedative root extract, widely used in sleep supplements.", growthCycle: "120-150 days", basePricePerKg: 10.00, regions: ["Europe", "Americas", "Asia"], climateZones: ["TEMPERATE_NORTH", "CONTINENTAL"] },
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
// AI — OPEN-SOURCE MODEL ROUTING VIA GROQ
// DeepSeek-R1 for reasoning · Qwen-2.5 for knowledge · LLaMA-3 for conversation
// ================================================================
const GROQ_MODELS = {
  "DeepSeek-R1": "deepseek-r1-distill-llama-70b",
  "Qwen-2.5": "llama-3.1-8b-instant",
  "LLaMA-3": "llama-3.3-70b-versatile",
} as const;

function getGroqClient(): Groq | null {
  if (!process.env.GROQ_API_KEY) return null;
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

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

  // --- MARKET PRICES (all 200+ crops, live currency conversion) ---
  app.get("/api/market", async (req, res) => {
    const targetCurrency = (req.query.currency as string) || "USD";
    const categoryFilter = req.query.category as string;
    const rates = await getCurrencyRates();
    const rate = rates[targetCurrency] || 1;

    let crops = CROP_DATABASE;
    if (categoryFilter && categoryFilter !== "All") {
      crops = crops.filter(c => c.category === categoryFilter);
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

  // --- AI CHAT (Open-source: DeepSeek-R1 · Qwen-2.5 · LLaMA-3 via Groq) ---
  app.post("/api/ai/chat", async (req, res) => {
    const { message, history = [], userPrefs = {} } = req.body;
    if (!message?.trim()) return res.status(400).json({ error: "Message is required" });

    const groq = getGroqClient();

    if (!groq) {
      return res.json({
        content: `Hello! I'd be happy to assist with your farming question. To enable full AI-powered responses using open-source models (DeepSeek-R1, Qwen-2.5, LLaMA-3), please configure your GROQ_API_KEY. Get a free key at console.groq.com`,
        model: "LLaMA-3",
      });
    }

    try {
      const persona = routeModel(message);
      const systemInstruction = getSystemPrompt(persona, userPrefs);

      const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
        { role: "system", content: systemInstruction },
        ...history.map((m: any) => ({
          role: (m.role === "ai" ? "assistant" : "user") as "user" | "assistant",
          content: m.content,
        })),
        { role: "user", content: message },
      ];

      const completion = await groq.chat.completions.create({
        model: GROQ_MODELS[persona],
        messages: chatMessages,
        max_tokens: 1024,
        temperature: persona === "DeepSeek-R1" ? 0.3 : 0.7,
      });

      const content = completion.choices[0]?.message?.content
        || "I couldn't generate a response. Please try again.";
      res.json({ content, model: persona });
    } catch (err: any) {
      console.error("[AI Chat]", err?.message || err);
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
