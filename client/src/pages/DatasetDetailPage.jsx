import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { datasetsAPI } from '../services/api';
import { ArrowLeft, Terminal, FileText, CheckCircle2, Table, Hash, Type, Calendar } from 'lucide-react';

export default function DatasetDetailPage({ datasetId: propDatasetId }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const activeId = id || propDatasetId;

  const [dataset, setDataset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadDataset() {
      try {
        setLoading(true);
        const res = await datasetsAPI.getById(activeId);
        setDataset(res.data.dataset);
      } catch (err) {
        console.error('Error fetching dataset detail:', err);
        setError('Failed to load dataset details.');
      } finally {
        setLoading(false);
      }
    }
    if (activeId) {
      loadDataset();
    }
  }, [activeId]);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span>Loading schema and data preview...</span>
      </div>
    );
  }

  if (error || !dataset) {
    return (
      <div className="p-8 text-center text-rose-400">
        <p>{error || 'Dataset not found.'}</p>
        <button onClick={() => navigate('/datasets')} className="mt-4 px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs cursor-pointer">
          ← Back to Datasets
        </button>
      </div>
    );
  }

  const columns = dataset.columns || [];
  const previewData = dataset.previewData || [];

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/datasets')}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center space-x-2">
              <span>{dataset.name}</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                {dataset.status}
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              SQL Table: <code className="text-indigo-300 font-mono">{dataset.table_name}</code> • {dataset.row_count} rows
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/query-editor', { state: { sql: `SELECT * FROM "${dataset.table_name}" LIMIT 25;` } })}
          className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/25 flex items-center space-x-2 transition-all cursor-pointer self-start md:self-auto"
        >
          <Terminal className="w-3.5 h-3.5" />
          <span>Open in SQL Editor</span>
        </button>
      </div>

      {/* Column Schema Inspector */}
      <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/40">
        <h2 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
          <Table className="w-4 h-4 text-indigo-400" />
          <span>Inferred Schema & Column Attributes ({columns.length} Fields)</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {columns.map((col, idx) => {
            const isNumeric = col.type === 'INTEGER' || col.type === 'REAL';
            const isDate = col.type === 'DATE' || col.clean.includes('date');
            return (
              <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div className="flex items-center space-x-1.5 text-slate-300 font-semibold truncate mb-1">
                  {isNumeric ? <Hash className="w-3.5 h-3.5 text-indigo-400 shrink-0" /> : isDate ? <Calendar className="w-3.5 h-3.5 text-violet-400 shrink-0" /> : <Type className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                  <span className="truncate">{col.clean}</span>
                </div>
                <div className="flex items-center justify-between text-[10px]">
                  <span className="font-mono text-indigo-300">{col.type}</span>
                  <span className="text-slate-500">Indexed</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sample Records Data Preview Grid */}
      <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <FileText className="w-4 h-4 text-indigo-400" />
            <span>Dataset Preview (First {previewData.length} Records)</span>
          </h2>
          <span className="text-[11px] text-slate-400 font-mono">
            SELECT * FROM "{dataset.table_name}" LIMIT 50
          </span>
        </div>

        <div className="overflow-x-auto max-h-[500px]">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-semibold">
              <tr>
                {columns.map((c, i) => (
                  <th key={i} className="py-2.5 px-4 font-mono">{c.clean}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {previewData.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors">
                  {columns.map((c, cIdx) => (
                    <td key={cIdx} className="py-2 px-4 text-slate-300 text-[11px]">
                      {row[c.clean] !== undefined && row[c.clean] !== null ? String(row[c.clean]) : (row[c.original] !== undefined ? String(row[c.original]) : '-')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
