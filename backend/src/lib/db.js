import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

let connection;

export const connectMySQL = async () => {
  try {
    connection = await mysql.createPool({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DB,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
    });
    console.log("Connected to MySQL");
    return connection;
  } catch (err) {
    console.error("MySQL Connection Failed:", err);
    throw err;
  }
};

// Optional: helper to get connection
export const getConnection = () => {
  if (!connection) throw new Error("MySQL not initialized. Call connectMySQL first.");
  return connection;
};
