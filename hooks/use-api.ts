'use client';

import { useState, useCallback } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: any;
}

export function useApi(scope: 'auto' | 'admin' | 'user' = 'auto') {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const request = useCallback(async (endpoint: string, options: RequestOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      let token = null;

      if (scope === 'admin') {
        token = localStorage.getItem('adminToken');
      } else if (scope === 'user') {
        token = localStorage.getItem('userToken');
      } else {
        // Auto: Prefer admin, fallback to user (legacy behavior + my previous fix)
        token = localStorage.getItem('adminToken');
        if (!token) {
          token = localStorage.getItem('userToken');
        }
      }

      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };

      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: options.method || 'GET',
        headers,
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'API request failed');
      }

      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { request, loading, error };
}
