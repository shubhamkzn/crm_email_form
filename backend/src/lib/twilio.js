import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export async function sendOtp(phone, otp) {
  
  try {
    const message = await client.messages.create({
      body: `Your login OTP is ${otp}`,
      from: process.env.TWILIO_PHONE_NUMBER, // must be a verified Twilio number
      to: phone, // must be in E.164 format (+919876543210)
    });    

    console.log(`✅ OTP sent to ${phone} (SID: ${message.sid})`);
  } catch (err) {
    console.error("❌ Error sending OTP:", err?.message || err);
    throw new Error("Failed to send OTP");
  }
}
