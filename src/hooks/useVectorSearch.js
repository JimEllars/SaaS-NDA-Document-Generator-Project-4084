import { useState, useCallback } from 'react';

// Mock hook for Vector Intelligence Hub semantic search querying match_ai_interactions RPC
export const useVectorSearch = () => {
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (query) => {
    if (!query || query.trim() === '') {
      setResults([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/telemetry/match_ai_interactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch intelligence data');
      }

      const data = await response.json();
      setResults(data.results || []);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  }, []);

  return { search, results, isSearching, error };
};

export default useVectorSearch;
