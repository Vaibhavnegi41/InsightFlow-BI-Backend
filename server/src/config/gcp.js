import dotenv from 'dotenv';
dotenv.config();

export const gcpConfig = {
  projectId: process.env.GCP_PROJECT_ID || '',
  keyFilename: process.env.GCP_KEYFILE || '',
  bucketName: process.env.GCP_BUCKET || 'insightflow-analytics-data',
  datasetId: process.env.BIGQUERY_DATASET || 'insightflow_analytics',
  isBigQueryEnabled: Boolean(process.env.GCP_PROJECT_ID && process.env.GCP_KEYFILE),
  geminiApiKey: process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || ''
};

export function getGcpStatus() {
  return {
    bigQuery: {
      enabled: gcpConfig.isBigQueryEnabled,
      projectId: gcpConfig.projectId || 'Local In-Memory Analytical Warehouse (Active)',
      datasetId: gcpConfig.datasetId,
      status: gcpConfig.isBigQueryEnabled ? 'Connected to BigQuery' : 'Local Fast SQL Analytical Warehouse Mode'
    },
    cloudStorage: {
      enabled: Boolean(gcpConfig.bucketName && gcpConfig.isBigQueryEnabled),
      bucket: gcpConfig.bucketName,
      status: gcpConfig.isBigQueryEnabled ? 'Connected to GCS' : 'Local Secure File Storage Mode'
    },
    aiEngine: {
      hasApiKey: Boolean(gcpConfig.geminiApiKey),
      engine: gcpConfig.geminiApiKey ? 'Gemini AI Live Engine' : 'Heuristic Business Analytics AI Engine'
    }
  };
}
