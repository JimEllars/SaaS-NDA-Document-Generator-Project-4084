import React, { useState } from 'react';
import { FiSearch, FiCpu, FiMessageSquare, FiBookOpen } from 'react-icons/fi';
import { useVectorSearch } from '../hooks/useVectorSearch';

const IntelligenceHub = () => {
  const [query, setQuery] = useState('');
  const { search, results, isSearching, error } = useVectorSearch();

  const handleSearch = (e) => {
    e.preventDefault();
    search(query);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
          <FiCpu className="text-axim-teal" /> Vector Intelligence Hub
        </h3>
        <p className="text-sm text-zinc-400 mt-2">
          Semantic search across ecosystem memory: AI interactions, error resolutions, and knowledge base.
        </p>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <FiSearch className="text-zinc-500" />
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., How did we resolve the 500 error on the orchestrator yesterday?"
          className="w-full bg-black/60 border border-white/10 text-zinc-100 rounded-xl pl-12 pr-24 py-4 focus:ring-2 focus:ring-axim-teal focus:border-axim-teal outline-none transition"
        />
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className={`absolute inset-y-2 right-2 px-4 rounded-lg bg-axim-teal text-black font-bold text-sm hover:bg-teal-400 transition ${isSearching || !query.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSearching ? 'Querying...' : 'Search'}
        </button>
      </form>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Semantic Matches</h4>
          {results.map((res) => (
            <div key={res.id} className="bg-white/5 border border-white/10 rounded-xl p-5 hover:border-axim-teal/30 transition-colors">
              <div className="flex justify-between items-start mb-3">
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${
                  res.type === 'Resolution' ? 'bg-green-500/10 text-green-400' :
                  res.type === 'Knowledge Base' ? 'bg-blue-500/10 text-blue-400' :
                  'bg-purple-500/10 text-purple-400'
                }`}>
                  {res.type === 'Knowledge Base' ? <FiBookOpen size={12} /> : <FiMessageSquare size={12} />}
                  {res.type}
                </span>
                <div className="flex items-center gap-3 text-xs text-zinc-500">
                  <span className="flex items-center gap-1">
                    Match: <span className="text-axim-teal font-mono">{(res.similarity * 100).toFixed(0)}%</span>
                  </span>
                  <span>{new Date(res.timestamp).toLocaleString()}</span>
                </div>
              </div>
              <p className="text-zinc-300 text-sm leading-relaxed">{res.content}</p>
            </div>
          ))}
        </div>
      )}

      {!isSearching && results.length === 0 && query && (
        <div className="text-center p-12 border border-dashed border-white/10 rounded-xl text-zinc-500">
          No semantic matches found for your query. Try rephrasing your search.
        </div>
      )}
    </div>
  );
};

export default IntelligenceHub;
