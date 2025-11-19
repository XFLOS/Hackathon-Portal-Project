import { useState, useEffect } from 'react';
import api from '../services/api';

/**
 * Custom hook for API calls with loading and error states
 * @param {string} endpoint - API endpoint to call
 * @param {object} options - { method, body, dependencies, skip }
 * @returns {object} { data, loading, error, refetch }
 */
export function useApi(endpoint, options = {}) {
  const {
    method = 'GET',
    body = null,
    dependencies = [],
    skip = false
  } = options;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(!skip);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    if (skip) return;

    setLoading(true);
    setError(null);

    try {
      let response;
      
      if (method === 'GET') {
        response = await api.get(endpoint);
      } else if (method === 'POST') {
        response = await api.post(endpoint, body);
      } else if (method === 'PUT') {
        response = await api.put(endpoint, body);
      } else if (method === 'DELETE') {
        response = await api.delete(endpoint);
      }

      setData(response.data);
      setError(null);
    } catch (err) {
      console.error(`API Error (${method} ${endpoint}):`, err);
      setError(err.response?.data?.error || err.message || 'An error occurred');
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, skip, ...dependencies]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
}

/**
 * Hook for lazy API calls (manual trigger)
 * @param {string} endpoint - API endpoint
 * @param {string} method - HTTP method
 * @returns {object} { data, loading, error, execute }
 */
export function useLazyApi(endpoint, method = 'GET') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (bodyData = null) => {
    setLoading(true);
    setError(null);

    try {
      let response;
      
      if (method === 'GET') {
        response = await api.get(endpoint);
      } else if (method === 'POST') {
        response = await api.post(endpoint, bodyData);
      } else if (method === 'PUT') {
        response = await api.put(endpoint, bodyData);
      } else if (method === 'DELETE') {
        response = await api.delete(endpoint);
      }

      setData(response.data);
      setError(null);
      return response.data;
    } catch (err) {
      console.error(`API Error (${method} ${endpoint}):`, err);
      const errorMsg = err.response?.data?.error || err.message || 'An error occurred';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    execute
  };
}
