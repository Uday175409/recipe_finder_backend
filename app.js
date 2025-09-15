import express from "express";
import RecipeRouter from "./routes/recipe.route.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
// Environment variables are loaded in server.js before importing this file
app.use(cors());
app.use(cookieParser());
app.use(express.json());

app.use("/api/recipes", RecipeRouter);
app.use("/", (req, res) => {
  res.send(
    `Welcome to the Recipe Finder API with API key: ${
      process.env.SPOONACULAR_API_KEY
        ? process.env.SPOONACULAR_API_KEY
        : "undefined"
    }`
  );
});

export default app;
