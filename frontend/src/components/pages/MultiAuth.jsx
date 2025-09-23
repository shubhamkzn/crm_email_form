import axios from "axios";
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import loginSVG from "../../assets/login1.svg"; // adjust path if needed

const MultiAuth = () => {
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // ✅ email passed from Login.jsx
  const email = location.state?.email;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Email is missing. Please login again.");
      return;
    }

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/auth/verify-otp`,
        { email, otp },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.status === 200) {
        alert("2FA successful!");
        console.log(res.data);
        navigate("/dashboard"); 
      }
    } catch (err) {
      console.error("2FA error:", err);
      alert(err.response?.data?.message || "Invalid OTP.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-green-100 px-4">
      <div className="bg-white shadow-2xl rounded-xl flex max-w-4xl w-full overflow-hidden">
        <div className="hidden md:flex w-1/2 items-center justify-center bg-green-600 p-6">
          <img src={loginSVG} alt="2FA" />
        </div>

        <form onSubmit={handleSubmit} className="w-full md:w-1/2 p-8">
          <h2 className="text-3xl font-extrabold mb-6 text-center text-black">
            Two-Factor Authentication
          </h2>

          <input
            type="text"
            name="otp"
            placeholder="Enter 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="w-full mb-6 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
            required
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white font-semibold p-3 rounded-md hover:bg-green-700 transition"
          >
            Verify OTP
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            Didn’t get the code?{" "}
            <span className="text-green-600 font-semibold">Check your email</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default MultiAuth;
