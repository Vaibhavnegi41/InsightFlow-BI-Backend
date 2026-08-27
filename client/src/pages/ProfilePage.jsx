import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiAPI } from '../services/api';
import { 
  User, 
  Shield, 
  Cloud, 
  Database, 
  Bot, 
  CheckCircle2, 
  Server, 
  Award,
  Layers,
  HardDrive
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStatus() {
      try {
        setLoading(true);
        const res = await aiAPI.status();
        setStatus(res.data);
      } catch (err) {
        console.error('Failed to load status:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStatus();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">System Status & User Profile</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Overview of application session, BigQuery / GCS warehouse connectivity, and AI engines.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Card */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/40 space-y-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400 font-bold text-lg">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{user?.name}</h3>
              <p className="text-xs text-slate-400">{user?.email}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Assigned Persona:</span>
              <span className="font-semibold text-indigo-300">{user?.role || 'Business Analyst'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Session Auth:</span>
              <span className="font-mono text-emerald-400">JWT Verified</span>
            </div>
          </div>
        </div>

        {/* Cloud & Architecture Status */}
        <div className="lg:col-span-2 glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/40 space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <Cloud className="w-4 h-4 text-indigo-400" />
            <span>Analytical Architecture & Infrastructure</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            {/* Analytical Warehouse */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center space-x-2 text-slate-200 font-semibold">
                <Database className="w-4 h-4 text-indigo-400" />
                <span>Analytical Data Warehouse</span>
              </div>
              <p className="text-[11px] text-emerald-400 font-mono flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{status?.bigQuery?.status || 'Active In-Memory SQL Analytical Warehouse'}</span>
              </p>
              <p className="text-[10px] text-slate-500">Supports BigQuery Project credentials via env</p>
            </div>

            {/* Object Storage */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center space-x-2 text-slate-200 font-semibold">
                <HardDrive className="w-4 h-4 text-violet-400" />
                <span>Dataset Object Storage</span>
              </div>
              <p className="text-[11px] text-emerald-400 font-mono flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{status?.cloudStorage?.status || 'Active Secure File Pipeline'}</span>
              </p>
              <p className="text-[10px] text-slate-500">Google Cloud Storage bucket sync ready</p>
            </div>

            {/* AI Assistant Engine */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center space-x-2 text-slate-200 font-semibold">
                <Bot className="w-4 h-4 text-amber-400" />
                <span>AI Analytics Engine</span>
              </div>
              <p className="text-[11px] text-emerald-400 font-mono flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{status?.aiEngine?.engine || 'Heuristic Business Analytics AI Engine'}</span>
              </p>
              <p className="text-[10px] text-slate-500">Gemini LLM API or deterministic fallback</p>
            </div>

            {/* App Database */}
            <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
              <div className="flex items-center space-x-2 text-slate-200 font-semibold">
                <Server className="w-4 h-4 text-cyan-400" />
                <span>Application Metadata DB</span>
              </div>
              <p className="text-[11px] text-emerald-400 font-mono flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>SQLite (WAL Mode) / PostgreSQL Ready</span>
              </p>
              <p className="text-[10px] text-slate-500">Stores users, datasets, alerts, & history</p>
            </div>
          </div>
        </div>
      </div>

      {/* PRD Interview Positioning Overview Card */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/40 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center space-x-2">
          <Award className="w-4 h-4 text-indigo-400" />
          <span>Product Narrative & Pipeline Flow (PRD Section 2 & 18)</span>
        </h3>
        <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-indigo-300">
          <span className="px-2 py-1 bg-slate-900 rounded">Raw Data (CSV/JSON)</span>
          <span>→</span>
          <span className="px-2 py-1 bg-slate-900 rounded">SQL Pipeline</span>
          <span>→</span>
          <span className="px-2 py-1 bg-slate-900 rounded">Analytics & KPIs</span>
          <span>→</span>
          <span className="px-2 py-1 bg-slate-900 rounded">BI Dashboard</span>
          <span>→</span>
          <span className="px-2 py-1 bg-slate-900 rounded">Business Insights</span>
          <span>→</span>
          <span className="px-2 py-1 bg-slate-900 rounded">Alerts</span>
          <span>→</span>
          <span className="px-2 py-1 bg-indigo-900/50 text-white font-bold rounded">Decisions</span>
        </div>
      </div>
    </div>
  );
}
