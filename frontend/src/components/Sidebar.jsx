// components/Sidebar.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom'; // Add useLocation
import { 
  Home, Plus, History, User, Mic, BookOpen, Bot, 
  LogOut, ChevronLeft, ChevronRight, Sparkles, X 
} from 'lucide-react';
import { Button } from './ui/Button';

const Sidebar = ({ 
  user, 
  collapsed, 
  onToggleCollapse, 
  onLogout,
  onProfileClick,
  sidebarOpen = false,
  onCloseSidebar = () => {}
}) => {
  const location = useLocation(); // Get current location
  
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
    path: '/profile', // Changed from onClick to path
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

  // Check if current path matches sidebar item
  const isActive = (itemPath) => {
    if (!itemPath) return false;
    
    // Exact match for dashboard
    if (itemPath === '/dashboard') {
      return location.pathname === '/dashboard';
    }
    
    // For other paths, check if current path starts with item path
    // This handles nested routes like /result?matchId=...
    return location.pathname.startsWith(itemPath);
  };

  // Mobile Sidebar Component
  const MobileSidebar = () => (
    <>
      <div className="p-4 border-b border-slate-200/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
            CC
            <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 fill-yellow-400" />
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-transparent">
            Career Compass
          </span>
        </div>
        <button
          onClick={onCloseSidebar}
          className="p-2 hover:bg-slate-100 rounded-lg"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
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
              className={`flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group ${
                active ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center ${
                active ? 'text-blue-700' : item.color
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

  // Desktop Sidebar Component
  const DesktopSidebar = () => (
    <>
      <div className="p-4 border-b border-slate-200/50 flex items-center justify-between">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30">
              CC
              <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-400 fill-yellow-400" />
            </div>
            <motion.span
              initial={{ opacity: 1 }}
              animate={{ opacity: collapsed ? 0 : 1 }}
              className="text-lg font-bold bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-transparent whitespace-nowrap"
            >
              Career Compass
            </motion.span>
          </div>
        ) : (
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold shadow-lg shadow-blue-500/30 mx-auto">
            CC
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="p-1.5 hover:bg-slate-100 rounded-lg"
        >
          {collapsed ? (
            <ChevronRight className="w-4 h-4 text-slate-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-slate-600" />
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {sidebarItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.id}
              to={item.path || '#'}
              onClick={item.onClick}
              className={`flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group ${
                active ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
              }`}
              title={collapsed ? item.label : ''}
            >
              <div className={`w-10 h-10 rounded-lg ${item.bgColor} flex items-center justify-center ${
                active ? 'text-blue-700' : item.color
              } flex-shrink-0`}>
                <item.icon className="w-5 h-5" />
              </div>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 1 }}
                  animate={{ opacity: collapsed ? 0 : 1 }}
                  className={`font-medium whitespace-nowrap ${
                    active ? 'text-blue-700 font-semibold' : 'text-slate-700'
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

  // Return mobile sidebar container
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

  // Return desktop sidebar container
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