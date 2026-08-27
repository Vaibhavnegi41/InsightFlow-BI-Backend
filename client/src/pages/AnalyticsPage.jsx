import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { analyticsAPI } from '../services/api';
import { 
  BarChart3, 
  Users, 
  Package, 
  Percent, 
  ArrowUpDown, 
  DollarSign, 
  ShoppingBag,
  TrendingUp
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ScatterChart, Scatter, ZAxis, Legend 
} from 'recharts';

export default function AnalyticsPage() {
  const { activeDataset } = useData();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const res = await analyticsAPI.getKpis({ datasetId: activeDataset?.id });
        setAnalytics(res.data);
      } catch (err) {
        console.error('Failed to load deep analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, [activeDataset]);

  const topProducts = analytics?.topProducts || [];
  const customerSegments = analytics?.customerSegments || [];
  const categoryBreakdown = analytics?.categoryBreakdown || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2.5">
            <BarChart3 className="w-6 h-6 text-indigo-400" />
            <span>Deep Unit Economics & Product Analytics</span>
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Multi-dimensional analysis of product margins, discounting elasticity, and customer buyer segments.
          </p>
        </div>
      </div>

      {/* Customer Segment Breakdown & Margin Scatter */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Segments Performance */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/40">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center space-x-2">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Customer Buyer Segments & Spend Velocity</span>
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">Revenue distribution across enterprise and direct consumers</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={customerSegments} margin={{ top: 10, right: 10, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="customer_segment" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Total Revenue']}
                />
                <Bar dataKey="total_revenue" name="Revenue ($)" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Margin vs Revenue Comparison */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/40">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center space-x-2">
            <Percent className="w-4 h-4 text-emerald-400" />
            <span>Profit Margin % by Category</span>
          </h3>
          <p className="text-[11px] text-slate-400 mb-4">Margin resilience across key product lines</p>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="category" stroke="#64748b" tick={{ fontSize: 10 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(val) => [`${val}%`, 'Profit Margin']}
                />
                <Bar dataKey="margin_pct" name="Margin %" fill="#10b981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Complete Product Catalog Performance Grid */}
      <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Package className="w-4 h-4 text-indigo-400" />
            <span>Product Catalog Profitability & Discount Elasticity ({topProducts.length} Items)</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-semibold bg-slate-950/50">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Units Sold</th>
                <th className="py-3 px-4 text-right">Avg Discount</th>
                <th className="py-3 px-4 text-right">Gross Revenue</th>
                <th className="py-3 px-4 text-right">Net Profit</th>
                <th className="py-3 px-4 text-right">Margin %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {topProducts.map((prod, idx) => (
                <tr key={idx} className="hover:bg-slate-800/30 transition-colors font-sans">
                  <td className="py-3 px-4 font-semibold text-slate-200">{prod.product_name}</td>
                  <td className="py-3 px-4 text-slate-400 text-xs font-mono">{prod.category}</td>
                  <td className="py-3 px-4 text-right font-mono text-slate-300">{prod.total_units_sold}</td>
                  <td className="py-3 px-4 text-right font-mono text-amber-400">{prod.avg_discount_pct}%</td>
                  <td className="py-3 px-4 text-right font-mono font-semibold text-white">${Number(prod.total_revenue).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-mono text-emerald-400">${Number(prod.total_profit).toLocaleString()}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">{prod.margin_pct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
