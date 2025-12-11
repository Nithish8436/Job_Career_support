import React, { useEffect, useState } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Dropdown, DropdownItem, DropdownDivider } from '../components/ui/Dropdown';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Clock, FileText, TrendingUp, ArrowRight, Loader2, AlertCircle, Bot, Mic, User, LogOut, Settings, Sparkles, Target, BookOpen, Info } from 'lucide-react';
import { cn } from '../lib/utils';
import { useAuth } from '../context/AuthContext';
import Roadmap from '../components/Roadmap';
import ProfileModal from '../components/ProfileModal';

const DashboardPage = () => {
    const [matches, setMatches] = useState([]);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stats, setStats] = useState({
        total: 0,
        avgScore: 0,
        saved: 0
    });

    const { user, loading: authLoading, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const fetchMatches = async () => {
            if (!user) {
                console.log('No user found, skipping fetch');
                setLoading(false);
                return;
            }

            console.log('Fetching matches for user:', user);
            console.log('User ID:', user.id);

            try {
                const url = `http://localhost:5000/api/match/user/${user.id}`;
                console.log('Fetching from:', url);

                const response = await fetch(url);
                console.log('Response status:', response.status);

                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('Error response:', errorText);
                    throw new Error('Failed to fetch matches');
                }
                const data = await response.json();
                console.log('Received data:', data);

                if (data.success) {
                    setMatches(data.matches);

                    // Calculate stats
                    const total = data.matches.length;
                    const avgScore = total > 0
                        ? Math.round(data.matches.reduce((acc, curr) => acc + curr.overallScore, 0) / total)
                        : 0;

                    setStats({
                        total,
                        avgScore,
                        saved: data.matches.length
                    });
                }
            } catch (err) {
                console.error('Error fetching dashboard data:', err);
                setError('Failed to load your dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchMatches();
    }, [user]);

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} mins ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        return date.toLocaleDateString();
    };

    if (authLoading || (loading && user)) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Navbar */}
            <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                            CC
                        </div>
                        <span className="text-xl font-bold text-text">Career Compass</span>
                    </Link>
                    <div className="flex items-center gap-4">
                        <Dropdown
                            trigger={
                                <button className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm hover:shadow-lg transition-shadow cursor-pointer">
                                    {user?.name?.charAt(0).toUpperCase() || 'U'}
                                </button>
                            }
                        >
                            <div className="px-4 py-3 border-b border-gray-100">
                                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                            <DropdownItem icon={User} onClick={() => setShowProfileModal(true)}>
                                View Profile
                            </DropdownItem>
                            <DropdownItem icon={Settings} onClick={() => navigate('/dashboard')}>
                                Settings
                            </DropdownItem>
                            <DropdownDivider />
                            <DropdownItem icon={LogOut} onClick={handleLogout} variant="danger">
                                Logout
                            </DropdownItem>
                        </Dropdown>
                    </div>
                </div>
            </nav>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Enhanced Welcome Banner */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-purple-50 to-pink-50 border border-primary/20 p-6 md:p-8"
                >
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                                <h1 className="text-3xl md:text-4xl font-bold text-text mb-2">
                                    Welcome back, {user?.name?.split(' ')[0]}! 👋
                                </h1>
                                <p className="text-muted text-lg">
                                    {matches.length === 0
                                        ? "Let's get started on your career journey!"
                                        : "Here's your career progress at a glance."}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Link to="/interview">
                                    <Button variant="outline" className="gap-2 border-primary/20 text-primary hover:bg-primary/5 bg-white">
                                        <Mic className="w-4 h-4" />
                                        <span className="hidden sm:inline">Mock Interview</span>
                                    </Button>
                                </Link>
                                <Link to="/upload">
                                    <Button className="gap-2 shadow-lg shadow-primary/20">
                                        <Plus className="w-4 h-4" />
                                        New Analysis
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {/* Getting Started Tips for New Users */}
                        {matches.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="mt-6 p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-primary/10"
                            >
                                <div className="flex items-start gap-3">
                                    <Sparkles className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h3 className="font-semibold text-text mb-2">Getting Started</h3>
                                        <ul className="space-y-2 text-sm text-muted">
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                                Upload your resume and a job description to get your first match analysis
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                                Take a skills quiz to assess your knowledge
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-primary"></div>
                                                Practice with our AI-powered mock interviews
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                    {/* Decorative background elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-0"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl -z-0"></div>
                </motion.div>

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700"
                    >
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p className="text-sm">{error}</p>
                    </motion.div>
                )}

                {/* Enhanced Stats Grid with Tooltips */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow group">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div className="relative group/tooltip">
                                        <Info className="w-4 h-4 text-gray-400 cursor-help" />
                                        <div className="absolute right-0 top-6 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 pointer-events-none">
                                            Total number of resume-job match analyses you've completed
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-muted font-medium mb-1">Total Analyses</p>
                                <h3 className="text-3xl font-bold text-text">{stats.total}</h3>
                                <p className="text-xs text-muted mt-2">
                                    {stats.total > 0 ? 'Keep analyzing to improve!' : 'Start your first analysis'}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow group">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                                        <TrendingUp className="w-6 h-6" />
                                    </div>
                                    <div className="relative group/tooltip">
                                        <Info className="w-4 h-4 text-gray-400 cursor-help" />
                                        <div className="absolute right-0 top-6 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 pointer-events-none">
                                            Average compatibility score across all your job matches
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-muted font-medium mb-1">Avg. Match Score</p>
                                <div className="flex items-baseline gap-2">
                                    <h3 className="text-3xl font-bold text-text">{stats.avgScore}%</h3>
                                    {stats.avgScore >= 70 && (
                                        <span className="text-xs text-green-600 font-medium">Excellent!</span>
                                    )}
                                </div>
                                <p className="text-xs text-muted mt-2">
                                    {stats.avgScore >= 80 ? 'Outstanding performance!' :
                                        stats.avgScore >= 60 ? 'Good progress!' :
                                            stats.avgScore > 0 ? 'Room for improvement' : 'No data yet'}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <Card className="hover:shadow-lg transition-shadow group">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center text-yellow-600 group-hover:scale-110 transition-transform">
                                        <Clock className="w-6 h-6" />
                                    </div>
                                    <div className="relative group/tooltip">
                                        <Info className="w-4 h-4 text-gray-400 cursor-help" />
                                        <div className="absolute right-0 top-6 w-48 p-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 invisible group-hover/tooltip:opacity-100 group-hover/tooltip:visible transition-all z-10 pointer-events-none">
                                            Your saved analysis history for future reference
                                        </div>
                                    </div>
                                </div>
                                <p className="text-sm text-muted font-medium mb-1">Saved History</p>
                                <h3 className="text-3xl font-bold text-text">{stats.saved}</h3>
                                <p className="text-xs text-muted mt-2">
                                    {stats.saved > 0 ? 'View your past analyses' : 'No saved analyses yet'}
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Main Content Grid */}
                <div className="grid lg:grid-cols-3 gap-6 md:gap-8">
                    {/* Left Column: Recent Matches & Quick Actions */}
                    <div className="lg:col-span-2 space-y-6 flex flex-col">
                        {/* Quick Actions - More Prominent */}
                        <Card className="bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-blue-100 shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Target className="w-5 h-5 text-primary" />
                                    Quick Actions
                                </CardTitle>
                                <CardDescription>Choose your next step</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    <Link to="/upload" className="block h-full">
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="h-full p-4 bg-white rounded-xl border-2 border-transparent hover:border-primary/30 transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0">
                                                    <Plus className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-text mb-1">New Analysis</h4>
                                                    <p className="text-xs text-muted">Upload resume & job description</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Link>

                                    <Link to="/quiz" className="block h-full">
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="h-full p-4 bg-white rounded-xl border-2 border-transparent hover:border-purple-300 transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors flex-shrink-0">
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-text mb-1">Take Quiz</h4>
                                                    <p className="text-xs text-muted">Test your skills & knowledge</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Link>

                                    <Link to="/interview" className="block h-full">
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="h-full p-4 bg-white rounded-xl border-2 border-transparent hover:border-pink-300 transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-pink-100 flex items-center justify-center text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors flex-shrink-0">
                                                    <Mic className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-text mb-1">Mock Interview</h4>
                                                    <p className="text-xs text-muted">Practice with AI interviewer</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Link>

                                    <Link to="/chat" className="block h-full">
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="h-full p-4 bg-white rounded-xl border-2 border-transparent hover:border-blue-300 transition-all cursor-pointer group"
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0">
                                                    <Bot className="w-5 h-5" />
                                                </div>
                                                <div className="flex-1">
                                                    <h4 className="font-semibold text-text mb-1">AI Career Chat</h4>
                                                    <p className="text-xs text-muted">Get personalized advice</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Recent Matches */}
                        <Card className="flex-1 flex flex-col">
                            <CardHeader>
                                <CardTitle>Recent Matches</CardTitle>
                                <CardDescription>Your latest resume analyses</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1">
                                <div className="space-y-3">
                                    {matches.length === 0 ? (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="text-center py-12"
                                        >
                                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                                                <FileText className="w-10 h-10 text-gray-300" />
                                            </div>
                                            <h3 className="font-semibold text-text mb-2">No matches yet</h3>
                                            <p className="text-sm text-muted mb-4 max-w-sm mx-auto">
                                                Upload your resume and a job description to get started with your first analysis
                                            </p>
                                            <Link to="/upload">
                                                <Button className="gap-2">
                                                    <Plus className="w-4 h-4" />
                                                    Start Your First Analysis
                                                </Button>
                                            </Link>
                                        </motion.div>
                                    ) : (
                                        matches.slice(0, 7).map((match, index) => (
                                            <motion.div
                                                key={match._id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                            >
                                                <Link to={`/result?matchId=${match._id}`}>
                                                    <div className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-primary/30 hover:bg-gray-50 transition-all group">
                                                        <div className="flex items-center gap-4">
                                                            <div className={cn(
                                                                "w-14 h-14 rounded-xl flex items-center justify-center font-bold text-lg shadow-sm",
                                                                match.overallScore >= 80 ? "bg-green-100 text-green-700" :
                                                                    match.overallScore >= 60 ? "bg-yellow-100 text-yellow-700" :
                                                                        "bg-red-100 text-red-700"
                                                            )}>
                                                                {match.overallScore}%
                                                            </div>
                                                            <div>
                                                                <h4 className="font-semibold text-text group-hover:text-primary transition-colors">
                                                                    {match.jobTitle || 'Unknown Position'}
                                                                </h4>
                                                                <p className="text-sm text-muted">{formatDate(match.createdAt)}</p>
                                                            </div>
                                                        </div>
                                                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                                {matches.length > 7 && (
                                    <div className="mt-4 text-center">
                                        <Link to="/history" className="text-sm text-primary hover:underline font-medium">
                                            View all {matches.length} analyses →
                                        </Link>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Career Roadmap */}
                    <div className="lg:col-span-1 flex">
                        <div className="w-full">
                            <Roadmap />
                        </div>
                    </div>
                </div>

                {/* AI Chat Button */}
                <Link to="/chat" className="group">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 flex items-center justify-center hover:bg-primary/90 transition-colors z-50"
                        title="AI Coach"
                    >
                        <Bot className="w-7 h-7" />
                        {/* Tooltip */}
                        <span className="absolute right-16 bg-gray-700 text-white text-sm px-3 py-1.5 rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap shadow-lg">
                            AI Coach
                        </span>
                    </motion.button>
                </Link>
            </div>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
            />
        </div>
    );
};

export default DashboardPage;
