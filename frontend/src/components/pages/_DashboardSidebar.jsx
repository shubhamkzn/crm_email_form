import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Mail,
  Layout,
  BarChart3,
  Activity,
  History,
  ChevronRight,
} from 'lucide-react';

/**
 * Sidebar as NavLinks so routing + active styles come from react-router.
 *
 * Props:
 * - isOpen: boolean (for mobile overlay)
 * - setIsOpen: fn to close sidebar on mobile
 */
const Sidebar = ({ isOpen, setIsOpen }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Layout, to: '/dashboard' },
    { id: 'email-service', label: 'Email Service', icon: Mail, to: '/seeData' },
    { id: 'templates', label: 'Templates', icon: Layout, to: '/templates' },
    { id: 'statistics', label: 'Statistics', icon: BarChart3, to: '/statistics' },
    { id: 'status', label: 'Status', icon: Activity, to: '/status' },
    { id: 'history', label: 'History', icon: History, to: '/history' }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          aria-hidden
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950
          text-white w-72 z-50 transition-transform duration-300 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          border-r border-slate-800/50 shadow-2xl
        `}
        aria-label="Sidebar"
      >
        <div className="p-6 border-b border-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
              <Mail className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                KaiMail
              </h1>
              <p className="text-xs text-slate-400">Email Builder</p>
            </div>
          </div>
        </div>

        <nav className="p-4 space-y-1" role="navigation">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.id}
                to={item.to}
                className={({ isActive }) =>
                  `w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-violet-600/20 to-purple-600/20 text-violet-400 border border-violet-500/20 shadow-lg shadow-violet-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`
                }
                onClick={() => setIsOpen(false)} // close on mobile nav
                aria-current={undefined}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
                <span className="ml-auto">
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                </span>
              </NavLink>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
