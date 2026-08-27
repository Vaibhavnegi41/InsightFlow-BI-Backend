import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Database, 
  Bell, 
  Sparkles, 
  ChevronDown, 
  CheckCircle2, 
  AlertTriangle, 
  User, 
  LogOut,
  RefreshCw
} from 'lucide-react';

export default function Navbar() {
  const navigate = useNavigate();
  const { datasets, activeDataset, setActiveDataset, alertHistory, refreshDatasets } = useData();
  const { user, logout } = useAuth();
  const [showDatasetMenu, setShowDatasetMenu] = useState(false);
  const [showAlertMenu, setShowAlertMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshDatasets();
    setTimeout(() => setRefreshing(false), 500);
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#0B101B]/80 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between">
      {/* Active Dataset Selector */}
      <div className="flex items-center space-x-3">
        <div className="relative">
          <button
            onClick={() => setShowDatasetMenu(!showDatasetMenu)}
            className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/60 hover:border-indigo-500/50 transition-all text-xs font-medium text-slate-200"
          >
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span className="max-w-[200px] truncate">
              {activeDataset ? activeDataset.name : 'Select Dataset...'}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showDatasetMenu && (
            <div className="absolute left-0 mt-2 w-72 bg-[#111827] border border-slate-700 rounded-xl shadow-2xl py-2 z-50">
              <div className="px-3 py-1 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                Switch Active Analytical Dataset
              </div>
              <div className="max-h-60 overflow-y-auto">
                {datasets.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-slate-400 text-center">No datasets uploaded yet</div>
                ) : (
                  datasets.map(ds => (
                    <button
                      key={ds.id}
                      onClick={() => {
                        setActiveDataset(ds);
                        setShowDatasetMenu(false);
                      }}
                      className={`w-full text-left px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-800/80 transition-colors ${activeDataset?.id === ds.id ? 'bg-indigo-950/40 text-indigo-300' : 'text-slate-300'}`}
                    >
                      <div className="truncate pr-2">
                        <div className="text-xs font-medium truncate">{ds.name}</div>
                        <div className="text-[10px] text-slate-400">{ds.row_count || ds.rowCount} records • {ds.file_type}</div>
                      </div>
                      {activeDataset?.id === ds.id && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                    </button>
                  ))
                )}
              </div>
              <div className="border-t border-slate-800 mt-1 pt-1 px-2">
                <button
                  onClick={() => {
                    setShowDatasetMenu(false);
                    navigate('/datasets');
                  }}
                  className="w-full text-center py-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium cursor-pointer"
                >
                  + Upload New Dataset
                </button>
              </div>
            </div>
          )}
        </div>

        <button 
          onClick={handleRefresh}
          title="Refresh dataset records"
          className="p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-400' : ''}`} />
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center space-x-3.5">
        {/* Ask AI Quick Trigger */}
        <button
          onClick={() => navigate('/ai-assistant')}
          className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-medium shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Ask AI Analyst</span>
        </button>

        {/* Notifications & Triggered Alerts */}
        <div className="relative">
          <button
            onClick={() => setShowAlertMenu(!showAlertMenu)}
            className="relative p-2 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-300 transition-all cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {alertHistory && alertHistory.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-bold flex items-center justify-center animate-bounce">
                {alertHistory.length}
              </span>
            )}
          </button>

          {showAlertMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-[#111827] border border-slate-700 rounded-xl shadow-2xl p-2 z-50">
              <div className="flex items-center justify-between px-2 py-1.5 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-200">Triggered Business Alerts</span>
                <button
                  onClick={() => {
                    setShowAlertMenu(false);
                    navigate('/alerts');
                  }}
                  className="text-[11px] text-indigo-400 hover:underline cursor-pointer"
                >
                  View Rules
                </button>
              </div>
              <div className="max-h-64 overflow-y-auto mt-1 space-y-1">
                {(!alertHistory || alertHistory.length === 0) ? (
                  <div className="p-4 text-center text-xs text-slate-400">All business KPIs are within normal operational thresholds.</div>
                ) : (
                  alertHistory.map((item, idx) => (
                    <div key={item.id || idx} className="p-2 rounded-lg bg-slate-900/90 border border-rose-900/40 text-xs">
                      <div className="flex items-center space-x-1.5 text-rose-400 font-semibold mb-1">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.alert_name || 'KPI Threshold Breach'}</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-snug">{item.message}</p>
                      <div className="mt-1 text-[9px] text-slate-500">
                        {new Date(item.triggered_at).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-2 p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-medium cursor-pointer"
          >
            <div className="w-6 h-6 rounded-md bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-semibold text-[11px]">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="hidden sm:inline max-w-[100px] truncate">{user?.name || 'Analyst'}</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-[#111827] border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50">
              <div className="px-3 py-2 border-b border-slate-800">
                <div className="text-xs font-semibold text-slate-200">{user?.name}</div>
                <div className="text-[10px] text-slate-400 truncate">{user?.email}</div>
                <div className="text-[9px] font-medium text-indigo-400 mt-0.5">{user?.role}</div>
              </div>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  navigate('/profile');
                }}
                className="w-full text-left px-3 py-2 text-xs text-slate-300 hover:bg-slate-800 flex items-center space-x-2 cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span>Profile & System Status</span>
              </button>
              <button
                onClick={() => {
                  setShowUserMenu(false);
                  logout();
                  navigate('/login');
                }}
                className="w-full text-left px-3 py-2 text-xs text-rose-400 hover:bg-rose-950/30 flex items-center space-x-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
