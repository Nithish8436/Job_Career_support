import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import SEO from '../components/SEO';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Loader2, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to process request');
            }

            setIsSuccess(true);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsSubmitting(false);
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
                    {isSuccess ? (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
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
                    ) : (
                        <motion.form
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
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? (
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
