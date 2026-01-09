import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AlertCircle, Loader2, Eye, EyeOff, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

const RegisterPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { register, error: authError, isAuthenticated } = useAuth();
    const [localError, setLocalError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
        }
    }, [isAuthenticated, navigate]);

    // Auto-clear local error
    useEffect(() => {
        if (localError) {
            const timer = setTimeout(() => {
                setLocalError('');
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [localError]);

    // Password strength calculation
    const getPasswordStrength = (pwd) => {
        if (!pwd) return { strength: 0, label: '', color: '' };

        let strength = 0;
        if (pwd.length >= 6) strength++;
        if (pwd.length >= 10) strength++;
        if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
        if (/\d/.test(pwd)) strength++;
        if (/[^a-zA-Z0-9]/.test(pwd)) strength++;

        const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
        const colors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500', 'bg-emerald-500'];

        return { strength, label: labels[strength], color: colors[strength] };
    };

    const passwordStrength = getPasswordStrength(password);
    const passwordsMatch = password && confirmPassword && password === confirmPassword;

    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLocalError('');

        if (password !== confirmPassword) {
            setLocalError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setLocalError('Password must be at least 6 characters');
            return;
        }

        setIsSubmitting(true);
        // register now returns { success, message, requireVerification } or falls to catch
        // We'll trust the auth context or handle return
        const result = await register(name, email, password);

        // Check if registration was successful (assuming register returns validation or boolean)
        // If your auth context returns true/false:
        if (result) {
            setIsSuccess(true);
        } else {
            // Error sets in context
        }
        setIsSubmitting(false);
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
                <SEO title="Verify Email" />
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100 p-8 text-center"
                >
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <h2 className="text-3xl font-bold text-slate-900 mb-4">Check Your Email!</h2>
                    <p className="text-slate-600 mb-8">
                        We've sent a verification link to <strong>{email}</strong>.
                        Please click the link to activate your account.
                    </p>
                    <Link to="/login">
                        <Button className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                            Back to Login
                        </Button>
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <SEO
                title="Create Account"
                description="Join Career Compass to build your career with AI-powered insights."
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/50"
            >
                <div className="flex flex-col lg:flex-row">
                    {/* Left Side - Card (like login page) */}
                    <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-50 via-cyan-50 to-slate-50 items-center justify-center p-8 relative overflow-hidden rounded-l-3xl">
                        {/* Decorative Elements */}
                        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 right-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl"></div>

                        {/* Card Container */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="relative z-10 w-full max-w-sm"
                        >
                            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/80 p-8">
                                {/* Card Header */}
                                <div className="text-center mb-8">
                                    <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md">
                                        <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Start Your Career Journey</h3>
                                    <p className="text-slate-600 text-sm">
                                        Join our community and unlock your career potential with AI-powered insights
                                    </p>
                                </div>

                                {/* Benefits List */}
                                <div className="space-y-3">
                                    {[
                                        'Get instant resume-job match scores',
                                        'Receive personalized improvement tips',
                                        'Access AI mock interviews',
                                        'Track your career progress',
                                        'Join thousands of successful job seekers'
                                    ].map((benefit, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3 + index * 0.1 }}
                                            className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50/80 transition-colors"
                                        >
                                            {/* Checkbox circle */}
                                            <div className="w-5 h-5 mt-0.5 rounded-full border-2 border-blue-500 flex items-center justify-center flex-shrink-0">
                                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                            </div>
                                            <span className="text-slate-700 font-medium text-sm">{benefit}</span>
                                        </motion.div>
                                    ))}
                                </div>


                            </div>
                        </motion.div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="w-full lg:w-1/2 p-8 lg:p-12 bg-gradient-to-b from-white to-slate-50/50">
                        {/* Logo */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-8"
                        >
                            <div className="flex items-center gap-2 mb-6">
                                <motion.div
                                    whileHover={{ rotate: 5, scale: 1.1 }}
                                    className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30"
                                >
                                    CC
                                </motion.div>
                                <span className="text-2xl font-bold bg-gradient-to-r from-slate-900 to-blue-700 bg-clip-text text-transparent">Career Compass</span>
                            </div>
                            <h1 className="text-4xl font-bold text-slate-900 mb-3">
                                Create <br />Account
                            </h1>
                            <p className="text-slate-600 text-base font-medium">
                                Join thousands building their careers with us
                            </p>
                        </motion.div>

                        {/* Error Message */}
                        <AnimatePresence mode="wait">
                            {(authError || localError) && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm font-medium"
                                >
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    {authError || localError}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Name Field */}
                            <div>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    className="w-full h-12 px-4 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-400 placeholder-slate-400 transition-all duration-200"
                                />
                            </div>

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
                            <div>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        minLength={6}
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

                                {/* Password Strength Indicator */}
                                {password && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        className="mt-2 space-y-1"
                                    >
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((level) => (
                                                <div
                                                    key={level}
                                                    className={`h-1 flex-1 rounded-full transition-all duration-300 ${level <= passwordStrength.strength
                                                        ? passwordStrength.color
                                                        : 'bg-slate-200'
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        {passwordStrength.label && (
                                            <p className="text-xs text-slate-600">
                                                Password strength: <span className="font-medium">{passwordStrength.label}</span>
                                            </p>
                                        )}
                                    </motion.div>
                                )}
                            </div>

                            {/* Confirm Password Field */}
                            <div>
                                <div className="relative">
                                    <Input
                                        id="confirm-password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        minLength={6}
                                        className="w-full h-12 px-4 pr-12 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-blue-400 placeholder-slate-400 transition-all duration-200"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Password Match Indicator */}
                                {confirmPassword && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="mt-2 flex items-center gap-2 text-xs"
                                    >
                                        {passwordsMatch ? (
                                            <>
                                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                                <span className="text-green-600 font-medium">Passwords match</span>
                                            </>
                                        ) : (
                                            <>
                                                <XCircle className="w-4 h-4 text-red-600" />
                                                <span className="text-red-600 font-medium">Passwords don't match</span>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </div>

                            {/* Terms Checkbox */}
                            <div className="flex items-start gap-3 text-sm pt-2">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    required
                                    className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mt-1"
                                />
                                <div className="text-slate-700">
                                    <label htmlFor="terms" className="cursor-pointer hover:text-slate-900">I agree to the</label>{' '}
                                    <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">Terms of Service</Link>{' '}
                                    and{' '}
                                    <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-medium hover:underline">Privacy Policy</Link>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                                <Button
                                    type="submit"
                                    className="w-full h-12 mt-4 bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 group"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Creating Account...
                                        </>
                                    ) : (
                                        <>
                                            Create Account
                                            <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </Button>
                            </motion.div>
                        </form>

                        {/* Sign In Link */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="mt-6 pt-6 border-t border-slate-100"
                        >
                            <p className="text-center text-sm text-slate-600">
                                Already have an account?{' '}
                                <Link to="/login" className="text-blue-600 font-semibold hover:text-blue-700 hover:underline transition-colors">
                                    Sign In
                                </Link>
                            </p>
                        </motion.div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default RegisterPage;