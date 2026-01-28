import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';


const Navbar = ({ showProfile = true, rightContent = null }) => {
    const { user } = useAuth();

    return (
        <nav className="border-b border-slate-200/50 bg-white sticky top-0 z-50 backdrop-blur-sm bg-white/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <Link to={user ? "/dashboard" : "/"} className="block">
                    <Logo />
                </Link>
                <div className="flex items-center gap-4">
                    {rightContent}
                    {showProfile && (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center text-white font-bold text-sm hover:shadow-lg hover:shadow-blue-600/30 transition-shadow">
                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;