import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, CheckCircle, Upload, FileText, Search, X, Check,
    Star, ChevronLeft, ChevronRight, User, Shield, Zap
} from 'lucide-react';

// Import assets
import atsBot from '../assets/ats-bot.png';

const LandingPage = () => {
    const [currentTestimonial, setCurrentTestimonial] = useState(0);
    const [activeSection, setActiveSection] = useState('hero');

    const testimonials = [
        {
            name: "Patricia K.",
            role: "Job Seeker",
            date: "Jul 4, 2024",
            rating: 5,
            title: "Excellent resource!",
            text: "This is an excellent tool! I ran my resume through Career Compass and my first rating was a 37% which would not have been selected. After optimization, I got interviews!"
        },
        {
            name: "Stephen H.",
            role: "Software Engineer",
            date: "May 31, 2024",
            rating: 5,
            title: "Helped me to find...",
            text: "The experience was a positive one. The tool was easy to use and it helped me get the resume as close as possible to the job description."
        },
        {
            name: "Kathleen C.",
            role: "Career Coach",
            date: "May 30, 2024",
            rating: 5,
            title: "Wonderful Aide for Resumes",
            text: "I love Career Compass because it helps me get my clients one step closer to obtaining an interview. The ATS checks are invaluable."
        }
    ];

    const nextTestimonial = () => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    };

    const prevTestimonial = () => {
        setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    };

    // Scroll Spy Logic
    useEffect(() => {
        const handleScroll = () => {
            const sections = ['hero', 'ats', 'optimization', 'testimonials'];
            const scrollPosition = window.scrollY + 100; // Offset

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
                    setActiveSection(section);
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

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-blue-50 font-sans text-slate-900">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 border-b border-gray-100 backdrop-blur-md bg-white/95 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => scrollToSection('hero')}>
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-shadow">
                            CC
                        </div>
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent tracking-tight">Career Compass</span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
                        <button
                            onClick={() => scrollToSection('hero')}
                            className={`transition-colors ${activeSection === 'hero' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
                        >
                            Resume Scanner
                        </button>
                        <button
                            onClick={() => scrollToSection('ats')}
                            className={`transition-colors ${activeSection === 'ats' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
                        >
                            ATS Check
                        </button>
                        <button
                            onClick={() => scrollToSection('optimization')}
                            className={`transition-colors ${activeSection === 'optimization' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
                        >
                            Optimization
                        </button>
                        <button
                            onClick={() => scrollToSection('testimonials')}
                            className={`transition-colors ${activeSection === 'testimonials' ? 'text-blue-600 font-bold border-b-2 border-blue-600' : 'text-slate-600 hover:text-blue-600'}`}
                        >
                            Testimonials
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost" className="text-slate-700 font-semibold hover:text-blue-600 hover:bg-blue-50/80 transition-colors">Log In</Button>
                        </Link>
                        <Link to="/register">
                            <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold px-6 shadow-lg shadow-blue-600/30 transition-all hover:shadow-blue-600/50 hover:scale-105">Sign Up</Button>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div id="hero" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-32 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-10 -left-40 w-80 h-80 bg-blue-200/40 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 -right-40 w-80 h-80 bg-cyan-200/30 rounded-full blur-3xl animate-pulse"></div>
                
                <div className="grid lg:grid-cols-2 gap-16 items-center relative z-10">
                    <motion.div 
                        className="max-w-2xl"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-tight mb-6">
                            Optimize your resume <br />
                            <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">to get more interviews</span>
                        </h1>
                        <p className="text-xl text-slate-600 mb-10 leading-relaxed font-medium">
                            Career Compass helps you optimize your resume for any job, highlighting the key experience and skills recruiters need to see.
                        </p>
                        <Link to="/upload">
                            <Button size="lg" className="h-16 px-10 text-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-xl shadow-blue-600/30 transition-all hover:shadow-blue-600/50 hover:scale-105 hover:-translate-y-1">
                                Scan Your Resume For Free
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </Link>
                    </motion.div>

                    {/* Hero Visual - Dashboard Mockup */}
                    <motion.div
                        initial={{ opacity: 0, x: 40 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative hidden lg:block"
                    >
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-200/60 via-cyan-200/50 to-blue-200/40 rounded-3xl blur-2xl opacity-60"></div>
                        <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden hover:shadow-3xl transition-shadow duration-300">
                            <div className="bg-slate-50 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                                <div>
                                    <h3 className="font-bold text-slate-800">Resume scan results</h3>
                                    <p className="text-xs text-slate-500 font-medium">Business Systems Analyst, DevOps</p>
                                </div>
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                </div>
                            </div>

                            <div className="flex">
                                <div className="w-1/3 p-8 border-r border-gray-100 flex flex-col items-center justify-center bg-slate-50/30">
                                    <h4 className="text-lg font-bold text-slate-800 mb-6">Match Rate</h4>
                                    <div className="relative w-40 h-40 flex items-center justify-center mb-6">
                                        <svg className="w-full h-full transform -rotate-90">
                                            <circle cx="80" cy="80" r="70" stroke="#E2E8F0" strokeWidth="12" fill="none" />
                                            <circle cx="80" cy="80" r="70" stroke="#2563EB" strokeWidth="12" fill="none" strokeDasharray="439.8" strokeDashoffset="43.98" strokeLinecap="round" />
                                        </svg>
                                        <span className="absolute text-4xl font-extrabold text-slate-900">91%</span>
                                    </div>
                                    <Button className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold py-3 rounded-lg shadow-lg shadow-blue-600/20 transition-all">Upload & rescan</Button>
                                </div>

                                <div className="w-2/3 p-8">
                                    <div className="flex items-center gap-3 mb-8">
                                        <h3 className="text-xl font-bold text-slate-900">Searchability</h3>
                                        <span className="bg-slate-800 text-white text-[10px] px-2 py-1 rounded-full font-bold tracking-wide">IMPORTANT</span>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4 p-4 bg-red-50 rounded-xl border border-red-100 transition-colors hover:bg-red-100/50">
                                            <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <X className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">ATS Tip</p>
                                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">Adding this job's company name can help us provide you ATS-specific tips.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100 transition-colors hover:bg-green-100/50">
                                            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">Contact Information</p>
                                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">You provided your email and phone number. Good job!</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl border border-green-100 transition-colors hover:bg-green-100/50">
                                            <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-800">Job Title Match</p>
                                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">The job title was found in your resume. Excellent!</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Beat the Bots Section */}
            <div id="ats" className="py-24 bg-slate-50 overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div className="order-2 lg:order-1 relative">
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-100/50 rounded-full blur-3xl -z-10"></div>
                            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 relative">
                                <div className="absolute -top-6 left-8 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-bold text-sm shadow-sm">ATS TIPS</div>
                                <div className="space-y-6 mt-4">
                                    <div className="flex gap-4 items-start">
                                        <img src={atsBot} alt="ATS Bot" className="w-16 h-16 rounded-full object-cover border-2 border-slate-100" />
                                        <div className="space-y-2 w-full">
                                            <div className="h-4 bg-slate-100 rounded w-3/4"></div>
                                            <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                                        </div>
                                    </div>
                                    <div className="h-px bg-slate-100"></div>
                                    <div className="space-y-3">
                                        <div className="h-3 bg-slate-100 rounded w-full"></div>
                                        <div className="h-3 bg-slate-100 rounded w-5/6"></div>
                                        <div className="h-3 bg-slate-100 rounded w-4/6"></div>
                                    </div>
                                    {/* Magnifying Glass Overlay */}
                                    <motion.div
                                        animate={{
                                            x: [0, 20, 0],
                                            y: [0, -20, 0],
                                            scale: [1, 1.1, 1]
                                        }}
                                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                        className="absolute -right-8 -bottom-8 bg-white p-4 rounded-full shadow-2xl border-4 border-slate-50"
                                    >
                                        <Search className="w-12 h-12 text-blue-600" />
                                    </motion.div>
                                    <div className="absolute -right-4 top-1/2 bg-green-500 text-white p-2 rounded-full shadow-lg">
                                        <Check className="w-6 h-6" />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="order-1 lg:order-2">
                            <p className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-4">APPLICANT TRACKING SYSTEM</p>
                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                                Beat the bots
                            </h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                Most companies, including 99% of Fortune 500, use Applicant Tracking Systems (ATS) to process your resume. These systems might cause qualified candidates like you to slip through the cracks.
                                <br /><br />
                                Career Compass reverse-engineered all the top ATS and studied recruiter workflows to get you in the "yes" pile.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* See Missing Skills Section (Perfect Match) */}
            <div id="optimization" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-2 gap-20 items-center">
                        <div>
                            <p className="text-blue-600 font-bold tracking-wide uppercase text-sm mb-4">RESUME OPTIMIZATION</p>
                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                                See your missing skills
                            </h2>
                            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                                Career Compass matches hard skills, soft skills, and keywords from the job listing to your resume. AI-powered system will show you how to tailor your resume so that you highlight the skills and experience recruiters are searching for.
                            </p>
                        </div>

                        {/* Skills Visual */}
                        <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 relative">
                            <div className="absolute -top-6 -left-6 bg-white p-4 rounded-xl shadow-lg border border-slate-100 flex items-center gap-4 z-10">
                                <div className="w-12 h-12 rounded-full border-4 border-red-500 flex items-center justify-center text-xl font-bold text-slate-900">
                                    4
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500 font-bold uppercase">Hard Skills</p>
                                    <div className="w-32 h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                                        <div className="w-[30%] h-full bg-red-500 rounded-full"></div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 space-y-4">
                                <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-slate-800">Agile</span>
                                        <div className="flex gap-2">
                                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                            <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                        </div>
                                    </div>
                                    <div className="bg-blue-50 p-3 rounded-lg">
                                        <p className="text-xs font-bold text-blue-700 mb-1">Phrase suggestions</p>
                                        <p className="text-xs text-blue-600">"Navigating Change with Agile Precision"</p>
                                        <p className="text-xs text-blue-600 mt-1">"Embracing Agile Methodologies for Success"</p>
                                    </div>
                                </div>
                                {['API Development', 'Business Value', 'Fintech'].map((skill, i) => (
                                    <div key={i} className="flex justify-between items-center p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <span className="text-sm font-medium text-slate-700">{skill}</span>
                                        <X className="w-5 h-5 text-red-500" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>


            {/* Testimonials Section */}
            <div id="testimonials" className="py-32 bg-gradient-to-b from-white to-slate-50 relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-20 right-0 w-96 h-96 bg-blue-100/30 rounded-full blur-3xl"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">What Career Compass <br/><span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">customers are saying</span></h2>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Join thousands of job seekers who've successfully landed interviews with our platform</p>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {testimonials.map((t, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -8 }}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: i * 0.1 }}
                                viewport={{ once: true }}
                                className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 hover:border-blue-300 text-left flex flex-col h-full hover:shadow-xl transition-all"
                            >
                                <div className="flex gap-1 mb-4">
                                    {[...Array(t.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                                <h3 className="font-bold text-lg text-slate-900 mb-3">{t.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed mb-6 flex-grow">"{t.text}"</p>
                                <div className="pt-6 border-t border-slate-100">
                                    <p className="font-bold text-slate-900 text-sm">{t.name}</p>
                                    <p className="text-slate-500 text-xs">{t.date}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Navigation Buttons (Visual only for now as grid shows all 3) */}
                    <div className="flex justify-center gap-4 mt-12">
                        <button className="w-12 h-12 rounded-full bg-white border border-slate-300 flex items-center justify-center hover:bg-blue-50 hover:border-blue-400 transition-all hover:shadow-md">
                            <ChevronLeft className="w-6 h-6 text-slate-600" />
                        </button>
                        <button className="w-12 h-12 rounded-full bg-white border border-slate-300 flex items-center justify-center hover:bg-blue-50 hover:border-blue-400 transition-all hover:shadow-md">
                            <ChevronRight className="w-6 h-6 text-slate-600" />
                        </button>
                    </div>
                </div>
            </div>

            {/* All-in-One Tool Section */}
            <div id="features" className="py-32 bg-gradient-to-b from-blue-50 via-cyan-50 to-white relative overflow-hidden">
                {/* Background decoration */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-200/20 rounded-full blur-3xl"></div>
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-200/20 rounded-full blur-3xl"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">The <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">all-in-one</span> job search tool</h2>
                            <p className="text-lg text-slate-600 leading-relaxed">
                                Career Compass tools offer everything you need to save time and get more job interviews. Your resume is just the beginning!
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <Button size="lg" className="w-full md:w-auto bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold px-8 h-14 rounded-lg text-lg shadow-lg shadow-blue-600/30 transition-all hover:shadow-blue-600/50">
                                Start Optimizing Your Job Search
                                <ArrowRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { icon: FileText, text: "Resume scanner" },
                                { icon: Zap, text: "Job matcher" },
                                { icon: User, text: "Resume Manager" }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.05, backgroundColor: '#F0F9FF' }}
                                    initial={{ opacity: 0, x: -20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.5, delay: i * 0.1 }}
                                    viewport={{ once: true }}
                                    className="bg-white p-6 rounded-xl border border-slate-200 hover:border-blue-300 flex items-center gap-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
                                >
                                    <item.icon className="w-6 h-6 text-blue-600 flex-shrink-0" />
                                    <span className="font-bold text-slate-800">{item.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Simple Footer */}
            <footer className="bg-gradient-to-r from-slate-900 to-slate-800 text-slate-300 py-16 border-t border-slate-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-4 gap-12">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">CC</div>
                            <span className="text-xl font-bold text-white">Career Compass</span>
                        </div>
                        <p className="text-sm text-slate-400">Optimize your resume to get more interviews.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Products</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Resume Scanner</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Resume Builder</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Job Tracker</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Resources</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Blog</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">ATS Guide</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Resume Examples</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Company</h4>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">About Us</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Contact</a></li>
                            <li><a href="#" className="text-slate-400 hover:text-blue-400 transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
