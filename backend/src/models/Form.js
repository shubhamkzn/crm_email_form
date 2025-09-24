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
 create: async ({ name, schema, country, brand }) => {
  const db = await getConnection();

  const [result] = await db.query(
    "INSERT INTO form_schema (name, form_schema, country, brand) VALUES (?, ?, ?, ?)",
    [name, JSON.stringify(schema), country, brand]
  );

  const formId = result.insertId;
  const tableName = `form_${formId}_submissions`;

  const allComponents = flattenComponents(schema.components);

  const columns = allComponents
    .filter(c => c.type !== "button")
    .map(c => `\`${c.key}\` ${mapFormioTypeToMySQL(c.type)}`);

  const createTableSQL = `
    CREATE TABLE \`${tableName}\` (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ${columns.join(",\n")},
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  console.log(createTableSQL);

  await db.query(createTableSQL);

  return formId;
},


createBrand: async ({ name, countryId }) => {
  const db = await getConnection();

  const [result] = await db.query(
    "INSERT INTO brands (name, country_id) VALUES (?, ?)",
    [name, countryId]
  );

  // Fetch the inserted row including created_at
  const [rows] = await db.query(
    "SELECT id, name, country_id, created_at FROM brands WHERE id = ?",
    [result.insertId]
  );

  return rows[0];
},




createWebsite: async ({ name, brandId, countryId }) => {
  const db = await getConnection();

  // Sanitize name for table safety
  const safeName = name.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase();

  // Generate log table name based on website name
  const logTableName = `email_log_${safeName}`;

  // Step 1: Insert website with log_table value
  const [result] = await db.query(
    "INSERT INTO websites (name, brand_id, country_id, log_table) VALUES (?, ?, ?, ?)",
    [name, brandId, countryId, logTableName]
  );

  const websiteId = result.insertId;

  // Step 2: Create the log table in DB
  await db.query(`
    CREATE TABLE IF NOT EXISTS \`${logTableName}\` (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) NOT NULL,
      message TEXT,
      status VARCHAR(50),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  return { id: websiteId, name, logTable: logTableName };
},



findAll: async ({ page = 1, limit = 10 }) => {
  const db = await getConnection();

  const offset = (page - 1) * limit;

  // Get total count
  const [[{ total }]] = await db.query(
    "SELECT COUNT(*) AS total FROM form_schema"
  );

  // Get paginated rows
  const [rows] = await db.query(
    "SELECT id, name, country, brand FROM form_schema LIMIT ? OFFSET ?",
    [parseInt(limit), parseInt(offset)]
  );

  return { total, page, totalPages: Math.ceil(total / limit), rows };
},

  findById: async (id) => {
    const db = await getConnection();
    const [rows] = await db.query(
      "SELECT * FROM form_schema WHERE id = ?",
      [id]
    );
    return rows[0];
  },

  editById: async ({ id, schema, name, country, brand }) => {
    const db = await getConnection();

    const [result] = await db.query(
      "UPDATE form_schema SET form_schema = ?, name = ?, country = ?, brand = ? WHERE id = ?",
      [JSON.stringify(schema), name, country, brand, id]
    );

    const tableName = `form_${id}_submissions`;
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

  deleteById: async ({ id }) => {
    const db = await getConnection();

    const [result] = await db.query(
      "DELETE FROM form_schema WHERE id = ?",
      [id]
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
