// src/components/Layout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './pages/Sidebar.jsx';

export default function Layout() {
  return (
    <>
      <Sidebar />
      {/* Main: full width, no left padding, content starts at x=0 */}
      <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
        <div className="mx-auto p-4">
          <Outlet />
        </div>
      </main>
    </>
  );
}
