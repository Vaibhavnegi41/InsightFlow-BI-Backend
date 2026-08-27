import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { queryAPI } from '../services/api';
import { History, Play, CheckCircle2, XCircle, Clock, Bookmark, Terminal, Search } from 'lucide-react';

export default function QueryHistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [savedQueries, setSavedQueries] = useState([]);
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'saved'
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [histRes, savedRes] = await Promise.all([
        queryAPI.history(50),
        queryAPI.saved()
      ]);
      setHistory(histRes.data.history || []);
      setSavedQueries(savedRes.data.queries || []);
    } catch (err) {
      console.error('Failed to load query history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const displayedList = activeTab === 'history' ? history : savedQueries;
  const filteredList = displayedList.filter(item => 
    (item.sql && item.sql.toLowerCase().includes(search.toLowerCase())) ||
    (item.title && item.title.toLowerCase().includes(search.toLowerCase())) ||
    (item.dataset_name && item.dataset_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <History className="w-6 h-6 text-indigo-400" />
            <span>Query Logs & Saved Repository</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Audit analytical query executions, execution durations, and re-run saved snippets.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'history' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Execution History ({history.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'saved' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Saved Queries ({savedQueries.length})
          </button>
        </div>
      </div>

      {/* Search Filter */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          placeholder="Filter by query SQL snippet, title, or dataset name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Query List */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading query audit logs...</div>
        ) : filteredList.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl border border-slate-800 text-slate-400 text-xs">
            No queries found matching your filter.
          </div>
        ) : (
          filteredList.map((item, idx) => (
            <div key={item.id || idx} className="glass-panel rounded-2xl p-4 border border-slate-800 bg-slate-900/40 hover:border-slate-700 transition-all space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  {item.status === 'SUCCESS' || item.is_saved ? (
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{item.is_saved ? 'SAVED' : 'SUCCESS'}</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] font-semibold flex items-center space-x-1">
                      <XCircle className="w-3.5 h-3.5" />
                      <span>FAILED</span>
                    </span>
                  )}
                  {item.title && <span className="font-bold text-white">{item.title}</span>}
                  {item.dataset_name && (
                    <span className="text-slate-400 text-[11px]">
                      Dataset: <strong className="text-slate-300">{item.dataset_name}</strong>
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3 text-slate-500 text-[11px]">
                  {item.execution_time && (
                    <span className="flex items-center space-x-1 font-mono text-emerald-400">
                      <Clock className="w-3 h-3" />
                      <span>{item.execution_time} ms</span>
                    </span>
                  )}
                  <span>{new Date(item.created_at).toLocaleString()}</span>
                  <button
                    onClick={() => navigate('/query-editor', { state: { sql: item.sql } })}
                    className="px-3 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white font-medium text-xs border border-indigo-500/30 transition-all flex items-center space-x-1 cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-current" />
                    <span>Re-run</span>
                  </button>
                </div>
              </div>

              {/* Code snippet block */}
              <div className="bg-[#0B0F19] rounded-xl p-3 border border-slate-800/80 overflow-x-auto">
                <pre className="text-[11px] font-mono text-indigo-200 leading-relaxed whitespace-pre-wrap">
                  {item.sql}
                </pre>
              </div>

              {item.error_message && (
                <div className="text-[11px] font-mono text-rose-300 bg-rose-950/30 p-2 rounded-lg border border-rose-900/40">
                  {item.error_message}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
