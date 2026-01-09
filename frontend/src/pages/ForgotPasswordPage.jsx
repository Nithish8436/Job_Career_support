import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import axios from 'axios';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState('idle'); // idle, loading, success, demo_success, error
    const [error, setError] = useState(null);
    const [demoLink, setDemoLink] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setError(null);

        try {
            const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000' });
            const res = await api.post('/api/auth/forgot-password', { email });

            if (res.data.success) {
                if (res.data.demo_link) {
                    setDemoLink(res.data.demo_link);
                    setStatus('demo_success');
                } else {
                    setStatus('success');
                }
            }
        } catch (err) {
            setStatus('error');
            setError(err.response?.data?.message || 'Failed to process request');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <SEO
                title="Forgot Password"
                description="Reset your Career Compass password."
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200/50 p-8 md:p-12 relative overflow-hidden"
            >
                {/* Decorative background blur */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -z-10"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-500/5 rounded-full blur-3xl -z-10"></div>

                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
                        <Mail className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Forgot Password?</h1>
                    <p className="text-slate-600">
                        Enter your email address and we'll send you instructions to reset your password.
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {status === 'success' && (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-green-50 border border-green-200 rounded-xl p-6 text-center"
                        >
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-green-800 mb-2">Check your email</h3>
                            <p className="text-green-700 text-sm mb-6">
                                We have sent a password reset link to <strong>{email}</strong>.
                            </p>
                            <Link to="/login">
                                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                    Back to Login
                                </Button>
                            </Link>
                        </motion.div>
                    )}

                    {status === 'demo_success' && (
                        <motion.div
                            key="demo_success"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-center"
                        >
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-6 h-6 text-blue-600" />
                            </div>
                            <h3 className="text-lg font-bold text-blue-800 mb-2">Reset Link Ready!</h3>
                            <p className="text-blue-700 text-sm mb-6">
                                Click the button below to reset your password:
                            </p>
                            <Link to={demoLink}>
                                <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white mb-3">
                                    Reset Password Now
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                onClick={() => { setStatus('idle'); setEmail(''); setDemoLink(null); }}
                                className="w-full text-slate-500"
                            >
                                Try Another Email
                            </Button>
                        </motion.div>
                    )}

                    {(status === 'idle' || status === 'loading' || status === 'error') && (
                        <motion.form
                            key="form"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onSubmit={handleSubmit}
                            className="space-y-6"
                        >
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm font-medium">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Email Address</label>
                                <Input
                                    type="email"
                                    placeholder="Enter your registered email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all"
                                disabled={status === 'loading'}
                            >
                                {status === 'loading' ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Sending Instructions...
                                    </>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>

                            <div className="text-center pt-4">
                                <Link
                                    to="/login"
                                    className="inline-flex items-center text-slate-500 hover:text-slate-800 font-medium transition-colors"
                                >
                                    <ArrowLeft className="w-4 h-4 mr-2" />
                                    Back to Login
                                </Link>
                            </div>
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
};

export default ForgotPasswordPage;
