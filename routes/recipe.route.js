import express from "express";
import {
  testApi,
  findRecipes,
  getRecipeById,
  getRandomRecipes,
  findRecipesByIngredients,
  getSimilarRecipes,
  getRecipeNutrition,
  getRecipePriceBreakdown,
  getRecipeInstructions,
  generateMealPlan,
  getWinePairing,
  analyzeRecipeNutrition,
  searchFoodVideos,
  temp,
  getApiKeyStatus
} from "../controller/recipe.controller.js";

const router = express.Router();
router.get("/temp", temp);
// Test endpoint
router.get("/test", testApi);

// API Key Status endpoint
router.get("/api-status", getApiKeyStatus);

// Recipe Search & Discovery
router.get("/search", findRecipes);
router.get("/random", getRandomRecipes);
router.get("/find-by-ingredients", findRecipesByIngredients);
router.get("/videos", searchFoodVideos);

// Recipe Details
router.get("/:id", getRecipeById);
router.get("/:id/similar", getSimilarRecipes);
router.get("/:id/nutrition", getRecipeNutrition);
router.get("/:id/price-breakdown", getRecipePriceBreakdown);
router.get("/:id/instructions", getRecipeInstructions);

// Meal Planning
router.get("/meal-plan/generate", generateMealPlan);

// Wine & Food Pairing
router.get("/wine/pairing", getWinePairing);

// Nutrition Analysis
router.post("/analyze-nutrition", analyzeRecipeNutrition);

// Legacy routes (keeping for backward compatibility)
router.get("/find", findRecipes);
router.get("/get/:id", getRecipeById);
// router.get("/temp", (req, res) => {
//   console.log(`API Key in temp route: ${process.env.SPOONACULAR_API_KEY}`);
//   res.send(`temp api with api key:${process.env.SPOONACULAR_API_KEY}`);
// });
// router.get("/temp", (req, res) => {
//   console.log(`API Key in temp route: ${process.env.SPOONACULAR_API_KEY}`);
//   res.send(`temp api with api key:${process.env.SPOONACULAR_API_KEY}`);
// });

export default router;
