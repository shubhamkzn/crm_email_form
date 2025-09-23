
import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config(); // Load .env variables

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);
console.log("TWILIO ENV:", process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN, process.env.TWILIO_PHONE_NUMBER);

async function sendSms() {
  try {
    const message = await client.messages.create({
      body: "Hello! This is a test message from Twilio (ESM).",
      from: process.env.TWILIO_PHONE_NUMBER, // Twilio number
      to: "+919369488728",              // Your personal number in E.164 format
    });

    console.log("Message sent! SID:", message.sid);
  } catch (error) {
    console.error("Error sending SMS:", error.message);
  }
}

sendSms();
