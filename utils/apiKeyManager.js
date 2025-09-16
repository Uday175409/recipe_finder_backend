import axios from 'axios';

class ApiKeyManager {
  constructor() {
    // Delay initialization to ensure .env is loaded
    this.apiKeys = null;
    this.currentKeyIndex = 0;
    this.keyStatus = new Map();
    this.initialized = false;
  }

  // Initialize the manager (called on first use)
  initialize() {
    if (this.initialized) return;
    
    try {
      // Load all available API keys from environment variables
      this.apiKeys = this.loadApiKeys();
      
      console.log(`🔑 API Key Manager initialized with ${this.apiKeys.length} keys`);
      
      // Initialize status for all keys
      this.apiKeys.forEach((key, index) => {
        this.keyStatus.set(index, {
          isActive: true,
          errorCount: 0,
          lastError: null,
          rateLimitResetTime: null
        });
      });
      
      this.initialized = true;
    } catch (error) {
      console.error('❌ Failed to initialize API Key Manager:', error.message);
      throw error;
    }
  }

  loadApiKeys() {
    const keys = [];
    
    // Load keys from environment variables (SPOONACULAR_API_KEY, SPOONACULAR_API_KEY2, etc.)
    const primaryKey = process.env.SPOONACULAR_API_KEY || process.env.SPOONACULAR_API_KEY1;
    
    if (primaryKey) {
      keys.push(primaryKey);
    }
    
    // Load additional keys (try various naming patterns)
    for (let i = 2; i <= 10; i++) {
      const nextKey = process.env[`SPOONACULAR_API_KEY${i}`];
      if (nextKey) {
        keys.push(nextKey);
      }
    }
    
    // Also try the key that was being used before (SPOONACULAR_API_KEY3)
    const legacyKey = process.env.SPOONACULAR_API_KEY3;
    if (legacyKey && !keys.includes(legacyKey)) {
      keys.push(legacyKey);
    }
    
    if (keys.length === 0) {
      console.error('⚠️  No API keys found in environment variables');
      console.error('Please set at least one of the following:');
      console.error('- SPOONACULAR_API_KEY');
      console.error('- SPOONACULAR_API_KEY2');
      console.error('- SPOONACULAR_API_KEY3');
      console.error('Check your .env file or environment variables');
      throw new Error('No API keys configured');
    }
    
    console.log(`✅ Loaded ${keys.length} API key(s)`);
    return keys;
  }

  getCurrentKey() {
    this.initialize();
    
    if (this.apiKeys.length === 0) {
      throw new Error('No API keys available');
    }
    
    return this.apiKeys[this.currentKeyIndex];
  }

  getCurrentKeyInfo() {
    this.initialize();
    
    return {
      key: this.getCurrentKey(),
      index: this.currentKeyIndex,
      status: this.keyStatus.get(this.currentKeyIndex)
    };
  }

  rotateToNextKey() {
    this.initialize();
    
    const previousIndex = this.currentKeyIndex;
    
    // Find next active key
    let attempts = 0;
    do {
      this.currentKeyIndex = (this.currentKeyIndex + 1) % this.apiKeys.length;
      attempts++;
      
      const status = this.keyStatus.get(this.currentKeyIndex);
      
      // Check if this key is available (not in rate limit cooldown)
      if (status.isActive || this.isKeyAvailable(this.currentKeyIndex)) {
        console.log(`Rotated from key ${previousIndex} to key ${this.currentKeyIndex}`);
        return this.getCurrentKey();
      }
      
    } while (attempts < this.apiKeys.length);
    
    // If all keys are exhausted, reset to first key and hope for the best
    console.warn('All API keys seem to be rate limited. Resetting to first key.');
    this.currentKeyIndex = 0;
    return this.getCurrentKey();
  }

  isKeyAvailable(keyIndex) {
    const status = this.keyStatus.get(keyIndex);
    
    if (!status) return true;
    
    // If key has a rate limit reset time, check if it's passed
    if (status.rateLimitResetTime && Date.now() < status.rateLimitResetTime) {
      return false;
    }
    
    // Reset status if cooldown period has passed
    if (status.rateLimitResetTime && Date.now() >= status.rateLimitResetTime) {
      status.isActive = true;
      status.rateLimitResetTime = null;
      status.errorCount = 0;
    }
    
    return status.isActive;
  }

  handleApiError(error, keyIndex = this.currentKeyIndex) {
    const status = this.keyStatus.get(keyIndex);
    
    if (!status) return;
    
    status.errorCount++;
    status.lastError = {
      message: error.message,
      status: error.response?.status,
      timestamp: Date.now()
    };
    
    // Handle specific error types
    if (error.response?.status === 402) {
      // Payment required - key has hit rate limit
      console.log(`API Key ${keyIndex} hit rate limit (402). Marking as inactive.`);
      status.isActive = false;
      status.rateLimitResetTime = Date.now() + (60 * 60 * 1000); // 1 hour cooldown
    } else if (error.response?.status === 429) {
      // Too many requests - temporary rate limit
      console.log(`API Key ${keyIndex} hit temporary rate limit (429). Setting cooldown.`);
      status.isActive = false;
      status.rateLimitResetTime = Date.now() + (15 * 60 * 1000); // 15 minutes cooldown
    } else if (error.response?.status === 401 || error.response?.status === 403) {
      // Unauthorized/Forbidden - key might be invalid
      console.log(`API Key ${keyIndex} is unauthorized (${error.response.status}). Marking as inactive.`);
      status.isActive = false;
      status.rateLimitResetTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hour cooldown
    }
    
    console.log(`Key ${keyIndex} status updated:`, status);
  }

  // Make an API request with automatic key rotation on failure
  async makeRequest(url, options = {}) {
    this.initialize();
    
    let lastError = null;
    let attempts = 0;
    const maxAttempts = this.apiKeys.length;
    
    while (attempts < maxAttempts) {
      try {
        const currentKey = this.getCurrentKey();
        const keyIndex = this.currentKeyIndex;
        
        // Add API key to URL or headers
        const finalUrl = this.addApiKeyToUrl(url, currentKey);
        
        console.log(`Making request with API key ${keyIndex}: ${finalUrl.substring(0, 100)}...`);
        
        const response = await axios.get(finalUrl, options);
        
        // Request successful, reset error count for this key
        const status = this.keyStatus.get(keyIndex);
        if (status) {
          status.errorCount = 0;
          status.lastError = null;
        }
        
        return response;
        
      } catch (error) {
        lastError = error;
        const currentKeyIndex = this.currentKeyIndex;
        
        console.log(`Request failed with key ${currentKeyIndex}:`, error.response?.status, error.message);
        
        // Handle the error and update key status
        this.handleApiError(error, currentKeyIndex);
        
        // If this is a rate limit error, try next key
        if (error.response?.status === 402 || error.response?.status === 429) {
          console.log(`Rotating to next API key due to rate limit...`);
          this.rotateToNextKey();
          attempts++;
          continue;
        }
        
        // For other errors, still try rotating if we have more keys
        if (attempts < maxAttempts - 1) {
          console.log(`Trying next API key due to error...`);
          this.rotateToNextKey();
          attempts++;
          continue;
        }
        
        // If it's not a rate limit error and we've tried all keys, throw the error
        break;
      }
    }
    
    // All keys failed
    console.error(`All ${this.apiKeys.length} API keys failed. Last error:`, lastError?.message);
    throw lastError || new Error('All API keys exhausted');
  }

  addApiKeyToUrl(url, apiKey) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}apiKey=${apiKey}`;
  }

  // Get status of all keys
  getStatus() {
    this.initialize();
    
    return {
      totalKeys: this.apiKeys.length,
      currentKeyIndex: this.currentKeyIndex,
      keyStatuses: Array.from(this.keyStatus.entries()).map(([index, status]) => ({
        index,
        isActive: status.isActive,
        errorCount: status.errorCount,
        lastError: status.lastError,
        rateLimitResetTime: status.rateLimitResetTime,
        isAvailable: this.isKeyAvailable(index)
      }))
    };
  }
}

// Create a singleton instance
const apiKeyManager = new ApiKeyManager();

export default apiKeyManager;
export { ApiKeyManager };