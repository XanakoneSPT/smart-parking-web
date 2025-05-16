import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for automatic data fetching at regular intervals.
 * 
 * @param {Function} fetchFunction - Function that returns a promise to fetch data
 * @param {number} interval - Interval in milliseconds (default: 10000 ms / 10 seconds)
 * @param {boolean} enabled - Whether auto-fetching is enabled (default: true)
 * @param {Array} dependencies - Array of dependencies that will trigger a refetch when changed
 * @returns {Object} - { data, isLoading, error, manualFetch, setEnabled }
 */
const useAutoFetch = (fetchFunction, interval = 10000, enabled = true, dependencies = []) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEnabled, setEnabled] = useState(enabled);
  
  // Use a ref to store the fetch function to avoid it being affected by rerenders
  const fetchFunctionRef = useRef(fetchFunction);
  useEffect(() => {
    fetchFunctionRef.current = fetchFunction;
  }, [fetchFunction]);
  
  // Function to fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const result = await fetchFunctionRef.current();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err);
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial fetch and fetch when dependencies change
  useEffect(() => {
    fetchData();
  }, [...dependencies]);
  
  // Set up the interval for auto-fetching
  useEffect(() => {
    if (!isEnabled) return;
    
    const intervalId = setInterval(() => {
      fetchData();
    }, interval);
    
    // Clean up the interval on unmount or when dependencies change
    return () => clearInterval(intervalId);
  }, [interval, isEnabled, ...dependencies]);
  
  // Function to manually trigger a fetch
  const manualFetch = () => {
    fetchData();
  };
  
  return { data, isLoading, error, manualFetch, setEnabled };
};

export default useAutoFetch; 