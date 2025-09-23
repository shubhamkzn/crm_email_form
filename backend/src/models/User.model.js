// lib/user.js
import bcrypt from "bcryptjs";
import { getConnection } from "../lib/db.js";

const SALT_ROUNDS = 10;
// ================= CREATE USER =================
export const createUser = async ({ username, email, phone, password, countryCode, dialCode }) => {
  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const conn = getConnection();
  const [result] = await conn.execute(
    `INSERT INTO users (username, email, phone, password, countryCode, dialCode) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [username, email || null, phone, hashedPassword, countryCode, dialCode]
  );

  return {
    id: result.insertId,
    username,
    email,
    phone,
    countryCode,
    dialCode
  };
};



// Find user by email
export const findUserByEmail = async (email) => {
  const conn = getConnection();
  const [rows] = await conn.execute(`SELECT * FROM users WHERE email = ?`, [email]);
  return rows[0];
};

// Find user by phone
export const findUserByPhone = async (phone) => {
  const conn = getConnection();
  const [rows] = await conn.execute(`SELECT * FROM users WHERE phone = ?`, [phone]);
  return rows[0];
};

// Update OTP
export const updateUserOtp = async (userId, otp, otpExpires) => {
  const conn = getConnection();
  await conn.execute(
    `UPDATE users SET otp = ?, otpExpires = ? WHERE id = ?`,
    [otp, otpExpires, userId]
  );
};

// Verify password
export const verifyPassword = async (user, password) => {
  return bcrypt.compare(password, user.password);
};

export const findUserById = async (id) => {
  const conn = getConnection();
  const [rows] = await conn.execute(`SELECT * FROM users WHERE id = ?`, [id]);
  return rows[0];
};
