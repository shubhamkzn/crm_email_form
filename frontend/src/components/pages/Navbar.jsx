import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Moon, Sun, Menu, LogOut } from 'lucide-react';
import useLogout from '../hooks/useLogout.jsx';
import useAuth from '../hooks/useAuth.jsx';
import useDarkMode from '../hooks/useDarkMode.jsx';

const Navbar = ({ setIsOpen }) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const logout = useLogout();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Centralized dark mode
  const { isDark, toggle } = useDarkMode();

  // Close menu on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest('#user-menu')) setUserMenuOpen(false);
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const userName = user?.username ?? user?.name ?? 'User';
  const userEmail = user?.email ?? '';

  return (
    <nav className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/50 sticky top-0 z-[999999]">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Menu & Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsOpen && setIsOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-slate-600 dark:text-slate-400" />
            </button>
            <NavLink to="/" className="text-2xl font-bold text-blue-700 dark:text-blue-400">
              Email Builder
            </NavLink>
          </div>

          {/* Center: Desktop Links */}
          <div className="hidden lg:flex items-center gap-4">
            {[
              { to: '/', label: 'Home' },
              { to: '/dashboard', label: 'Dashboard' },
              { to: '/seeData', label: 'Email Service' },
              { to: '/history', label: 'History' },
              { to: '/templates', label: 'Templates' },
            ].map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md font-medium ${
                    isActive
                      ? 'text-blue-800 dark:text-blue-400'
                      : 'text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-400'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* Right: User & Dark Mode */}
          <div className="flex items-center gap-4">
            {/* Dark Mode Toggle */}
            <button
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-slate-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>

            {/* User Menu */}
            <div className="relative" id="user-menu">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-3 px-4 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Welcome, {userName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{userEmail}</p>
                </div>
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold shadow-lg shadow-violet-500/20">
                  {userName?.[0]?.toUpperCase() ?? 'U'}
                </div>
              </button>

              {userMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setUserMenuOpen(false)}
                    aria-hidden
                  />
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50">
                    <div className="p-4 border-b border-slate-200 dark:border-slate-800">
                      <p className="font-medium text-slate-900 dark:text-white">{userName}</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{userEmail}</p>
                    </div>
                    <div className="p-2 border-t border-slate-200 dark:border-slate-800">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile logout */}
            <div className="lg:hidden">
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-3 py-1 rounded-md"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
