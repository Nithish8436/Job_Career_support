import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
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
        const success = await login(email, password);
        if (success) {
            navigate('/dashboard');
        }
        setIsSubmitting(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-100 via-blue-50 to-cyan-50">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200/50"
            >
                <div className="flex flex-col lg:flex-row">
                    {/* Left Side - Form */}
                    <div className="w-full lg:w-1/2 p-8 lg:p-12 bg-gradient-to-b from-white to-blue-50/30">
                        {/* Logo */}
                        <div className="mb-10">
                            <div className="flex items-center gap-2 mb-8">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-600/30">
                                    CC
                                </div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">Career Compass</span>
                            </div>
                            <h1 className="text-5xl font-bold text-gray-900 mb-3">
                                Welcome <br />Back
                            </h1>
                            <p className="text-gray-600 text-base font-medium">
                                Sign in to continue your career journey
                            </p>
                        </div>

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
                                       className="w-full h-12 px-4 bg-white border border-gray-200/60 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-all duration-200"
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
                                       className="w-full h-12 px-4 pr-12 bg-white border border-gray-200/60 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 transition-all duration-200"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                       className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>

                            {/* Remember Me & Forgot Password */}
                            <div className="flex items-center justify-between text-sm">
                                <label className="flex items-center gap-2 cursor-pointer">
                                       <input type="checkbox" className="w-4 h-4 rounded border-gray-200 text-blue-600 focus:ring-blue-500" />
                                       <span className="text-gray-700 font-medium">Remember me</span>
                                </label>
                                <Link to="/forgot-password" className="text-blue-600 hover:text-blue-700 hover:underline font-medium transition-colors">
                                    Forgot Password?
                                </Link>
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                   className="w-full h-12 mt-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/30 hover:shadow-lg hover:shadow-blue-700/40"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Signing In...
                                    </>
                                ) : (
                                    'Sign In'
                                )}
                            </Button>
                        </form>

                        {/* Sign Up Link */}
                        <p className="mt-6 text-center text-sm text-gray-600">
                            Don't have an account?{' '}
                               <Link to="/register" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors">
                                Sign Up
                            </Link>
                        </p>
                    </div>

                    {/* Right Side - Illustration */}
                    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-400 via-cyan-300 to-teal-400 items-center justify-center p-12 relative overflow-hidden rounded-r-3xl">
                        {/* Decorative Clouds */}
                        <div className="absolute top-10 right-10 w-24 h-16 bg-white/20 rounded-full blur-xl"></div>
                        <div className="absolute top-32 left-20 w-32 h-20 bg-white/15 rounded-full blur-xl"></div>
                        <div className="absolute bottom-20 right-32 w-28 h-18 bg-white/20 rounded-full blur-xl"></div>

                        {/* Illustration */}
                        <div className="relative z-10">
                            <img
                                src="https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&h=500&fit=crop"
                                alt="Team collaboration"
                                className="w-full max-w-md rounded-2xl shadow-2xl"
                            />
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
