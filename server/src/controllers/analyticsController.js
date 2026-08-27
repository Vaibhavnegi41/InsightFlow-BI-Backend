import { computeKpis } from '../services/analyticsService.js';

export function getKpis(req, res) {
  try {
    const { datasetId, startDate, endDate, category, region } = req.query;
    const result = computeKpis({ datasetId, startDate, endDate, category, region });
    if (result.error) {
      return res.status(404).json({ error: result.error });
    }
    return res.json(result);
  } catch (err) {
    console.error('KPI calculation error:', err);
    return res.status(500).json({ error: 'Failed to calculate business KPIs.' });
  }
}

export function getRevenueAnalytics(req, res) {
  try {
    const { datasetId, startDate, endDate, category, region } = req.query;
    const result = computeKpis({ datasetId, startDate, endDate, category, region });
    if (result.error) return res.status(404).json({ error: result.error });

    return res.json({
      totalRevenue: result.kpis.totalRevenue,
      revenueGrowth: result.kpis.growth.revenue,
      monthlyRevenue: result.monthlyTrends.map(m => ({ month: m.month, revenue: m.revenue, orders: m.orders })),
      categoryRevenue: result.categoryBreakdown.map(c => ({ category: c.category, revenue: c.revenue }))
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to calculate revenue analytics.' });
  }
}

export function getProfitAnalytics(req, res) {
  try {
    const { datasetId, startDate, endDate, category, region } = req.query;
    const result = computeKpis({ datasetId, startDate, endDate, category, region });
    if (result.error) return res.status(404).json({ error: result.error });

    return res.json({
      totalProfit: result.kpis.totalProfit,
      profitMargin: result.kpis.profitMargin,
      monthlyProfit: result.monthlyTrends.map(m => ({ month: m.month, profit: m.profit })),
      categoryMargins: result.categoryBreakdown.map(c => ({ category: c.category, margin_pct: c.margin_pct }))
    });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to calculate profit analytics.' });
  }
}

export function getProductAnalytics(req, res) {
  try {
    const { datasetId, startDate, endDate, category, region } = req.query;
    const result = computeKpis({ datasetId, startDate, endDate, category, region });
    if (result.error) return res.status(404).json({ error: result.error });

    return res.json({ topProducts: result.topProducts });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to calculate product analytics.' });
  }
}

export function getRegionalAnalytics(req, res) {
  try {
    const { datasetId, startDate, endDate, category, region } = req.query;
    const result = computeKpis({ datasetId, startDate, endDate, category, region });
    if (result.error) return res.status(404).json({ error: result.error });

    return res.json({ regionalBreakdown: result.regionalBreakdown });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to calculate regional analytics.' });
  }
}
