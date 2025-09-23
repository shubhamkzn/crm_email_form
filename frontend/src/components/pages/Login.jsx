import axios from "axios";
import React, { useState } from "react";
import loginSVG from "../../assets/login1.svg";
import { Link } from "react-router";
  import { ToastContainer, toast } from 'react-toastify';

const Login = () => {
  const [step, setStep] = useState(1); // 1 = login, 2 = OTP
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [emailForOTP, setEmailForOTP] = useState("");
  const [isResending, setIsResending] = useState(false);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // ✅ Login submit
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/auth/login`,
        formData,
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.status === 200) {
        toast.success("Login successful! OTP sent to your registered phone/email.");
        setEmailForOTP(formData.email);
        setStep(2);
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error(err.response?.data?.message || "Something went wrong. Try again.");
    }
  };

  // ✅ OTP submit
  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/auth/verify-otp`,
        { email: emailForOTP, otp },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true,
        }
      );

      if (res.status === 200) {
        toast.success("2FA successful! Redirecting...");
        setTimeout(() => {
          window.location.href = "/dashboard";
        }, 1500);
      }
    } catch (err) {
      console.error("OTP error:", err);
      toast.error(err.response?.data?.message || "Invalid OTP. Please retry.");
    }
  };

  // // ✅ Resend OTP (handle retry)
  // const handleResendOtp = async () => {
  //   if (!emailForOTP) {
  //     toast.error("Email not found. Please login again.");
  //     setStep(1);
  //     return;
  //   }
  //   try {
  //     setIsResending(true);
  //     const res = await axios.post(
  //       `${import.meta.env.VITE_BASE_URL}/api/auth/resend-otp`,
  //       { email: emailForOTP },
  //       {
  //         headers: { "Content-Type": "application/json" },
  //         withCredentials: true,
  //       }
  //     );

  //     if (res.status === 200) {
  //       toast.success("A new OTP has been sent to your registered email/phone.");
  //     }
  //   } catch (err) {
  //     console.error("Resend OTP error:", err);
  //     toast.error(err.response?.data?.message || "Failed to resend OTP.");
  //   } finally {
  //     setIsResending(false);
  //   }
  // };

  return (
<div className="h-screen w-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      {/* ✅ Global toaster */}
      <ToastContainer position="top-center" reverseOrder={false} />

      <div className="bg-white shadow-2xl rounded-xl flex max-w-4xl w-full overflow-hidden">
        <div className="hidden md:flex w-1/2 items-center justify-center bg-blue-600 p-6">
          <img src={loginSVG} alt="Login" />
        </div>

        <div className="w-full md:w-1/2 p-8">
          {/* Step 1: Login */}
          {step === 1 && (
            <form onSubmit={handleLoginSubmit}>
              <h2 className="text-3xl font-extrabold mb-6 text-center text-black">
                Login to Your Account
              </h2>
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                className="w-full mb-4 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="w-full mb-6 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-semibold p-3 rounded-md hover:bg-blue-700 transition"
              >
                Log In
              </button>
              <p className="mt-4 text-center text-sm text-gray-600">
                Don’t have an account?{" "}
                <Link
                  to="/signup"
                  className="text-blue-600 font-semibold hover:underline"
                >
                  Sign Up
                </Link>
              </p>
            </form>
          )}

          {/* Step 2: OTP */}
          {step === 2 && (
            <form onSubmit={handleOTPSubmit}>
              <h2 className="text-3xl font-extrabold mb-6 text-center text-black">
                Two-Factor Authentication
              </h2>
              <p className="mb-4 text-center text-gray-600">
                Enter the OTP sent to your registered phone/email
              </p>
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
              {/* <p className="mt-6 text-center text-sm text-gray-600">
                Didn’t get the code?{" "}
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-green-600 font-semibold hover:underline disabled:opacity-50"
                  disabled={isResending}
                >
                  {isResending ? "Resending..." : "Resend"}
                </button>
              </p> */}
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
