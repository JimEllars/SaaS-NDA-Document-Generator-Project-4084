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
      // Simulate an RPC call to match_ai_interactions
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockResponses = [
        {
          id: 'res-1',
          content: 'Resolved Cloudflare Edge cache spike by purging the affected zone. The issue was traced to a misconfigured VCL rule.',
          similarity: 0.92,
          timestamp: '2023-10-14T08:23:00Z',
          type: 'Resolution'
        },
        {
          id: 'res-2',
          content: 'Document Orchestrator API was updated to v1.2 to include new mutual NDA templates and webhook retries.',
          similarity: 0.85,
          timestamp: '2023-10-12T14:15:00Z',
          type: 'Knowledge Base'
        },
        {
          id: 'res-3',
          content: 'Admin "auth-user-999" initiated an emergency reboot of the main database instance due to memory leak alerts.',
          similarity: 0.76,
          timestamp: '2023-10-10T09:41:00Z',
          type: 'Audit Log'
        }
      ];

      setResults(mockResponses.filter(r =>
        r.content.toLowerCase().includes(query.toLowerCase()) ||
        r.type.toLowerCase().includes(query.toLowerCase())
      ).length > 0 ? mockResponses : mockResponses.slice(0, 1));

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSearching(false);
    }
  }, []);

  return { search, results, isSearching, error };
};

export default useVectorSearch;
