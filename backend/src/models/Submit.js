import { getConnection } from "../lib/db.js";

const Submission = {
  // Store submission in dynamic table + leads
  submitById: async ({ formId, data }) => {
    const db = await getConnection();
    const tableName = `form_${formId}_submissions`;

    const entries = Object.entries(data).filter(([key]) => key !== "submit");

    const columns = entries.map(([key]) => `\`${key}\``).join(", ");
    const values = entries.map(([_, value]) =>
      typeof value === "object" ? JSON.stringify(value) : value
    );
    const placeholders = entries.map(() => "?").join(", ");

    const sql = `INSERT INTO \`${tableName}\` (${columns}) VALUES (${placeholders})`;
    const [result] = await db.query(sql, values);
    console.log('result',result)
    const submissionId= result.insertId;
    // Extract personal info for leads table
    const leadName =
      data.firstName && data.lastName
        ? `${data.firstName} ${data.lastName}`
        : data.name || null;
    const leadEmail = data.email || null;
    const leadPhone = data.phone || data.phoneNumber || null;

    await db.query(
      `INSERT INTO leads (form_id, name, email, phone, data,submission_id) VALUES (?, ?, ?, ?, ?,?)`,
      [formId, leadName, leadEmail, leadPhone, JSON.stringify(data),submissionId]
    );

    return result.insertId;
  },

  // Fetch all submissions from a form-specific table
  getAllSubmissions: async ({ formId }) => {
    const db = await getConnection();
    const tableName = `form_${formId}_submissions`;

    const query = `SELECT * FROM \`${tableName}\``;
    const [rows] = await db.query(query);
    return rows;
  },

  // Fetch all leads from central leads table
  getLeads: async () => {
    const db = await getConnection();
    const [rows] = await db.query(`SELECT 
    l.*,
    f.*,
    w.id AS website_id,
    w.name AS website_name,
    w.log_table,
    w.created_at AS website_created_at,
    b.id AS brand_id,
    b.name AS brand_name,
    b.created_at AS brand_created_at,
    r.id AS region_id,
    r.countryName AS country_name
FROM leads l
JOIN forms f 
    ON l.form_id = f.form_id
LEFT JOIN websites w 
    ON f.website_id = w.id
LEFT JOIN brands b 
    ON f.brand_id = b.id
LEFT JOIN region r 
    ON f.region_id = r.id`);
    return rows;
  },
};

export default Submission;
