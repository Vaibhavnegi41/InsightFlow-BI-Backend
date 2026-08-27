import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  Terminal, 
  History, 
  BarChart3, 
  Lightbulb, 
  BellRing, 
  Bot, 
  Settings, 
  Flame 
} from 'lucide-react';

export default function Sidebar() {
  const menuItems = [
    { path: '/dashboard', label: 'Executive Dashboard', icon: LayoutDashboard, badge: 'Live' },
    { path: '/datasets', label: 'Dataset Manager', icon: Database },
    { path: '/query-editor', label: 'SQL Query Editor', icon: Terminal },
    { path: '/query-history', label: 'Query History', icon: History },
    { path: '/analytics', label: 'Deep Analytics', icon: BarChart3 },
    { path: '/insights', label: 'Business Insights', icon: Lightbulb, badge: 'AI' },
    { path: '/alerts', label: 'Alerts & Rules', icon: BellRing },
    { path: '/ai-assistant', label: 'AI Data Assistant', icon: Bot, highlight: true },
    { path: '/profile', label: 'Settings & Status', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#0B0F19] border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div>
        <NavLink to="/dashboard" className="h-16 px-6 flex items-center space-x-3 border-b border-slate-800/80 hover:bg-slate-900/30 transition-colors">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Flame className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              InsightFlow
            </div>
            <div className="text-[10px] text-indigo-400 font-medium tracking-wider uppercase">
              Analytics & BI Engine
            </div>
          </div>
        </NavLink>

        {/* Navigation links */}
        <nav className="p-3.5 space-y-1">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 border border-indigo-500/30 shadow-inner'
                    : item.highlight
                    ? 'bg-gradient-to-r from-indigo-950/40 to-violet-950/40 text-slate-300 border border-indigo-500/20 hover:border-indigo-500/40 hover:text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wide ${
                    item.badge === 'Live'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-[#070A12]">
        <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-300 mb-1.5">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Analytical Engine</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">SQLite/BQ</span>
          </div>
          <p className="text-[10px] text-slate-500 leading-tight">
            Fast in-process SQL execution pipeline with CTE & window function support.
          </p>
        </div>
      </div>
    </aside>
  );
}
