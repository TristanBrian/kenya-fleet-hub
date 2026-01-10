import { useState, useEffect } from 'react';

const API_KEYS_STORAGE_KEY = 'safiri_api_keys';

interface ApiKeys {
  mapbox?: string;
  weather?: string;
  fuel?: string;
}

export const useApiKeys = () => {
  const [apiKeys, setApiKeys] = useState<ApiKeys>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadKeys();
    
    // Listen for storage changes (when keys are updated in Settings)
    const handleStorageChange = () => loadKeys();
    window.addEventListener('storage', handleStorageChange);
    
    // Also poll for changes (for same-tab updates)
    const interval = setInterval(loadKeys, 2000);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const loadKeys = () => {
    try {
      const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
      const mapboxToken = localStorage.getItem('mapbox_token') || '';
      const envMapboxToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || '';
      
      const keys: ApiKeys = stored ? JSON.parse(stored) : {};
      
      // Add mapbox token from either env or localStorage
      const validMapboxToken = envMapboxToken.startsWith('pk.') ? envMapboxToken : 
                               mapboxToken.startsWith('pk.') ? mapboxToken : '';
      if (validMapboxToken) {
        keys.mapbox = validMapboxToken;
      }
      
      setApiKeys(keys);
    } catch (error) {
      console.error('Error loading API keys:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getMapboxToken = (): string | null => {
    return apiKeys.mapbox || null;
  };

  const getWeatherApiKey = (): string | null => {
    return apiKeys.weather || null;
  };

  const getFuelApiKey = (): string | null => {
    return apiKeys.fuel || null;
  };

  const isMapboxConfigured = (): boolean => {
    return !!apiKeys.mapbox;
  };

  const isWeatherConfigured = (): boolean => {
    return !!apiKeys.weather;
  };

  const isFuelConfigured = (): boolean => {
    return !!apiKeys.fuel;
  };

  return {
    apiKeys,
    isLoading,
    getMapboxToken,
    getWeatherApiKey,
    getFuelApiKey,
    isMapboxConfigured,
    isWeatherConfigured,
    isFuelConfigured,
  };
};
