import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { motion } from 'framer-motion';
import {
    ArrowRight, CheckCircle, Upload, FileText, Search, X, Check,
    ChevronLeft, ChevronRight, User, Shield, Zap,
    Target, TrendingUp, ShieldCheck, Globe, Users,
    Award, Clock, FileCheck, BarChart3, RefreshCw, Heart,
    Play, ChevronDown, Circle, AlertCircle
} from 'lucide-react';

// Import assets
import atsBot from '../assets/ats-bot.png';

const LandingPage = () => {
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [activeSection, setActiveSection] = useState('hero');
    const [scrolled, setScrolled] = useState(false);
    const [hoveredFeature, setHoveredFeature] = useState(null);

    const testimonials = [
        {
            name: "Patricia K.",
            role: "Software Engineer",
            date: "Jul 4, 2024",
            rating: 5,
            title: "Landing interviews became easier",
            text: "Career Compass transformed my job search. My resume match rate went from 37% to 91% after optimization, and I started getting callbacks within days!"
        },
        {
            name: "Stephen H.",
            role: "Data Scientist",
            date: "May 31, 2024",
            rating: 5,
            title: "Game-changing tool",
            text: "The AI-powered insights helped me tailor my resume perfectly. I landed 3 interviews in 2 weeks after using Career Compass."
        },
        {
            name: "Kathleen C.",
            role: "Career Coach",
            date: "May 30, 2024",
            rating: 5,
            title: "Invaluable for my clients",
            text: "I recommend Career Compass to all my clients. The ATS optimization and gap analysis features are exactly what job seekers need in today's market."
        }
    ];

    const features = [
        {
            icon: Target,
            title: "AI-Powered Analysis",
            description: "Advanced AI scans your resume against job requirements for perfect matching",
            color: "from-purple-500 to-pink-500"
        },
        {
            icon: Target,
            title: "Smart Gap Analysis",
            description: "Identify missing skills and get personalized recommendations to improve",
            color: "from-blue-500 to-cyan-500"
        },
        {
            icon: ShieldCheck,
            title: "ATS Optimization",
            description: "Beat applicant tracking systems with resume formatting that gets noticed",
            color: "from-green-500 to-emerald-500"
        },
        {
            icon: TrendingUp,
            title: "Match Score Tracking",
            description: "Track your progress with visual metrics and improvement suggestions",
            color: "from-orange-500 to-red-500"
        }
    ];

    const stats = [
        { value: "95%", label: "Interview Rate Increase", icon: TrendingUp },
        { value: "50k+", label: "Resumes Optimized", icon: Users },
        { value: "4.9/5", label: "User Rating", icon: Award },
        { value: "2.3x", label: "More Interviews", icon: CheckCircle }
    ];

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);

            const sections = ['hero', 'ats', 'optimization', 'testimonials'];
            const scrollPosition = window.scrollY + 100;

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
                    setActiveSection(section);
                    break;
                }
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    };

    // Create a dashboard mockup component instead of using an image
    const DashboardMockup = () => (
        <div className="relative w-full max-w-lg mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-500/20 via-cyan-500/10 to-blue-500/20 rounded-3xl blur-3xl opacity-60 animate-pulse"></div>

            <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 overflow-hidden transform hover:shadow-3xl transition-all duration-500 hover:-translate-y-2">
                {/* Dashboard Header */}
                <div className="bg-gradient-to-r from-slate-50 to-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-800">Resume Analysis Dashboard</h3>
                        <p className="text-xs text-slate-500">Senior Software Engineer @ Google</p>
                    </div>
                    <div className="flex gap-2">
                        {['bg-green-400', 'bg-yellow-400', 'bg-red-400'].map((color, i) => (
                            <div key={i} className={`w-2 h-2 rounded-full ${color}`}></div>
                        ))}
                    </div>
                </div>

                {/* Dashboard Content */}
                <div className="p-6">
                    {/* Match Score */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="text-sm text-slate-500">Match Score</div>
                            <div className="text-3xl font-bold text-slate-900">94%</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-slate-500">Recommended Action</div>
                            <div className="text-sm font-semibold text-green-600">Ready to Apply</div>
                        </div>
                    </div>

                    {/* Progress Bars */}
                    <div className="space-y-3">
                        {[
                            { label: 'Skills Match', value: 95, color: 'bg-green-500' },
                            { label: 'Experience Match', value: 88, color: 'bg-blue-500' },
                            { label: 'ATS Optimization', value: 92, color: 'bg-purple-500' },
                            { label: 'Keyword Density', value: 76, color: 'bg-cyan-500' }
                        ].map((item, index) => (
                            <div key={index}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-slate-700">{item.label}</span>
                                    <span className="font-semibold">{item.value}%</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${item.value}%` }}
                                        transition={{ delay: 0.5 + index * 0.1, duration: 1 }}
                                        className={`h-full rounded-full ${item.color}`}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Action Items */}
                    <div className="mt-6 pt-6 border-t border-slate-100">
                        <div className="text-sm font-semibold text-slate-800 mb-2">Quick Actions</div>
                        <div className="grid grid-cols-2 gap-2">
                            <button className="p-2 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 text-sm font-semibold transition-colors">
                                Optimize Resume
                            </button>
                            <button className="p-2 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 text-sm font-semibold transition-colors">
                                View Suggestions
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200 selection:text-blue-900">
            <SEO
                title="AI-Powered Resume Analysis & Interview Prep"
                description="Supercharge your job search with Career Compass. Get instant resume feedback, AI mock interviews, and personalized career roadmaps."
            />
            {/* Floating Background Elements */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-r from-blue-200/20 to-cyan-200/20 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute top-1/3 -left-40 w-80 h-80 bg-gradient-to-r from-purple-200/20 to-pink-200/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                <div className="absolute bottom-40 right-1/4 w-64 h-64 bg-gradient-to-r from-emerald-200/20 to-teal-200/20 rounded-full blur-3xl animate-pulse delay-500"></div>
            </div>

            {/* Enhanced Navbar */}
            <motion.nav
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
                    ? 'bg-white/95 backdrop-blur-lg border-b border-slate-200/80 shadow-lg shadow-slate-200/10'
                    : 'bg-transparent border-b border-transparent'
                    }`}
            >
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-3 cursor-pointer group"
                        onClick={() => scrollToSection('hero')}
                    >
                        <div className="relative">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30 group-hover:shadow-blue-500/50 transition-all duration-300">
                                CC
                            </div>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent tracking-tight">
                            Career Compass
                        </span>
                    </motion.div>

                    <div className="hidden lg:flex items-center gap-8 text-sm font-medium">
                        {['Scanner', 'ATS', 'Analysis', 'Reviews'].map((item, index) => {
                            const sections = ['hero', 'ats', 'optimization', 'testimonials'];
                            const isActive = activeSection === sections[index];
                            return (
                                <button
                                    key={item}
                                    onClick={() => scrollToSection(sections[index])}
                                    className={`relative px-1 py-2 transition-all duration-300 ${isActive
                                        ? 'text-blue-700 font-semibold'
                                        : 'text-slate-600 hover:text-blue-600'
                                        }`}
                                >
                                    {item}
                                    {isActive && (
                                        <motion.div
                                            layoutId="navbar-indicator"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full"
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex items-center gap-3">
                        <Link to="/login">
                            <Button
                                variant="ghost"
                                className="text-sm text-slate-700 font-semibold hover:text-blue-700 hover:bg-blue-50/80 transition-all duration-300 hover:scale-105"
                            >
                                Sign In
                            </Button>
                        </Link>
                        <Link to="/register">
                            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                <Button className="bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white font-bold px-6 py-2 rounded-xl shadow-lg shadow-blue-600/30 hover:shadow-blue-600/50 transition-all duration-300 group text-sm">
                                    Get Started Free
                                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </motion.div>
                        </Link>
                    </div>
                </div>
            </motion.nav>

            {/* Hero Section */}
            <div id="hero" className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-20 lg:pt-20 lg:pb-28">
                    <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7 }}
                            className="max-w-2xl"
                        >
                            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight mb-4">
                                Land Your Dream Job
                                <span className="block bg-gradient-to-r from-blue-700 via-cyan-600 to-blue-700 bg-clip-text text-transparent">
                                    Faster with AI
                                </span>
                            </h1>

                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                Career Compass uses advanced AI to analyze your resume, match it with job requirements, and provide actionable insights to get you more interviews.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-3">
                                <Link to="/login">
                                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                                        <Button size="lg" className="h-12 px-8 text-base bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white font-bold rounded-xl shadow-xl shadow-blue-600/30 hover:shadow-blue-600/50 transition-all group">
                                            Start Free Analysis
                                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </Button>
                                    </motion.div>
                                </Link>
                            </div>

                            {/* Stats */}
                            <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
                                {stats.map((stat, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4 + index * 0.1 }}
                                        className="text-center"
                                    >
                                        <div className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">
                                            {stat.value}
                                        </div>
                                        <div className="text-xs text-slate-600 mt-1">{stat.label}</div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Hero Dashboard Visual - Using component instead of image */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            transition={{ duration: 0.8, delay: 0.3 }}
                            className="relative"
                        >
                            <DashboardMockup />
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <div className="py-16 bg-gradient-to-b from-white to-blue-50/30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Everything You Need to
                            <span className="block bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">
                                Stand Out from the Crowd
                            </span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                onMouseEnter={() => setHoveredFeature(index)}
                                onMouseLeave={() => setHoveredFeature(null)}
                                className="relative group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-white to-slate-50 rounded-xl shadow-lg group-hover:shadow-xl transition-all duration-300"></div>
                                <div className="relative p-6 rounded-xl border border-slate-200/80 group-hover:border-blue-300 transition-all duration-300">
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${feature.color} flex items-center justify-center mb-4 transform group-hover:scale-110 transition-transform duration-300`}>
                                        <feature.icon className="w-6 h-6 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 mb-2">{feature.title}</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ATS Section */}
            <div id="ats" className="py-16 bg-gradient-to-b from-blue-50/30 to-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                            viewport={{ once: true }}
                            className="relative"
                        >
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-100/40 to-cyan-100/40 rounded-3xl blur-3xl"></div>

                            <div className="relative bg-white p-6 rounded-2xl shadow-xl border border-slate-100">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center">
                                        <ShieldCheck className="w-7 h-7 text-white" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">ATS Compatibility Check</div>
                                        <div className="text-sm text-slate-500">Real-time analysis against 50+ ATS systems</div>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { label: 'Format Compatibility', score: 95, color: 'bg-green-500' },
                                        { label: 'Keyword Optimization', score: 88, color: 'bg-blue-500' },
                                        { label: 'Section Recognition', score: 92, color: 'bg-purple-500' }
                                    ].map((item, index) => (
                                        <div key={index}>
                                            <div className="flex justify-between text-sm mb-1">
                                                <span>{item.label}</span>
                                                <span className="font-semibold">{item.score}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    whileInView={{ width: `${item.score}%` }}
                                                    transition={{ delay: index * 0.2, duration: 1 }}
                                                    className={`h-full rounded-full ${item.color}`}
                                                    viewport={{ once: true }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.7 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
                                Optimized for Every
                                <span className="block bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">
                                    Applicant Tracking System
                                </span>
                            </h2>
                            <p className="text-slate-600 mb-6 leading-relaxed">
                                Over 98% of Fortune 500 companies use ATS to filter resumes. Career Compass ensures your resume passes through every major system with our advanced formatting and keyword optimization technology.
                            </p>
                            <ul className="space-y-3">
                                {[
                                    'Real-time ATS compatibility scoring',
                                    'Keyword optimization for specific job descriptions',
                                    'Format validation across all ATS platforms',
                                    'Instant improvement suggestions'
                                ].map((item, index) => (
                                    <li key={index} className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                        <span className="text-slate-700">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Gap Analysis Section */}
            <div id="optimization" className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            See Exactly What's
                            <span className="block bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                                Missing from Your Resume
                            </span>
                        </h2>
                    </motion.div>

                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div>
                                        <h3 className="font-bold text-slate-900">Skill Gap Analysis</h3>
                                        <p className="text-sm text-slate-500">Software Engineer Position</p>
                                    </div>
                                    <div className="px-3 py-1 bg-red-50 text-red-700 rounded-full text-sm font-semibold">
                                        4 Skills Missing
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    {[
                                        { skill: 'Docker', status: 'missing', suggestion: 'Add containerization experience from your cloud projects' },
                                        { skill: 'AWS', status: 'missing', suggestion: 'Highlight any cloud computing coursework or projects' },
                                        { skill: 'React', status: 'present', level: 'Expert' },
                                        { skill: 'Node.js', status: 'present', level: 'Intermediate' },
                                        { skill: 'CI/CD', status: 'missing', suggestion: 'Mention deployment pipelines from your team projects' }
                                    ].map((item, index) => (
                                        <div
                                            key={index}
                                            className={`p-3 rounded-lg border ${item.status === 'missing'
                                                ? 'bg-red-50 border-red-100'
                                                : 'bg-green-50 border-green-100'
                                                }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    {item.status === 'present' ? (
                                                        <CheckCircle className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <X className="w-4 h-4 text-red-500" />
                                                    )}
                                                    <span className="font-semibold text-slate-900">{item.skill}</span>
                                                </div>
                                                {item.status === 'present' ? (
                                                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                                                        {item.level}
                                                    </span>
                                                ) : (
                                                    <span className="text-xs text-red-600 font-medium">Missing</span>
                                                )}
                                            </div>
                                            {item.suggestion && (
                                                <p className="mt-2 text-xs text-slate-600 pl-7">{item.suggestion}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div>
                            <p className="text-slate-600 mb-6 leading-relaxed">
                                Career Compass identifies exactly what skills and keywords are missing from your resume compared to job requirements. Get specific, actionable suggestions to fill those gaps and become the perfect candidate.
                            </p>

                            <div className="space-y-4">
                                {[
                                    {
                                        title: "Keyword Optimization",
                                        description: "Match your resume language with job description keywords",
                                        icon: FileText
                                    },
                                    {
                                        title: "Skill Enhancement",
                                        description: "Get specific recommendations to improve missing skills",
                                        icon: Zap
                                    },
                                    {
                                        title: "Experience Reframing",
                                        description: "Learn how to present your experience more effectively",
                                        icon: TrendingUp
                                    }
                                ].map((item, index) => (
                                    <motion.div
                                        key={index}
                                        whileHover={{ x: 5 }}
                                        className="flex items-start gap-3 p-3 hover:bg-slate-50 rounded-lg transition-colors"
                                    >
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 flex items-center justify-center flex-shrink-0">
                                            <item.icon className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 mb-1 text-sm">{item.title}</h4>
                                            <p className="text-slate-600 text-xs">{item.description}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Testimonials Section */}
            <div id="testimonials" className="py-16 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">
                            Success Stories from
                            <span className="block bg-gradient-to-r from-blue-700 to-cyan-600 bg-clip-text text-transparent">
                                Job Seekers Like You
                            </span>
                        </h2>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -5 }}
                                className="bg-white p-6 rounded-xl shadow-lg border border-slate-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300"
                            >
                                <div className="flex gap-1 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <CheckCircle key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <h3 className="font-bold text-slate-900 mb-3">{testimonial.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed mb-4">"{testimonial.text}"</p>
                                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                                        {testimonial.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{testimonial.name}</p>
                                        <p className="text-slate-500 text-xs">{testimonial.role} • {testimonial.date}</p>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* CTA Section */}
            <div className="py-16 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">
                            Ready to Transform Your
                            <span className="block bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                Job Search?
                            </span>
                        </h2>
                        <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
                            Join thousands of successful job seekers who landed their dream roles with Career Compass.
                        </p>

                    </motion.div>
                </div>
            </div>

            {/* Enhanced Footer */}
            <footer className="bg-slate-900 text-slate-300 py-12 border-t border-slate-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold">
                                    CC
                                </div>
                                <span className="text-xl font-bold text-white">Career Compass</span>
                            </div>
                            <p className="text-slate-400 text-sm mb-6 max-w-md">
                                AI-powered career assistant helping job seekers land more interviews with smart resume optimization and ATS compatibility checks.
                            </p>
                            <div className="flex gap-3">
                                {['Twitter', 'LinkedIn', 'GitHub', 'Discord'].map((social) => (
                                    <button
                                        key={social}
                                        className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors text-xs"
                                    >
                                        {social.charAt(0)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {[
                            {
                                title: "Product",
                                links: ["Resume Scanner", "ATS Check", "Gap Analysis", "Resume Builder", "Job Tracker"]
                            },
                            {
                                title: "Resources",
                                links: ["Blog", "Career Guides", "Resume Templates", "ATS Guide", "FAQ"]
                            },
                            {
                                title: "Company",
                                links: ["About Us", "Careers", "Contact", "Privacy Policy", "Terms of Service"]
                            }
                        ].map((column, index) => (
                            <div key={index}>
                                <h4 className="font-bold text-white mb-4 text-sm">{column.title}</h4>
                                <ul className="space-y-2">
                                    {column.links.map((link) => (
                                        <li key={link}>
                                            <a
                                                href="#"
                                                className="text-slate-400 hover:text-blue-400 transition-colors duration-300 text-sm hover:pl-2 block"
                                            >
                                                {link}
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-800 text-center text-slate-500 text-xs">
                        <p>© {new Date().getFullYear()} Career Compass. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;