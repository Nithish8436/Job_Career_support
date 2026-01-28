import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { Home, BarChart2, CheckSquare, Settings, User, LogOut, ChevronLeft, ChevronRight, Menu, X, Plus, History, Mic, BookOpen, Bot } from 'lucide-react';
import Logo from './Logo';
import { Button } from './ui/Button';

const Sidebar = ({
  user,
  collapsed,
  onToggleCollapse,
  onLogout,
  onProfileClick,
  sidebarOpen = false,
  onCloseSidebar = () => { }
}) => {
  const location = useLocation();

  const sidebarItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      id: 'new-analysis',
      label: 'New Analysis',
      icon: Plus,
      path: '/upload',
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      id: 'history',
      label: 'History',
      icon: History,
      path: '/history',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: User,
      path: '/profile',
      color: 'text-cyan-600',
      bgColor: 'bg-cyan-100'
    },
    {
      id: 'interview',
      label: 'Interview',
      icon: Mic,
      path: '/interview',
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    },
    {
      id: 'quiz',
      label: 'Quiz',
      icon: BookOpen,
      path: '/quiz',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      id: 'chat',
      label: 'AI Chat',
      icon: Bot,
      path: '/chat',
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ];

  const isActive = (itemPath) => {
    if (!itemPath) return false;
    if (itemPath === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(itemPath);
  };

  const MobileSidebar = () => (
    <>
      <div className="p-4 border-b border-slate-200/50 flex items-center justify-between">
        <Link to="/dashboard" onClick={onCloseSidebar}>
          <Logo />
        </Link>
        <button
          onClick={onCloseSidebar}
          className="p-2 hover:bg-slate-100 rounded-lg"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
        {sidebarItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.id}
              to={item.path || '#'}
              onClick={() => {
                if (item.onClick) {
                  item.onClick();
                }
                onCloseSidebar();
              }}
              className={`flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group ${active ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
            >
              <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center ${active ? 'text-blue-700' : item.color
                }`}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className={`font-medium ${active ? 'text-blue-700 font-semibold' : 'text-slate-700'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-200/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full mt-4 border-slate-300 text-slate-700 hover:bg-slate-50"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </>
  );

  const DesktopSidebar = () => (
    <>
      <div className="p-4 border-b border-slate-200/50 flex items-center justify-between h-16">
        {!collapsed ? (
          <Logo />
        ) : (
          <Logo iconOnly={true} />
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 hover:bg-slate-100 rounded-lg ml-auto"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 scrollbar-hide">
        {sidebarItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.id}
              to={item.path || '#'}
              onClick={item.onClick}
              className={`flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group ${active ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                }`}
              title={collapsed ? item.label : ''}
            >
              <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center ${active ? 'text-blue-700' : item.color
                } flex-shrink-0`}>
                <item.icon className="w-5 h-5" />
              </div>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 1 }}
                  animate={{ opacity: collapsed ? 0 : 1 }}
                  className={`font-medium whitespace-nowrap ${active ? 'text-blue-700 font-semibold' : 'text-slate-700'
                    }`}
                >
                  {item.label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-200/50">
        {!collapsed ? (
          <>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full mt-4 border-slate-300 text-slate-700 hover:bg-slate-50"
              onClick={onLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </>
        ) : (
          <div className="flex flex-col items-center space-y-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="border-slate-300 text-slate-700 hover:bg-slate-50"
              onClick={onLogout}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </>
  );

  if (sidebarOpen) {
    return (
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: 0 }}
        exit={{ x: -300 }}
        transition={{ type: "spring", damping: 25 }}
        className="fixed inset-y-0 left-0 w-64 bg-white border-r border-slate-200/50 z-50 lg:hidden flex flex-col"
      >
        <MobileSidebar />
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ width: 80 }}
      animate={{ width: collapsed ? 80 : 256 }}
      className="hidden lg:flex flex-col bg-white border-r border-slate-200/50 sticky top-0 h-screen z-30"
    >
      <DesktopSidebar />
    </motion.div>
  );
};

export default Sidebar;