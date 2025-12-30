
import React, { useState } from 'react';
import { GeminiService } from '../services/geminiService';

const SearchView: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [result, setResult] = useState<{text: string, grounding: any[]} | null>(null);

  const handleSearch = async () => {
    if (!query.trim() || isSearching) return;
    setIsSearching(true);
    try {
      const data = await GeminiService.searchGrounding(query);
      setResult(data);
    } catch (error) {
      alert("Search failed.");
      console.error(error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar max-w-5xl mx-auto w-full">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold mb-4">Grounded Intelligence</h2>
        <p className="text-slate-400">Ask about recent news, sports, or current events. Gemini will verify with Google Search.</p>
      </div>

      <div className="glass rounded-2xl p-2 flex gap-2 mb-8 shadow-xl max-w-2xl mx-auto">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Who won the Super Bowl last night?"
          className="flex-1 bg-transparent px-4 py-3 outline-none text-slate-200"
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button
          onClick={handleSearch}
          disabled={isSearching || !query.trim()}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 px-6 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
        >
          {isSearching ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-search"></i>}
          Search
        </button>
      </div>

      {result && (
        <div className="space-y-8">
          <div className="glass rounded-3xl p-8 border-l-4 border-l-indigo-500 shadow-2xl">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">AI Insight</h3>
            <div className="prose prose-invert prose-lg max-w-none">
              {result.text}
            </div>
          </div>

          {result.grounding && result.grounding.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-slate-400 mb-4 flex items-center gap-2">
                <i className="fa-solid fa-link text-indigo-400"></i> Sources & Citations
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.grounding.map((chunk, idx) => chunk.web && (
                  <a
                    key={idx}
                    href={chunk.web.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass p-4 rounded-xl hover:bg-indigo-600/10 transition-colors border border-transparent hover:border-indigo-500/30 flex justify-between items-center group"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="font-medium text-slate-200 truncate">{chunk.web.title || chunk.web.uri}</p>
                      <p className="text-xs text-slate-500 truncate">{chunk.web.uri}</p>
                    </div>
                    <i className="fa-solid fa-arrow-up-right-from-square text-slate-600 group-hover:text-indigo-400"></i>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchView;
