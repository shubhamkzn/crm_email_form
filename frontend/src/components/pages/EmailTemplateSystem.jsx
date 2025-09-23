import React from 'react';
import { useNavigate } from 'react-router';
import { Mail, Plus } from 'lucide-react';
import Navbar from './Navbar.jsx';
import { useDarkModeContext } from '../context/DarkModeContext.jsx'; // centralized dark mode

export default function EmailTemplateSystem() {
  const nav = useNavigate();
  const { isDark } = useDarkModeContext(); // centralized dark mode

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
      <Navbar />

      <div className="max-w-6xl mx-auto p-8">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Templates
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Choose to manage existing templates or start from a starter pack.
          </p>
        </header>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Existing Templates */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow hover:shadow-lg transition-colors duration-300">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Existing Templates
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  View, edit, duplicate or delete previously created templates.
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => nav('/templates/existing')}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors duration-300"
                  >
                    Open
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Build New Template */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow hover:shadow-lg transition-colors duration-300">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 text-white">
                <Plus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Build New Template
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                  Pick a starter template or start blank and customize it in the editor.
                </p>
                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() => nav('/templates/build')}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300"
                  >
                    Choose Starter
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
