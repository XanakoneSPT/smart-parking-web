import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const AutoFetchContext = createContext();

/**
 * Provider component for AutoFetch settings
 */
export const AutoFetchProvider = ({ children }) => {
  // Default interval is 10 seconds
  const [interval, setInterval] = useState(10000); 
  // Auto fetch is enabled by default
  const [globalEnabled, setGlobalEnabled] = useState(true);
  
  // Load settings from localStorage on mount
  useEffect(() => {
    const savedInterval = localStorage.getItem('autoFetchInterval');
    const savedEnabled = localStorage.getItem('autoFetchEnabled');
    
    if (savedInterval) {
      setInterval(parseInt(savedInterval, 10));
    }
    
    if (savedEnabled !== null) {
      setGlobalEnabled(savedEnabled === 'true');
    }
  }, []);
  
  // Save settings to localStorage when they change
  useEffect(() => {
    localStorage.setItem('autoFetchInterval', interval.toString());
    localStorage.setItem('autoFetchEnabled', globalEnabled.toString());
  }, [interval, globalEnabled]);
  
  // Handle visibility change to pause fetching when tab is not visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setGlobalEnabled(true);
      } else {
        setGlobalEnabled(false);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // Values and functions provided by the context
  const value = {
    interval,
    setInterval,
    globalEnabled,
    setGlobalEnabled,
    
    // Helper function to update interval
    updateInterval: (newInterval) => {
      setInterval(newInterval);
    },
    
    // Helper function to toggle global enabled state
    toggleGlobalEnabled: () => {
      setGlobalEnabled(prev => !prev);
    }
  };
  
  return (
    <AutoFetchContext.Provider value={value}>
      {children}
    </AutoFetchContext.Provider>
  );
};

/**
 * Hook to use the AutoFetch context
 */
export const useAutoFetchSettings = () => {
  const context = useContext(AutoFetchContext);
  if (context === undefined) {
    throw new Error('useAutoFetchSettings must be used within an AutoFetchProvider');
  }
  return context;
};

export default AutoFetchContext; 