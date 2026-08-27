import { executeQuery } from './queryService.js';
import { getActiveDataset } from './analyticsService.js';
import { gcpConfig } from '../config/gcp.js';
import db from '../config/db.js';

// Fallback intelligent natural language to SQL translator
function generateHeuristicSql(question, tableName, columns) {
  const q = question.toLowerCase();
  const colNames = columns.map(c => c.clean.toLowerCase());
  const has = (name) => colNames.includes(name.toLowerCase());

  const dateCol = ['order_date', 'date', 'created_at', 'target_doj', 'timestamp'].find(has) || null;
  const revCol = ['revenue', 'sales', 'total_amount', 'amount', 'compensation', 'salary', 'price'].find(has) || null;
  const profCol = ['profit', 'net_profit', 'margin', 'net_income'].find(has) || null;
  const orderCol = ['order_id', 'id', 's_no', 'candidate_id', 'transaction_id'].find(has) || null;
  const catCol = ['category', 'department', 'role', 'type', 'status'].find(has) || null;
  const prodCol = ['product_name', 'item_name', 'candidate', 'role', 'title', 'sku'].find(has) || null;
  const regCol = ['region', 'location', 'country', 'city', 'status'].find(has) || null;

  // 1. Top items / products / candidates
  if (q.includes('top') || q.includes('best') || q.includes('list') || q.includes('show')) {
    if (prodCol && revCol) {
      return {
        sql: `SELECT "${prodCol}", ${catCol ? `"${catCol}",` : ''} COUNT(*) as record_count, ROUND(SUM(CAST("${revCol}" AS REAL)), 2) as total_value FROM "${tableName}" GROUP BY "${prodCol}" ${catCol ? `,"${catCol}"` : ''} ORDER BY total_value DESC LIMIT 5;`,
        chartType: 'bar',
        chartX: prodCol,
        chartY: 'total_value'
      };
    } else if (prodCol) {
      return {
        sql: `SELECT "${prodCol}", COUNT(*) as count FROM "${tableName}" GROUP BY "${prodCol}" ORDER BY count DESC LIMIT 5;`,
        chartType: 'bar',
        chartX: prodCol,
        chartY: 'count'
      };
    }
  }

  // 2. Category / Department breakdown
  if (catCol && (q.includes('category') || q.includes('department') || q.includes('role') || q.includes('status') || q.includes('breakdown'))) {
    return {
      sql: `SELECT "${catCol}", COUNT(*) as count ${revCol ? `, ROUND(SUM(CAST("${revCol}" AS REAL)), 2) as total_value` : ''} FROM "${tableName}" GROUP BY "${catCol}" ORDER BY count DESC;`,
      chartType: 'bar',
      chartX: catCol,
      chartY: revCol ? 'total_value' : 'count'
    };
  }

  // 3. Geographic / Regional performance
  if (regCol && (q.includes('region') || q.includes('geography') || q.includes('location'))) {
    return {
      sql: `SELECT "${regCol}", COUNT(*) as count ${revCol ? `, ROUND(SUM(CAST("${revCol}" AS REAL)), 2) as total_value` : ''} FROM "${tableName}" GROUP BY "${regCol}" ORDER BY count DESC;`,
      chartType: 'bar',
      chartX: regCol,
      chartY: revCol ? 'total_value' : 'count'
    };
  }

  // 4. Monthly trends / timeline
  if (dateCol && (q.includes('month') || q.includes('trend') || q.includes('time') || q.includes('growth') || q.includes('timeline') || q.includes('year'))) {
    return {
      sql: `SELECT SUBSTR("${dateCol}", 1, 7) as timeline, COUNT(*) as record_count ${revCol ? `, ROUND(SUM(CAST("${revCol}" AS REAL)), 2) as total_value` : ''} FROM "${tableName}" GROUP BY SUBSTR("${dateCol}", 1, 7) ORDER BY timeline ASC;`,
      chartType: 'area',
      chartX: 'timeline',
      chartY: revCol ? 'total_value' : 'record_count'
    };
  }

  // 5. Default General summary / First rows
  return {
    sql: `SELECT * FROM "${tableName}" LIMIT 10;`,
    chartType: 'table',
    chartX: null,
    chartY: null
  };
}

function synthesizeBusinessExplanation(question, sqlResult, queryMeta) {
  const { data, rowCount } = sqlResult;
  if (!data || data.length === 0) {
    return `The query ran successfully against table \`${queryMeta.tableName}\`, but returned no matching records.`;
  }

  const firstRow = data[0];
  const keys = Object.keys(firstRow);

  if (keys.includes('total_revenue') || keys.includes('total_value')) {
    const valKey = keys.includes('total_revenue') ? 'total_revenue' : 'total_value';
    const nameKey = keys[0];
    const topItem = data[0];
    return `Analysis reveals that **${topItem[nameKey]}** leads with **$${Number(topItem[valKey] || 0).toLocaleString()}** across **${topItem.units_sold || topItem.record_count || topItem.count || 'N/A'}** transactions/records.`;
  }

  return `Query evaluated across table \`${queryMeta.tableName}\` with **${rowCount}** records retrieved.`;
}

export async function askAiAssistant({ question, datasetId, userId }) {
  const dataset = getActiveDataset(datasetId);
  if (!dataset) {
    throw new Error('No active dataset found to query against.');
  }

  const columns = JSON.parse(dataset.columns_json || '[]');
  const tableName = dataset.table_name;

  const heuristic = generateHeuristicSql(question, tableName, columns);
  const generatedSql = heuristic.sql;
  const chartConfig = { type: heuristic.chartType, x: heuristic.chartX, y: heuristic.chartY };

  // Execute the generated SQL safely
  const queryResult = executeQuery({
    userId,
    datasetId: dataset.id,
    sql: generatedSql
  });

  // Synthesize business explanation
  const explanation = synthesizeBusinessExplanation(question, queryResult, {
    tableName,
    datasetName: dataset.name
  });

  return {
    question,
    dataset: {
      id: dataset.id,
      name: dataset.name,
      tableName
    },
    generatedSql,
    executionTimeMs: queryResult.executionTimeMs,
    bytesProcessed: queryResult.bytesProcessed,
    rowCount: queryResult.rowCount,
    columns: queryResult.columns,
    data: queryResult.data,
    explanation,
    chartConfig,
    optimization: queryResult.optimization
  };
}
