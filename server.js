import dotenv from 'dotenv';    
import path from 'path';
import { fileURLToPath } from 'url';

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('=== DOTENV DEBUG ===');
console.log('Current working directory:', process.cwd());
console.log('__dirname:', __dirname);
console.log('Looking for .env at:', path.join(__dirname, '.env'));

// Load environment variables FIRST before importing anything else
const result = dotenv.config({ path: path.join(__dirname, '.env') });
console.log('dotenv.config result:', result);

console.log('=== SERVER STARTUP DEBUG ===');
console.log('Environment variables loaded');
console.log('All env keys:', Object.keys(process.env).filter(key => key.startsWith('SPOON') || key === 'PORT'));
console.log('PORT:', process.env.PORT);
console.log('SPOONACULAR_API_KEY exists:', !!process.env.SPOONACULAR_API_KEY);
console.log('SPOONACULAR_API_KEY length:', process.env.SPOONACULAR_API_KEY ? process.env.SPOONACULAR_API_KEY.length : 'undefined');
console.log('First 10 chars of API key:', process.env.SPOONACULAR_API_KEY ? process.env.SPOONACULAR_API_KEY : 'undefined');
console.log('=== SERVER STARTUP DEBUG END ===');

import app from './app.js';

app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});