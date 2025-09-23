import { getConnection } from "../lib/db.js";
import { nanoid } from "nanoid";

// -------------------- BRAND HELPERS --------------------
export const getBrandByNameOrCreate = async (brand) => {
  const conn = getConnection();

  const [rows] = await conn.execute("SELECT * FROM brands WHERE name = ?", [
    brand,
  ]);
  if (rows.length > 0) return rows[0];

  // Create new brand row if missing
  const logTable = `email_logs_${brand.toLowerCase().replace(/[^a-z0-9_]/g, "_")}`;
  await conn.execute("INSERT INTO brands (name, log_table) VALUES (?, ?)", [
    brand,
    logTable,
  ]);

  return { id: null, name: brand, log_table: logTable };
};

export const getAllBrands = async () => {
  const conn = getConnection();
  const [rows] = await conn.execute(
    "SELECT id, name, log_table FROM brands ORDER BY name"
  );
  console.log('brands', rows);
  return rows;
};

export const addBrand = async ({ name, countryId }) => {
  const conn = getConnection();
  const logTable = `email_logs_${name.toLowerCase().replace(/[^a-z0-9_]/g, "_")}`;

  const [result] = await conn.query(
    `INSERT INTO brands (name, log_table,country_id, created_at) 
     VALUES (?, ?,?, CURRENT_TIMESTAMP)`,
    [name, logTable, countryId]
  );

  return {
    id: result.insertId,
    name,
    log_table: logTable,
    created_at: new Date(),
  };
};

export const getBrandByName = async (brand) => {
  const conn = getConnection();
  const [rows] = await conn.execute(
    "SELECT log_table FROM brands WHERE name = ?",
    [brand]
  );
  return rows.length > 0 ? rows[0] : null;
};

export const getBrandByRegion = async ({ regionId }) => {
  const conn = getConnection();
  const [row] = await conn.execute("Select id, name FROM brands WHERE country_id = ?", [regionId]);
  return row
}

// -------------------- EMAIL LOGS (Brand-Specific) --------------------
export const ensureBrandTableExists = async (tableName) => {
  const conn = getConnection();
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS \`${tableName}\` (
      id INT AUTO_INCREMENT PRIMARY KEY,
      to_email VARCHAR(255) NOT NULL,
      subject VARCHAR(255) NOT NULL,
      body TEXT,
      status ENUM('sent','failed') DEFAULT 'sent',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB;
  `);
  return tableName;
};

export const logEmail = async ({ tableName, toEmail, subject, body, status = "sent" }) => {
  const conn = getConnection();
  const [result] = await conn.execute(
    `INSERT INTO \`${tableName}\` (to_email, subject, body, status) VALUES (?, ?, ?, ?)`,
    [toEmail, subject, body, status]
  );
  return result.insertId;
};

export const getEmailLogs = async (tableName) => {
  const conn = getConnection();

  // Check if table exists
  const [tables] = await conn.execute("SHOW TABLES LIKE ?", [tableName]);
  if (!tables.length) return [];

  const [rows] = await conn.execute(
    `SELECT id, to_email, subject, status, created_at 
     FROM \`${tableName}\` 
     ORDER BY created_at DESC`
  );
  return rows;
};

export const updateEmailLogStatus = async ({ tableName, id, status }) => {
  const conn = getConnection();
  const [result] = await conn.execute(
    `UPDATE \`${tableName}\` SET status = ? WHERE id = ?`,
    [status, id]
  );
  return result.affectedRows;
};

export const getBrandLogs = async (logTable, limit = 10, offset = 0) => {
  const conn = getConnection();
  const [rows] = await conn.query(
    `SELECT * FROM \`${logTable}\` ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  return rows;
};

// -------------------- TEMPLATES --------------------
export const saveTemplateData = async (id, name, html, config, created) => {
  const conn = getConnection();
  const createdAt = created.replace("T", " ").split(".")[0];

  await conn.execute(
    `INSERT INTO templates (id, name, html, config, created)
     VALUES (?, ?, ?, ?, ?)`,
    [id, name, html, JSON.stringify(config), createdAt]
  );

  return id;
};

export const updateTemplateData = async (id, name, html, config, created) => {
  const conn = getConnection();
  const createdAt = created.replace("T", " ").split(".")[0];

  await conn.execute(
    `UPDATE templates
     SET name = ?, html = ?, config = ?, created = ?
     WHERE id = ?`,
    [name, html, JSON.stringify(config), createdAt, id]
  );

  return id;
};

export const getAllTemplatesData = async () => {
  const conn = getConnection();
  const [rows] = await conn.execute(
    `SELECT * FROM templates ORDER BY created DESC`
  );
  return rows;
};

export const routeDeleteTemplateData = async (id) => {
  const conn = getConnection();
  const [result] = await conn.execute(
    `DELETE FROM templates WHERE id = ?`,
    [id]
  );
  return result;
};

export const copyTemplateData = async (id) => {
  const conn = getConnection();

  // 1. Fetch the original
  const [rows] = await conn.execute("SELECT * FROM templates WHERE id = ?", [id]);
  if (!rows.length) return null;

  const original = rows[0];
  const newId = `tpl_${nanoid(10)}`;

  // Normalize config
  const config = typeof original.config === "string"
    ? original.config
    : JSON.stringify(original.config);

  // 2. Insert the copy
  await conn.execute(
    `INSERT INTO templates (id, name, html, config, created) 
     VALUES (?, ?, ?, ?, NOW())`,
    [newId, original.name + " (Copy)", original.html, config]
  );

  // 3. Fetch new template
  const [newRows] = await conn.execute("SELECT * FROM templates WHERE id = ?", [newId]);
  return newRows[0];
};

export const getOneTemplate = async (templateId) => {
  const conn = getConnection();
  const [rows] = await conn.query(
    "SELECT id, name, html, config, created FROM templates WHERE id = ?",
    [templateId]
  );
  if (!rows.length) return null;

  const row = rows[0];
  try {
    row.config = typeof row.config === "string" ? JSON.parse(row.config) : row.config;
  } catch (err) {
    console.error("Config JSON parse error:", err.message);
    row.config = {};
  }
  return row;
};
