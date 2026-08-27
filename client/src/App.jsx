import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Layout from './components/layout/Layout';

// Pages matching PRD Section 11
import DashboardPage from './pages/DashboardPage';
import DatasetsPage from './pages/DatasetsPage';
import DatasetDetailPage from './pages/DatasetDetailPage';
import QueryEditorPage from './pages/QueryEditorPage';
import QueryHistoryPage from './pages/QueryHistoryPage';
import AnalyticsPage from './pages/AnalyticsPage';
import InsightsPage from './pages/InsightsPage';
import AlertsPage from './pages/AlertsPage';
import AiAssistantPage from './pages/AiAssistantPage';
import ProfilePage from './pages/ProfilePage';
import AuthPage from './pages/AuthPage';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D16] flex items-center justify-center text-indigo-400">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Routes>
      {/* Standalone Authentication Routes */}
      <Route path="/login" element={<AuthPage isRegister={false} />} />
      <Route path="/register" element={<AuthPage isRegister={true} />} />

      {/* Main Authenticated Layout Routes */}
      <Route
        path="/*"
        element={
          <Layout>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/datasets" element={<DatasetsPage />} />
              <Route path="/datasets/:id" element={<DatasetDetailPage />} />
              <Route path="/query-editor" element={<QueryEditorPage />} />
              <Route path="/query-history" element={<QueryHistoryPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/insights" element={<InsightsPage />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/ai-assistant" element={<AiAssistantPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Layout>
        }
      />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DataProvider>
          <AppRoutes />
        </DataProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
