import express from "express";
import axios from "axios";
import { getApiKey, apiKeyManager } from "../utils/getApiKey.js";

const BASE_URL = "https://api.spoonacular.com";

console.log("=== CONTROLLER DEBUG ===");
console.log("Controller loaded, will get API key dynamically");
console.log("=== CONTROLLER DEBUG END ===");

export const temp = async (req, res) => {
  const API_KEY = getApiKey();
  console.log(`API Key in temp controller: ${API_KEY}`);
  res.send(
    `Api key from the temp from the controller: ${API_KEY}`
  );
};

// Get API Key Status - for monitoring which keys are working
export const getApiKeyStatus = async (req, res) => {
  try {
    const status = apiKeyManager.getStatus();
    res.status(200).json({
      success: true,
      data: status,
      message: "API key status retrieved successfully"
    });
  } catch (error) {
    console.log(`Error in getApiKeyStatus: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Test endpoint to verify API key and basic connectivity
export const testApi = async (req, res) => {
  try {
    const testUrl = `${BASE_URL}/recipes/complexSearch?query=pasta&number=1`;
    console.log("Test URL:", testUrl);

    const response = await apiKeyManager.makeRequest(testUrl);
    console.log("Test API Response Status:", response.status);
    console.log("Test API Response Data:", response.data);

    res.status(200).json({
      success: true,
      message: "API test successful",
      data: response.data,
      apiKeyStatus: apiKeyManager.getStatus(),
      url: testUrl,
    });
  } catch (error) {
    console.log("Test API Error:", error.message);
    console.log("Error response:", error.response?.data);
    res.status(500).json({
      success: false,
      message: "API test failed",
      error: error.message,
      details: error.response?.data,
      apiKeyStatus: apiKeyManager.getStatus(),
    });
  }
};

// Recipe Search with filters
export const findRecipes = async (req, res) => {
  try {
    console.log("=== BACKEND DEBUG - findRecipes START ===");
    console.log("Request query params:", req.query);

    const {
      query,
      cuisine,
      diet,
      intolerances,
      type,
      maxReadyTime,
      minCalories,
      maxCalories,
      offset = 0,
      number = 12,
    } = req.query;

    // Build URL without API key (manager will add it)
    let queryParams = [];
    queryParams.push(`offset=${offset}`);
    queryParams.push(`number=${number}`);

    if (query) queryParams.push(`query=${encodeURIComponent(query)}`);
    if (cuisine) queryParams.push(`cuisine=${encodeURIComponent(cuisine)}`);
    if (diet) queryParams.push(`diet=${encodeURIComponent(diet)}`);
    if (intolerances)
      queryParams.push(`intolerances=${encodeURIComponent(intolerances)}`);
    if (type) queryParams.push(`type=${encodeURIComponent(type)}`);
    if (maxReadyTime) queryParams.push(`maxReadyTime=${maxReadyTime}`);
    if (minCalories) queryParams.push(`minCalories=${minCalories}`);
    if (maxCalories) queryParams.push(`maxCalories=${maxCalories}`);

    const fullUrl = `${BASE_URL}/recipes/complexSearch?${queryParams.join("&")}`;
    console.log("API URL (before key):", fullUrl);

    const response = await apiKeyManager.makeRequest(fullUrl);
    console.log("API Response status:", response.status);
    console.log("API Response data keys:", Object.keys(response.data || {}));
    console.log("=== BACKEND DEBUG - findRecipes SUCCESS ===");

    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.log("=== BACKEND DEBUG - findRecipes ERROR ===");
    console.log(`Error in findRecipes: ${error}`);
    console.log("Error status:", error.response?.status);
    console.log("Error data:", error.response?.data);
    console.log("Error message:", error.message);
    console.log("=== BACKEND DEBUG - findRecipes ERROR END ===");

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
      apiKeyStatus: apiKeyManager.getStatus(),
    });
  }
};

// Get Recipe Details
export const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    const response = await apiKeyManager.makeRequest(
      `${BASE_URL}/recipes/${id}/information`
    );
    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.log(`Error in getRecipeById: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
      apiKeyStatus: apiKeyManager.getStatus(),
    });
  }
};

// Random Recipes
export const getRandomRecipes = async (req, res) => {
  try {
    const { number = 10, tags } = req.query;
    let url = `${BASE_URL}/recipes/random?number=${number}`;
    if (tags) url += `&tags=${encodeURIComponent(tags)}`;

    const response = await apiKeyManager.makeRequest(url);
    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.log(`Error in getRandomRecipes: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
      apiKeyStatus: apiKeyManager.getStatus(),
    });
  }
};

// Find Recipes by Ingredients
export const findRecipesByIngredients = async (req, res) => {
  try {
    const { ingredients, number = 10, ranking = 1 } = req.query;
    const url = `${BASE_URL}/recipes/findByIngredients?ingredients=${encodeURIComponent(ingredients)}&number=${number}&ranking=${ranking}`;
    
    const response = await apiKeyManager.makeRequest(url);
    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.log(`Error in findRecipesByIngredients: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
      apiKeyStatus: apiKeyManager.getStatus(),
    });
  }
};

// Get Similar Recipes
export const getSimilarRecipes = async (req, res) => {
  try {
    const { id } = req.params;
    const { number = 10 } = req.query;
    const url = `${BASE_URL}/recipes/${id}/similar?number=${number}`;
    
    const response = await apiKeyManager.makeRequest(url);
    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.log(`Error in getSimilarRecipes: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
      apiKeyStatus: apiKeyManager.getStatus(),
    });
  }
};

// Get Recipe Nutrition
export const getRecipeNutrition = async (req, res) => {
  try {
    const { id } = req.params;
    const url = `${BASE_URL}/recipes/${id}/nutritionWidget.json`;
    
    const response = await apiKeyManager.makeRequest(url);
    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.log(`Error in getRecipeNutrition: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
      apiKeyStatus: apiKeyManager.getStatus(),
    });
  }
};

// Get Recipe Price Breakdown
export const getRecipePriceBreakdown = async (req, res) => {
  try {
    const { id } = req.params;
    const url = `${BASE_URL}/recipes/${id}/priceBreakdownWidget.json`;
    
    const response = await apiKeyManager.makeRequest(url);
    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.log(`Error in getRecipePriceBreakdown: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
      apiKeyStatus: apiKeyManager.getStatus(),
    });
  }
};

// Get Recipe Instructions
export const getRecipeInstructions = async (req, res) => {
  try {
    const { id } = req.params;
    const url = `${BASE_URL}/recipes/${id}/analyzedInstructions`;
    
    const response = await apiKeyManager.makeRequest(url);
    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.log(`Error in getRecipeInstructions: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
      apiKeyStatus: apiKeyManager.getStatus(),
    });
  }
};

// Generate Meal Plan
export const generateMealPlan = async (req, res) => {
  try {
    const { timeFrame = "day", targetCalories, diet, exclude } = req.query;
    let url = `${BASE_URL}/mealplanner/generate?timeFrame=${timeFrame}`;
    
    if (targetCalories) url += `&targetCalories=${targetCalories}`;
    if (diet) url += `&diet=${encodeURIComponent(diet)}`;
    if (exclude) url += `&exclude=${encodeURIComponent(exclude)}`;

    const response = await apiKeyManager.makeRequest(url);
    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.log(`Error in generateMealPlan: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
      apiKeyStatus: apiKeyManager.getStatus(),
    });
  }
};

// Wine Pairing
export const getWinePairing = async (req, res) => {
  try {
    const { food, maxPrice } = req.query;
    let url = `${BASE_URL}/food/wine/pairing?food=${encodeURIComponent(food)}`;
    
    if (maxPrice) url += `&maxPrice=${maxPrice}`;

    const response = await apiKeyManager.makeRequest(url);
    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.log(`Error in getWinePairing: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
      apiKeyStatus: apiKeyManager.getStatus(),
    });
  }
};

// Search Food Videos
export const searchFoodVideos = async (req, res) => {
  try {
    const { query, type = "main course", number = 10 } = req.query;
    let url = `${BASE_URL}/food/videos/search?query=${encodeURIComponent(query)}&type=${encodeURIComponent(type)}&number=${number}`;

    const response = await apiKeyManager.makeRequest(url);
    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.log(`Error in searchFoodVideos: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
      apiKeyStatus: apiKeyManager.getStatus(),
    });
  }
};

// Analyze Recipe Nutrition
export const analyzeRecipeNutrition = async (req, res) => {
  try {
    const { title, servings, ingredients } = req.body;
    
    // For POST requests, we'll handle API key rotation manually for now
    let lastError = null;
    let attempts = 0;
    const maxAttempts = 3; // Try a few keys
    
    while (attempts < maxAttempts) {
      try {
        const API_KEY = apiKeyManager.getCurrentKey();
        const response = await axios.post(
          `${BASE_URL}/recipes/analyze?apiKey=${API_KEY}`,
          { title, servings, ingredients }
        );
        
        res.status(200).json({
          success: true,
          data: response.data,
        });
        return;
        
      } catch (error) {
        lastError = error;
        
        // If it's a rate limit error, try next key
        if (error.response?.status === 402 || error.response?.status === 429) {
          console.log(`POST request failed with key ${apiKeyManager.currentKeyIndex}, rotating...`);
          apiKeyManager.handleApiError(error);
          apiKeyManager.rotateToNextKey();
          attempts++;
          continue;
        }
        
        // For other errors, break immediately
        break;
      }
    }
    
    // If we get here, all attempts failed
    throw lastError;
    
  } catch (error) {
    console.log(`Error in analyzeRecipeNutrition: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
      apiKeyStatus: apiKeyManager.getStatus(),
    });
  }
};
