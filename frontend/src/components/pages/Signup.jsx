// src/pages/Signup.jsx
import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Link } from 'react-router';
import SignupSVG from '../../assets/signup1.svg';

const countries = [
  { name: 'United States', iso: 'US', dialCode: '1' },
  { name: 'India', iso: 'IN', dialCode: '91' },
  { name: 'United Kingdom', iso: 'GB', dialCode: '44' },
  { name: 'Canada', iso: 'CA', dialCode: '1' },
  { name: 'Australia', iso: 'AU', dialCode: '61' },
  { name: 'Germany', iso: 'DE', dialCode: '49' },
  { name: 'France', iso: 'FR', dialCode: '33' },
  { name: 'Brazil', iso: 'BR', dialCode: '55' },
  { name: 'Mexico', iso: 'MX', dialCode: '52' },
  { name: 'South Africa', iso: 'ZA', dialCode: '27' },
];

const Signup = () => {
  // ✅ initialize from the first country in the list
  const defaultCountry = countries[0];

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    country: defaultCountry.name,
    countryCode: defaultCountry.iso,
    dialCode: defaultCountry.dialCode,
  });

  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleCountryChange = (e) => {
    const selectedCountry = countries.find((c) => c.name === e.target.value);
    if (!selectedCountry) return;
    setFormData({
      ...formData,
      country: selectedCountry.name,
      countryCode: selectedCountry.iso,
      dialCode: selectedCountry.dialCode,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData);

    if (!formData.username || !formData.email || !formData.password || !formData.phone) {
      return alert('Please fill all required fields.');
    }

    if (formData.password.length < 8) {
      return alert('Password must be at least 8 characters.');
    }

    const phoneDigits = formData.phone.replace(/\D/g, '');
    if (phoneDigits.length < 7 || phoneDigits.length > 15) {
      return alert('Please enter a valid phone number.');
    }

    const fullPhone = `+${formData.dialCode}${phoneDigits}`;
const payload = {
  username: formData.username.trim(),
  email: formData.email.trim().toLowerCase(),
  phone: fullPhone,            
  password: formData.password,
  countryCode: formData.countryCode,
  dialCode: formData.dialCode, 
};


    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BASE_URL}/api/auth/signup`,
        payload,
        { headers: { 'Content-Type': 'application/json' }, withCredentials: true }
      );

      if (res.status === 201 || res.status === 200) {
        alert('Signup successful! Please log in.');
        navigate('/login');
      }
    } catch (err) {
      console.error('Signup error:', err);
      alert(err.response?.data?.message || 'Something went wrong.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-sky-100 to-blue-200 px-4">
      <div className="bg-white shadow-xl rounded-xl flex max-w-4xl w-full overflow-hidden">
        {/* SVG */}
        <div className="hidden md:flex w-1/2 items-center justify-center bg-blue-600 p-6">
          <img src={SignupSVG} alt="Signup" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full md:w-1/2 p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Create Account</h2>

          <input
            type="text"
            name="username"
            placeholder="Full Name"
            value={formData.username}
            onChange={handleChange}
            autoComplete="name"
            className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          {/* Country selector */}
          <select
            name="country"
            value={formData.country}
            onChange={handleCountryChange}
            className="w-full mb-4 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {countries.map((c) => (
              <option key={c.iso} value={c.name}>
                {c.name} (+{c.dialCode})
              </option>
            ))}
          </select>

          {/* Phone with dial code */}
          <div className="flex gap-2 mb-4">
            <div className="flex items-center px-3 py-3 bg-gray-100 border rounded-lg text-gray-600 min-w-fit">
              +{formData.dialCode}
            </div>
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              autoComplete="tel"
              className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <input
            type="password"
            name="password"
            placeholder="Password (min 8 chars)"
            value={formData.password}
            onChange={handleChange}
            autoComplete="new-password"
            className="w-full mb-6 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white font-semibold p-3 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Sign Up
          </button>

          <p className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
