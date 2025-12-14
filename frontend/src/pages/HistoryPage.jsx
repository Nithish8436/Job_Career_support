import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Calendar, ArrowRight, Search, Filter, Trash2, Loader2, AlertTriangle, Menu } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { cn } from '../lib/utils';
import Sidebar from '../components/Sidebar';
import SidebarOverlay from '../components/SidebarOverlay';
import ProfileModal from '../components/ProfileModal';

const HistoryPage = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [deleting, setDeleting] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(true);
    const [showProfileModal, setShowProfileModal] = useState(false);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/match/user/${user.id}?limit=100`, {
                    headers: { 'x-auth-token': token }
                });
                const data = await response.json();
                if (data.success) {
                    setMatches(data.matches);
                }
            } catch (error) {
                console.error('Error fetching history:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchHistory();
        }
    }, [user, token]);

    const handleLogout = () => {
        navigate('/');
        setTimeout(() => {
            logout();
        }, 100);
    };

    const handleDeleteMatch = async (matchId, e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!window.confirm('Are you sure you want to delete this match history? This action cannot be undone.')) {
            return;
        }

        setDeleting(matchId);
        try {
            const response = await fetch(`http://localhost:5000/api/match/${matchId}`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (response.ok) {
                setMatches(matches.filter(m => m._id !== matchId));
            } else {
                alert('Failed to delete match. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting match:', error);
            alert('Error deleting match. Please try again.');
        } finally {
            setDeleting(null);
        }
    };

    const handleDeleteAll = async () => {
        if (!window.confirm('Are you sure you want to delete ALL match histories? This action cannot be undone.')) {
            return;
        }

        setDeleting('all');
        try {
            const response = await fetch(`http://localhost:5000/api/match/user/${user.id}/all`, {
                method: 'DELETE',
                headers: { 'x-auth-token': token }
            });

            if (response.ok) {
                setMatches([]);
            } else {
                alert('Failed to delete matches. Please try again.');
            }
        } catch (error) {
            console.error('Error deleting matches:', error);
            alert('Error deleting matches. Please try again.');
        } finally {
            setDeleting(null);
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
        if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
        return 'text-red-600 bg-red-50 border-red-200';
    };

    const filteredMatches = matches.filter(match => {
        const matchesSearch = (match.jobTitle || 'Untitled Position').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (match.company || '').toLowerCase().includes(searchTerm.toLowerCase());

        if (filter === 'all') return matchesSearch;
        if (filter === 'high') return matchesSearch && (match.overallScore || 0) >= 80;
        if (filter === 'medium') return matchesSearch && (match.overallScore || 0) >= 60 && (match.overallScore || 0) < 80;
        if (filter === 'low') return matchesSearch && (match.overallScore || 0) < 60;
        return matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex">
            {/* Mobile Sidebar Overlay */}
            <SidebarOverlay isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)}>
                <Sidebar
                    user={user}
                    collapsed={collapsed}
                    onToggleCollapse={() => setCollapsed(!collapsed)}
                    onLogout={handleLogout}
                    onProfileClick={() => setShowProfileModal(true)}
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
                onProfileClick={() => setShowProfileModal(true)}
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
                            <span className="text-lg font-semibold text-slate-900">Analysis History</span>
                        </div>
                    </div>
                </nav>

                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">Analysis History</h1>
                            <p className="text-slate-600 mt-1">View and manage your past resume analyses</p>
                        </div>
                        <div className="flex gap-2">
                            {matches.length > 0 && (
                                <Button
                                    variant="outline"
                                    className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                                    onClick={handleDeleteAll}
                                    disabled={deleting === 'all'}
                                >
                                    <Trash2 className="w-4 h-4" />
                                    {deleting === 'all' ? 'Deleting...' : 'Delete All'}
                                </Button>
                            )}
                            <Link to="/upload">
                                <Button className="gap-2 bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white">
                                    <FileText className="w-4 h-4" />
                                    New Analysis
                                </Button>
                            </Link>
                        </div>
                    </div>

                    {/* Filters and Search */}
                    <Card className="mb-8 border-slate-200/50 shadow-sm">
                        <CardContent className="p-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search by job title or company..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-500"
                                    />
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                                    {['all', 'high', 'medium', 'low'].map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setFilter(f)}
                                            className={cn(
                                                "px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors",
                                                filter === f
                                                    ? "bg-gradient-to-r from-blue-700 to-cyan-600 text-white"
                                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                            )}
                                        >
                                            {f.charAt(0).toUpperCase() + f.slice(1)} Scores
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {loading ? (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                        </div>
                    ) : filteredMatches.length > 0 ? (
                        <div className="grid gap-4">
                            {filteredMatches.map((match, index) => (
                                <motion.div
                                    key={match._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link to={`/result?matchId=${match._id}`}>
                                        <Card className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-transparent hover:border-l-blue-500 border-slate-200/50 shadow-sm">
                                            <CardContent className="p-6">
                                                <div className="flex flex-col md:flex-row md:items-center gap-6">
                                                    {/* Score Bubble */}
                                                    <div className={cn(
                                                        "w-16 h-16 rounded-2xl flex items-center justify-center text-xl font-bold border-2 flex-shrink-0",
                                                        getScoreColor(match.overallScore || 0)
                                                    )}>
                                                        {match.overallScore || 0}%
                                                    </div>

                                                    {/* Details */}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-lg font-bold text-slate-900 truncate">
                                                            {match.jobTitle || 'Untitled Position'}
                                                        </h3>
                                                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-1 text-sm text-slate-500">
                                                            <span className="flex items-center gap-1.5">
                                                                <Calendar className="w-4 h-4" />
                                                                {new Date(match.createdAt).toLocaleDateString(undefined, {
                                                                    year: 'numeric',
                                                                    month: 'long',
                                                                    day: 'numeric'
                                                                })}
                                                            </span>
                                                            {match.company && (
                                                                <span className="flex items-center gap-1.5">
                                                                    <FileText className="w-4 h-4" />
                                                                    {match.company}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex items-center gap-4 text-blue-600 font-medium text-sm">
                                                        <button
                                                            onClick={(e) => handleDeleteMatch(match._id, e)}
                                                            disabled={deleting === match._id}
                                                            className="p-2 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg transition-colors disabled:opacity-50"
                                                            title="Delete this match"
                                                        >
                                                            {deleting === match._id ? (
                                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                            ) : (
                                                                <Trash2 className="w-4 h-4" />
                                                            )}
                                                        </button>
                                                        <div className="flex items-center gap-2">
                                                            View Report
                                                            <ArrowRight className="w-4 h-4" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="w-8 h-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 mb-1">No analyses found</h3>
                            <p className="text-slate-500 mb-6">
                                {searchTerm || filter !== 'all'
                                    ? "Try adjusting your search or filters"
                                    : "Upload your resume to get your first analysis"}
                            </p>
                            {(searchTerm || filter !== 'all') ? (
                                <Button variant="outline" onClick={() => { setSearchTerm(''); setFilter('all'); }} className="border-slate-300 text-slate-700 hover:bg-slate-50">
                                    Clear Filters
                                </Button>
                            ) : (
                                <Link to="/upload">
                                    <Button className="bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white">Start New Analysis</Button>
                                </Link>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
            />
        </div>
    );
};

export default HistoryPage;