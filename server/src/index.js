import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import { initDatabase } from './config/db.js';
import { seedDefaultDataset } from './services/dataPipeline.js';
import { seedDefaultAlerts } from './services/alertService.js';
import { generateBusinessInsights } from './services/insightService.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import datasetRoutes from './routes/datasetRoutes.js';
import queryRoutes from './routes/queryRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import alertRoutes from './routes/alertRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static files for uploads if needed
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

// Root Endpoint for Render health check
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    service: 'InsightFlow Backend API',
    health: '/api/health'
  });
});

// Mount API Routes matching PRD
app.use('/api/auth', authRoutes);
app.use('/api/datasets', datasetRoutes);
app.use('/api/query', queryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/insights', insightRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/ai', aiRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    platform: 'InsightFlow — AI-Powered Business Analytics & Intelligence Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[InsightFlow Server Error]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error occurred.',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Bootstrap Database and Seed Initial Data
try {
  initDatabase();
  const defaultDatasetId = seedDefaultDataset('demo_user');
  seedDefaultAlerts('demo_user', defaultDatasetId);
  generateBusinessInsights(defaultDatasetId);
} catch (initErr) {
  console.error('Initialization error during startup:', initErr);
}

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 InsightFlow API Server is running on port ${PORT}`);
  console.log(`📊 Endpoints: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
