import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ showProfile = true, rightContent = null }) => {
    const { user } = useAuth();

    return (
        <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        CC
                    </div>
                    <span className="text-xl font-bold text-slate-900">Career Compass</span>
                </Link>
                <div className="flex items-center gap-4">
                    {rightContent}
                    {showProfile && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-100 to-violet-100 flex items-center justify-center">
                            <span className="text-sm font-semibold text-indigo-700">
                                {user?.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
