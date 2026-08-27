import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory setup
const dataDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'insightflow.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency and performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  // 1. Users Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'Business Analyst',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // 2. Datasets Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS datasets (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      file_name TEXT NOT NULL,
      file_type TEXT NOT NULL,
      row_count INTEGER DEFAULT 0,
      table_name TEXT UNIQUE NOT NULL,
      status TEXT DEFAULT 'Uploaded',
      columns_json TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );
  `);

  // 3. Queries Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS queries (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      dataset_id TEXT,
      sql TEXT NOT NULL,
      title TEXT,
      execution_time REAL,
      bytes_processed INTEGER,
      status TEXT DEFAULT 'SUCCESS',
      error_message TEXT,
      is_saved INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE SET NULL
    );
  `);

  // 4. Alerts Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      dataset_id TEXT,
      name TEXT NOT NULL,
      metric TEXT NOT NULL,
      condition TEXT NOT NULL,
      threshold REAL NOT NULL,
      frequency TEXT DEFAULT 'Daily',
      enabled INTEGER DEFAULT 1,
      last_triggered DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE SET NULL
    );
  `);

  // 5. Alert History Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS alert_history (
      id TEXT PRIMARY KEY,
      alert_id TEXT NOT NULL,
      alert_name TEXT NOT NULL,
      metric TEXT NOT NULL,
      current_value REAL NOT NULL,
      threshold REAL NOT NULL,
      condition TEXT NOT NULL,
      message TEXT NOT NULL,
      triggered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE
    );
  `);

  // 6. Insights Table
  db.exec(`
    CREATE TABLE IF NOT EXISTS insights (
      id TEXT PRIMARY KEY,
      dataset_id TEXT NOT NULL,
      metric TEXT NOT NULL,
      trend TEXT NOT NULL,
      root_cause TEXT NOT NULL,
      business_impact TEXT NOT NULL,
      recommendation TEXT NOT NULL,
      impact_level TEXT DEFAULT 'MEDIUM',
      category TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON DELETE CASCADE
    );
  `);

  // Ensure default demo user exists
  const demoUser = db.prepare('SELECT id FROM users WHERE id = ?').get('demo_user');
  if (!demoUser) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('demo1234', salt);
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `).run('demo_user', 'Demo Business Analyst', 'demo@insightflow.internal', hash, 'Business Analyst');
  }

  const guestUser = db.prepare('SELECT id FROM users WHERE id = ?').get('guest_user');
  if (!guestUser) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync('guest1234', salt);
    db.prepare(`
      INSERT INTO users (id, name, email, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `).run('guest_user', 'Guest User', 'guest@insightflow.internal', hash, 'Business Analyst');
  }

  console.log('[InsightFlow DB] Initialized application database schema successfully.');
}

export default db;
