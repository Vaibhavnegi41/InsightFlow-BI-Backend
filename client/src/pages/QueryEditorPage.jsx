import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { queryAPI } from '../services/api';
import { 
  Play, 
  Save, 
  Download, 
  Sparkles, 
  Clock, 
  Cpu, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  Code2, 
  Table as TableIcon, 
  ChevronRight, 
  BookOpen 
} from 'lucide-react';

export default function QueryEditorPage({ initialSql }) {
  const location = useLocation();
  const { activeDataset } = useData();
  const tableName = activeDataset?.table_name || 'dataset_ecommerce_sales';

  const defaultTemplates = [
    {
      title: 'Monthly Revenue & Margin CTE',
      description: 'Aggregates monthly gross sales, COGS, and blended margin using Common Table Expressions.',
      sql: `WITH MonthlyMetrics AS (
  SELECT
    SUBSTR(order_date, 1, 7) as month,
    COUNT(order_id) as total_orders,
    ROUND(SUM(revenue), 2) as gross_revenue,
    ROUND(SUM(profit), 2) as net_profit
  FROM "${tableName}"
  GROUP BY SUBSTR(order_date, 1, 7)
)
SELECT
  month,
  total_orders,
  gross_revenue,
  net_profit,
  ROUND((net_profit * 100.0 / NULLIF(gross_revenue, 0)), 1) as margin_percentage
FROM MonthlyMetrics
ORDER BY month DESC;`
    },
    {
      title: 'Top Product Ranking (Window Function)',
      description: 'Ranks top 3 products inside each category by total sales revenue using DENSE_RANK() OVER.',
      sql: `WITH RankedProducts AS (
  SELECT
    category,
    product_name,
    ROUND(SUM(revenue), 2) as total_revenue,
    DENSE_RANK() OVER (PARTITION BY category ORDER BY SUM(revenue) DESC) as category_rank
  FROM "${tableName}"
  GROUP BY category, product_name
)
SELECT * FROM RankedProducts
WHERE category_rank <= 3
ORDER BY category, category_rank ASC;`
    },
    {
      title: 'Customer Segment Spending Distribution',
      description: 'Evaluates customer segments, unique buyers, and average order value.',
      sql: `SELECT
  customer_segment,
  COUNT(DISTINCT customer_id) as unique_buyers,
  COUNT(order_id) as order_count,
  ROUND(SUM(revenue), 2) as segment_revenue,
  ROUND(AVG(revenue), 2) as avg_order_value
FROM "${tableName}"
GROUP BY customer_segment
ORDER BY segment_revenue DESC;`
    }
  ];

  const passedSql = location.state?.sql || initialSql;
  const [sql, setSql] = useState(passedSql || defaultTemplates[0].sql);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [saveTitle, setSaveTitle] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (location.state?.sql) {
      setSql(location.state.sql);
    } else if (initialSql) {
      setSql(initialSql);
    }
  }, [location.state, initialSql]);

  const handleRunQuery = async () => {
    if (!sql.trim()) return;

    try {
      setRunning(true);
      setError(null);
      const res = await queryAPI.execute({
        sql,
        datasetId: activeDataset?.id
      });
      setResult(res.data);
    } catch (err) {
      console.error('Query execution error:', err);
      setError(err.response?.data?.error || 'Failed to execute query.');
      setResult(null);
    } finally {
      setRunning(false);
    }
  };

  const handleSave = async () => {
    if (!saveTitle.trim()) return;
    try {
      await queryAPI.save({
        title: saveTitle,
        sql,
        datasetId: activeDataset?.id
      });
      setShowSaveModal(false);
      setSaveTitle('');
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      alert('Failed to save query');
    }
  };

  const handleExportCsv = () => {
    if (!result || !result.data || result.data.length === 0) return;
    const headers = result.columns.join(',');
    const rows = result.data.map(row => 
      result.columns.map(col => `"${row[col] !== undefined ? String(row[col]).replace(/"/g, '""') : ''}"`).join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `query_results_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const optimization = result?.optimization;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <span>SQL Analytics & Optimization Workspace</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Execute analytical SELECT queries with real-time BigQuery optimization advice & performance metrics.
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3 py-1 rounded-lg bg-emerald-950/50 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Query saved to history!</span>
          </div>
        )}
      </div>

      {/* Quick Templates Bar */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 text-[11px] font-semibold flex items-center space-x-1 shrink-0">
          <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
          <span>Templates:</span>
        </span>
        {defaultTemplates.map((tpl, i) => (
          <button
            key={i}
            onClick={() => setSql(tpl.sql)}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-slate-300 hover:text-white transition-colors shrink-0 text-[11px]"
          >
            {tpl.title}
          </button>
        ))}
      </div>

      {/* Editor & Controls */}
      <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden shadow-xl">
        {/* Editor Toolbar */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono">
            <Code2 className="w-4 h-4 text-indigo-400" />
            <span>SQL Editor • Active Table:</span>
            <span className="text-indigo-300 font-semibold">{tableName}</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSaveModal(true)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Query</span>
            </button>

            <button
              onClick={handleRunQuery}
              disabled={running}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 flex items-center space-x-2 transition-all cursor-pointer"
            >
              <Play className={`w-3.5 h-3.5 ${running ? 'animate-spin' : 'fill-current'}`} />
              <span>{running ? 'Executing...' : 'Run Query (Ctrl+Enter)'}</span>
            </button>
          </div>
        </div>

        {/* Text Area */}
        <div className="p-4 bg-[#0B0F19]">
          <textarea
            value={sql}
            onChange={(e) => setSql(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                handleRunQuery();
              }
            }}
            rows={7}
            className="w-full bg-transparent text-slate-100 font-mono text-xs leading-relaxed outline-none resize-y selection:bg-indigo-600 selection:text-white"
            placeholder="Write your analytical SELECT / CTE query here..."
          />
        </div>
      </div>

      {/* Execution Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-3">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Query Execution Failed:</span>
            <p className="mt-1 font-mono text-[11px] text-rose-200">{error}</p>
          </div>
        </div>
      )}

      {/* Query Optimization Advisor Panel */}
      {optimization && (
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/40">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Query Optimization Advisor</h3>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono ${
              optimization.score >= 80 ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
            }`}>
              Efficiency Score: {optimization.score}/100 • {optimization.grade}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {optimization.suggestions.map((sug, idx) => (
              <div key={idx} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
                <div className="flex items-center space-x-1.5 font-semibold text-slate-200 mb-1">
                  {sug.type === 'GOOD' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                  <span>{sug.title}</span>
                </div>
                <p className="text-[11px] text-slate-400">{sug.description}</p>
                <div className="mt-2 text-[10px] text-indigo-300 font-medium bg-indigo-950/30 px-2 py-1 rounded">
                  💡 {sug.potentialImprovement}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results View & Metrics */}
      {result && (
        <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
          {/* Results Bar */}
          <div className="p-4 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-950/60">
            <div className="flex items-center space-x-4 text-xs">
              <span className="font-bold text-white flex items-center space-x-1.5">
                <TableIcon className="w-4 h-4 text-indigo-400" />
                <span>Query Results ({result.rowCount} rows)</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>{result.executionTimeMs} ms</span>
              </span>
              <span className="flex items-center space-x-1 text-slate-400">
                <Cpu className="w-3.5 h-3.5 text-violet-400" />
                <span>~{(result.bytesProcessed / 1024).toFixed(1)} KB scanned</span>
              </span>
            </div>

            <button
              onClick={handleExportCsv}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Results Table */}
          <div className="overflow-x-auto max-h-[450px]">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="sticky top-0 bg-slate-950 border-b border-slate-800 text-slate-400 text-[10px] uppercase font-semibold">
                <tr>
                  {result.columns.map((col, i) => (
                    <th key={i} className="py-2.5 px-4 font-mono">{col}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {result.data.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-800/30 transition-colors">
                    {result.columns.map((col, cIdx) => (
                      <td key={cIdx} className="py-2 px-4 text-slate-300 text-[11px]">
                        {row[col] !== undefined && row[col] !== null ? String(row[col]) : '-'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Save Query Modal */}
      {showSaveModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Save Analytical Query</h3>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Query Title / Description</label>
              <input
                type="text"
                placeholder="e.g. Monthly Revenue Cohorts"
                value={saveTitle}
                onChange={(e) => setSaveTitle(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div className="flex items-center justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowSaveModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!saveTitle.trim()}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 cursor-pointer disabled:opacity-50"
              >
                Confirm Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
