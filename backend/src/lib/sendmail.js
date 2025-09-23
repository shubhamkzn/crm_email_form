// sendMail.js
import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";
import juice from "juice";  // <-- new import

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

export async function sendMail({ to, subject, text, html }) {
  if (!to || !subject || (!text && !html)) {
    throw new Error("Missing required fields");
  }

  // ✅ Convert CSS to inline styles automatically
  const inlinedHtml = html ? juice(html) : undefined;

  const msg = {
    to,
    from: process.env.MAIL_FROM, // from .env
    subject,
    text,
    html: inlinedHtml,
  };

  console.log("Final email payload:", msg);

  try {
    await sgMail.send(msg);
    return { success: true, message: "Email sent successfully!" };
  } catch (error) {
    console.error("SendGrid Error:", error.response?.body || error.message);
    throw new Error("Failed to send email");
  }
}
