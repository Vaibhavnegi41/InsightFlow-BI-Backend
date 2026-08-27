import db from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import csvParser from 'csv-parser';
import { generateSampleBusinessData } from '../data/seedData.js';

export function inferColumnType(values) {
  const nonNulls = values.filter(v => v !== null && v !== undefined && v !== '');
  if (nonNulls.length === 0) return 'TEXT';

  let isInt = true;
  let isReal = true;
  let isDate = true;

  for (const v of nonNulls.slice(0, 100)) {
    const s = String(v).trim();
    if (!/^-?\d+$/.test(s)) isInt = false;
    if (isNaN(Number(s))) isReal = false;
    if (isNaN(Date.parse(s)) || !s.includes('-') && !s.includes('/')) isDate = false;
  }

  if (isInt) return 'INTEGER';
  if (isReal) return 'REAL';
  if (isDate) return 'TEXT'; // SQLite stores dates as TEXT
  return 'TEXT';
}

export function sanitizeIdentifier(name) {
  return name.toLowerCase().replace(/[^a-z0-9_]/g, '_').replace(/^([0-9])/, '_$1');
}

export async function parseCsvFile(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

export function createDatasetFromRecords({ userId, name, fileName, fileType, records }) {
  if (!records || records.length === 0) {
    throw new Error('Dataset contains no records');
  }

  const datasetId = uuidv4();
  const rawTableName = `ds_${sanitizeIdentifier(name)}_${Date.now()}`;
  const tableName = rawTableName.slice(0, 50);

  // Extract keys and determine schema
  const rawHeaders = Object.keys(records[0]);
  const columnDefs = rawHeaders.map(header => {
    const cleanHeader = sanitizeIdentifier(header);
    const sampleValues = records.map(r => r[header]);
    const colType = inferColumnType(sampleValues);
    return {
      original: header,
      clean: cleanHeader,
      type: colType
    };
  });

  // Check duplicate clean column names
  const seenCols = new Set();
  columnDefs.forEach((col, idx) => {
    if (seenCols.has(col.clean)) {
      col.clean = `${col.clean}_${idx}`;
    }
    seenCols.add(col.clean);
  });

  // Create table in SQLite analytical database
  const sqlColumns = columnDefs.map(col => `"${col.clean}" ${col.type}`).join(', ');
  const createTableSql = `CREATE TABLE IF NOT EXISTS "${tableName}" (${sqlColumns});`;
  db.exec(createTableSql);

  // Insert records in a single transaction for maximum throughput
  const insertCols = columnDefs.map(c => `"${c.clean}"`).join(', ');
  const placeholders = columnDefs.map(() => '?').join(', ');
  const insertStmt = db.prepare(`INSERT INTO "${tableName}" (${insertCols}) VALUES (${placeholders})`);

  const insertMany = db.transaction((rows) => {
    for (const row of rows) {
      const values = columnDefs.map(col => {
        let val = row[col.original];
        if (val === undefined || val === null || val === '') return null;
        if (col.type === 'INTEGER') {
          const num = parseInt(val, 10);
          return isNaN(num) ? null : num;
        }
        if (col.type === 'REAL') {
          const num = parseFloat(val);
          return isNaN(num) ? null : num;
        }
        return String(val);
      });
      insertStmt.run(values);
    }
  });

  insertMany(records);

  // Save metadata
  const insertMetaStmt = db.prepare(`
    INSERT INTO datasets (id, user_id, name, file_name, file_type, row_count, table_name, status, columns_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insertMetaStmt.run(
    datasetId,
    userId || 'guest_user',
    name,
    fileName,
    fileType,
    records.length,
    tableName,
    'Processed',
    JSON.stringify(columnDefs)
  );

  return {
    id: datasetId,
    name,
    fileName,
    fileType,
    rowCount: records.length,
    tableName,
    status: 'Processed',
    columns: columnDefs
  };
}

export async function processUploadedDataset(file, userId, datasetName) {
  let records = [];
  const fileExt = file.originalname.split('.').pop().toLowerCase();
  
  if (fileExt === 'csv') {
    records = await parseCsvFile(file.path);
  } else if (fileExt === 'json') {
    const rawContent = fs.readFileSync(file.path, 'utf8');
    const parsed = JSON.parse(rawContent);
    records = Array.isArray(parsed) ? parsed : [parsed];
  } else {
    throw new Error('Unsupported file format. Please upload CSV or JSON.');
  }

  const name = datasetName || file.originalname.replace(/\.[^/.]+$/, '');
  const result = createDatasetFromRecords({
    userId,
    name,
    fileName: file.originalname,
    fileType: fileExt.toUpperCase(),
    records
  });

  // Clean up uploaded temp file if necessary
  try {
    if (fs.existsSync(file.path)) {
      // Keep or remove depending on storage policy
    }
  } catch (err) {
    console.error('Error cleaning up temp file:', err);
  }

  return result;
}

export function seedDefaultDataset(userId = 'demo_user') {
  const existing = db.prepare("SELECT id FROM datasets WHERE name = 'Global E-Commerce Sales & KPIs'").get();
  if (existing) {
    return existing.id;
  }

  const sampleRecords = generateSampleBusinessData();
  const dataset = createDatasetFromRecords({
    userId,
    name: 'Global E-Commerce Sales & KPIs',
    fileName: 'ecommerce_transactions_2025_2026.csv',
    fileType: 'CSV',
    records: sampleRecords
  });

  console.log(`[InsightFlow] Seeded default dataset: ${dataset.name} (${dataset.rowCount} rows)`);
  return dataset.id;
}
