import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { computeKpis, getActiveDataset } from './analyticsService.js';

export function getAlertRules(userId) {
  const stmt = db.prepare(`
    SELECT a.*, d.name as dataset_name
    FROM alerts a
    LEFT JOIN datasets d ON a.dataset_id = d.id
    ORDER BY a.created_at DESC
  `);
  return stmt.all();
}

export function createAlertRule({ userId, datasetId, name, metric, condition, threshold, frequency }) {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO alerts (id, user_id, dataset_id, name, metric, condition, threshold, frequency, enabled)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)
  `);

  stmt.run(
    id,
    userId || 'guest_user',
    datasetId || null,
    name,
    metric,
    condition, // 'GREATER_THAN', 'LESS_THAN', 'EQUALS', 'DROP_PCT', 'INCREASE_PCT'
    parseFloat(threshold),
    frequency || 'Daily'
  );

  // Evaluate immediately to populate history if triggered
  evaluateAlerts();

  return { id, name, metric, condition, threshold, frequency, enabled: 1 };
}

export function updateAlertRule(id, updates) {
  const fields = [];
  const values = [];

  if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
  if (updates.metric !== undefined) { fields.push('metric = ?'); values.push(updates.metric); }
  if (updates.condition !== undefined) { fields.push('condition = ?'); values.push(updates.condition); }
  if (updates.threshold !== undefined) { fields.push('threshold = ?'); values.push(parseFloat(updates.threshold)); }
  if (updates.frequency !== undefined) { fields.push('frequency = ?'); values.push(updates.frequency); }
  if (updates.enabled !== undefined) { fields.push('enabled = ?'); values.push(updates.enabled ? 1 : 0); }

  if (fields.length === 0) return { error: 'No fields to update' };

  values.push(id);
  const sql = `UPDATE alerts SET ${fields.join(', ')} WHERE id = ?`;
  db.prepare(sql).run(...values);

  evaluateAlerts();
  return { success: true, id };
}

export function deleteAlertRule(id) {
  db.prepare('DELETE FROM alerts WHERE id = ?').run(id);
  return { success: true, id };
}

export function getAlertHistory(limit = 30) {
  const stmt = db.prepare(`
    SELECT * FROM alert_history
    ORDER BY triggered_at DESC
    LIMIT ?
  `);
  return stmt.all(limit);
}

export function evaluateAlerts() {
  const rules = db.prepare("SELECT * FROM alerts WHERE enabled = 1").all();
  if (!rules || rules.length === 0) return [];

  const dataset = getActiveDataset();
  if (!dataset) return [];

  const analytics = computeKpis({ datasetId: dataset.id });
  if (analytics.error) return [];

  const { kpis } = analytics;
  const triggeredList = [];

  for (const rule of rules) {
    let currentValue = 0;

    switch (rule.metric) {
      case 'profit_margin':
        currentValue = kpis.profitMargin;
        break;
      case 'total_revenue':
        currentValue = kpis.totalRevenue;
        break;
      case 'total_profit':
        currentValue = kpis.totalProfit;
        break;
      case 'total_orders':
        currentValue = kpis.totalOrders;
        break;
      case 'average_order_value':
        currentValue = kpis.averageOrderValue;
        break;
      case 'revenue_growth':
        currentValue = kpis.growth.revenue;
        break;
      default:
        currentValue = kpis.profitMargin;
    }

    let isTriggered = false;
    let message = '';

    if (rule.condition === 'LESS_THAN' && currentValue < rule.threshold) {
      isTriggered = true;
      message = `Alert Triggered: ${rule.name}. Current ${rule.metric} is ${currentValue} which is below threshold ${rule.threshold}.`;
    } else if (rule.condition === 'GREATER_THAN' && currentValue > rule.threshold) {
      isTriggered = true;
      message = `Alert Triggered: ${rule.name}. Current ${rule.metric} is ${currentValue} which exceeds threshold ${rule.threshold}.`;
    } else if (rule.condition === 'DROP_PCT' && currentValue < -Math.abs(rule.threshold)) {
      isTriggered = true;
      message = `Alert Triggered: ${rule.name}. Metric dropped by ${Math.abs(currentValue)}%, exceeding drop threshold of ${rule.threshold}%.`;
    }

    if (isTriggered) {
      // Check if logged in the last 1 hour to avoid duplicate spam
      const recent = db.prepare(`
        SELECT id FROM alert_history 
        WHERE alert_id = ? AND triggered_at >= datetime('now', '-1 hour')
      `).get(rule.id);

      if (!recent) {
        const historyId = uuidv4();
        db.prepare(`
          INSERT INTO alert_history (id, alert_id, alert_name, metric, current_value, threshold, condition, message)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
          historyId,
          rule.id,
          rule.name,
          rule.metric,
          currentValue,
          rule.threshold,
          rule.condition,
          message
        );

        db.prepare(`UPDATE alerts SET last_triggered = CURRENT_TIMESTAMP WHERE id = ?`).run(rule.id);

        triggeredList.push({
          id: historyId,
          alertId: rule.id,
          alertName: rule.name,
          metric: rule.metric,
          currentValue,
          threshold: rule.threshold,
          message
        });
      }
    }
  }

  return triggeredList;
}

export function seedDefaultAlerts(userId = 'demo_user', datasetId = null) {
  const existingCount = db.prepare("SELECT COUNT(*) as count FROM alerts").get().count;
  if (existingCount > 0) return;

  const sampleRules = [
    {
      name: 'Low Profit Margin Guardrail',
      metric: 'profit_margin',
      condition: 'LESS_THAN',
      threshold: 25.0,
      frequency: 'Real-time'
    },
    {
      name: 'Revenue Milestone Watcher',
      metric: 'total_revenue',
      condition: 'GREATER_THAN',
      threshold: 50000.0,
      frequency: 'Daily'
    },
    {
      name: 'High Average Order Value Trigger',
      metric: 'average_order_value',
      condition: 'GREATER_THAN',
      threshold: 150.0,
      frequency: 'Daily'
    }
  ];

  sampleRules.forEach(r => {
    createAlertRule({
      userId,
      datasetId,
      name: r.name,
      metric: r.metric,
      condition: r.condition,
      threshold: r.threshold,
      frequency: r.frequency
    });
  });

  console.log('[InsightFlow] Seeded default business alert rules.');
}
