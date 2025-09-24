import { getConnection } from "../lib/db.js";

// Fetch logs with optional filters and pagination
export const fetchEmailLogs = async ({ region, brand, website, template, status, page = 1, limit = 10 }) => {
  const db = await getConnection();
  const offset = (page - 1) * limit;

  let conditions = [];
  let params = [];

  if (region) {
    conditions.push("eml.region_name = ?");
    params.push(region);
  }
  if (brand) {
    conditions.push("eml.brand_name = ?");
    params.push(brand);
  }
  if (website) {
    conditions.push("eml.website_name = ?");
    params.push(website);
  }
  if (template) {
    conditions.push("eml.template_id = ?");
    params.push(template);
  }
  if (status) {
    conditions.push("eml.status = ?");
    params.push(status);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const [rows] = await db.query(
    `SELECT *
     FROM email_master_log eml
     ${whereClause}
     ORDER BY eml.created_at DESC
     LIMIT ? OFFSET ?`,
    [...params, parseInt(limit), parseInt(offset)]
  );

  return rows;
};

// Fetch distinct options for filters
export const fetchDistinctOptions = async (column) => {
  const db = await getConnection();
  const [rows] = await db.query(`SELECT DISTINCT ?? AS value FROM email_master_log`, [column]);
  return rows.map(r => r.value);
};
