import React from 'react';
import { useNavigate } from 'react-router';
import useAuth from '../hooks/useAuth.jsx';
import Navbar from './Navbar.jsx';
import homeSvg from '../../assets/home1.svg';
import { useDarkModeContext } from '../context/DarkModeContext.jsx'; // Import context

const Home = () => {
  const { loading, user } = useAuth();
  const navigate = useNavigate();
  const { isDark, toggle } = useDarkModeContext(); // Use centralized dark mode

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen text-xl font-semibold text-blue-600 dark:text-blue-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-300 text-gray-900 dark:text-gray-100">
      {/* Navbar */}
      {/* <Navbar darkMode={isDark} toggleDarkMode={toggle} /> */}

      {/* Hero Section */}
      <main className="flex flex-col md:flex-row items-center justify-center gap-12 py-20 px-6 max-w-6xl mx-auto">
        {/* Left Text Section */}
        <div className="text-center md:text-left max-w-xl">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-800 dark:text-blue-400 leading-tight mb-4">
            Welcome, {user?.username || 'User'}!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
            You’ve successfully logged in to{' '}
            <span className="font-semibold text-blue-600 dark:text-blue-400">
              Email Builder
            </span>
            . Get started by viewing your campaign performance and leads dashboard.
          </p>

          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-semibold transition"
          >
            Go to Dashboard
          </button>
        </div>

        {/* Right Illustration */}
        <div className="w-full max-w-md flex-shrink-0">
          <img src={homeSvg} alt="home illustration" className="w-full h-auto" />
        </div>
      </main>

      {/* Feature Section */}
      <section className="py-12 px-6 max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          {
            title: 'Track Leads',
            description: 'Instantly monitor your leads and optimize conversion performance.',
          },
          {
            title: 'Campaign Insights',
            description: 'Get real-time insights and visualize your campaign growth.',
          },
          {
            title: 'Simple Dashboard',
            description: 'All your performance metrics organized in one clean interface.',
          },
        ].map((feature, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center hover:shadow-lg transition break-words"
          >
            <h3 className="text-lg font-bold text-blue-700 dark:text-blue-400 mb-2">
              {feature.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">{feature.description}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Home;
