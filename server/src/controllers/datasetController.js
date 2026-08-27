import db from '../config/db.js';
import { processUploadedDataset, seedDefaultDataset } from '../services/dataPipeline.js';
import { generateBusinessInsights } from '../services/insightService.js';
import { evaluateAlerts } from '../services/alertService.js';

export async function uploadDataset(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Please select a CSV or JSON file to upload.' });
    }

    const userId = req.user ? req.user.id : 'guest_user';
    const datasetName = req.body.name || req.file.originalname.replace(/\.[^/.]+$/, '');

    const dataset = await processUploadedDataset(req.file, userId, datasetName);

    // Automatically generate initial insights and evaluate alerts for the new dataset
    try {
      generateBusinessInsights(dataset.id);
      evaluateAlerts();
    } catch (e) {
      console.warn('Auto-generation on upload error:', e);
    }

    return res.status(201).json({
      message: 'Dataset uploaded and ingested successfully',
      dataset
    });
  } catch (err) {
    console.error('Dataset upload error:', err);
    return res.status(500).json({ error: err.message || 'Failed to process dataset upload.' });
  }
}

export function listDatasets(req, res) {
  try {
    const datasets = db.prepare(`
      SELECT id, user_id, name, file_name, file_type, row_count, table_name, status, columns_json, created_at
      FROM datasets
      ORDER BY created_at DESC
    `).all();

    const formatted = datasets.map(d => ({
      ...d,
      columns: JSON.parse(d.columns_json || '[]')
    }));

    return res.json({ datasets: formatted });
  } catch (err) {
    console.error('List datasets error:', err);
    return res.status(500).json({ error: 'Failed to retrieve datasets.' });
  }
}

export function getDatasetById(req, res) {
  try {
    const { id } = req.params;
    const dataset = db.prepare(`
      SELECT * FROM datasets WHERE id = ?
    `).get(id);

    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found.' });
    }

    const columns = JSON.parse(dataset.columns_json || '[]');

    // Fetch first 50 sample records for preview
    let previewData = [];
    try {
      previewData = db.prepare(`SELECT * FROM "${dataset.table_name}" LIMIT 50`).all();
    } catch (e) {
      console.error('Error fetching preview data:', e);
    }

    return res.json({
      dataset: {
        ...dataset,
        columns,
        previewData
      }
    });
  } catch (err) {
    console.error('Get dataset error:', err);
    return res.status(500).json({ error: 'Failed to retrieve dataset details.' });
  }
}

export function deleteDataset(req, res) {
  try {
    const { id } = req.params;
    const dataset = db.prepare('SELECT * FROM datasets WHERE id = ?').get(id);
    if (!dataset) {
      return res.status(404).json({ error: 'Dataset not found.' });
    }

    // Drop table
    try {
      db.exec(`DROP TABLE IF EXISTS "${dataset.table_name}";`);
    } catch (dropErr) {
      console.warn('Drop table error:', dropErr);
    }

    // Delete metadata
    db.prepare('DELETE FROM datasets WHERE id = ?').run(id);

    return res.json({ message: 'Dataset and associated table deleted successfully.', id });
  } catch (err) {
    console.error('Delete dataset error:', err);
    return res.status(500).json({ error: 'Failed to delete dataset.' });
  }
}

export function seedSampleDataset(req, res) {
  try {
    const userId = req.user ? req.user.id : 'guest_user';
    const datasetId = seedDefaultDataset(userId);
    generateBusinessInsights(datasetId);
    evaluateAlerts();

    const dataset = db.prepare('SELECT * FROM datasets WHERE id = ?').get(datasetId);

    return res.status(201).json({
      message: 'Sample E-Commerce dataset loaded successfully',
      dataset: {
        ...dataset,
        columns: JSON.parse(dataset.columns_json || '[]')
      }
    });
  } catch (err) {
    console.error('Seed dataset error:', err);
    return res.status(500).json({ error: 'Failed to seed sample dataset.' });
  }
}
