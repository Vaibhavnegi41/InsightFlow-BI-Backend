import { getInsights, generateBusinessInsights } from '../services/insightService.js';

export function fetchInsights(req, res) {
  try {
    const { datasetId } = req.query;
    const insights = getInsights(datasetId);
    return res.json({ insights });
  } catch (err) {
    console.error('Fetch insights error:', err);
    return res.status(500).json({ error: 'Failed to retrieve business insights.' });
  }
}

export function triggerGenerateInsights(req, res) {
  try {
    const { datasetId } = req.body;
    const insights = generateBusinessInsights(datasetId);
    return res.status(201).json({
      message: 'Business insights regenerated successfully',
      insights
    });
  } catch (err) {
    console.error('Generate insights error:', err);
    return res.status(500).json({ error: 'Failed to generate business insights.' });
  }
}
