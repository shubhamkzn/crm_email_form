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

    // Extract personal info for leads table
    const leadName =
      data.firstName && data.lastName
        ? `${data.firstName} ${data.lastName}`
        : data.name || null;
    const leadEmail = data.email || null;
    const leadPhone = data.phone || data.phoneNumber || null;

    await db.query(
      `INSERT INTO leads (form_id, name, email, phone, data) VALUES (?, ?, ?, ?, ?)`,
      [formId, leadName, leadEmail, leadPhone, JSON.stringify(data)]
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
    const [rows] = await db.query("SELECT * FROM leads ORDER BY created_at DESC");
    return rows;
  },
};

export default Submission;
