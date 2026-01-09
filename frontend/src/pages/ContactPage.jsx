import React, { useState } from 'react';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/Button';
import Footer from '../components/Footer';
import axios from 'axios';

const ContactPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <SEO title="Contact Us" description="Get in touch with the Career Compass team." />

            {/* Header / Hero */}
            <div className="bg-slate-900 text-white py-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-indigo-400 text-xs font-semibold mb-6">
                            <MessageSquare className="w-3 h-3" />
                            <span>Support</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Get in Touch</h1>
                        <p className="text-xl text-slate-300 leading-relaxed">
                            Have questions about our AI analysis? Need help with your account? We're here to help!
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 -mt-10 relative z-20">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Contact Info (Left Column) */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-1 space-y-6"
                    >
                        {/* Email Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <Mail className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1">Email Us</h3>
                                <p className="text-sm text-slate-500 mb-2">For general inquiries and support:</p>
                                <a href="mailto:support@careercompass.com" className="text-blue-600 font-semibold hover:underline block">support@careercompass.com</a>
                                <a href="mailto:partnerships@careercompass.com" className="text-blue-600 font-semibold hover:underline block">partnerships@careercompass.com</a>
                            </div>
                        </div>

                        {/* Address Card */}
                        <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex items-start gap-4">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                                <MapPin className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 mb-1">Visit Us</h3>
                                <p className="text-sm text-slate-500">
                                    123 Innovation Drive<br />
                                    Tech Valley, CA 94025
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form (Right Column) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="lg:col-span-2"
                    >
                        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                            <ContactForm />
                        </div>
                    </motion.div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

const ContactForm = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, loading, success, error

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (status !== 'idle') setStatus('idle');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');
        try {
            const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000' });
            await api.post('/api/contact', formData);
            setStatus('success');
            setFormData({ firstName: '', lastName: '', email: '', message: '' });
        } catch (error) {
            console.error('Contact Error:', error);
            setStatus('error');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {status === 'success' && (
                <div className="p-4 bg-green-50 text-green-700 rounded-lg flex items-center animate-fade-in">
                    <Send className="w-5 h-5 mr-2" />
                    Message sent successfully! We'll be in touch.
                </div>
            )}
            {status === 'error' && (
                <div className="p-4 bg-red-50 text-red-700 rounded-lg">
                    Failed to send message. Please try again.
                </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">First Name</label>
                    <input
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        type="text"
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="John"
                    />
                </div>
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Last Name</label>
                    <input
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        type="text"
                        className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        placeholder="Doe"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Email</label>
                <input
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    type="email"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                    placeholder="john@example.com"
                />
            </div>

            <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Message</label>
                <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                    placeholder="How can we help you?"
                ></textarea>
            </div>

            <Button
                disabled={status === 'loading'}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-base shadow-lg shadow-blue-500/30 disabled:opacity-70"
            >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
                {status !== 'loading' && <Send className="w-4 h-4 ml-2" />}
            </Button>
        </form>
    );
};

export default ContactPage;
