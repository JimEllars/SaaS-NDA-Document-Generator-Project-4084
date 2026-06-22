import React, { useState } from 'react';
import { FiSearch, FiCpu, FiMessageSquare, FiBookOpen, FiLoader } from 'react-icons/fi';
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
          className="w-full bg-black/60 border border-white/10 text-zinc-100 rounded-xl pl-12 pr-24 py-4 focus:ring-2 focus:ring-purple-500/40 focus:border-purple-400 focus:bg-slate-900/80 transition-all duration-300 outline-none transition"
        />
        <button
          type="submit"
          disabled={isSearching || !query.trim()}
          className={`absolute inset-y-2 right-2 px-4 rounded-lg bg-axim-teal text-black font-bold text-sm hover:bg-teal-400 transition ${isSearching || !query.trim() ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSearching ? <FiLoader className="animate-spin mx-auto" /> : 'Search'}
        </button>
      </form>
      <div className="flex flex-wrap gap-2 mt-3">
        <button
          type="button"
          onClick={() => { setQuery("Explain California Jurisdiction Implications"); search("Explain California Jurisdiction Implications"); }}
          className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-axim-teal rounded-full px-3 py-1 transition-colors"
        >
          Explain California Jurisdiction Implications
        </button>
        <button
          type="button"
          onClick={() => { setQuery("Review Robust Indemnity Clause Penalties"); search("Review Robust Indemnity Clause Penalties"); }}
          className="text-xs bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-axim-teal rounded-full px-3 py-1 transition-colors"
        >
          Review Robust Indemnity Clause Penalties
        </button>
      </div>


      {isSearching && (
        <div className="space-y-4" data-testid="skeleton-loader">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse">
            <div className="flex justify-between items-start mb-3">
              <div className="h-4 bg-white/10 rounded w-1/4"></div>
              <div className="h-3 bg-white/10 rounded w-1/4"></div>
            </div>
            <div className="h-3 bg-white/10 rounded w-full mb-2"></div>
            <div className="h-3 bg-white/10 rounded w-5/6"></div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5 animate-pulse">
            <div className="flex justify-between items-start mb-3">
              <div className="h-4 bg-white/10 rounded w-1/4"></div>
              <div className="h-3 bg-white/10 rounded w-1/4"></div>
            </div>
            <div className="h-3 bg-white/10 rounded w-full mb-2"></div>
            <div className="h-3 bg-white/10 rounded w-4/6"></div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm">
          {error}
        </div>
      )}

      {!isSearching && results.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider">Semantic Matches</h4>
          {results.map((res) => (
            <div key={res.id} className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5 hover:border-axim-teal/30 transition-colors shadow-lg">
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
