import { getAlertRules, createAlertRule, updateAlertRule, deleteAlertRule, getAlertHistory, evaluateAlerts } from '../services/alertService.js';

export function listAlerts(req, res) {
  try {
    const userId = req.user ? req.user.id : 'guest_user';
    const alerts = getAlertRules(userId);
    return res.json({ alerts });
  } catch (err) {
    console.error('List alerts error:', err);
    return res.status(500).json({ error: 'Failed to retrieve alert rules.' });
  }
}

export function createAlert(req, res) {
  try {
    const { name, metric, condition, threshold, frequency, datasetId } = req.body;
    if (!name || !metric || !condition || threshold === undefined) {
      return res.status(400).json({ error: 'Name, metric, condition, and threshold are required.' });
    }

    const userId = req.user ? req.user.id : 'guest_user';
    const rule = createAlertRule({ userId, datasetId, name, metric, condition, threshold, frequency });
    return res.status(201).json({ message: 'Alert rule created successfully', alert: rule });
  } catch (err) {
    console.error('Create alert error:', err);
    return res.status(500).json({ error: 'Failed to create alert rule.' });
  }
}

export function patchAlert(req, res) {
  try {
    const { id } = req.params;
    const result = updateAlertRule(id, req.body);
    if (result.error) return res.status(400).json({ error: result.error });

    return res.json({ message: 'Alert updated successfully', result });
  } catch (err) {
    console.error('Update alert error:', err);
    return res.status(500).json({ error: 'Failed to update alert.' });
  }
}

export function removeAlert(req, res) {
  try {
    const { id } = req.params;
    const result = deleteAlertRule(id);
    return res.json({ message: 'Alert rule deleted successfully', result });
  } catch (err) {
    console.error('Delete alert error:', err);
    return res.status(500).json({ error: 'Failed to delete alert rule.' });
  }
}

export function listAlertHistory(req, res) {
  try {
    const limit = parseInt(req.query.limit, 10) || 30;
    const history = getAlertHistory(limit);
    return res.json({ history });
  } catch (err) {
    console.error('List alert history error:', err);
    return res.status(500).json({ error: 'Failed to retrieve alert history.' });
  }
}

export function triggerEvaluateAlerts(req, res) {
  try {
    const triggered = evaluateAlerts();
    return res.json({ message: 'Alerts evaluated', triggered });
  } catch (err) {
    return res.status(500).json({ error: 'Evaluation failed.' });
  }
}
