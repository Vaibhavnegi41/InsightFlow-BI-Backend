import { executeQuery, getQueryHistory, saveQuery, getSavedQueries, analyzeQueryOptimization } from '../services/queryService.js';

export function runQuery(req, res) {
  try {
    const { sql, datasetId } = req.body;
    if (!sql || !sql.trim()) {
      return res.status(400).json({ error: 'SQL query text is required.' });
    }

    const userId = req.user ? req.user.id : 'guest_user';
    const result = executeQuery({ userId, datasetId, sql });

    return res.json(result);
  } catch (err) {
    console.error('Execute query error:', err);
    return res.status(400).json({
      status: 'FAILED',
      error: err.message || 'Error executing analytical SQL query.'
    });
  }
}

export function fetchQueryHistory(req, res) {
  try {
    const userId = req.user ? req.user.id : 'guest_user';
    const limit = parseInt(req.query.limit, 10) || 50;
    const history = getQueryHistory(userId, limit);
    return res.json({ history });
  } catch (err) {
    console.error('Fetch query history error:', err);
    return res.status(500).json({ error: 'Failed to retrieve query history.' });
  }
}

export function handleSaveQuery(req, res) {
  try {
    const { title, sql, datasetId } = req.body;
    if (!sql) {
      return res.status(400).json({ error: 'SQL query is required to save.' });
    }

    const userId = req.user ? req.user.id : 'guest_user';
    const saved = saveQuery({ userId, datasetId, title, sql });
    return res.status(201).json({ message: 'Query saved successfully', query: saved });
  } catch (err) {
    console.error('Save query error:', err);
    return res.status(500).json({ error: 'Failed to save query.' });
  }
}

export function fetchSavedQueries(req, res) {
  try {
    const userId = req.user ? req.user.id : 'guest_user';
    const saved = getSavedQueries(userId);
    return res.json({ queries: saved });
  } catch (err) {
    console.error('Fetch saved queries error:', err);
    return res.status(500).json({ error: 'Failed to retrieve saved queries.' });
  }
}

export function analyzeSql(req, res) {
  try {
    const { sql } = req.body;
    if (!sql) return res.status(400).json({ error: 'SQL query text is required.' });
    const analysis = analyzeQueryOptimization(sql);
    return res.json({ analysis });
  } catch (err) {
    return res.status(500).json({ error: 'Analysis failed.' });
  }
}
