import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KpiCard({ title, value, change, isPositive, prefix = '', suffix = '', subtitle, icon: Icon, color = 'indigo' }) {
  const colorMap = {
    indigo: 'from-indigo-500/10 to-indigo-500/0 border-indigo-500/20 text-indigo-400',
    emerald: 'from-emerald-500/10 to-emerald-500/0 border-emerald-500/20 text-emerald-400',
    violet: 'from-violet-500/10 to-violet-500/0 border-violet-500/20 text-violet-400',
    amber: 'from-amber-500/10 to-amber-500/0 border-amber-500/20 text-amber-400',
    rose: 'from-rose-500/10 to-rose-500/0 border-rose-500/20 text-rose-400',
    cyan: 'from-cyan-500/10 to-cyan-500/0 border-cyan-500/20 text-cyan-400',
  };

  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden bg-slate-900/60 border border-slate-800">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${colorMap[color]} rounded-bl-full pointer-events-none opacity-60`} />
      
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase">{title}</span>
        {Icon && (
          <div className={`p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 ${colorMap[color].split(' ').pop()}`}>
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="flex items-baseline space-x-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        {change !== undefined ? (
          <div className={`flex items-center space-x-1 font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
            <span>{isPositive ? '+' : ''}{change}%</span>
            <span className="text-slate-500 font-normal text-[11px] ml-1">vs prior period</span>
          </div>
        ) : (
          <span className="text-slate-500 text-[11px]">{subtitle || 'Aggregate Metric'}</span>
        )}
      </div>
    </div>
  );
}
