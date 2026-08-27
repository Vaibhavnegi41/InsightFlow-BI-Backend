import axios from 'axios';

const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach token to outgoing requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('insightflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout')
};

export const datasetsAPI = {
  list: () => api.get('/datasets'),
  getById: (id) => api.get(`/datasets/${id}`),
  upload: (formData) => api.post('/datasets/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  delete: (id) => api.delete(`/datasets/${id}`),
  seedSample: () => api.post('/datasets/seed')
};

export const queryAPI = {
  execute: (data) => api.post('/query/execute', data),
  history: (limit) => api.get(`/query/history?limit=${limit || 50}`),
  save: (data) => api.post('/query/save', data),
  saved: () => api.get('/query/saved'),
  analyze: (data) => api.post('/query/analyze', data)
};

export const analyticsAPI = {
  getKpis: (params) => api.get('/analytics/kpis', { params }),
  getRevenue: (params) => api.get('/analytics/revenue', { params }),
  getProfit: (params) => api.get('/analytics/profit', { params }),
  getProducts: (params) => api.get('/analytics/products', { params }),
  getRegions: (params) => api.get('/analytics/regions', { params })
};

export const insightsAPI = {
  list: (datasetId) => api.get('/insights', { params: { datasetId } }),
  generate: (datasetId) => api.post('/insights/generate', { datasetId })
};

export const alertsAPI = {
  list: () => api.get('/alerts'),
  create: (data) => api.post('/alerts', data),
  update: (id, data) => api.patch(`/alerts/${id}`, data),
  delete: (id) => api.delete(`/alerts/${id}`),
  history: () => api.get('/alerts/history'),
  evaluate: () => api.post('/alerts/evaluate')
};

export const aiAPI = {
  ask: (data) => api.post('/ai/ask', data),
  status: () => api.get('/ai/status')
};

export default api;
