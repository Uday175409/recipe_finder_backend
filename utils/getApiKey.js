import apiKeyManager from './apiKeyManager.js';

export const getApiKey = () => {
  return apiKeyManager.getCurrentKey();
};

// Export the manager for advanced usage
export { apiKeyManager };
