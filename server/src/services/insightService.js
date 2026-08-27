import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { computeKpis, getActiveDataset } from './analyticsService.js';

export function generateBusinessInsights(datasetId) {
  const dataset = getActiveDataset(datasetId);
  if (!dataset) {
    return [];
  }

  const analytics = computeKpis({ datasetId: dataset.id });
  if (analytics.error) return [];

  const { kpis, categoryBreakdown, regionalBreakdown, monthlyTrends, topProducts } = analytics;
  const insights = [];

  // 1. Overall Margin vs Revenue Growth Insight
  if (kpis.profitMargin < 25) {
    insights.push({
      id: uuidv4(),
      dataset_id: dataset.id,
      metric: 'Profit Margin & Unit Economics',
      trend: `Current blended profit margin is compressed at ${kpis.profitMargin}% despite gross revenue reaching $${kpis.totalRevenue.toLocaleString()}.`,
      root_cause: 'High promotional discounts across key volume categories combined with elevated product cost of goods.',
      business_impact: 'Erodes net operating cash flow and weakens bottom-line EBITDA despite top-line sales expansion.',
      recommendation: 'Cap maximum promotional discounts at 10% on lower-margin items and shift marketing ad spend towards higher-margin categories like Fashion and Home & Living.',
      impact_level: 'HIGH',
      category: 'Profitability'
    });
  } else {
    insights.push({
      id: uuidv4(),
      dataset_id: dataset.id,
      metric: 'Healthy Profitability Ratio',
      trend: `Blended profit margin is strong at ${kpis.profitMargin}%, generating $${kpis.totalProfit.toLocaleString()} in net profit.`,
      root_cause: 'Favorable product mix with strong demand in high-margin merchandise.',
      business_impact: 'Provides surplus margin to reinvest into customer acquisition and regional logistics.',
      recommendation: 'Maintain premium pricing tiers while introducing bundled upsells to further lift Average Order Value ($' + kpis.averageOrderValue + ').',
      impact_level: 'LOW',
      category: 'Profitability'
    });
  }

  // 2. Category Disparity Insight
  if (categoryBreakdown && categoryBreakdown.length >= 2) {
    const topCat = categoryBreakdown[0];
    const bottomCat = categoryBreakdown[categoryBreakdown.length - 1];

    insights.push({
      id: uuidv4(),
      dataset_id: dataset.id,
      metric: 'Category Revenue Concentration',
      trend: `${topCat.category} leads revenue generating $${topCat.revenue.toLocaleString()} (${topCat.orders} orders), while ${bottomCat.category} accounts for only $${bottomCat.revenue.toLocaleString()}.`,
      root_cause: 'Higher catalog breadth and customer demand density in consumer electronics and apparel.',
      business_impact: 'High revenue dependency on single category creates quarterly revenue vulnerability to supply shocks.',
      recommendation: `Launch targeted cross-selling campaigns to introduce ${bottomCat.category} items during checkout for customers purchasing ${topCat.category}.`,
      impact_level: 'MEDIUM',
      category: 'Product Mix'
    });
  }

  // 3. Regional Expansion & Logistics Insight
  if (regionalBreakdown && regionalBreakdown.length >= 2) {
    const topRegion = regionalBreakdown[0];
    const underperformingRegion = regionalBreakdown[regionalBreakdown.length - 1];

    insights.push({
      id: uuidv4(),
      dataset_id: dataset.id,
      metric: 'Regional Growth Asymmetry',
      trend: `${topRegion.region} captures $${topRegion.revenue.toLocaleString()} in sales, outperforming ${underperformingRegion.region} ($${underperformingRegion.revenue.toLocaleString()}) by ${Math.round((topRegion.revenue / Math.max(1, underperformingRegion.revenue)) * 10) / 10}x.`,
      root_cause: 'Underpenetrated marketing spend and localized fulfillment friction in emerging regional territories.',
      business_impact: 'Untapped customer lifetime value and lower regional market share compared to competitors.',
      recommendation: `Partner with local regional 3PL fulfillment hubs in ${underperformingRegion.region} to reduce delivery times and deploy targeted local digital campaigns.`,
      impact_level: 'MEDIUM',
      category: 'Geography'
    });
  }

  // 4. Monthly Seasonality & Momentum Insight
  if (monthlyTrends && monthlyTrends.length >= 3) {
    const recentMonths = monthlyTrends.slice(-3);
    const lastMonth = recentMonths[recentMonths.length - 1];
    const prevMonth = recentMonths[recentMonths.length - 2];
    const momChange = Math.round(((lastMonth.revenue - prevMonth.revenue) / Math.max(1, prevMonth.revenue)) * 100);

    insights.push({
      id: uuidv4(),
      dataset_id: dataset.id,
      metric: 'Month-over-Month Velocity',
      trend: `Revenue recorded $${lastMonth.revenue.toLocaleString()} in ${lastMonth.month} (${momChange >= 0 ? '+' : ''}${momChange}% vs ${prevMonth.month}).`,
      root_cause: momChange >= 0 ? 'Surge in repeat buyer transactions and seasonal promotional alignment.' : 'Post-peak promotional deceleration and inventory rebalancing.',
      business_impact: momChange >= 0 ? 'Accelerates working capital turnover and strengthens quarterly guidance.' : 'Risk of inventory holding costs if replenishment pace exceeds demand.',
      recommendation: 'Dynamically tune inventory reorder points and implement automated abandoned-cart retargeting flows.',
      impact_level: momChange < 0 ? 'HIGH' : 'LOW',
      category: 'Growth'
    });
  }

  // 5. Star Product SKU Insight
  if (topProducts && topProducts.length > 0) {
    const starProduct = topProducts[0];
    insights.push({
      id: uuidv4(),
      dataset_id: dataset.id,
      metric: 'Flagship SKU Performance',
      trend: `"${starProduct.product_name}" is the top grossing product, yielding $${starProduct.total_revenue.toLocaleString()} with a ${starProduct.margin_pct}% margin.`,
      root_cause: 'Strong product-market fit, superior customer ratings, and viral word-of-mouth adoption.',
      business_impact: 'Acts as the primary acquisition engine bringing new customer cohorts into the brand ecosystem.',
      recommendation: 'Ensure safety inventory levels of at least 45 days of supply to prevent stockouts, and create bundled accessories to expand order basket size.',
      impact_level: 'LOW',
      category: 'Merchandising'
    });
  }

  // Store generated insights in DB
  try {
    // Clear old insights for this dataset to refresh
    db.prepare('DELETE FROM insights WHERE dataset_id = ?').run(dataset.id);
    const insertStmt = db.prepare(`
      INSERT INTO insights (id, dataset_id, metric, trend, root_cause, business_impact, recommendation, impact_level, category)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insights.forEach(ins => {
      insertStmt.run(
        ins.id,
        ins.dataset_id,
        ins.metric,
        ins.trend,
        ins.root_cause,
        ins.business_impact,
        ins.recommendation,
        ins.impact_level,
        ins.category
      );
    });
  } catch (err) {
    console.error('Failed to persist insights:', err);
  }

  return insights;
}

export function getInsights(datasetId) {
  const dataset = getActiveDataset(datasetId);
  if (!dataset) return [];

  const existing = db.prepare('SELECT * FROM insights WHERE dataset_id = ? ORDER BY created_at DESC').all(dataset.id);
  if (existing && existing.length > 0) {
    return existing;
  }
  return generateBusinessInsights(dataset.id);
}
