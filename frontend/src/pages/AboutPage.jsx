import React from 'react';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { Users, Target, Shield } from 'lucide-react';

const AboutPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-16">
            <SEO title="About Us" description="About Career Compass and our mission." />
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
                        Empowering Your <br />
                        <span className="text-blue-600">Career Journey</span>
                    </h1>
                    <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                        We believe everyone deserves a fulfilling career. Career Compass uses advanced AI to democratize access to professional career guidance.
                    </p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-3 gap-8 mb-16">
                    {[
                        { icon: Target, title: "Our Mission", text: "To help 1 million job seekers land their dream jobs by 2026 through accessible, high-quality AI tools." },
                        { icon: Shield, title: "Our Values", text: "Transparency, privacy, and user success are at the core of everything we build." },
                        { icon: Users, title: "Our Community", text: "A growing community of over 50,000 professionals supporting each other's growth." }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 text-center"
                        >
                            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <item.icon className="w-7 h-7 text-blue-600" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                            <p className="text-slate-600">{item.text}</p>
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
        </div>
    );
};

export default AboutPage;
