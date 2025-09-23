

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail, findUserByPhone, updateUserOtp, verifyPassword } from "../models/User.model.js";
import { sendOtp } from "../lib/twilio.js";
import { sendOtpEmail } from "../lib/twilioemail.js";

const OTP_EXPIRATION = 5 * 60 * 1000; // 5 minutes
// ================= SIGNUP =================
export async function signup(req, res) {
  try {
    const { username, email, phone, password, countryCode, dialCode } = req.body;

    if (!username || !password || !phone || !countryCode || !dialCode) {
      return res.status(400).json({ message: "Username, password, phone, country code, and dial code are required" });
    }

    const normalizedEmail = email?.toLowerCase().trim();
    const cleanPhone = phone.replace(/\D/g, "");
    const cleanCountryCode = countryCode.replace(/\D/g, "");
    const cleanDialCode = dialCode.replace(/\D/g, "");

    // Check for existing user
    const existingUser = normalizedEmail
      ? await findUserByEmail(normalizedEmail)
      : await findUserByPhone(cleanPhone);

    if (existingUser) {
      const conflictField = existingUser.email === normalizedEmail ? "email" : "phone number";
      return res.status(409).json({ message: `User already exists with this ${conflictField}` });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    // Pass countryCode and dialCode to createUser
    const newUser = await createUser({
      username: username.trim(),
      email: normalizedEmail,
      phone: cleanPhone,
      password,
      countryCode: cleanCountryCode,
      dialCode: cleanDialCode
    });

    return res.status(201).json({
      message: "User created successfully",
      user: newUser
    });
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
}


// ================= LOGIN =================
export async function login(req, res) {
  try {
    const { email, phone, password} = req.body;

    // Check required fields
    if ((!email && !phone) || !password) {
      return res.status(400).json({ message: "Email/Phone and password are required" });
    }

    // Normalize input
    const identifier = email ? email.toLowerCase().trim() : phone.replace(/\D/g, "");
    const existingUser = email
      ? await findUserByEmail(identifier)
      : await findUserByPhone(identifier);

    if (!existingUser) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await verifyPassword(existingUser, password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate OTP
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + OTP_EXPIRATION);

    await updateUserOtp(existingUser.id, hashedOtp, otpExpires);

    let smsOk = false;
    let emailOk = false;
    const errors = [];

    // Send SMS OTP
    try {
      console.log(existingUser);
      if (existingUser.phone && existingUser.dialCode) {
        const fullPhone = `+${existingUser.phone.replace(/\D/g, "")}`;
        console.log(fullPhone);
        await sendOtp(fullPhone, otp);
        smsOk = true;
      }
    } catch (otpError) {
      console.error("OTP SMS sending failed:", otpError);
      errors.push({ type: "sms", error: otpError?.message || otpError });
    }

    // Send Email OTP
    try {
      if (existingUser.email) {
        await sendOtpEmail(existingUser.email, otp);
        emailOk = true;
      }
    } catch (emailError) {
      console.error("OTP email sending failed:", emailError);
      errors.push({ type: "email", error: emailError?.message || emailError });
    }

    if (!smsOk && !emailOk) {
      return res.status(500).json({
        message: "Failed to send OTP via SMS and Email. Please try again.",
        errors,
      });
    }

    // Remove sensitive info
    const { password: _, otp: __, otpExpires: ___, ...userWithoutSensitive } = existingUser;

    return res.status(200).json({
      message: "Password verified. OTP sent via SMS/Email.",
      user: userWithoutSensitive,
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


// ================= VERIFY OTP =================
export async function verifyOtp(req, res) {
  try {
    const { email, phone, otp } = req.body;

    if (!otp || (!email && !phone)) {
      return res.status(400).json({ message: "OTP and either email or phone are required" });
    }

    const identifier = email ? email.toLowerCase().trim() : phone;
    const user = email
      ? await findUserByEmail(identifier)
      : await findUserByPhone(identifier);

    if (!user || !user.otp || !user.otpExpires) {
      return res.status(400).json({ message: "OTP not found, please login again" });
    }

    if (new Date(user.otpExpires) < new Date()) {
      return res.status(400).json({ message: "OTP expired" });
    }

    const isValidOtp = await bcrypt.compare(otp.toString(), user.otp);
    if (!isValidOtp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Clear OTP
    await updateUserOtp(user.id, null, null);

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "100d",
    });

    res.cookie("token", token, {
      maxAge: 100 * 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    });

    const { password, otp: _, otpExpires, ...userWithoutSensitive } = user;

    return res.status(200).json({
      message: "OTP verified successfully",
      user: userWithoutSensitive,
      token,
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
}


// ================= LOGOUT =================
export async function logout(req, res) {
  res.clearCookie("token");
  return res.status(200).json({ message: "Logout successful" });
}

























































































