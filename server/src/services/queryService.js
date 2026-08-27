import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export function analyzeQueryOptimization(sql) {
  const normalized = sql.trim().toUpperCase();
  const suggestions = [];
  let score = 100;

  // 1. Check for SELECT *
  if (/SELECT\s+\*/i.test(sql)) {
    suggestions.push({
      type: 'WARNING',
      title: 'Avoid SELECT * in Analytical Warehouses',
      description: 'Selecting all columns increases bytes scanned, network transfer, and memory overhead in BigQuery / analytical databases. Project only the required columns (e.g., SELECT order_id, revenue).',
      potentialImprovement: 'Reduces bytes scanned by up to 60-80%.'
    });
    score -= 25;
  }

  // 2. Check for missing LIMIT on large SELECTs
  if (!/LIMIT\s+\d+/i.test(sql) && !/GROUP\s+BY/i.test(sql) && !/COUNT\(/i.test(sql)) {
    suggestions.push({
      type: 'INFO',
      title: 'Consider Adding a LIMIT Clause',
      description: 'Raw scanning without aggregation or pagination can transfer oversized result sets to the client. Use `LIMIT 100` for preliminary exploratory data inspection.',
      potentialImprovement: 'Prevents client-side memory saturation.'
    });
    score -= 10;
  }

  // 3. Check for Date / Partition Filtering (BigQuery Best Practice)
  if (!/WHERE/i.test(sql) && !/HAVING/i.test(sql)) {
    suggestions.push({
      type: 'RECOMMENDATION',
      title: 'Add Partition / Date Filters (Pruning)',
      description: 'In BigQuery, partitioning on date/timestamp columns (e.g., `WHERE order_date >= "2026-01-01"`) ensures only relevant storage partitions are read, dramatically decreasing query cost.',
      potentialImprovement: 'Enables BigQuery Partition Pruning to save query quota.'
    });
    score -= 15;
  }

  // 4. Check for Subqueries vs CTEs
  if (/\(\s*SELECT\s+.*FROM\s+.*SELECT/is.test(sql) && !/WITH\s+/i.test(sql)) {
    suggestions.push({
      type: 'BEST_PRACTICE',
      title: 'Refactor Nested Subqueries into CTEs (Common Table Expressions)',
      description: 'Using `WITH cte_name AS (...)` improves readability, allows query optimizers to reuse intermediate projections, and simplifies complex multi-stage analytics.',
      potentialImprovement: 'Improves maintainability and query readability.'
    });
    score -= 10;
  }

  // 5. Positive Pattern Check
  if (/WITH\s+/i.test(sql)) {
    suggestions.push({
      type: 'GOOD',
      title: 'Modern SQL Structure (CTE Used)',
      description: 'Common Table Expressions (CTEs) are utilized cleanly.',
      potentialImprovement: 'Optimal analytical SQL construct.'
    });
  }

  if (/OVER\s*\(/i.test(sql)) {
    suggestions.push({
      type: 'GOOD',
      title: 'Window Function Detected',
      description: 'Leveraging analytical window functions (e.g., RANK, ROW_NUMBER, LAG, LEAD) for time-series / ranking analysis.',
      potentialImprovement: 'High-performance in-engine aggregation.'
    });
  }

  return {
    score: Math.max(20, score),
    grade: score >= 85 ? 'A (Optimized)' : (score >= 70 ? 'B (Acceptable)' : 'C (Needs Optimization)'),
    suggestions
  };
}

export function executeQuery({ userId, datasetId, sql }) {
  const startTime = process.hrtime();
  let queryStatus = 'SUCCESS';
  let errorMessage = null;
  let rows = [];
  let columns = [];
  let bytesEstimated = 0;

  // Basic security check: Only allow SELECT or WITH statements for analytics safety
  const trimmed = sql.trim().toUpperCase();
  if (!trimmed.startsWith('SELECT') && !trimmed.startsWith('WITH') && !trimmed.startsWith('EXPLAIN')) {
    throw new Error('Security Restriction: Only analytical read-only SELECT or CTE queries are permitted.');
  }

  // Prevent destructive SQL commands
  const forbidden = ['DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'TRUNCATE', 'GRANT', 'REVOKE'];
  for (const word of forbidden) {
    const regex = new RegExp(`\\b${word}\\b`, 'i');
    if (regex.test(sql)) {
      throw new Error(`Security Restriction: Modifying statement '${word}' is not allowed in the analytical engine.`);
    }
  }

  try {
    const stmt = db.prepare(sql);
    rows = stmt.all();

    if (rows && rows.length > 0) {
      columns = Object.keys(rows[0]);
      // Estimate bytes scanned (approx size of returned data + memory overhead)
      const sampleRowBytes = JSON.stringify(rows[0]).length;
      bytesEstimated = sampleRowBytes * rows.length + 1024;
    } else {
      bytesEstimated = 512;
    }
  } catch (err) {
    queryStatus = 'FAILED';
    errorMessage = err.message;
    throw err;
  } finally {
    const diff = process.hrtime(startTime);
    const executionTimeMs = Math.round((diff[0] * 1000 + diff[1] / 1e6) * 100) / 100;

    // Record in query history
    const queryId = uuidv4();
    try {
      const historyStmt = db.prepare(`
        INSERT INTO queries (id, user_id, dataset_id, sql, execution_time, bytes_processed, status, error_message)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      historyStmt.run(
        queryId,
        userId || 'guest_user',
        datasetId || null,
        sql,
        executionTimeMs,
        bytesEstimated,
        queryStatus,
        errorMessage
      );
    } catch (saveErr) {
      console.error('Failed to log query history:', saveErr);
    }

    const optimization = analyzeQueryOptimization(sql);

    return {
      queryId,
      status: queryStatus,
      executionTimeMs,
      bytesProcessed: bytesEstimated,
      rowCount: rows ? rows.length : 0,
      columns,
      data: rows,
      optimization
    };
  }
}

export function getQueryHistory(userId, limit = 50) {
  const stmt = db.prepare(`
    SELECT q.*, d.name as dataset_name
    FROM queries q
    LEFT JOIN datasets d ON q.dataset_id = d.id
    ORDER BY q.created_at DESC
    LIMIT ?
  `);
  return stmt.all(limit);
}

export function saveQuery({ userId, datasetId, title, sql }) {
  const id = uuidv4();
  const stmt = db.prepare(`
    INSERT INTO queries (id, user_id, dataset_id, title, sql, is_saved, status)
    VALUES (?, ?, ?, ?, ?, 1, 'SAVED')
  `);
  stmt.run(id, userId || 'guest_user', datasetId || null, title || 'Saved Query', sql);
  return { id, title, sql };
}

export function getSavedQueries(userId) {
  const stmt = db.prepare(`
    SELECT * FROM queries
    WHERE is_saved = 1
    ORDER BY created_at DESC
  `);
  return stmt.all();
}
