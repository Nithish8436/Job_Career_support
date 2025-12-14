import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, ArrowLeft, Download, Share2, Loader2, Bot, Sparkles, ArrowRight, Menu } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import SkillsRadar from '../components/SkillsRadar';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Wand2, FileText, Github } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import SidebarOverlay from '../components/SidebarOverlay';
import ProfileModal from '../components/ProfileModal';
import { useAuth } from '../context/AuthContext';

// Role -> image mapping
const careerImageMap = {
    'full stack': 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=1200&q=80',
    'technical lead': 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80',
    'lead': 'https://images.unsplash.com/photo-1504384764586-bb4cdc1707b0?auto=format&fit=crop&w=1200&q=80',
    'devops': 'https://images.unsplash.com/photo-1518773553398-650c184e0bb3?auto=format&fit=crop&w=1200&q=80',
    'data': 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=1200&q=80',
    'ml': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    'ai': 'https://images.unsplash.com/photo-1504386106331-3e4e71712b38?auto=format&fit=crop&w=1200&q=80',
    'security': 'https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=1200&q=80',
    'mobile': 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80',
    'product': 'https://images.unsplash.com/photo-1483478550801-ceba5fe50e8e?auto=format&fit=crop&w=1200&q=80',
    'design': 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
    'cloud': 'https://images.unsplash.com/photo-1454165205744-3b78555e5572?auto=format&fit=crop&w=1200&q=80'
};

const getCareerImage = (career) => {
    const title = career?.title?.toLowerCase() || '';

    const mapped = Object.entries(careerImageMap).find(([keyword]) => title.includes(keyword));
    if (mapped) return mapped[1];

    if (career?.imageUrl) return career.imageUrl;

    return `https://image.pollinations.ai/prompt/${encodeURIComponent(title || 'technology career workspace')}?width=800&height=400&nologo=true`;
};

const computeCareerMatch = (career, matchedSkills = [], overallScore = 0) => {
    const providedScore = [career?.matchScore, career?.matchPercent, career?.matchPercentage]
        .find(v => typeof v === 'number');
    if (providedScore || providedScore === 0) {
        return Math.round(providedScore);
    }

    const normalize = (val) => (val || '').toString().trim().toLowerCase();
    const normalizedMatched = Array.from(new Set(
        (matchedSkills || []).map(normalize).filter(Boolean)
    ));
    const required = (career?.requiredSkills || []).map(normalize).filter(Boolean);

    if (required.length && normalizedMatched.length) {
        const matchedCount = required.filter(req =>
            normalizedMatched.includes(req)
        ).length;
        return Math.round((matchedCount / required.length) * 100);
    }

    return overallScore ? Math.round(overallScore) : null;
};

const MatchResultPage = () => {
    const navigate = useNavigate();
    const [copyNotification, setCopyNotification] = useState(false);
    const [searchParams] = useSearchParams();
    const matchId = searchParams.get('matchId');
    const [matchData, setMatchData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [enhancedResume, setEnhancedResume] = useState(null);
    const [isGeneratingResume, setIsGeneratingResume] = useState(false);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(true);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const contentRef = useRef(null);
    const { user, logout } = useAuth();

    useEffect(() => {
        const fetchMatchData = async () => {
            if (!matchId) {
                setError('No match ID provided');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`http://localhost:5000/api/match/${matchId}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch match data');
                }
                const data = await response.json();
                setMatchData(data.match);
            } catch (err) {
                console.error('Fetch error:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchMatchData();
    }, [matchId]);

    const handleLogout = () => {
        navigate('/');
        setTimeout(() => {
            logout();
        }, 100);
    };

    const handleGenerateEnhancedResume = async () => {
        if (!matchData) return;
        setIsGeneratingResume(true);
        setShowResumeModal(true);

        try {
            const response = await fetch('http://localhost:5000/api/match/enhanced-resume', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    resumeId: matchData.resumeId,
                    jobDescription: matchData.jobDescription,
                    analysisResults: {
                        suggestions: matchData.suggestions
                    }
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate resume');
            }

            const pdfBlob = await response.blob();
            const pdfUrl = URL.createObjectURL(pdfBlob);
            setEnhancedResume(pdfUrl);
        } catch (err) {
            console.error('Resume generation error:', err);
            alert('Failed to generate enhanced resume. Please try again.');
            setShowResumeModal(false);
        } finally {
            setIsGeneratingResume(false);
        }
    };

    const handleDownloadEnhancedPDF = () => {
        if (!enhancedResume) return;

        const link = document.createElement('a');
        link.href = enhancedResume;
        link.download = 'enhanced_resume.pdf';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleExportPDF = async () => {
        if (!matchId) return;

        try {
            const originalText = 'Export PDF';
            const button = event.target.closest('button');
            const originalButtonHTML = button.innerHTML;
            button.disabled = true;
            button.innerHTML = 'Generating PDF...';

            const response = await fetch('http://localhost:5000/api/match/export-pdf', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ matchId }),
            });

            if (!response.ok) {
                throw new Error('Failed to generate PDF');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `career_report_${matchId}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            button.disabled = false;
            button.innerHTML = originalButtonHTML;
        } catch (err) {
            console.error('PDF Export failed:', err);
            alert('Failed to export PDF. Please try again.');
            if (event.target.closest('button')) {
                event.target.closest('button').disabled = false;
                event.target.closest('button').innerHTML = 'Export PDF';
            }
        }
    };

    const handleShare = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            alert('Link copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy:', err);
            alert('Failed to copy link');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-slate-600">Analyzing your resume...</p>
                </div>
            </div>
        );
    }

    if (error || !matchData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex items-center justify-center">
                <Card className="max-w-md border-slate-200/50 shadow-sm">
                    <CardContent className="p-8 text-center">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-slate-900 mb-2">Error Loading Results</h2>
                        <p className="text-slate-600 mb-4">{error || 'Match data not found'}</p>
                        <Link to="/upload">
                            <Button className="bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white">Try Again</Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const score = matchData.overallScore || 0;
    const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-red-600';
    const scoreBg = score >= 80 ? 'bg-green-100' : score >= 60 ? 'bg-yellow-100' : 'bg-red-100';
    const scoreBorder = score >= 80 ? 'border-green-200' : score >= 60 ? 'border-yellow-200' : 'border-red-200';

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
                            <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2 text-slate-700 hover:bg-slate-100"
                                onClick={() => navigate(-1)}
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Button>
                            <span className="text-lg font-semibold text-slate-900">Analysis Report</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="default"
                                size="sm"
                                className="gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white border-0 shadow-lg shadow-blue-600/25"
                                onClick={handleGenerateEnhancedResume}
                                disabled={isGeneratingResume}
                            >
                                {isGeneratingResume ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Wand2 className="w-4 h-4" />
                                )}
                                {isGeneratingResume ? 'Rewriting...' : 'Enhance Resume'}
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50" onClick={handleExportPDF}>
                                <Download className="w-4 h-4" />
                                Export PDF
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50" onClick={handleShare}>
                                <Share2 className="w-4 h-4" />
                                Share
                            </Button>
                        </div>
                    </div>
                </nav>

                {/* Eligibility Warning */}
                {matchData.eligibility && !matchData.eligibility.eligible && (
                    <div className="bg-red-50 border-b-2 border-red-200">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                                <div>
                                    <h3 className="font-bold text-red-900 text-lg mb-1">Not Eligible for This Position</h3>
                                    <p className="text-red-800">{matchData.eligibility.reason}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={contentRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="grid lg:grid-cols-12 gap-8">
                        {/* Left Column: Summary */}
                        <div className="lg:col-span-4 space-y-6">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Card className="overflow-hidden border-slate-200/50 shadow-lg">
                                    <CardHeader className="bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50 border-b border-slate-200 pb-8">
                                        <CardTitle className="text-center mb-2 text-xl text-slate-900">Overall Match Score</CardTitle>
                                        <div className="flex justify-center my-6">
                                            <div className={cn(
                                                "relative w-44 h-44 rounded-full flex items-center justify-center shadow-2xl",
                                                score >= 80 ? "bg-gradient-to-br from-green-500 to-green-600" :
                                                    score >= 60 ? "bg-gradient-to-br from-yellow-500 to-yellow-600" :
                                                        "bg-gradient-to-br from-red-500 to-red-600"
                                            )}>
                                                <div className="absolute inset-2 bg-white rounded-full flex items-center justify-center">
                                                    <span className={cn("text-6xl font-black", scoreColor)}>
                                                        {score}%
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-center text-base font-semibold text-slate-700">
                                            {score >= 80 ? '🚀 Excellent Match!' : score >= 60 ? '👍 Good Potential' : '🚧 Needs Improvement'}
                                        </p>
                                    </CardHeader>
                                    <CardContent className="pt-6 space-y-5 px-6 pb-6">
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm font-semibold">
                                                <span className="text-slate-700">Skills Match</span>
                                                <span className="text-green-600">{matchData.breakdown?.skillsScore || 0}%</span>
                                            </div>
                                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${matchData.breakdown?.skillsScore || 0}%` }}
                                                    transition={{ duration: 1, delay: 0.2 }}
                                                    className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm font-semibold">
                                                <span className="text-slate-700">Experience</span>
                                                <span className="text-blue-600">{matchData.breakdown?.experienceScore || 0}%</span>
                                            </div>
                                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${matchData.breakdown?.experienceScore || 0}%` }}
                                                    transition={{ duration: 1, delay: 0.4 }}
                                                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm font-semibold">
                                                <span className="text-slate-700">Education</span>
                                                <span className="text-cyan-600">{matchData.breakdown?.educationScore || 0}%</span>
                                            </div>
                                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${matchData.breakdown?.educationScore || 0}%` }}
                                                    transition={{ duration: 1, delay: 0.6 }}
                                                    className="h-full bg-gradient-to-r from-cyan-500 to-cyan-600 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.1 }}
                            >
                                <SkillsRadar matchData={matchData} />
                            </motion.div>

                            {matchData.suggestions && matchData.suggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.1 }}
                                >
                                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100/50 border-blue-200/50 shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="text-lg text-blue-700 flex items-center gap-2">
                                                <AlertTriangle className="w-5 h-5" />
                                                Quick Actions
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            {matchData.suggestions.slice(0, 3).map((suggestion, index) => (
                                                <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-200/50 shadow-sm">
                                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0 text-xs font-bold border border-blue-200">{index + 1}</div>
                                                    <div>
                                                        <p className="text-sm font-medium text-slate-900">{suggestion.suggested || suggestion.reason}</p>
                                                        <p className="text-xs text-slate-500 mt-1">{suggestion.priority} priority</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </div>

                        {/* Right Column: Details */}
                        <div className="lg:col-span-8 space-y-6">
                            {/* Skill Gap Analysis */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.2 }}
                            >
                                <Card className="border-slate-200/50 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-slate-900">Skill Gap Analysis</CardTitle>
                                        <CardDescription className="text-slate-600">Comparison of your skills vs. job requirements</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid md:grid-cols-2 gap-8">
                                            <div>
                                                <h4 className="flex items-center gap-2 font-medium text-green-700 mb-4 bg-gradient-to-r from-green-50 to-green-100/50 p-2 rounded-lg border border-green-200">
                                                    <CheckCircle className="w-5 h-5" />
                                                    Matched Skills
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {matchData.matchedSkills && matchData.matchedSkills.length > 0 ? (
                                                        matchData.matchedSkills.map((skill, index) => (
                                                            <span key={index} className="px-3 py-1 bg-gradient-to-br from-green-100 to-green-50 text-green-700 rounded-full text-sm font-medium border border-green-200">
                                                                {skill}
                                                            </span>
                                                        ))
                                                    ) : (
                                                        <p className="text-sm text-slate-600">No matched skills found</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="flex items-center gap-2 font-medium text-red-700 mb-4 bg-gradient-to-r from-red-50 to-red-100/50 p-2 rounded-lg border border-red-200">
                                                    <XCircle className="w-5 h-5" />
                                                    Missing Skills
                                                </h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {matchData.missingSkills && matchData.missingSkills.length > 0 ? (
                                                        <>
                                                            {matchData.missingSkills.map((skill, index) => (
                                                                <span key={index} className="px-3 py-1 bg-gradient-to-br from-red-100 to-red-50 text-red-700 rounded-full text-sm font-medium border border-red-200">
                                                                    {skill}
                                                                </span>
                                                            ))}
                                                            <Link to="/chat" state={{ initialMessage: `I'm missing these skills: ${matchData.missingSkills.join(', ')}. How can I learn them quickly or show I have transferable skills?` }}>
                                                                <Button variant="outline" size="sm" className="h-7 text-xs gap-1 ml-2 border-slate-300 text-slate-700 hover:bg-slate-50">
                                                                    <Bot className="w-3 h-3" /> Fix with AI
                                                                </Button>
                                                            </Link>
                                                        </>
                                                    ) : (
                                                        <p className="text-sm text-slate-600">No missing skills identified</p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>

                            {/* GitHub Profile Analysis */}
                            {matchData.githubAnalysis && matchData.githubAnalysis.isPresent && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.2 }}
                                    className="mb-6"
                                >
                                    <Card className="bg-slate-900 border-slate-700 text-white overflow-hidden relative shadow-lg">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                            <Github size={120} />
                                        </div>

                                        <CardHeader>
                                            <CardTitle className="flex items-center gap-3 text-white">
                                                <Github className="w-6 h-6" />
                                                GitHub Profile Analysis
                                                {matchData.githubAnalysis.profileUrl && (
                                                    <a href={matchData.githubAnalysis.profileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline font-normal ml-auto flex items-center gap-1">
                                                        View Profile <ArrowRight className="w-3 h-3" />
                                                    </a>
                                                )}
                                            </CardTitle>
                                            <CardDescription className="text-slate-400">
                                                Evaluation of your open source presence and coding activity
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4 relative z-10">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                                    <div className="text-xs text-slate-400 mb-1">Activity Level</div>
                                                    <div className={cn(
                                                        "font-bold text-lg",
                                                        matchData.githubAnalysis.activityLevel === 'High' ? "text-green-400" :
                                                            matchData.githubAnalysis.activityLevel === 'Medium' ? "text-yellow-400" :
                                                                "text-slate-400"
                                                    )}>
                                                        {matchData.githubAnalysis.activityLevel}
                                                    </div>
                                                </div>
                                                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                                    <div className="text-xs text-slate-400 mb-1">Project Portfolio</div>
                                                    <div className={cn(
                                                        "font-bold text-lg",
                                                        matchData.githubAnalysis.projectQuality === 'Strong' ? "text-green-400" :
                                                            "text-blue-400"
                                                    )}>
                                                        {matchData.githubAnalysis.projectQuality}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
                                                <h4 className="font-semibold text-sm text-slate-300 mb-2">Analysis</h4>
                                                <p className="text-sm text-slate-400 leading-relaxed">
                                                    {matchData.githubAnalysis.analysis}
                                                </p>
                                            </div>

                                            <div className="flex items-start gap-3 bg-gradient-to-r from-blue-900/30 to-blue-800/30 border border-blue-900/50 p-4 rounded-lg">
                                                <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                                <div>
                                                    <h4 className="font-semibold text-sm text-blue-400 mb-1">Recommendation</h4>
                                                    <p className="text-sm text-slate-300">
                                                        {matchData.githubAnalysis.recommendation}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* Detailed Skill Analysis */}
                            {matchData.skillAnalysis && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.25 }}
                                >
                                    <Card className="border-slate-200/50 shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="text-slate-900">Detailed Skill Breakdown</CardTitle>
                                            <CardDescription className="text-slate-600">In-depth analysis of your technical and professional capabilities</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {/* Hard Skills */}
                                            <div className="space-y-3">
                                                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                    Hard Skills
                                                </h4>
                                                <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-200/50">
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {matchData.skillAnalysis.hardSkills?.matched?.map((skill, i) => (
                                                            <span key={i} className="px-2.5 py-1 bg-gradient-to-br from-green-100 to-green-50 text-green-700 rounded-md text-xs font-medium border border-green-200 flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3" /> {skill}
                                                            </span>
                                                        ))}
                                                        {matchData.skillAnalysis.hardSkills?.missing?.map((skill, i) => (
                                                            <span key={i} className="px-2.5 py-1 bg-gradient-to-br from-red-100 to-red-50 text-red-700 rounded-md text-xs font-medium border border-red-200 flex items-center gap-1">
                                                                <XCircle className="w-3 h-3" /> {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <p className="text-sm text-slate-600">
                                                        <span className="font-medium text-slate-900">Improvement:</span> {matchData.skillAnalysis.hardSkills?.improvements}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Soft Skills */}
                                            <div className="space-y-3">
                                                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-purple-500" />
                                                    Soft Skills
                                                </h4>
                                                <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-200/50">
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {matchData.skillAnalysis.softSkills?.matched?.map((skill, i) => (
                                                            <span key={i} className="px-2.5 py-1 bg-gradient-to-br from-green-100 to-green-50 text-green-700 rounded-md text-xs font-medium border border-green-200 flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3" /> {skill}
                                                            </span>
                                                        ))}
                                                        {matchData.skillAnalysis.softSkills?.missing?.map((skill, i) => (
                                                            <span key={i} className="px-2.5 py-1 bg-gradient-to-br from-red-100 to-red-50 text-red-700 rounded-md text-xs font-medium border border-red-200 flex items-center gap-1">
                                                                <XCircle className="w-3 h-3" /> {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <p className="text-sm text-slate-600">
                                                        <span className="font-medium text-slate-900">Improvement:</span> {matchData.skillAnalysis.softSkills?.improvements}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Technical Skills */}
                                            <div className="space-y-3">
                                                <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-indigo-500" />
                                                    Technical Skills
                                                </h4>
                                                <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl p-4 border border-slate-200/50">
                                                    <div className="flex flex-wrap gap-2 mb-3">
                                                        {matchData.skillAnalysis.technicalSkills?.matched?.map((skill, i) => (
                                                            <span key={i} className="px-2.5 py-1 bg-gradient-to-br from-green-100 to-green-50 text-green-700 rounded-md text-xs font-medium border border-green-200 flex items-center gap-1">
                                                                <CheckCircle className="w-3 h-3" /> {skill}
                                                            </span>
                                                        ))}
                                                        {matchData.skillAnalysis.technicalSkills?.missing?.map((skill, i) => (
                                                            <span key={i} className="px-2.5 py-1 bg-gradient-to-br from-red-100 to-red-50 text-red-700 rounded-md text-xs font-medium border border-red-200 flex items-center gap-1">
                                                                <XCircle className="w-3 h-3" /> {skill}
                                                            </span>
                                                        ))}
                                                    </div>
                                                    <p className="text-sm text-slate-600">
                                                        <span className="font-medium text-slate-900">Improvement:</span> {matchData.skillAnalysis.technicalSkills?.improvements}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* AI Suggestions */}
                            {matchData.suggestions && matchData.suggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.3 }}
                                >
                                    <Card className="border-slate-200/50 shadow-sm">
                                        <CardHeader>
                                            <CardTitle className="text-slate-900">AI Resume Improvements</CardTitle>
                                            <CardDescription className="text-slate-600">Prioritized suggestions to increase your impact</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-6">
                                            {matchData.suggestions.map((suggestion, index) => (
                                                <div key={index} className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                                                    <div className={cn("p-4 border-b border-slate-200 flex justify-between items-center",
                                                        suggestion.priority === 'high' ? 'bg-gradient-to-r from-red-50 to-red-100/50' :
                                                            suggestion.priority === 'medium' ? 'bg-gradient-to-r from-yellow-50 to-yellow-100/50' : 'bg-gradient-to-r from-blue-50 to-blue-100/50'
                                                    )}>
                                                        <span className="font-medium text-slate-800 capitalize flex items-center gap-2">
                                                            {suggestion.priority === 'high' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                                                            Resume Improvement
                                                        </span>
                                                        <span className={cn("text-xs font-bold px-2 py-1 rounded uppercase tracking-wide",
                                                            suggestion.priority === 'high' ? 'text-red-700 bg-gradient-to-r from-red-100 to-red-50 border border-red-200' :
                                                                suggestion.priority === 'medium' ? 'text-yellow-700 bg-gradient-to-r from-yellow-100 to-yellow-50 border border-yellow-200' :
                                                                    'text-blue-700 bg-gradient-to-r from-blue-100 to-blue-50 border border-blue-200'
                                                        )}>
                                                            {suggestion.priority} priority
                                                        </span>
                                                    </div>
                                                    <div className="p-4 grid md:grid-cols-2 gap-6">
                                                        {suggestion.original && (
                                                            <div className="space-y-2">
                                                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Original</p>
                                                                <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200 italic">
                                                                    "{suggestion.original}"
                                                                </p>
                                                            </div>
                                                        )}
                                                        <div className="space-y-2 col-span-2 md:col-span-1">
                                                            <p className="text-xs font-bold text-blue-600 uppercase tracking-wider">AI Suggested</p>
                                                            <p className="text-sm text-slate-900 bg-gradient-to-br from-blue-50 to-blue-100/50 p-3 rounded-lg border border-blue-200 font-medium">
                                                                {suggestion.suggested}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    {suggestion.reason && (
                                                        <div className="bg-slate-50 p-3 border-t border-slate-200">
                                                            <p className="text-xs text-slate-600"><strong>Why:</strong> {suggestion.reason}</p>
                                                        </div>
                                                    )}
                                                    <div className="bg-white p-3 border-t border-slate-200 flex justify-end gap-2">
                                                        <Link to="/chat" state={{
                                                            initialMessage: suggestion.original
                                                                ? `Help me rewrite my resume to address this suggestion: "${suggestion.suggested}". My original text was: "${suggestion.original}"`
                                                                : `I need to add this to my resume: "${suggestion.suggested}". I don't have this on my resume yet. Can you help me draft a bullet point or section for it?`
                                                        }}>
                                                            <Button variant="outline" size="sm" className="gap-2 h-8 text-xs border-slate-300 text-slate-700 hover:bg-slate-50">
                                                                <Bot className="w-3 h-3" /> Fix with AI
                                                            </Button>
                                                        </Link>
                                                        <Button variant="ghost" size="sm" className="h-8 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100" onClick={() => {
                                                            navigator.clipboard.writeText(suggestion.suggested);
                                                            setCopyNotification(true);
                                                            setTimeout(() => setCopyNotification(false), 2000);
                                                        }}>
                                                            Copy
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}

                            {/* Career Path Suggestions */}
                            {matchData.careerSuggestions && matchData.careerSuggestions.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.4, delay: 0.4 }}
                                >
                                    <Card className="overflow-hidden border-slate-200/50 shadow-lg">
                                        <CardHeader className="pb-6 pt-6 bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50 border-b border-slate-200">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="p-2 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl shadow-md">
                                                    <Sparkles className="w-6 h-6 text-white" />
                                                </div>
                                                <CardTitle className="text-2xl text-slate-900">
                                                    Explore Other Career Paths
                                                </CardTitle>
                                            </div>
                                            <CardDescription className="text-base text-slate-600 ml-14">
                                                Based on your skills, here are alternative career paths you might excel in
                                            </CardDescription>
                                        </CardHeader>
                                        <CardContent className="pb-8 pt-6">
                                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {matchData.careerSuggestions.map((career, index) => (
                                                    <motion.div
                                                        key={index}
                                                        initial={{ opacity: 0, y: 20 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.1 }}
                                                        whileHover={{ y: -8, scale: 1.02 }}
                                                        className="h-full"
                                                    >
                                                        <div className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-slate-200 flex flex-col h-full">
                                                            {/* Career Image */}
                                                            <div className="relative h-32 overflow-hidden flex-shrink-0">
                                                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent z-10" />
                                                                <img
                                                                    src={getCareerImage(career)}
                                                                    alt={career.title}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                                />
                                                                <div className="absolute top-3 right-3 z-20">
                                                                    <div className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white px-3 py-1 rounded-full shadow-lg shadow-blue-600/30">
                                                                        <span className="text-xs font-bold">
                                                                            {(() => {
                                                                                const aggregatedMatchedSkills = [
                                                                                    ...(matchData.matchedSkills || []),
                                                                                    ...(matchData.skillAnalysis?.hardSkills?.matched || []),
                                                                                    ...(matchData.skillAnalysis?.softSkills?.matched || []),
                                                                                    ...(matchData.skillAnalysis?.technicalSkills?.matched || [])
                                                                                ];
                                                                                const matchScore = computeCareerMatch(
                                                                                    career,
                                                                                    aggregatedMatchedSkills,
                                                                                    matchData.overallScore || 0
                                                                                );
                                                                                return matchScore !== null ? `${matchScore}% Match` : 'Match pending';
                                                                            })()}
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>

                                                            {/* Career Details */}
                                                            <div className="p-5 flex flex-col flex-grow">
                                                                <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-700 transition-colors">
                                                                    {career.title}
                                                                </h3>
                                                                <p className="text-sm text-slate-600 mb-4 leading-relaxed line-clamp-3 flex-grow">
                                                                    {career.description}
                                                                </p>

                                                                {/* Required Skills */}
                                                                <div className="mb-4">
                                                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                                                                        Skills to Learn
                                                                    </p>
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {career.requiredSkills.slice(0, 3).map((skill, i) => (
                                                                            <span
                                                                                key={i}
                                                                                className="px-2 py-1 bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-700 rounded-md text-[10px] font-semibold border border-blue-200"
                                                                            >
                                                                                {skill}
                                                                            </span>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                {/* Learn More Button */}
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="w-full gap-2 border-blue-200 text-blue-700 hover:bg-gradient-to-r hover:from-blue-600 hover:to-cyan-600 hover:text-white transition-all duration-300 font-semibold mt-auto"
                                                                >
                                                                    Learn More
                                                                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Copy Notification Toast */}
                {copyNotification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-700 to-cyan-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 shadow-blue-600/30"
                    >
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Copied to clipboard!</span>
                    </motion.div>
                )}
                <Modal
                    isOpen={showResumeModal}
                    onClose={() => setShowResumeModal(false)}
                    title="Enhanced Resume Preview"
                    size="xl"
                >
                    {isGeneratingResume ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                            <h3 className="text-lg font-semibold text-slate-800">Rewriting your resume...</h3>
                            <p className="text-slate-500 text-center max-w-md mt-2">
                                Our AI is analyzing your profile and the job description to create a tailored, ATS-friendly resume. This may take a few seconds.
                            </p>
                        </div>
                    ) : enhancedResume ? (
                        <div className="space-y-6">
                            <div className="bg-gradient-to-br from-slate-50 to-white rounded-xl border border-slate-200 h-[70vh] overflow-hidden">
                                <iframe
                                    src={enhancedResume}
                                    className="w-full h-full border-none"
                                    title="Enhanced Resume Preview"
                                />
                            </div>
                            <div className="flex justify-end gap-3">
                                <Button variant="outline" onClick={() => setShowResumeModal(false)} className="border-slate-300 text-slate-700 hover:bg-slate-50">
                                    Close
                                </Button>
                                <Button onClick={handleDownloadEnhancedPDF} className="gap-2 bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white">
                                    <Download className="w-4 h-4" />
                                    Download PDF
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-red-500">
                            Failed to load resume content.
                        </div>
                    )}
                </Modal>
            </div>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
            />
        </div>
    );
};

export default MatchResultPage;