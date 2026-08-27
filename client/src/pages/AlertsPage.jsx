import React, { useState, useEffect } from 'react';
import { alertsAPI } from '../services/api';
import { 
  BellRing, 
  Plus, 
  AlertTriangle, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Activity, 
  ToggleLeft, 
  ToggleRight,
  RefreshCw,
  Sliders
} from 'lucide-react';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // New Alert Form
  const [name, setName] = useState('');
  const [metric, setMetric] = useState('profit_margin');
  const [condition, setCondition] = useState('LESS_THAN');
  const [threshold, setThreshold] = useState('20.0');
  const [frequency, setFrequency] = useState('Daily');
  const [creating, setCreating] = useState(false);

  const loadAlerts = async () => {
    try {
      setLoading(true);
      const [rulesRes, histRes] = await Promise.all([
        alertsAPI.list(),
        alertsAPI.history()
      ]);
      setAlerts(rulesRes.data.alerts || []);
      setHistory(histRes.data.history || []);
    } catch (err) {
      console.error('Failed to load alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const handleToggle = async (rule) => {
    try {
      await alertsAPI.update(rule.id, { enabled: !rule.enabled });
      await loadAlerts();
    } catch (err) {
      alert('Failed to update alert state.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this alert rule?')) return;
    try {
      await alertsAPI.delete(id);
      await loadAlerts();
    } catch (err) {
      alert('Failed to delete alert rule.');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setCreating(true);
      await alertsAPI.create({
        name,
        metric,
        condition,
        threshold: parseFloat(threshold),
        frequency
      });
      setShowModal(false);
      setName('');
      setThreshold('20.0');
      await loadAlerts();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to create alert rule.');
    } finally {
      setCreating(false);
    }
  };

  const handleEvaluateNow = async () => {
    try {
      await alertsAPI.evaluate();
      await loadAlerts();
    } catch (err) {
      alert('Evaluation failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <BellRing className="w-6 h-6 text-indigo-400" />
            <span>Automated KPI Alerts & Rules</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure automated threshold monitors for revenue dips, profit erosion, and volume targets.
          </p>
        </div>

        <div className="flex items-center space-x-3 self-start md:self-auto">
          <button
            onClick={handleEvaluateNow}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span>Evaluate All Rules Now</span>
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-lg shadow-indigo-500/25 flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Alert Rule</span>
          </button>
        </div>
      </div>

      {/* Rules Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Sliders className="w-4 h-4 text-indigo-400" />
            <span>Configured Monitor Rules ({alerts.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-semibold bg-slate-950/50">
                <th className="py-3 px-4">Rule Name</th>
                <th className="py-3 px-4">Target Metric</th>
                <th className="py-3 px-4">Condition</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4">Cadence</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Evaluated</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {alerts.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    No alert rules configured yet. Click 'Create Alert Rule' to set a threshold.
                  </td>
                </tr>
              ) : (
                alerts.map(rule => (
                  <tr key={rule.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-200">{rule.name}</td>
                    <td className="py-3 px-4 font-mono text-indigo-300">{rule.metric}</td>
                    <td className="py-3 px-4 font-mono text-slate-300">{rule.condition}</td>
                    <td className="py-3 px-4 font-mono font-bold text-white">{rule.threshold}</td>
                    <td className="py-3 px-4 text-slate-400">{rule.frequency}</td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggle(rule)}
                        className={`flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border transition-all cursor-pointer ${
                          rule.enabled
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                            : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}
                      >
                        {rule.enabled ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                        <span>{rule.enabled ? 'Active' : 'Paused'}</span>
                      </button>
                    </td>
                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {rule.last_triggered ? new Date(rule.last_triggered).toLocaleTimeString() : 'Never'}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(rule.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Triggered Alerts History Feed */}
      <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center space-x-2">
          <Activity className="w-4 h-4 text-rose-400" />
          <span>Triggered Alerts Log ({history.length})</span>
        </h2>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {history.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs">
              No alert threshold breaches detected. All business metrics are within tolerance.
            </div>
          ) : (
            history.map((item, idx) => (
              <div key={item.id || idx} className="p-3 rounded-xl bg-slate-950/80 border border-rose-900/30 flex items-start justify-between gap-3 text-xs">
                <div className="flex items-start space-x-2.5">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-200">{item.alert_name}</span>
                    <p className="text-[11px] text-slate-400 mt-0.5">{item.message}</p>
                  </div>
                </div>
                <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                  {new Date(item.triggered_at).toLocaleTimeString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Alert Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-slate-700 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Configure New Alert Rule</h3>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 mb-1 block">Rule Identifier Name</label>
                <input
                  type="text"
                  placeholder="e.g. Critical Margin Dip Guardrail"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 mb-1 block">Business Metric</label>
                  <select
                    value={metric}
                    onChange={(e) => setMetric(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="profit_margin">Profit Margin (%)</option>
                    <option value="total_revenue">Total Revenue ($)</option>
                    <option value="total_profit">Total Profit ($)</option>
                    <option value="total_orders">Total Orders (count)</option>
                    <option value="average_order_value">Average Order Value ($)</option>
                  </select>
                </div>

                <div>
                  <label className="text-slate-400 mb-1 block">Condition</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="LESS_THAN">Falls Below (&lt;)</option>
                    <option value="GREATER_THAN">Exceeds (&gt;)</option>
                    <option value="DROP_PCT">Drops More Than %</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 mb-1 block">Threshold Value</label>
                  <input
                    type="number"
                    step="0.1"
                    value={threshold}
                    onChange={(e) => setThreshold(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white font-mono focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 mb-1 block">Evaluation Frequency</label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Real-time">Real-time / On Ingestion</option>
                    <option value="Daily">Daily</option>
                    <option value="Weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/25 cursor-pointer"
                >
                  {creating ? 'Saving Rule...' : 'Create Alert Rule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
