import React, { useEffect, useState, useRef } from 'react';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, ArrowLeft, Download, Share2, Loader2, Bot, Sparkles, ArrowRight } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { cn } from '../lib/utils';
import SkillsRadar from '../components/SkillsRadar';
import { toPng } from 'html-to-image';
import jsPDF from 'jspdf';
import { Wand2, FileText, Github } from 'lucide-react';

// Role -> image mapping to keep cards visually distinct
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

    // Prefer curated mapping for consistency
    const mapped = Object.entries(careerImageMap).find(([keyword]) => title.includes(keyword));
    if (mapped) return mapped[1];

    // If backend supplied something and we have no mapped hit, use it
    if (career?.imageUrl) return career.imageUrl;

    // Fallback: deterministic prompt-based image per title to avoid duplicates
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(title || 'technology career workspace')}?width=800&height=400&nologo=true`;
};

const computeCareerMatch = (career, matchedSkills = [], overallScore = 0) => {
    // If backend provided a score in any common key, prefer it
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

    // Fallback to overall match if nothing else
    return overallScore ? Math.round(overallScore) : null;
};

const MatchResultPage = () => {
    const [copyNotification, setCopyNotification] = useState(false);
    const [searchParams] = useSearchParams();
    const matchId = searchParams.get('matchId');
    const [matchData, setMatchData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [enhancedResume, setEnhancedResume] = useState(null);
    const [isGeneratingResume, setIsGeneratingResume] = useState(false);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const contentRef = useRef(null);

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

            // Get PDF as blob
            const pdfBlob = await response.blob();

            // Create object URL for preview
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

        // Create a temporary link and trigger download
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
        } catch (err) {
            console.error('PDF Export failed:', err);
            alert('Failed to export PDF. Please try again.');
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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted">Analyzing your resume...</p>
                </div>
            </div>
        );
    }

    if (error || !matchData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Card className="max-w-md">
                    <CardContent className="p-8 text-center">
                        <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold mb-2">Error Loading Results</h2>
                        <p className="text-muted mb-4">{error || 'Match data not found'}</p>
                        <Link to="/upload">
                            <Button>Try Again</Button>
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
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Navbar */}
            <nav className="border-b border-gray-100 bg-white sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link to="/upload">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <ArrowLeft className="w-4 h-4" />
                                Back
                            </Button>
                        </Link>
                        <span className="text-lg font-semibold text-text">Analysis Report</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="default"
                            size="sm"
                            className="gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white border-0"
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
                        <Button variant="outline" size="sm" className="gap-2" onClick={handleExportPDF}>
                            <Download className="w-4 h-4" />
                            Export PDF
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2" onClick={handleShare}>
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
                            <Card className="overflow-hidden border-0 shadow-lg">
                                <CardHeader className="bg-gradient-to-br from-indigo-50 to-violet-50 border-b border-gray-100 pb-8">
                                    <CardTitle className="text-center mb-2 text-xl">Overall Match Score</CardTitle>
                                    <div className="flex justify-center my-6">
                                        <div className={cn(
                                            "relative w-44 h-44 rounded-full flex items-center justify-center shadow-2xl",
                                            score >= 80 ? "bg-success" :
                                                score >= 60 ? "bg-warning" :
                                                    "bg-error"
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
                                            <span className="text-success">{matchData.breakdown?.skillsScore || 0}%</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${matchData.breakdown?.skillsScore || 0}%` }}
                                                transition={{ duration: 1, delay: 0.2 }}
                                                className="h-full bg-success rounded-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm font-semibold">
                                            <span className="text-slate-700">Experience</span>
                                            <span className="text-primary">{matchData.breakdown?.experienceScore || 0}%</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${matchData.breakdown?.experienceScore || 0}%` }}
                                                transition={{ duration: 1, delay: 0.4 }}
                                                className="h-full bg-primary rounded-full"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm font-semibold">
                                            <span className="text-slate-700">Education</span>
                                            <span className="text-accent">{matchData.breakdown?.educationScore || 0}%</span>
                                        </div>
                                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${matchData.breakdown?.educationScore || 0}%` }}
                                                transition={{ duration: 1, delay: 0.6 }}
                                                className="h-full bg-accent rounded-full"
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
                                <Card className="bg-primary/5 border-primary/20">
                                    <CardHeader>
                                        <CardTitle className="text-lg text-primary flex items-center gap-2">
                                            <AlertTriangle className="w-5 h-5" />
                                            Quick Actions
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {matchData.suggestions.slice(0, 3).map((suggestion, index) => (
                                            <div key={index} className="flex items-start gap-3 p-3 bg-white rounded-lg border border-primary/10 shadow-sm">
                                                <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 text-xs font-bold">{index + 1}</div>
                                                <div>
                                                    <p className="text-sm font-medium text-text">{suggestion.suggested || suggestion.reason}</p>
                                                    <p className="text-xs text-muted mt-1">{suggestion.priority} priority</p>
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
                        {/* Skill Gap Analysis - Original Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: 0.2 }}
                        >
                            <Card>
                                <CardHeader>
                                    <CardTitle>Skill Gap Analysis</CardTitle>
                                    <CardDescription>Comparison of your skills vs. job requirements</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div>
                                            <h4 className="flex items-center gap-2 font-medium text-green-700 mb-4 bg-green-50 p-2 rounded-lg">
                                                <CheckCircle className="w-5 h-5" />
                                                Matched Skills
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {matchData.matchedSkills && matchData.matchedSkills.length > 0 ? (
                                                    matchData.matchedSkills.map((skill, index) => (
                                                        <span key={index} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium border border-green-200">
                                                            {skill}
                                                        </span>
                                                    ))
                                                ) : (
                                                    <p className="text-sm text-muted">No matched skills found</p>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="flex items-center gap-2 font-medium text-red-700 mb-4 bg-red-50 p-2 rounded-lg">
                                                <XCircle className="w-5 h-5" />
                                                Missing Skills
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {matchData.missingSkills && matchData.missingSkills.length > 0 ? (
                                                    <>
                                                        {matchData.missingSkills.map((skill, index) => (
                                                            <span key={index} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium border border-red-200">
                                                                {skill}
                                                            </span>
                                                        ))}
                                                        <Link to="/chat" state={{ initialMessage: `I'm missing these skills: ${matchData.missingSkills.join(', ')}. How can I learn them quickly or show I have transferable skills?` }}>
                                                            <Button variant="outline" size="sm" className="h-7 text-xs gap-1 ml-2">
                                                                <Bot className="w-3 h-3" /> Fix with AI
                                                            </Button>
                                                        </Link>
                                                    </>
                                                ) : (
                                                    <p className="text-sm text-muted">No missing skills identified</p>
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
                                <Card className="bg-[#0d1117] border-gray-800 text-white overflow-hidden relative">
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
                                        <CardDescription className="text-gray-400">
                                            Evaluation of your open source presence and coding activity
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4 relative z-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-[#161b22] p-3 rounded-lg border border-gray-700">
                                                <div className="text-xs text-gray-400 mb-1">Activity Level</div>
                                                <div className={cn(
                                                    "font-bold text-lg",
                                                    matchData.githubAnalysis.activityLevel === 'High' ? "text-green-400" :
                                                        matchData.githubAnalysis.activityLevel === 'Medium' ? "text-yellow-400" :
                                                            "text-gray-400"
                                                )}>
                                                    {matchData.githubAnalysis.activityLevel}
                                                </div>
                                            </div>
                                            <div className="bg-[#161b22] p-3 rounded-lg border border-gray-700">
                                                <div className="text-xs text-gray-400 mb-1">Project Portfolio</div>
                                                <div className={cn(
                                                    "font-bold text-lg",
                                                    matchData.githubAnalysis.projectQuality === 'Strong' ? "text-green-400" :
                                                        "text-blue-400"
                                                )}>
                                                    {matchData.githubAnalysis.projectQuality}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-[#161b22] p-4 rounded-lg border border-gray-700">
                                            <h4 className="font-semibold text-sm text-gray-300 mb-2">Analysis</h4>
                                            <p className="text-sm text-gray-400 leading-relaxed">
                                                {matchData.githubAnalysis.analysis}
                                            </p>
                                        </div>

                                        <div className="flex items-start gap-3 bg-blue-900/20 border border-blue-900/50 p-4 rounded-lg">
                                            <Sparkles className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="font-semibold text-sm text-blue-400 mb-1">Recommendation</h4>
                                                <p className="text-sm text-gray-300">
                                                    {matchData.githubAnalysis.recommendation}
                                                </p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {/* Detailed Skill Analysis - New Section */}
                        {matchData.skillAnalysis && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.25 }}
                            >
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Detailed Skill Breakdown</CardTitle>
                                        <CardDescription>In-depth analysis of your technical and professional capabilities</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {/* Hard Skills */}
                                        <div className="space-y-3">
                                            <h4 className="font-semibold text-slate-800 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                                Hard Skills
                                            </h4>
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {matchData.skillAnalysis.hardSkills?.matched?.map((skill, i) => (
                                                        <span key={i} className="px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium border border-green-200 flex items-center gap-1">
                                                            <CheckCircle className="w-3 h-3" /> {skill}
                                                        </span>
                                                    ))}
                                                    {matchData.skillAnalysis.hardSkills?.missing?.map((skill, i) => (
                                                        <span key={i} className="px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium border border-red-200 flex items-center gap-1">
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
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {matchData.skillAnalysis.softSkills?.matched?.map((skill, i) => (
                                                        <span key={i} className="px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium border border-green-200 flex items-center gap-1">
                                                            <CheckCircle className="w-3 h-3" /> {skill}
                                                        </span>
                                                    ))}
                                                    {matchData.skillAnalysis.softSkills?.missing?.map((skill, i) => (
                                                        <span key={i} className="px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium border border-red-200 flex items-center gap-1">
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
                                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {matchData.skillAnalysis.technicalSkills?.matched?.map((skill, i) => (
                                                        <span key={i} className="px-2.5 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium border border-green-200 flex items-center gap-1">
                                                            <CheckCircle className="w-3 h-3" /> {skill}
                                                        </span>
                                                    ))}
                                                    {matchData.skillAnalysis.technicalSkills?.missing?.map((skill, i) => (
                                                        <span key={i} className="px-2.5 py-1 bg-red-100 text-red-700 rounded-md text-xs font-medium border border-red-200 flex items-center gap-1">
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
                                <Card>
                                    <CardHeader>
                                        <CardTitle>AI Resume Improvements</CardTitle>
                                        <CardDescription>Prioritized suggestions to increase your impact</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {matchData.suggestions.map((suggestion, index) => (
                                            <div key={index} className="border border-gray-200 rounded-xl overflow-hidden">
                                                <div className={cn("p-4 border-b border-gray-200 flex justify-between items-center",
                                                    suggestion.priority === 'high' ? 'bg-red-50' :
                                                        suggestion.priority === 'medium' ? 'bg-yellow-50' : 'bg-blue-50'
                                                )}>
                                                    <span className="font-medium text-slate-800 capitalize flex items-center gap-2">
                                                        {suggestion.priority === 'high' && <AlertTriangle className="w-4 h-4 text-red-600" />}
                                                        Resume Improvement
                                                    </span>
                                                    <span className={cn("text-xs font-bold px-2 py-1 rounded uppercase tracking-wide",
                                                        suggestion.priority === 'high' ? 'text-red-700 bg-red-100 border border-red-200' :
                                                            suggestion.priority === 'medium' ? 'text-yellow-700 bg-yellow-100 border border-yellow-200' :
                                                                'text-blue-700 bg-blue-100 border border-blue-200'
                                                    )}>
                                                        {suggestion.priority} Priority
                                                    </span>
                                                </div>
                                                <div className="p-4 grid md:grid-cols-2 gap-6">
                                                    {suggestion.original && (
                                                        <div className="space-y-2">
                                                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Original</p>
                                                            <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
                                                                "{suggestion.original}"
                                                            </p>
                                                        </div>
                                                    )}
                                                    <div className="space-y-2 col-span-2 md:col-span-1">
                                                        <p className="text-xs font-bold text-primary uppercase tracking-wider">AI Suggested</p>
                                                        <p className="text-sm text-slate-800 bg-indigo-50 p-3 rounded-lg border border-indigo-100 font-medium">
                                                            {suggestion.suggested}
                                                        </p>
                                                    </div>
                                                </div>
                                                {suggestion.reason && (
                                                    <div className="bg-slate-50 p-3 border-t border-slate-100">
                                                        <p className="text-xs text-slate-600"><strong>Why:</strong> {suggestion.reason}</p>
                                                    </div>
                                                )}
                                                <div className="bg-white p-3 border-t border-gray-100 flex justify-end gap-2">
                                                    <Link to="/chat" state={{
                                                        initialMessage: suggestion.original
                                                            ? `Help me rewrite my resume to address this suggestion: "${suggestion.suggested}". My original text was: "${suggestion.original}"`
                                                            : `I need to add this to my resume: "${suggestion.suggested}". I don't have this on my resume yet. Can you help me draft a bullet point or section for it?`
                                                    }}>
                                                        <Button variant="outline" size="sm" className="gap-2 h-8 text-xs">
                                                            <Bot className="w-3 h-3" /> Fix with AI
                                                        </Button>
                                                    </Link>
                                                    <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => {
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
                                <Card className="overflow-hidden border-0 shadow-lg">
                                    <CardHeader className="pb-6 pt-6 bg-gradient-to-br from-indigo-50 to-violet-50">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-primary rounded-xl">
                                                <Sparkles className="w-6 h-6 text-white" />
                                            </div>
                                            <CardTitle className="text-2xl text-primary">
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
                                                    <div className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col h-full">
                                                        {/* Career Image */}
                                                        <div className="relative h-32 overflow-hidden flex-shrink-0">
                                                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                                                            <img
                                                                src={getCareerImage(career)}
                                                                alt={career.title}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                                            />
                                                            <div className="absolute top-3 right-3 z-20">
                                                                <div className="bg-primary text-white px-3 py-1 rounded-full shadow-lg">
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
                                                            <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">
                                                                {career.title}
                                                            </h3>
                                                            <p className="text-sm text-slate-600 mb-4 leading-relaxed line-clamp-3 flex-grow">
                                                                {career.description}
                                                            </p>

                                                            {/* Required Skills */}
                                                            <div className="mb-4">
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                                                    Skills to Learn
                                                                </p>
                                                                <div className="flex flex-wrap gap-1.5">
                                                                    {career.requiredSkills.slice(0, 3).map((skill, i) => (
                                                                        <span
                                                                            key={i}
                                                                            className="px-2 py-1 bg-indigo-50 text-primary rounded-md text-[10px] font-semibold border border-indigo-100"
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
                                                                className="w-full gap-2 border-primary/20 text-primary hover:bg-primary hover:text-white transition-all duration-300 font-semibold mt-auto"
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
                    className="fixed bottom-8 right-8 bg-primary text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50"
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
                        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                        <h3 className="text-lg font-semibold text-slate-800">Rewriting your resume...</h3>
                        <p className="text-slate-500 text-center max-w-md mt-2">
                            Our AI is analyzing your profile and the job description to create a tailored, ATS-friendly resume. This may take a few seconds.
                        </p>
                    </div>
                ) : enhancedResume ? (
                    <div className="space-y-6">
                        <div className="bg-gray-50 rounded-xl border border-gray-200 h-[70vh] overflow-hidden">
                            <iframe
                                src={enhancedResume}
                                className="w-full h-full border-none"
                                title="Enhanced Resume Preview"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <Button variant="outline" onClick={() => setShowResumeModal(false)}>
                                Close
                            </Button>
                            <Button onClick={handleDownloadEnhancedPDF} className="gap-2">
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
    );
};

export default MatchResultPage;
