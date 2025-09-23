import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Layout, History, ArrowUpRight,FileText } from 'lucide-react';
import Navbar from './Navbar.jsx';
import useAuth from '../hooks/useAuth.jsx';
import { useDarkModeContext } from '../context/DarkModeContext.jsx'; // centralized dark mode

const Dashboard = () => {
  const { user } = useAuth();
  const { isDark } = useDarkModeContext(); // use centralized dark mode

  const services = [
    {
      id: 'email-service',
      title: 'Email Service',
      description: 'Send beautiful emails with our powerful API and SMTP service',
      icon: Mail,
      stats: { sent: '12.4k', pending: '234' },
      gradient: 'from-violet-600 to-purple-600',
      link: '/seeData'
    },
    {
      id: 'templates',
      title: 'Templates',
      description: 'Create and manage reusable email templates with dynamic content',
      icon: Layout,
      stats: { active: '48', drafts: '12' },
      gradient: 'from-blue-600 to-cyan-600',
      link: '/templates'
    },
    {
      id: 'history',
      title: 'History',
      description: 'View detailed logs of all email activities and transactions',
      icon: History,
      stats: { today: '523', week: '3.2k' },
      gradient: 'from-rose-600 to-pink-600',
      link: '/history'
    },
        {
      id: 'forms',
      title: 'Forms',
      description: 'Create, edit, and manage dynamic forms using Form.io',
      icon: FileText,
      stats: { created: '32', submissions: '1.4k' },
      gradient: 'from-emerald-600 to-teal-600',
      link: '/forms'
    }

  ];

  const welcomeName = user?.username || user?.name || 'there';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
      {/* Navbar */}
         {/* <Navbar /> */}


      {/* Main Content */}
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Welcome back, {welcomeName}! 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Here's what's happening with your email campaigns today
          </p>
        </div>

        {/* Services */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <Link
                key={service.id}
                to={service.link}
                className="relative group bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 hover:shadow-2xl transition-all duration-300 text-left overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <div className="relative z-10">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${service.gradient} mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>

                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {service.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                    {service.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <div className="flex gap-4">
                      {Object.entries(service.stats).map(([key, value]) => (
                        <div key={key}>
                          <p className="text-xs text-slate-500 dark:text-slate-500 capitalize">{key}</p>
                          <p className="text-sm font-semibold text-slate-900 dark:text-white">{value}</p>
                        </div>
                      ))}
                    </div>

                    <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
