// src/lib/sendgrid.js
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
 
dotenv.config();
 
if (!process.env.SENDGRID_API_KEY) {
  console.warn("⚠️ SENDGRID_API_KEY not set in env. Email sending will fail.");
} else {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
}
 
/**
 * Send OTP email using SendGrid.
 * - email: recipient email
 * - otp: plain numeric OTP (6-digit)
 * - options: { subject, fromName, fromEmail }
 */
export async function sendOtpEmail(email, otp, options = {}) {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error("SendGrid API key not configured");
  }
  const fromEmail = process.env.FROM_EMAIL || options.fromEmail || "no-reply@example.com";
  const fromName = options.fromName || "Verification";
  const subject =
    options.subject || "Your One-Time Password (OTP) — Do not share this code";
 
  const text = `Your login OTP is ${otp}. It expires in 5 minutes. Do not share this code with anyone.`;
  const html = `
   <div style="font-family: Arial, Helvetica, sans-serif; max-width: 420px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #ffffff; line-height: 1.6; color: #333;">
  <h2 style="margin: 0 0 16px; font-size: 22px; font-weight: 600; color: #222; text-align: center;">
    Login Verification
  </h2>
  
  <p style="margin: 0 0 12px; font-size: 15px; text-align: center;">
    Please use the following one-time code to complete your login:
  </p>
  
  <p style="margin: 16px 0; font-size: 24px; font-weight: 700; letter-spacing: 4px; text-align: center; color: #2c3e50;">
    ${otp}
  </p>
  
  <p style="margin: 0; font-size: 13px; color: #666; text-align: center;">
    This code will expire in <strong>5 minutes</strong>. <br>
    For your security, do not share this code with anyone.
  </p>
</div>

  `;
 
  const msg = {
    to: email,
    from: { name: fromName, email: fromEmail },
    subject,
    text,
    html,
  };
 
  try {
    const result = await sgMail.send(msg);
    // send returns an array for each recipient; just log minimal success info
    console.log(`✅ OTP email sent to ${email}`);
    return result;
  } catch (err) {
    // Normalize error message
    const errMsg = err?.response?.body || err.message || err;
    console.error("❌ Error sending OTP email:", errMsg);
    // throw to let caller decide fallback
    throw err;
  }
}
 
 