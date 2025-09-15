import express from "express";
import axios from "axios";
import { getApiKey } from "../utils/getApiKey.js";

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

// Test endpoint to verify API key and basic connectivity
export const testApi = async (req, res) => {
  try {
    const API_KEY = getApiKey();
    console.log("=== TEST API ENDPOINT ===");
    console.log("API_KEY:", API_KEY);
    console.log("API_KEY exists:", !!API_KEY);

    const testUrl = `${BASE_URL}/recipes/complexSearch?query=pasta&apiKey=${API_KEY}&number=1`;
    console.log("Test URL:", testUrl);

    const response = await axios.get(testUrl);
    console.log("Test API Response Status:", response.status);
    console.log("Test API Response Data:", response.data);

    res.status(200).json({
      success: true,
      message: "API test successful",
      data: response.data,
      apiKey: API_KEY ? "Present" : "Missing",
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
    });
  }
};

// Recipe Search with filters
export const findRecipes = async (req, res) => {
  try {
    const API_KEY = getApiKey();
    console.log("=== BACKEND DEBUG - findRecipes START ===");
    console.log("Request query params:", req.query);
    console.log("API_KEY from getApiKey():", API_KEY);
    console.log("API_KEY from env:", process.env.SPOONACULAR_API_KEY);
    console.log("API_KEY exists:", !!API_KEY);
    console.log(
      "API_KEY length:",
      API_KEY ? API_KEY.length : "undefined"
    );

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

    // Build URL manually instead of using URLSearchParams
    let queryParams = [];
    queryParams.push(`apiKey=${API_KEY}`);
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

    const fullUrl = `${BASE_URL}/recipes/complexSearch?${queryParams.join(
      "&"
    )}`;
    console.log("Full API URL:", fullUrl);
    console.log(
      "API Key in URL:",
      fullUrl.includes("apiKey=") ? "Present" : "Missing"
    );
    console.log("Query params array:", queryParams);

    const response = await axios.get(fullUrl);
    console.log(`Final URL:${fullUrl}`);
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
    });
  }
};

// Get Recipe Details
export const getRecipeById = async (req, res) => {
  try {
    const { id } = req.params;
    const API_KEY = getApiKey();
    const response = await axios.get(
      `${BASE_URL}/recipes/${id}/information?apiKey=${API_KEY}`
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
    });
  }
};

// Random Recipes
export const getRandomRecipes = async (req, res) => {
  try {
    const { number = 10, tags } = req.query;
    const API_KEY = getApiKey();
    const params = new URLSearchParams({
      apiKey: API_KEY,
      number,
    });
    if (tags) params.append("tags", tags);

    const response = await axios.get(`${BASE_URL}/recipes/random?${params}`);
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
    });
  }
};

// Find Recipes by Ingredients
export const findRecipesByIngredients = async (req, res) => {
  try {
    const { ingredients, number = 10, ranking = 1 } = req.query;
    const API_KEY = getApiKey();
    const response = await axios.get(
      `${BASE_URL}/recipes/findByIngredients?ingredients=${ingredients}&number=${number}&ranking=${ranking}&apiKey=${API_KEY}`
    );
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
    });
  }
};

// Get Similar Recipes
export const getSimilarRecipes = async (req, res) => {
  try {
    const { id } = req.params;
    const { number = 10 } = req.query;
    const API_KEY = getApiKey();
    const response = await axios.get(
      `${BASE_URL}/recipes/${id}/similar?number=${number}&apiKey=${API_KEY}`
    );
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
    });
  }
};

// Get Recipe Nutrition
export const getRecipeNutrition = async (req, res) => {
  try {
    const { id } = req.params;
    const API_KEY = getApiKey();
    const response = await axios.get(
      `${BASE_URL}/recipes/${id}/nutritionWidget.json?apiKey=${API_KEY}`
    );
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
    });
  }
};

// Get Recipe Price Breakdown
export const getRecipePriceBreakdown = async (req, res) => {
  try {
    const { id } = req.params;
    const API_KEY = getApiKey();
    const response = await axios.get(
      `${BASE_URL}/recipes/${id}/priceBreakdownWidget.json?apiKey=${API_KEY}`
    );
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
    });
  }
};

// Get Recipe Instructions
export const getRecipeInstructions = async (req, res) => {
  try {
    const { id } = req.params;
    const API_KEY = getApiKey();
    const response = await axios.get(
      `${BASE_URL}/recipes/${id}/analyzedInstructions?apiKey=${API_KEY}`
    );
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
    });
  }
};

// Generate Meal Plan
export const generateMealPlan = async (req, res) => {
  try {
    const { timeFrame = "day", targetCalories, diet, exclude } = req.query;
    const API_KEY = getApiKey();

    const params = new URLSearchParams({
      apiKey: API_KEY,
      timeFrame,
    });

    if (targetCalories) params.append("targetCalories", targetCalories);
    if (diet) params.append("diet", diet);
    if (exclude) params.append("exclude", exclude);

    const response = await axios.get(
      `${BASE_URL}/mealplanner/generate?${params}`
    );
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
    });
  }
};

// Wine Pairing
export const getWinePairing = async (req, res) => {
  try {
    const { food, maxPrice } = req.query;
    const API_KEY = getApiKey();
    const params = new URLSearchParams({
      apiKey: API_KEY,
      food,
    });

    if (maxPrice) params.append("maxPrice", maxPrice);

    const response = await axios.get(`${BASE_URL}/food/wine/pairing?${params}`);
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
    });
  }
};

// Analyze Recipe Nutrition
export const analyzeRecipeNutrition = async (req, res) => {
  try {
    const { title, servings, ingredients } = req.body;
    const API_KEY = getApiKey();
    const response = await axios.post(
      `${BASE_URL}/recipes/analyze?apiKey=${API_KEY}`,
      { title, servings, ingredients }
    );
    res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.log(`Error in analyzeRecipeNutrition: ${error}`);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

// Search Food Videos
export const searchFoodVideos = async (req, res) => {
  try {
    const { query, type = "main course", number = 10 } = req.query;
    const API_KEY = getApiKey();
    const params = new URLSearchParams({
      apiKey: API_KEY,
      query,
      type,
      number,
    });

    const response = await axios.get(
      `${BASE_URL}/food/videos/search?${params}`
    );
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
    });
  }
};
