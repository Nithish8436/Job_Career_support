import React from 'react';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { Users, Target, Heart, Award, Sparkles, Globe, Eye } from 'lucide-react';
import Footer from '../components/Footer';

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <SEO title="About Us" description="Learn about the mission and team behind Career Compass." />

            {/* Hero Section */}
            <div className="bg-slate-900 text-white py-24 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="max-w-3xl mx-auto"
                    >
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-purple-400 text-xs font-semibold mb-6">
                            <Users className="w-3 h-3" />
                            <span>Our Story</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-bold mb-6">Empowering Your Career Journey</h1>
                        <p className="text-xl text-slate-300 leading-relaxed">
                            We're on a mission to democratize career success by providing AI-powered tools that help job seekers land their dream roles.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Mission & Stats */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
                <div className="grid md:grid-cols-3 gap-6">
                    {[
                        { label: 'Resumes Optimized', value: '50k+', icon: Target },
                        { label: 'Success Rate', value: '94%', icon: Award },
                        { label: 'Countries Reached', value: '30+', icon: Globe }
                    ].map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center"
                        >
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                            <div className="text-sm text-slate-500 font-medium uppercase tracking-wide">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Team Section */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl p-12 text-center text-white"
                >
                    <h2 className="text-3xl font-bold mb-4">Join Us on this Journey</h2>
                    <p className="text-blue-100 mb-8 max-w-xl mx-auto">
                        Whether you're just starting out or looking to pivot, we're here to support your next big move.
                    </p>
                </motion.div>
            </div>
            <Footer />
        </div>
    );
};

export default AboutPage;
