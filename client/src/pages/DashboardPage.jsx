import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { analyticsAPI, datasetsAPI } from '../services/api';
import KpiCard from '../components/common/KpiCard';
import { 
  DollarSign, 
  TrendingUp, 
  ShoppingCart, 
  Users, 
  Percent, 
  CreditCard,
  Filter,
  Sparkles,
  ArrowUpRight,
  Database,
  Layers,
  Globe2,
  Package
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b'];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { activeDataset, datasets, refreshDatasets } = useData();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedRegion, setSelectedRegion] = useState('All');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await analyticsAPI.getKpis({
        datasetId: activeDataset?.id,
        category: selectedCategory,
        region: selectedRegion
      });
      setAnalytics(res.data);
    } catch (err) {
      console.error('Error fetching dashboard analytics:', err);
      setError(err.response?.data?.error || 'Failed to load KPI metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [activeDataset, selectedCategory, selectedRegion]);

  const handleSeedDataset = async () => {
    try {
      setLoading(true);
      await datasetsAPI.seedSample();
      await refreshDatasets();
    } catch (err) {
      console.error('Failed to load sample dataset:', err);
    }
  };

  if (!activeDataset && datasets.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center glass-panel rounded-2xl border border-slate-800 my-10">
        <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 mb-4 animate-bounce">
          <Database className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white mb-2">No Datasets Ingested Yet</h2>
        <p className="text-sm text-slate-400 max-w-md mb-6">
          Upload a CSV or JSON dataset or load our curated multi-month e-commerce benchmark data to explore KPIs, SQL queries, and AI insights.
        </p>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleSeedDataset}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/30 transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Load Sample E-Commerce Dataset</span>
          </button>
          <button
            onClick={() => navigate('/datasets')}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-all cursor-pointer"
          >
            Upload Custom File
          </button>
        </div>
      </div>
    );
  }

  const kpis = analytics?.kpis || {};
  const monthlyTrends = analytics?.monthlyTrends || [];
  const categoryBreakdown = analytics?.categoryBreakdown || [];
  const regionalBreakdown = analytics?.regionalBreakdown || [];
  const topProducts = analytics?.topProducts || [];

  return (
    <div className="space-y-6">
      {/* Header & Filter Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Executive BI Dashboard</h1>
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-semibold">
              Live Analytical Warehouse
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Active Dataset: <span className="font-semibold text-slate-200">{activeDataset?.name}</span> ({analytics?.dataset?.rowCount || activeDataset?.row_count || 0} records evaluated)
          </p>
        </div>

        {/* Global Filter Bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-500 text-[11px]">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Categories</option>
              <option value="Electronics" className="bg-slate-900">Electronics</option>
              <option value="Fashion & Apparel" className="bg-slate-900">Fashion & Apparel</option>
              <option value="Home & Living" className="bg-slate-900">Home & Living</option>
              <option value="Office & Supplies" className="bg-slate-900">Office & Supplies</option>
            </select>
          </div>

          <div className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <Globe2 className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-slate-500 text-[11px]">Region:</span>
            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="bg-transparent text-xs text-slate-200 outline-none cursor-pointer"
            >
              <option value="All" className="bg-slate-900">All Regions</option>
              <option value="North America (US-East)" className="bg-slate-900">US-East</option>
              <option value="North America (US-West)" className="bg-slate-900">US-West</option>
              <option value="Europe (EU-Central)" className="bg-slate-900">EU-Central</option>
              <option value="Asia Pacific (APAC-South)" className="bg-slate-900">APAC-South</option>
            </select>
          </div>

          <button
            onClick={() => navigate('/query-editor')}
            className="px-3 py-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600/30 text-xs font-medium flex items-center space-x-1.5 transition-all cursor-pointer"
          >
            <span>Custom SQL</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Gross Revenue"
          value={kpis.totalRevenue || 0}
          prefix="$"
          change={kpis.growth?.revenue}
          isPositive={(kpis.growth?.revenue || 0) >= 0}
          icon={DollarSign}
          color="indigo"
        />
        <KpiCard
          title="Net Operating Profit"
          value={kpis.totalProfit || 0}
          prefix="$"
          change={kpis.growth?.profit}
          isPositive={(kpis.growth?.profit || 0) >= 0}
          icon={TrendingUp}
          color="emerald"
        />
        <KpiCard
          title="Blended Profit Margin"
          value={kpis.profitMargin || 0}
          suffix="%"
          subtitle="Net Profit / Total Revenue"
          icon={Percent}
          color="violet"
        />
        <KpiCard
          title="Average Order Value (AOV)"
          value={kpis.averageOrderValue || 0}
          prefix="$"
          subtitle={`${kpis.totalOrders || 0} total transactions`}
          icon={CreditCard}
          color="amber"
        />
      </div>

      {/* Primary Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue & Profit Area Trends (2 Columns) */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <span>Revenue & Profit Trajectory</span>
              </h3>
              <p className="text-[11px] text-slate-400">Monthly breakdown aggregated via analytical SQL</p>
            </div>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-300">
              GROUP BY SUBSTR(order_date, 1, 7)
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0}/>
                  </linearGradient>
                  <linearGradient id="colorProf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="month" stroke="#64748b" tick={{ fontSize: 11 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, '']}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="revenue" name="Gross Revenue" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="profit" name="Net Profit" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorProf)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Revenue Distribution (1 Column) */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/50 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                <span>Sales by Category</span>
              </h3>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">Product line share & margins</p>
          </div>

          <div className="h-56 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryBreakdown}
                  dataKey="revenue"
                  nameKey="category"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                >
                  {categoryBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 mt-2">
            {categoryBreakdown.map((cat, idx) => (
              <div key={cat.category} className="flex items-center justify-between text-xs py-1 border-b border-slate-800/60 last:border-0">
                <div className="flex items-center space-x-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="text-slate-300 truncate max-w-[120px]">{cat.category}</span>
                </div>
                <div className="flex items-center space-x-2 text-right">
                  <span className="font-semibold text-white">${Number(cat.revenue).toLocaleString()}</span>
                  <span className="text-[10px] text-emerald-400 font-mono">({cat.margin_pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Regional & Top Products Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Regional Performance Bar Chart */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Globe2 className="w-4 h-4 text-indigo-400" />
                <span>Geographic Territory Performance</span>
              </h3>
              <p className="text-[11px] text-slate-400">Revenue & customer count by territory</p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                <XAxis dataKey="region" stroke="#64748b" tick={{ fontSize: 10 }} angle={-15} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fontSize: 11 }} tickFormatter={(v) => `$${v >= 1000 ? (v/1000).toFixed(0) + 'k' : v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#111827', borderColor: '#374151', borderRadius: '0.75rem', fontSize: '12px' }}
                  formatter={(val) => [`$${Number(val).toLocaleString()}`, 'Revenue']}
                />
                <Bar dataKey="revenue" name="Territory Revenue" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 5 Flagship Products Table */}
        <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <Package className="w-4 h-4 text-violet-400" />
                <span>Top Revenue Products</span>
              </h3>
              <p className="text-[11px] text-slate-400">High-volume merchandise & margins</p>
            </div>
            <button
              onClick={() => navigate('/analytics')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
            >
              View Full Catalog →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-semibold">
                  <th className="pb-2.5">Product SKU</th>
                  <th className="pb-2.5">Category</th>
                  <th className="pb-2.5 text-right">Units</th>
                  <th className="pb-2.5 text-right">Revenue</th>
                  <th className="pb-2.5 text-right">Margin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {topProducts.slice(0, 5).map((prod, idx) => (
                  <tr key={prod.product_name || idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 font-medium text-slate-200 max-w-[150px] truncate">{prod.product_name}</td>
                    <td className="py-2.5 text-slate-400 text-[11px]">{prod.category}</td>
                    <td className="py-2.5 text-right text-slate-300 font-mono">{prod.total_units_sold}</td>
                    <td className="py-2.5 text-right font-semibold text-white font-mono">${Number(prod.total_revenue).toLocaleString()}</td>
                    <td className="py-2.5 text-right text-emerald-400 font-mono font-medium">{prod.margin_pct}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
