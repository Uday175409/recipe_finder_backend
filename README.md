# Recipe Finder - Backend

A robust Node.js/Express backend API for the Recipe Finder application with intelligent API key rotation and comprehensive recipe management.

## 🚀 Features

### Core Functionality
- **Recipe Search & Discovery** - Advanced filtering with cuisine, diet, ingredients
- **Recipe Details** - Complete nutrition, pricing, and instruction data
- **Meal Planning** - Generate customized meal plans
- **Wine Pairing** - Smart food and wine recommendations
- **Ingredient-based Search** - Find recipes by available ingredients

### Advanced Features
- **🔄 Intelligent API Key Rotation** - Automatic failover when rate limits are hit
- **📊 Real-time Monitoring** - API key health tracking and status reporting
- **🛡️ Error Handling** - Graceful degradation and comprehensive error responses
- **💰 Currency Support** - Multi-currency pricing with live conversion rates

## 📁 Project Structure

```
backend/
├── controller/
│   └── recipe.controller.js    # Main API logic and route handlers
├── routes/
│   └── recipe.route.js         # API route definitions
├── utils/
│   ├── apiKeyManager.js        # Smart API key rotation system
│   └── getApiKey.js           # API key utilities
├── models/                     # Database models (future expansion)
├── .env                       # Environment variables (not committed)
├── .env.example              # Environment template
├── package.json              # Dependencies and scripts
└── server.js                 # Main server entry point
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- Spoonacular API key(s)

### Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   # or
   node server.js
   ```

## 🔑 Environment Configuration

### Required Variables
```env
# Primary API key
SPOONACULAR_API_KEY=your_primary_key_here

# Additional keys for rotation (recommended)
SPOONACULAR_API_KEY2=your_backup_key_2
SPOONACULAR_API_KEY3=your_backup_key_3
SPOONACULAR_API_KEY4=your_backup_key_4

# Server configuration
PORT=5000

# Currency settings
USD_TO_INR=83.5
```

### API Key Rotation System
The backend automatically rotates between multiple API keys when:
- **402 Errors** - Payment required (quota exceeded)
- **429 Errors** - Too many requests (rate limiting)
- **401/403 Errors** - Authentication/authorization issues

## 📚 API Endpoints

### Recipe Management
```http
# Search recipes with filters
GET /api/recipes/search?query=pasta&cuisine=italian&diet=vegetarian

# Get recipe details
GET /api/recipes/:id

# Get recipe nutrition
GET /api/recipes/:id/nutrition

# Get recipe pricing
GET /api/recipes/:id/price-breakdown

# Get cooking instructions
GET /api/recipes/:id/instructions

# Find similar recipes
GET /api/recipes/:id/similar
```

### Discovery & Planning
```http
# Random recipes
GET /api/recipes/random?number=10&tags=vegetarian

# Find by ingredients
GET /api/recipes/find-by-ingredients?ingredients=chicken,rice,tomato

# Generate meal plan
GET /api/recipes/meal-plan/generate?timeFrame=day&targetCalories=2000

# Wine pairing
GET /api/recipes/wine/pairing?food=steak
```

### Utility Endpoints
```http
# API key status monitoring
GET /api/recipes/api-status

# Health check
GET /api/recipes/test
```

## 🔧 API Key Management

### Monitoring Key Health
```bash
curl http://localhost:5000/api/recipes/api-status
```

Response example:
```json
{
  "success": true,
  "data": {
    "totalKeys": 4,
    "currentKeyIndex": 0,
    "keyStatuses": [
      {
        "index": 0,
        "isActive": true,
        "errorCount": 0,
        "isAvailable": true
      }
    ]
  }
}
```

### Automatic Rotation Logic
1. **Primary Key Usage** - Starts with first available key
2. **Error Detection** - Monitors 402/429 response codes
3. **Intelligent Switching** - Rotates to next healthy key
4. **Cooldown Management** - Temporarily disables overused keys
5. **Recovery** - Automatically re-enables keys after cooldown

## 🐛 Development & Debugging

### Logging
The server provides detailed logging for:
- API key rotation events
- Request failures and successes
- Rate limit detection
- Error tracking

### Common Issues

#### "No API keys configured" Error
```bash
# Check your .env file exists and has valid keys
ls -la .env
cat .env | grep SPOONACULAR
```

#### Rate Limiting
```bash
# Monitor key status
curl http://localhost:5000/api/recipes/api-status

# Check server logs for rotation events
npm run dev
```

#### CORS Issues
```javascript
// Already configured for frontend on localhost:5173
// Modify in server.js if needed
```

## 📦 Dependencies

### Production
- **express** - Web framework
- **axios** - HTTP client for external APIs
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Development
- **nodemon** - Auto-restart on file changes

## 🚀 Deployment

### Environment Setup
1. Set environment variables on your hosting platform
2. Ensure all API keys are valid and have sufficient quota
3. Configure PORT for your hosting service

### Recommended Hosting
- **Heroku** - Easy deployment with environment variables
- **Railway** - Modern hosting with git integration
- **DigitalOcean App Platform** - Scalable with monitoring
- **AWS EC2** - Full control and customization

### Health Monitoring
Monitor these endpoints in production:
- `GET /api/recipes/test` - Basic health check
- `GET /api/recipes/api-status` - API key health

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
1. Check the logs for detailed error messages
2. Verify API key configuration
3. Monitor API key status endpoint
4. Review Spoonacular API documentation

---

**Built with ❤️ for the Recipe Finder project**