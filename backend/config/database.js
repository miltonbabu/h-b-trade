const initSqlJs = require("sql.js");
const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");

const isProduction = process.env.NODE_ENV === "production";
const dbPath = path.join(__dirname, "..", "data", "hbtrade.db");
const dataDir = path.dirname(dbPath);

let db;
let SQL;
let pgPool;

const initDatabase = async () => {
  if (isProduction && process.env.DB_HOST) {
    return initPostgreSQL();
  }
  return initSQLite();
};

const initPostgreSQL = async () => {
  pgPool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
    ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
  });

  try {
    const client = await pgPool.connect();
    console.log("PostgreSQL connected successfully");
    client.release();

    await initPostgresTables();
    return true;
  } catch (error) {
    console.error("PostgreSQL connection error:", error);
    throw error;
  }
};

const initPostgresTables = async () => {
  const client = await pgPool.connect();
  try {
    await client.query("BEGIN");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS product_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        phone VARCHAR(50),
        whatsapp VARCHAR(50),
        email VARCHAR(255) NOT NULL,
        product_name VARCHAR(500) NOT NULL,
        product_link TEXT,
        quantity VARCHAR(100),
        shipping_method VARCHAR(100),
        message TEXT,
        image VARCHAR(500),
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        order_number VARCHAR(100) UNIQUE NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        product_name VARCHAR(500) NOT NULL,
        quantity VARCHAR(100),
        shipping_method VARCHAR(100),
        price DECIMAL(10, 2),
        status VARCHAR(50) DEFAULT 'pending',
        tracking_number VARCHAR(100),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS tracking (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tracking_number VARCHAR(100) NOT NULL,
        status VARCHAR(100) NOT NULL,
        location VARCHAR(255),
        note TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        subject VARCHAR(255),
        message TEXT NOT NULL,
        is_read BOOLEAN DEFAULT false,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        product_code VARCHAR(100),
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100),
        price DECIMAL(10, 2) NOT NULL,
        moq INTEGER DEFAULT 1,
        image VARCHAR(500),
        description TEXT,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    try {
      await client.query(
        "ALTER TABLE products ADD COLUMN IF NOT EXISTS product_code VARCHAR(100)",
      );
    } catch (e) {
      // Column already exists, ignore error
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        phone VARCHAR(50),
        email VARCHAR(255),
        whatsapp_link VARCHAR(500),
        facebook_page VARCHAR(500),
        facebook_group VARCHAR(500),
        office_address TEXT,
        company_name VARCHAR(255) DEFAULT 'H&B Trade',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    const settingsResult = await client.query("SELECT COUNT(*) FROM settings");
    if (parseInt(settingsResult.rows[0].count) === 0) {
      await client.query(`
        INSERT INTO settings (phone, email, whatsapp_link, facebook_page, facebook_group, office_address, company_name)
        VALUES ('+880 1234-567890', 'info@hbtrade.com', 'https://wa.me/8801234567890', 'https://www.facebook.com/hbtrade', 'https://www.facebook.com/groups/hbtrade', '123 Trade Center, Guangzhou, China | 456 Business Hub, Dhaka, Bangladesh', 'H&B Trade')
      `);
    }

    const adminResult = await client.query(
      "SELECT COUNT(*) FROM users WHERE email = $1",
      ["admin@hbtrade.com"],
    );
    if (parseInt(adminResult.rows[0].count) === 0) {
      const hashedPassword = bcrypt.hashSync("admin123", 10);
      await client.query(
        `
        INSERT INTO users (name, email, password, role)
        VALUES ('Admin', 'admin@hbtrade.com', $1, 'admin')
      `,
        [hashedPassword],
      );
    }

    await client.query("COMMIT");
    console.log("PostgreSQL tables initialized");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

const initSQLite = async () => {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  SQL = await initSqlJs();

  if (fs.existsSync(dbPath)) {
    const fileBuffer = fs.readFileSync(dbPath);
    db = new SQL.Database(fileBuffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS product_requests (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      whatsapp TEXT,
      email TEXT NOT NULL,
      product_name TEXT NOT NULL,
      product_link TEXT,
      quantity TEXT,
      shipping_method TEXT,
      message TEXT,
      image TEXT,
      tracking_number TEXT,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Add tracking_number column to product_requests if it doesn't exist
  const productRequestsInfo = db.exec("PRAGMA table_info(product_requests)");
  if (productRequestsInfo.length > 0) {
    const prColumns = productRequestsInfo[0].values.map((col) => col[1]);
    if (!prColumns.includes("tracking_number")) {
      db.run("ALTER TABLE product_requests ADD COLUMN tracking_number TEXT");
    }
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      order_number TEXT UNIQUE NOT NULL,
      tracking_number TEXT,
      customer_name TEXT NOT NULL,
      customer_info TEXT,
      product_name TEXT NOT NULL,
      quantity TEXT,
      shipping_method TEXT,
      price REAL,
      status TEXT DEFAULT 'pending',
      payment_info TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS tracking (
      id TEXT PRIMARY KEY,
      tracking_number TEXT NOT NULL,
      status TEXT NOT NULL,
      location TEXT,
      note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      product_code TEXT,
      name TEXT NOT NULL,
      category TEXT,
      price REAL NOT NULL,
      moq INTEGER DEFAULT 1,
      image TEXT,
      description TEXT,
      status TEXT DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const productsInfo = db.exec("PRAGMA table_info(products)");
  if (productsInfo.length > 0) {
    const columns = productsInfo[0].values.map((col) => col[1]);
    if (!columns.includes("product_code")) {
      db.run("ALTER TABLE products ADD COLUMN product_code TEXT");
    }
    if (!columns.includes("image2")) {
      db.run("ALTER TABLE products ADD COLUMN image2 TEXT");
    }
    if (!columns.includes("image3")) {
      db.run("ALTER TABLE products ADD COLUMN image3 TEXT");
    }
  }

  // Add missing columns to orders table
  const ordersInfo = db.exec("PRAGMA table_info(orders)");
  if (ordersInfo.length > 0) {
    const orderColumns = ordersInfo[0].values.map((col) => col[1]);
    if (!orderColumns.includes("product_codes")) {
      db.run("ALTER TABLE orders ADD COLUMN product_codes TEXT");
    }
    if (!orderColumns.includes("items_info")) {
      db.run("ALTER TABLE orders ADD COLUMN items_info TEXT");
    }
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      id TEXT PRIMARY KEY,
      phone TEXT,
      email TEXT,
      whatsapp_link TEXT,
      facebook_page TEXT,
      facebook_group TEXT,
      office_address TEXT,
      company_name TEXT DEFAULT 'H&B Trade',
      bkash TEXT,
      nagad TEXT,
      bank_account TEXT,
      wechat TEXT,
      alipay TEXT,
      wechat_qr TEXT,
      alipay_qr TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  const settingsResult = db.exec("SELECT COUNT(*) as count FROM settings");
  if (settingsResult.length === 0 || settingsResult[0].values[0][0] === 0) {
    db.run(`
      INSERT INTO settings (id, phone, email, whatsapp_link, facebook_page, facebook_group, office_address, company_name, bkash, nagad, bank_account, wechat, alipay)
      VALUES ('settings-1', '+880 1234-567890', 'info@hbtrade.com', 'https://wa.me/8801234567890', 'https://www.facebook.com/hbtrade', 'https://www.facebook.com/groups/hbtrade', '123 Trade Center, Guangzhou, China | 456 Business Hub, Dhaka, Bangladesh', 'H&B Trade', '0183522072', '0183522072', 'Bank: The City Bank\nName: MD ARIFUL ISLAM RONY\nAccount Number: 2183964509001\nBranch: Gulshan-02 Avenue\nRouting Number: 225261732\nDhaka, Bangladesh', 'wechat_hbtrade', 'alipay_hbtrade')
    `);
  }

  const adminResult = db.exec(
    "SELECT COUNT(*) as count FROM users WHERE email = 'admin@hbtrade.com'",
  );
  if (adminResult.length === 0 || adminResult[0].values[0][0] === 0) {
    const hashedPassword = bcrypt.hashSync("admin123", 10);
    db.run(
      `
      INSERT INTO users (id, name, email, password, role)
      VALUES ('admin-1', 'Admin', 'admin@hbtrade.com', ?, 'super_admin')
    `,
      [hashedPassword],
    );
  }

  saveDatabase();
  console.log("SQLite database initialized");
  return true;
};

const saveDatabase = () => {
  if (!isProduction && db) {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(dbPath, buffer);
  }
};

const query = async (sql, params = []) => {
  if (isProduction && pgPool) {
    const result = await pgPool.query(sql, params);
    return { rows: result.rows, rowCount: result.rowCount };
  }

  try {
    const stmt = db.prepare(sql);
    if (params.length > 0) {
      stmt.bind(params);
    }

    const rows = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      rows.push(row);
    }
    stmt.free();

    saveDatabase();
    return { rows, rowCount: rows.length };
  } catch (error) {
    console.error("Query error:", error);
    throw error;
  }
};

const getOne = async (sql, params = []) => {
  if (isProduction && pgPool) {
    const result = await pgPool.query(sql, params);
    return result.rows[0];
  }

  try {
    const stmt = db.prepare(sql);
    if (params.length > 0) {
      stmt.bind(params);
    }

    let result = null;
    if (stmt.step()) {
      result = stmt.getAsObject();
    }
    stmt.free();

    return result;
  } catch (error) {
    console.error("getOne error:", error);
    throw error;
  }
};

const getMany = async (sql, params = []) => {
  if (isProduction && pgPool) {
    const result = await pgPool.query(sql, params);
    return result.rows;
  }

  try {
    const stmt = db.prepare(sql);
    if (params.length > 0) {
      stmt.bind(params);
    }

    const rows = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject());
    }
    stmt.free();

    return rows;
  } catch (error) {
    console.error("getMany error:", error);
    throw error;
  }
};

const run = async (sql, params = []) => {
  if (isProduction && pgPool) {
    const result = await pgPool.query(sql, params);
    return { changes: result.rowCount };
  }

  try {
    db.run(sql, params);
    saveDatabase();
    return { changes: db.getRowsModified() };
  } catch (error) {
    console.error("run error:", error);
    throw error;
  }
};

module.exports = {
  initDatabase,
  query,
  getOne,
  getMany,
  run,
};
