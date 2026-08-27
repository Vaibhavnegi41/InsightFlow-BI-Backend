import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { datasetsAPI } from '../services/api';
import { 
  Database, 
  UploadCloud, 
  FileText, 
  Trash2, 
  Eye, 
  Sparkles, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Plus,
  RefreshCw
} from 'lucide-react';

export default function DatasetsPage() {
  const navigate = useNavigate();
  const { datasets, activeDataset, setActiveDataset, refreshDatasets, loadingDatasets } = useData();
  const [uploading, setUploading] = useState(false);
  const [datasetName, setDatasetName] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadSuccess, setUploadSuccess] = useState(null);
  const [uploadError, setUploadError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      if (!datasetName) {
        setDatasetName(file.name.replace(/\.[^/.]+$/, ''));
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    try {
      setUploading(true);
      setUploadError(null);
      setUploadSuccess(null);

      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', datasetName || selectedFile.name);

      const res = await datasetsAPI.upload(formData);
      setUploadSuccess(`Dataset "${res.data.dataset.name}" ingested successfully with ${res.data.dataset.rowCount} records!`);
      setSelectedFile(null);
      setDatasetName('');
      await refreshDatasets();
    } catch (err) {
      console.error('Upload error:', err);
      setUploadError(err.response?.data?.error || 'Failed to upload dataset.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete dataset "${name}" and drop its analytical table?`)) {
      return;
    }

    try {
      await datasetsAPI.delete(id);
      await refreshDatasets();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete dataset');
    }
  };

  const handleSeedSample = async () => {
    try {
      setUploading(true);
      await datasetsAPI.seedSample();
      await refreshDatasets();
      setUploadSuccess('Loaded sample benchmark dataset successfully!');
    } catch (err) {
      setUploadError('Failed to load sample dataset.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Dataset Ingestion Pipeline</h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload CSV/JSON business records, validate schemas, and sync with analytical storage.
          </p>
        </div>

        <button
          onClick={handleSeedSample}
          disabled={uploading}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-xs shadow-lg shadow-indigo-500/20 transition-all flex items-center space-x-2 cursor-pointer self-start md:self-auto"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Load E-Commerce Benchmark Dataset</span>
        </button>
      </div>

      {/* Alerts */}
      {uploadSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{uploadSuccess}</span>
        </div>
      )}
      {uploadError && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Upload Box */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 bg-slate-900/40">
        <h2 className="text-sm font-bold text-white mb-3 flex items-center space-x-2">
          <UploadCloud className="w-4 h-4 text-indigo-400" />
          <span>Upload New Business Dataset</span>
        </h2>

        <form onSubmit={handleUpload} className="space-y-4">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                const file = e.dataTransfer.files[0];
                setSelectedFile(file);
                if (!datasetName) setDatasetName(file.name.replace(/\.[^/.]+$/, ''));
              }
            }}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
              isDragging
                ? 'border-indigo-500 bg-indigo-950/20'
                : 'border-slate-700/80 hover:border-indigo-500/50 bg-slate-950/40'
            }`}
            onClick={() => document.getElementById('file-upload-input').click()}
          >
            <input
              id="file-upload-input"
              type="file"
              accept=".csv,.json"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="flex flex-col items-center">
              <UploadCloud className="w-10 h-10 text-indigo-400 mb-2 animate-bounce" />
              <p className="text-xs font-semibold text-slate-200">
                {selectedFile ? selectedFile.name : 'Click to browse or drag and drop dataset file here'}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Supports CSV, JSON (Up to 50MB per file)</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="text"
              placeholder="Dataset Display Name (e.g., Q3 Regional Sales & Margin)"
              value={datasetName}
              onChange={(e) => setDatasetName(e.target.value)}
              className="flex-1 w-full bg-slate-950/70 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <button
              type="submit"
              disabled={!selectedFile || uploading}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center space-x-2 cursor-pointer ${
                selectedFile && !uploading
                  ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              {uploading ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Schema & Ingesting...</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ingest & Create Analytical Table</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Dataset List Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 bg-slate-900/40 overflow-hidden">
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center space-x-2">
            <Database className="w-4 h-4 text-indigo-400" />
            <span>Managed Business Datasets ({datasets.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-semibold bg-slate-950/40">
                <th className="py-3 px-4">Dataset Name</th>
                <th className="py-3 px-4">Format</th>
                <th className="py-3 px-4">Rows</th>
                <th className="py-3 px-4">Columns Detected</th>
                <th className="py-3 px-4">SQL Table Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {datasets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="py-8 text-center text-slate-500">
                    No datasets available. Upload a file above or click 'Load E-Commerce Benchmark Dataset'.
                  </td>
                </tr>
              ) : (
                datasets.map(ds => {
                  const isActive = activeDataset?.id === ds.id;
                  const cols = ds.columns || [];
                  return (
                    <tr
                      key={ds.id}
                      onClick={() => setActiveDataset(ds)}
                      className={`hover:bg-slate-800/40 transition-colors cursor-pointer ${isActive ? 'bg-indigo-950/30' : ''}`}
                    >
                      <td className="py-3 px-4 font-semibold text-slate-200">
                        <div className="flex items-center space-x-2">
                          <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                          <span className="truncate max-w-[200px]">{ds.name}</span>
                          {isActive && (
                            <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 text-[9px] font-bold">
                              ACTIVE
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                          {ds.file_type}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {(ds.row_count || ds.rowCount || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-400">
                        {cols.length} cols ({cols.slice(0, 3).map(c => c.clean).join(', ')}...)
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">
                        {ds.table_name}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold flex items-center space-x-1 w-max">
                          <CheckCircle className="w-3 h-3" />
                          <span>{ds.status || 'Processed'}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-[11px]">
                        {new Date(ds.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveDataset(ds);
                              navigate(`/datasets/${ds.id}`);
                            }}
                            title="Preview Schema & Data"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => handleDelete(ds.id, ds.name, e)}
                            title="Delete dataset"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
