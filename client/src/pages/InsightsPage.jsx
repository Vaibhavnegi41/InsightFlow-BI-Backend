import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { insightsAPI } from '../services/api';
import { 
  Lightbulb, 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw,
  Target,
  ShieldAlert,
  Zap
} from 'lucide-react';

export default function InsightsPage() {
  const { activeDataset } = useData();
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const loadInsights = async () => {
    try {
      setLoading(true);
      const res = await insightsAPI.list(activeDataset?.id);
      setInsights(res.data.insights || []);
    } catch (err) {
      console.error('Failed to fetch insights:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [activeDataset]);

  const handleRegenerate = async () => {
    try {
      setGenerating(true);
      const res = await insightsAPI.generate(activeDataset?.id);
      setInsights(res.data.insights || []);
    } catch (err) {
      console.error('Error generating insights:', err);
    } finally {
      setGenerating(false);
    }
  };

  const getImpactBadge = (level) => {
    switch (level) {
      case 'HIGH':
        return 'bg-rose-500/10 text-rose-300 border-rose-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/10 text-amber-300 border-amber-500/30';
      default:
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center space-x-2.5">
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Structured Business Insights</h1>
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-[10px] font-semibold flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>5-Stage Cognitive Framework</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Structured analysis: <strong className="text-indigo-300">Metric → Trend → Root Cause → Business Impact → Recommendation</strong>
          </p>
        </div>

        <button
          onClick={handleRegenerate}
          disabled={generating}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/20 flex items-center space-x-2 transition-all cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${generating ? 'animate-spin' : ''}`} />
          <span>{generating ? 'Synthesizing...' : 'Regenerate Insights'}</span>
        </button>
      </div>

      {/* Structured Insights Cards Feed */}
      <div className="space-y-5">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Synthesizing statistical and AI business insights...</div>
        ) : insights.length === 0 ? (
          <div className="glass-panel p-8 text-center rounded-2xl border border-slate-800 text-slate-400 text-xs">
            No insights generated yet. Click 'Regenerate Insights' to analyze the active dataset.
          </div>
        ) : (
          insights.map((item, idx) => (
            <div key={item.id || idx} className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/40 hover:border-indigo-500/40 transition-all space-y-4 shadow-lg">
              {/* Insight Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 rounded-xl bg-indigo-950/60 border border-indigo-500/30 text-indigo-400">
                    <Lightbulb className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.metric}</h3>
                    <span className="text-[10px] text-slate-400 font-mono">Category: {item.category || 'General'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getImpactBadge(item.impact_level)}`}>
                    {item.impact_level} IMPACT
                  </span>
                </div>
              </div>

              {/* 5-Part Breakdown Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                {/* 1. Trend */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center space-x-1.5 text-indigo-300 font-semibold text-[11px] uppercase tracking-wider">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Observed Metric Trend</span>
                  </div>
                  <p className="text-slate-200 leading-relaxed">{item.trend}</p>
                </div>

                {/* 2. Root Cause */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center space-x-1.5 text-amber-300 font-semibold text-[11px] uppercase tracking-wider">
                    <Target className="w-3.5 h-3.5 text-amber-400" />
                    <span>Identified Root Cause</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{item.root_cause}</p>
                </div>

                {/* 3. Business Impact */}
                <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
                  <div className="flex items-center space-x-1.5 text-rose-300 font-semibold text-[11px] uppercase tracking-wider">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    <span>Business Impact</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{item.business_impact}</p>
                </div>

                {/* 4. Strategic Recommendation */}
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-indigo-950/50 to-slate-950/60 border border-indigo-500/30 space-y-1">
                  <div className="flex items-center space-x-1.5 text-emerald-300 font-semibold text-[11px] uppercase tracking-wider">
                    <Zap className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Actionable Recommendation</span>
                  </div>
                  <p className="text-emerald-100 leading-relaxed font-medium">{item.recommendation}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
