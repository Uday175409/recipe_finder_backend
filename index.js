// Vercel serverless function entry point
// This file exports the Express app for Vercel deployment

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables for Vercel deployment
// Vercel will also provide environment variables through its platform
dotenv.config({ path: path.join(__dirname, '.env') });

// Import the Express app after environment is configured
import app from './app.js';

// Export the Express app for Vercel
export default app;