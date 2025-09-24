import { json } from "express";
import { getConnection } from "../lib/db.js";

function mapFormioTypeToMySQL(type) {
  switch (type) {
    case "number": return "INT";
    case "checkbox": return "TINYINT(1)";
    case "date": return "DATE";
    case "datetime": return "DATETIME";
    case "email": return "VARCHAR(255)";
    case "phoneNumber": return "VARCHAR(20)";
    case "textfield":
    case "textarea": return "TEXT";
    case "select": return "TEXT";
    default: return "TEXT";
  }
}

function flattenComponents(components) {
  let flat = [];
  components.forEach(c => {
    if (c.type === "columns") {
      c.columns.forEach(col => {
        flat = flat.concat(flattenComponents(col.components));
      });
    } else if (c.type === "panel" || c.type === "fieldset" || c.type === "datagrid") {
      flat = flat.concat(flattenComponents(c.components));
    } else {
      flat.push(c);
    }
  });
  return flat;
}

const Form = {
  create: async ({ formId, pageName, schema, regionId, brandId, websiteId }) => {
    const db = await getConnection(); // ✅ ensure connection

    const [result] = await db.query(
      "INSERT INTO forms (form_id, region_id, brand_id, website_id, form_schema, page_name) VALUES (?, ?, ?,?,?, ?)",
      [formId, regionId, brandId, websiteId, JSON.stringify(schema), pageName]
    );

    const tableName = `form_${formId}_submissions`;

    const allComponents = flattenComponents(schema.components);

    const columns = allComponents
      .filter(c => c.type !== "button")
      .map(c => {
        switch (c.type) {
          case "number": return `\`${c.key}\` INT`;
          case "email":
          case "textfield": return `\`${c.key}\` VARCHAR(255)`;
          default: return `\`${c.key}\` ${mapFormioTypeToMySQL(c.type)}`;
        }
      });

    const createTableSQL = `
      CREATE TABLE \`${tableName}\` (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ${columns.join(",\n")},
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log(createTableSQL);

    await db.query(createTableSQL);

    return result.insertId;
  },

  findAll: async ({ page = 1, limit = 10 }) => {
    const db = await getConnection();

    const offset = (page - 1) * limit;

    // Get total count
    const [[{ total }]] = await db.query(
      "SELECT COUNT(*) AS total FROM forms"
    );

    // Get paginated rows
    const [rows] = await db.query(
      `SELECT 
    f.form_id,
    f.page_name,
    f.created_at,
    b.name AS brand_name,
    r.countryName
FROM forms f
JOIN brands b 
    ON f.brand_id = b.id
JOIN region r 
    ON f.region_id = r.id;
`,
      [parseInt(limit), parseInt(offset)]
    );
    console.log(rows)

    return { total, page, totalPages: Math.ceil(total / limit), rows };
  },

  findById: async (formId) => {
    const db = await getConnection();
    const [rows] = await db.query(
      `SELECT 
    f.form_schema,
    f.page_name,
    b.name AS brand_name,
    r.countryName
FROM forms f
JOIN brands b 
    ON f.brand_id = b.id
JOIN region r 
    ON f.region_id = r.id
WHERE f.form_id = ?;
`,
      [formId]
    );
    return rows[0];
  },

  editById: async ({ formId, schema, page_name }) => {
    const db = await getConnection();

    const [result] = await db.query(
      "UPDATE forms SET form_schema = ?, page_name = ? WHERE form_id = ?",
      [JSON.stringify(schema), page_name, formId]
    );

    const tableName = `form_${formId}_submissions`;
    const [rows] = await db.query(
      `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
      [tableName]
    );

    const allComponents = flattenComponents(schema.components);
    const existingColumns = rows.map(r => r.COLUMN_NAME);

    for (const comp of allComponents) {
      if (comp.type === "button") continue;

      const columnName = comp.key;
      if (!existingColumns.includes(columnName)) {
        const columnType = mapFormioTypeToMySQL(comp.type);
        await db.query(
          `ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${columnType}`
        );
      }
    }
    return result;
  },

  deleteById: async ({ formId }) => {
    const db = await getConnection();

    const [result] = await db.query(
      "DELETE FROM forms WHERE form_id = ?",
      [formId]
    );

    if (result.affectedRows > 0) {
      console.log("Row deleted successfully");
      return true;
    } else {
      console.log("No row found with given id");
      return false;
    }
  },



};



export default Form;
