import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Home, BarChart3, Mail, Clock, FileText, ChevronLeft, ChevronRight,
  LogOut, ChevronDown, FormInput, Users, Package, Plus, Layers,
  Sparkles, Grid3X3, Database, Zap, Activity, Moon, Sun
} from 'lucide-react';

// Import the hooks from your existing codebase
import useLogout from '../hooks/useLogout.jsx';
import useAuth from '../hooks/useAuth.jsx';
import useDarkMode from '../hooks/useDarkMode.jsx';

let useRouterLocation;
try {
  const rr = require('react-router-dom');
  useRouterLocation = rr.useLocation;
} catch (e) {
  useRouterLocation = null;
}

// Sidebar component (self-contained)
const Sidebar = ({ initialCompact = false, onNavigate }) => {
  // State management
  const [compact, setCompact] = useState(() => initialCompact);
  const [expandedSections, setExpandedSections] = useState({});
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [activeProduct, setActiveProduct] = useState('email-builder');
  const [activePath, setActivePath] = useState('/dashboard');

  // Authentication and dark mode hooks
  const logout = useLogout();
  const { user } = useAuth();
  const { isDark, toggle } = useDarkMode();
  const navigate = useNavigate();

  // If react-router's useLocation exists, sync activePath with it.
  const location = useRouterLocation ? useRouterLocation() : null;

  // Product / menu structure with real Email Builder navigation from Navbar
  const products = [
    {
      id: 'form-builder',
      label: 'Form Builder',
      icon: FormInput,
      gradient: 'from-violet-600 to-purple-600',
      glowColor: 'rgba(139, 92, 246, 0.3)',
      children: [
        { to: '/forms', label: 'All Forms', icon: Grid3X3 },
        { to: '/forms/list', label: 'Templates', icon: Layers },
        // { to: '/form-analytics', label: 'Analytics', icon: Activity }
      ]
    },
    {
      id: 'email-builder',
      label: 'Email Builder',
      icon: Mail,
      gradient: 'from-blue-600 to-indigo-600',
      glowColor: 'rgba(59, 130, 246, 0.3)',
      children: [
        { to: '/', label: 'Home', icon: Home },
        { to: '/dashboard', label: 'Dashboard', icon: BarChart3 },
        { to: '/seeData', label: 'Email Service', icon: Mail },
        { to: '/history', label: 'History', icon: Clock },
        { to: '/templates', label: 'Templates', icon: FileText }
      ]
    },
    {
      id: 'lead-management',
      label: 'Lead Management',
      icon: Users,
      gradient: 'from-emerald-600 to-teal-600',
      glowColor: 'rgba(16, 185, 129, 0.3)',
      children: [
        { to: '/leads', label: 'All Leads', icon: Database },
        // { to: '/lead-scoring', label: 'Lead Scoring', icon: Zap },
        // { to: '/lead-analytics', label: 'Analytics', icon: Activity }
      ]
    }
  ];

  // Helper: expand a parent by id
  const ensureExpanded = (id) => {
    if (!id) return;
    setExpandedSections(prev => ({ ...prev, [id]: true }));
  };

  // When router location changes -> keep activePath in sync and expand matching parents
  useEffect(() => {
    if (location && location.pathname) {
      setActivePath(location.pathname);
      // expand parents that contain the path
      products.forEach(p => {
        const foundInProduct = p.children?.some(child => {
          if (child.to === location.pathname) return true;
          // check nested children
          return child.children?.some(grand => grand.to === location.pathname);
        });
        if (foundInProduct) {
          setExpandedSections(prev => ({ ...prev, [p.id]: true }));
        }
      });
    }
  }, [location]);

  // When activePath changes (internal click), expand parents automatically (useful without router)
  useEffect(() => {
    products.forEach(p => {
      const foundInProduct = p.children?.some(child => {
        if (child.to === activePath) return true;
        return child.children?.some(grand => grand.to === activePath);
      });
      if (foundInProduct) {
        setExpandedSections(prev => ({ ...prev, [p.id]: true }));
      }
    });
  }, [activePath]);

  // Toggle section expansion
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  // Navigation handler (keeps work without react-router)
  const navigateTo = (to) => {
    setActivePath(to);
    if (onNavigate && typeof onNavigate === 'function') {
      onNavigate(to);
    } else if (navigate) {
      navigate(to);
    }
    // If react-router is present the host app should handle navigation when using Link/NavLink.
  };

  // Logout handler
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  // Render nav item recursively (supports nested children)
  const renderNavItem = (item, depth = 0, parentKey = '') => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedSections[item.to || item.id || parentKey];
    const Icon = item.icon;
    const isActive = activePath === item.to;

    const paddingLeft = compact ? '' : depth > 0 ? 'pl-8' : 'pl-4';

    if (hasChildren) {
      return (
        <div key={(item.to || item.id || parentKey) + '-wrap'} className="relative">
          <button
            onClick={() => {
              if (item.to) {
                navigateTo(item.to);
              }
              toggleSection(item.to || item.id || parentKey);
            }}
            aria-expanded={!!isExpanded}
            className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-all duration-200 group relative ${compact ? 'justify-center' : ''} ${paddingLeft} ${isActive ? 'bg-gradient-to-r from-white/10 to-white/5 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
          >
            <Icon className="w-4 h-4 relative z-10" />

            {!compact && (
              <>
                <span className="text-sm font-medium flex-1 text-left relative z-10">{item.label}</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 relative z-10 ${isExpanded ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>

          {!compact && isExpanded && (
            <div className="mt-1 space-y-0.5">
              {item.children.map(child => renderNavItem(child, depth + 1, item.to || item.id))}
            </div>
          )}
        </div>
      );
    }

    // leaf link
    return (
      <button
        key={item.to}
        onClick={() => navigateTo(item.to)}
        aria-current={isActive ? 'page' : undefined}
        className={`flex items-center gap-3 px-4 py-2.5 rounded-lg w-full transition-all duration-200 group relative ${compact ? 'justify-center' : ''} ${depth > 0 ? 'pl-10' : 'pl-4'} ${isActive ? 'bg-gradient-to-r from-white/10 to-white/5 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
      >
        <Icon className="w-4 h-4 relative z-10" />
        {!compact && (
          <span className="text-sm font-medium text-left relative z-10">{item.label}</span>
        )}
      </button>
    );
  };

  // Real user data from auth context
  const userName = user?.username ?? user?.name ?? 'User';
  const userEmail = user?.email ?? '';

  return (
    <div className="bg-slate-50 dark:bg-slate-950 relative">
      {/* Glass overlay when sidebar is expanded on mobile/tablet */}
      {!compact && (
        <div
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setCompact(true)}
        />
      )}

      {/* Main Sidebar */}
      <aside className={`fixed left-0 top-0 h-full z-50 transition-all duration-300 ease-out ${compact ? 'w-20' : 'w-72'}`}>
        {/* Glassmorphism container */}
        <div className="h-full bg-slate-900/95 backdrop-blur-2xl border-r border-white/10 shadow-2xl shadow-black/50 flex flex-col relative overflow-hidden">

          {/* Animated gradient background */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 animate-pulse" />
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-600/10 via-transparent to-violet-600/10" />
          </div>

          {/* Content wrapper */}
          <div className="relative z-10 h-full flex flex-col">
            {/* Premium Header */}
            <div className="px-4 py-4 border-b border-white/10 bg-white/5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Animated logo */}
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-400 to-purple-500 blur-lg opacity-50 animate-pulse" />
                  </div>

                  {!compact && (
                    <div>
                      <h1 className="text-lg font-bold text-white tracking-tight">CRM Suite</h1>
                      <p className="text-xs text-slate-400 font-medium">Enterprise Portal</p>
                    </div>
                  )}
                </div>

               
                {!compact ? (
                  <div className="flex items-center gap-2">
                    {/* Dark Mode Toggle */}
                    <button
                      onClick={toggle}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 group"
                      aria-label="Toggle dark mode"
                      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                    >
                      {isDark ? (
                        <Sun className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                      ) : (
                        <Moon className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                      )}
                    </button>

                    <button
                      onClick={() => setCompact(!compact)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 group relative z-10"
                      aria-label="Toggle sidebar"
                    >
                      <ChevronLeft className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                    </button>
                  </div>
                ) : null}
              </div>

              {/* When compact, place toggle below the logo to prevent it overflowing horizontally */}
              {compact && (
                <div className="mt-3 flex justify-center gap-2">
                  {/* Dark Mode Toggle - Compact */}
                  <button
                    onClick={toggle}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 group"
                    aria-label="Toggle dark mode"
                    title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                  >
                    {isDark ? (
                      <Sun className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                    ) : (
                      <Moon className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                    )}
                  </button>

                  <button
                    onClick={() => setCompact(!compact)}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/20 group relative z-10"
                    aria-label="Expand sidebar"
                    title="Expand sidebar"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-white transition-colors" />
                  </button>
                </div>
              )}
            </div>

            {/* Product Selector */}
            <div className="px-3 py-3 border-b border-white/10 bg-gradient-to-b from-white/5 to-transparent">
              <div className={`${compact ? 'space-y-2' : 'space-y-2'}`}>
                {products.map((product) => {
                  const Icon = product.icon;
                  const isActive = activeProduct === product.id;

                  return (
                    <button
                      key={product.id}
                      onClick={() => {
                        setActiveProduct(product.id);
                        // ensure corresponding product is expanded so nav shows below
                        setExpandedSections(prev => ({ ...prev, [product.id]: true }));
                      }}
                      onMouseEnter={() => setHoveredProduct(product.id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300 relative group ${compact ? 'justify-center' : ''} ${isActive ? 'bg-gradient-to-r ' + product.gradient + ' text-white shadow-lg' : 'hover:bg-white/5 text-slate-300 hover:text-white'}`}
                      style={{ boxShadow: isActive ? `0 10px 30px -10px ${product.glowColor}` : '' }}
                      aria-pressed={isActive}
                    >
                      <Icon className="w-5 h-5 relative z-10" />
                      {!compact && (
                        <span className="text-sm font-semibold relative z-10">{product.label}</span>
                      )}

                      {/* Hover effect */}
                      {hoveredProduct === product.id && !isActive && (
                        <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-white/5 rounded-lg animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto px-3 py-4">
              <div className="space-y-1">
                {products.find(p => p.id === activeProduct)?.children?.map(item => renderNavItem(item))}
              </div>
            </nav>

            {/* Premium User Footer */}
            <div className="px-3 py-4 border-t border-white/10 bg-gradient-to-t from-black/30 to-transparent">
              <div className={`flex items-center gap-3 ${compact ? 'flex-col' : ''}`}>
                {/* Animated avatar */}
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/30">
                    {userName?.[0]?.toUpperCase() ?? 'U'}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900 shadow-lg shadow-emerald-500/50" />
                </div>

                {!compact && (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{userName}</p>
                      <p className="text-xs text-slate-400 truncate">{userEmail}</p>
                    </div>

                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 group"
                      title="Logout"
                    >
                      <LogOut className="w-4 h-4 text-slate-300 group-hover:text-red-400 transition-colors" />
                    </button>
                  </>
                )}

                {/* Compact mode - logout button below avatar */}
                {compact && (
                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-red-500/20 group"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4 text-slate-300 group-hover:text-red-400 transition-colors" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
};

export const Layout = ({ children }) => {
  return (
    <div className="min-h-screen">
      <Sidebar />
      <main className="">
        {children}
      </main>
    </div>
  );
};

export default Sidebar;

