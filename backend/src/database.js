const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(__dirname, '..', 'data', 'portal.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      phone TEXT NOT NULL,
      name TEXT,
      company_uuid TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      job_uuid TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      content TEXT NOT NULL,
      sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'staff')),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    )
  `);

  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
    CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
    CREATE INDEX IF NOT EXISTS idx_messages_job ON messages(job_uuid);
  `);

  console.log('Database initialized successfully');
}

const customerOps = {
  findByEmailAndPhone: (email, phone) => {
    return db.prepare('SELECT * FROM customers WHERE email = ? AND phone = ?').get(email, phone);
  },
  
  findById: (id) => {
    return db.prepare('SELECT * FROM customers WHERE id = ?').get(id);
  },
  
  create: (id, email, phone, name, companyUuid) => {
    const stmt = db.prepare('INSERT INTO customers (id, email, phone, name, company_uuid) VALUES (?, ?, ?, ?, ?)');
    return stmt.run(id, email, phone, name, companyUuid);
  },
  
  upsert: (id, email, phone, name, companyUuid) => {
    const stmt = db.prepare(`
      INSERT INTO customers (id, email, phone, name, company_uuid) 
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET 
        phone = excluded.phone,
        name = excluded.name,
        company_uuid = excluded.company_uuid
    `);
    return stmt.run(id, email, phone, name, companyUuid);
  }
};

const sessionOps = {
  create: (id, customerId, token, expiresAt) => {
    const stmt = db.prepare('INSERT INTO sessions (id, customer_id, token, expires_at) VALUES (?, ?, ?, ?)');
    return stmt.run(id, customerId, token, expiresAt);
  },
  
  findByToken: (token) => {
    return db.prepare("SELECT * FROM sessions WHERE token = ? AND expires_at > datetime('now')").get(token);
  },

  deleteByToken: (token) => {
    return db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  },

  cleanExpired: () => {
    return db.prepare("DELETE FROM sessions WHERE expires_at <= datetime('now')").run();
  }
};

const messageOps = {
  create: (id, jobUuid, customerId, content, senderType) => {
    const stmt = db.prepare('INSERT INTO messages (id, job_uuid, customer_id, content, sender_type) VALUES (?, ?, ?, ?, ?)');
    return stmt.run(id, jobUuid, customerId, content, senderType);
  },
  
  findByJobUuid: (jobUuid) => {
    return db.prepare('SELECT * FROM messages WHERE job_uuid = ? ORDER BY created_at ASC').all(jobUuid);
  },
  
  findById: (id) => {
    return db.prepare('SELECT * FROM messages WHERE id = ?').get(id);
  }
};

module.exports = {
  db,
  initializeDatabase,
  customerOps,
  sessionOps,
  messageOps
};

