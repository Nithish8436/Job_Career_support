import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2, ArrowLeft, KeyRound, CheckCircle2, ShieldQuestion } from 'lucide-react';
import axios from 'axios';

const ForgotPasswordPage = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: Question/Answer
    const [email, setEmail] = useState('');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [error, setError] = useState(null);

    const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000' });

    const handleGetQuestion = async (e) => {
        e.preventDefault();
        setStatus('loading');
        setError(null);

        try {
            const res = await api.post('/api/auth/get-question', { email });
            if (res.data.success) {
                setQuestion(res.data.question);
                setStep(2);
                setStatus('idle');
            }
        } catch (err) {
            setStatus('error');
            setError(err.response?.data?.message || 'Failed to find account');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (newPassword.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setStatus('loading');
        setError(null);

        try {
            const res = await api.post('/api/auth/reset-via-question', {
                email,
                answer,
                newPassword
            });

            if (res.data.success) {
                setStatus('success');
            }
        } catch (err) {
            setStatus('error');
            setError(err.response?.data?.message || 'Failed to reset password');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            <SEO
                title="Reset Password"
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
                        <KeyRound className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Password Recovery</h1>
                    <p className="text-slate-600">
                        {step === 1 ? "Enter your email to find your account." : "Answer your security question to reset."}
                    </p>
                </div>

                <AnimatePresence mode="wait">
                    {status === 'success' ? (
                        <motion.div
                            key="success"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-green-50 border border-green-200 rounded-xl p-6 text-center"
                        >
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                            <h3 className="text-lg font-bold text-green-800 mb-2">Password Reset!</h3>
                            <p className="text-green-700 text-sm mb-6">
                                Your password has been successfully updated.
                            </p>
                            <Link to="/login">
                                <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                                    Login with New Password
                                </Button>
                            </Link>
                        </motion.div>
                    ) : (
                        <motion.form
                            key={step} // Animate transition between steps
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={step === 1 ? handleGetQuestion : handleResetPassword}
                            className="space-y-6"
                        >
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm font-medium">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            {step === 1 ? (
                                // Step 1: Email
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
                            ) : (
                                // Step 2: Security Question & New Password
                                <div className="space-y-4">
                                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                                        <div className="flex items-center gap-2 text-blue-800 font-medium mb-1">
                                            <ShieldQuestion className="w-5 h-5" />
                                            Security Question:
                                        </div>
                                        <p className="text-blue-900 text-lg font-semibold">{question}</p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Your Answer</label>
                                        <Input
                                            type="text"
                                            placeholder="Enter your answer"
                                            value={answer}
                                            onChange={(e) => setAnswer(e.target.value)}
                                            required
                                            className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">New Password</label>
                                        <Input
                                            type="password"
                                            placeholder="Enter new password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2 ml-1">Confirm New Password</label>
                                        <Input
                                            type="password"
                                            placeholder="Confirm new password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            className="w-full h-12 px-4 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-600"
                                        />
                                    </div>
                                </div>
                            )}

                            <Button
                                type="submit"
                                className="w-full h-12 bg-gradient-to-r from-blue-700 to-cyan-600 hover:from-blue-800 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg shadow-blue-600/25 transition-all"
                                disabled={status === 'loading'}
                            >
                                {status === 'loading' ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        {step === 1 ? "Checking Email..." : "Resetting Password..."}
                                    </>
                                ) : (
                                    step === 1 ? "Continue" : "Reset Password"
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
