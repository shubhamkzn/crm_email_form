// routes/auth.route.js
import express from "express";
import { login, signup, logout, verifyOtp } from "../controllers/auth.controllers.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/verify-otp", verifyOtp);  // ✅ Add this
router.post("/logout", logout);

router.get("/check-auth", protectRoute, (req, res) => {
  const token = req.cookies.token;
  res.status(200).json({ success: true, user: req.user, token });
});

export default router;
