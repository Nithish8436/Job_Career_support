import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(true); // Default to true
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { login, error, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const success = await login(email, password, rememberMe);
        if (success) {
            navigate('/dashboard');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <SEO
                title="Login"
                description="Sign in to Career Compass to access your AI career tools."
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50"
            >
                <div className="flex flex-col lg:flex-row">
                    {/* Left Side - Form */}
                    <div className="w-full lg:w-1/2 p-8 lg:p-12 bg-gradient-to-b from-white to-slate-50/50">
                        {/* Logo */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-10"
                        >
                            <div className="flex items-center gap-2 mb-8">
                                <motion.div
                                    whileHover={{ rotate: 5, scale: 1.1 }}
                                    className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30"
                                >
                                    CC
                                </motion.div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-transparent">Career Compass</span>
                            </div>
                            <h1 className="text-5xl font-bold text-slate-900 mb-3">
                                Welcome <br />Back
                            </h1>
                            <p className="text-slate-600 text-base font-medium">
                                Sign in to continue your career journey
                            </p>
                        </motion.div>

                        {/* Error Message */}
                        <AnimatePresence mode="wait">
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm font-medium"
                                >
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Email Field */}
                            <div>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-400 placeholder-slate-400 transition-all duration-200"
                                />
                            </div>

                            {/* Password Field */}
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full h-12 px-4 pr-12 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-400 placeholder-slate-400 transition-all duration-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span className="text-slate-700 font-medium">Remember me</span>
                                </label>
                                <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors">
                                    Forgot Password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    type="submit"
                                    className="w-full h-12 mt-6 bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 group"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Signing In...
                                        </>
                                    ) : (
                                        <>
                                            Sign In
                                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        </form>

                        {/* Sign Up Link */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-8 pt-6 border-t border-slate-100"
                        >
                            <p className="text-center text-sm text-slate-600">
                                Don't have an account?{' '}
                                <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors">
                                    Sign Up
                                </Link>
                            </p>
                        </motion.div>
                    </div>

                    {/* Right Side - Features Card */}
                    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50 items-center justify-center p-12 relative overflow-hidden rounded-r-3xl">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl"></div>

                        {/* Features Card Container */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="relative z-10 w-full max-w-md"
                        >
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-8">
                                {/* Card Header */}
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md">
                                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Career Success Awaits</h3>
                                    <p className="text-slate-600 text-sm">
                                        Join thousands who found their dream jobs with Career Compass
                                    </p>
                                </div>

                                {/* Features List - Exact as in image */}
                                <div className="space-y-4">
                                    {[
                                        'AI-powered resume analysis',
                                        'Instant job match scores',
                                        'Skill gap identification',
                                        'ATS optimization'
                                    ].map((feature, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + index * 0.1 }}
                                            className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50/80 transition-colors"
                                        >
                                            {/* Checkbox circle */}
                                            <div className="w-5 h-5 mt-0.5 rounded-full border-2 border-blue-500 flex items-center justify-center flex-shrink-0">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            </div>
                                            <span className="text-slate-700 font-medium text-sm">{feature}</span>
                                        </motion.div>
                                    ))}
                                </div>



                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;