import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Shield, TrendingUp, FileText, Mic, Award, Sparkles, Edit2, Save, Menu, LogOut } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import SidebarOverlay from '../components/SidebarOverlay';
import { cn } from '../lib/utils';

const ProfilePage = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(true);
    const [stats, setStats] = useState({
        analyses: 0,
        interviews: 0,
        quizzes: 0,
        avgScore: 0
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(user?.name || '');

    useEffect(() => {
        const fetchUserStats = async () => {
            if (!user) return;

            try {
                // Fetch user's match history for analyses count
                const response = await fetch(`http://localhost:5000/api/match/user/${user.id}`);
                const data = await response.json();

                if (data.success) {
                    const totalAnalyses = data.matches.length;
                    const avgScore = totalAnalyses > 0
                        ? Math.round(data.matches.reduce((acc, curr) => acc + (curr.overallScore || 0), 0) / totalAnalyses)
                        : 0;

                    setStats(prev => ({
                        ...prev,
                        analyses: totalAnalyses,
                        avgScore
                    }));
                }
            } catch (error) {
                console.error('Error fetching user stats:', error);
            }
        };

        fetchUserStats();
    }, [user]);

    const handleLogout = () => {
        navigate('/');
        setTimeout(() => {
            logout();
        }, 100);
    };

    const handleSaveProfile = async () => {
        // Here you would typically update the user profile via API
        setIsEditing(false);
        // Update user context or API call would go here
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-slate-600">Please log in to view your profile</p>
                    <Button onClick={() => navigate('/login')} className="mt-4">Login</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex">
            {/* Mobile Sidebar Overlay */}
            <SidebarOverlay isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
                <Sidebar
                    user={user}
                    collapsed={collapsed}
                    onToggleCollapse={() => setCollapsed(!collapsed)}
                    onLogout={handleLogout}
                    onProfileClick={() => navigate('/profile')}
                    sidebarOpen={sidebarOpen}
                    onCloseSidebar={() => setSidebarOpen(false)}
                />
            </SidebarOverlay>

            {/* Desktop Sidebar */}
            <Sidebar
                user={user}
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed(!collapsed)}
                onLogout={handleLogout}
                onProfileClick={() => navigate('/profile')}
            />

            {/* Main Content */}
            <div className="flex-1">
                {/* Navbar */}
                <nav className="border-b border-slate-200/50 bg-white sticky top-0 z-20 backdrop-blur-sm bg-white/80">
                    <div className="px-4 h-16 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
                            >
                                <Menu className="w-5 h-5 text-slate-700" />
                            </button>

                            <span className="text-lg font-semibold text-slate-900">My Profile</span>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                            onClick={handleLogout}
                        >
                            <LogOut className="w-4 h-4" />
                            Logout
                        </Button>
                    </div>
                </nav>

                {/* Profile Content */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="space-y-8">
                        {/* Profile Header */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4 }}
                        >
                            <Card className="overflow-hidden border-slate-200/50 shadow-lg">
                                <div className="bg-gradient-to-br from-blue-600 to-cyan-500 h-32 relative">
                                    <div className="absolute -bottom-16 left-8">
                                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-700 to-cyan-600 border-4 border-white flex items-center justify-center text-white text-4xl font-bold shadow-xl">
                                            {user.name?.charAt(0).toUpperCase() || 'U'}
                                            <div className="absolute -top-1 -right-1">
                                                <Sparkles className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <CardContent className="pt-20 pb-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            {isEditing ? (
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="text"
                                                        value={editedName}
                                                        onChange={(e) => setEditedName(e.target.value)}
                                                        className="text-2xl font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-lg px-3 py-1"
                                                    />
                                                    <Button
                                                        size="sm"
                                                        onClick={handleSaveProfile}
                                                        className="bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white"
                                                    >
                                                        <Save className="w-4 h-4 mr-2" />
                                                        Save
                                                    </Button>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-3">
                                                    <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setIsEditing(true)}
                                                        className="p-1 hover:bg-slate-100"
                                                    >
                                                        <Edit2 className="w-4 h-4 text-slate-500" />
                                                    </Button>
                                                </div>
                                            )}
                                            <p className="text-slate-600 mt-1">{user.email}</p>
                                            <p className="text-sm text-slate-500 mt-2">
                                                Member since {formatDate(user.createdAt)}
                                            </p>
                                        </div>
                                        <div className={cn(
                                            "px-4 py-2 rounded-full text-sm font-semibold",
                                            "bg-gradient-to-r from-green-100 to-green-50 text-green-700 border border-green-200"
                                        )}>
                                            <Shield className="w-4 h-4 inline mr-2" />
                                            Active Account
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>


                        {/* Personal Information */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                        >
                            <Card className="border-slate-200/50 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-slate-900">Personal Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl border border-blue-200/50">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500 font-medium">Full Name</p>
                                                    <p className="text-base text-slate-900 font-semibold">{user.name}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gradient-to-br from-cyan-50 to-cyan-100/30 rounded-xl border border-cyan-200/50">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-100 to-cyan-50 flex items-center justify-center text-cyan-600">
                                                    <Mail className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500 font-medium">Email Address</p>
                                                    <p className="text-base text-slate-900 font-semibold">{user.email}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100/30 rounded-xl border border-purple-200/50">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center text-purple-600">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500 font-medium">Member Since</p>
                                                    <p className="text-base text-slate-900 font-semibold">{formatDate(user.createdAt)}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-4 bg-gradient-to-br from-green-50 to-green-100/30 rounded-xl border border-green-200/50">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center text-green-600">
                                                    <Shield className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm text-slate-500 font-medium">Account Status</p>
                                                    <p className="text-base text-green-900 font-semibold">Active</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>

                        {/* Recent Activity */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.3 }}
                        >
                            <Card className="border-slate-200/50 shadow-sm">
                                <CardHeader>
                                    <CardTitle className="text-slate-900">Recent Activity</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    {stats.analyses === 0 ? (
                                        <div className="text-center py-8">
                                            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Sparkles className="w-8 h-8 text-slate-300" />
                                            </div>
                                            <h3 className="font-semibold text-slate-900 mb-2">No activity yet</h3>
                                            <p className="text-sm text-slate-600 mb-4">
                                                Start analyzing your resume to see your activity here
                                            </p>
                                            <Button
                                                className="gap-2 bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white"
                                                onClick={() => navigate('/upload')}
                                            >
                                                <FileText className="w-4 h-4" />
                                                Start First Analysis
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200/50">
                                                <p className="text-sm text-slate-600">
                                                    You've completed <span className="font-semibold text-slate-900">{stats.analyses}</span> resume analyses with an average score of <span className="font-semibold text-slate-900">{stats.avgScore}%</span>
                                                </p>
                                            </div>
                                            <div className="flex justify-center">
                                                <Button
                                                    variant="outline"
                                                    className="border-slate-300 text-slate-700 hover:bg-slate-50"
                                                    onClick={() => navigate('/history')}
                                                >
                                                    View All Activities
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;