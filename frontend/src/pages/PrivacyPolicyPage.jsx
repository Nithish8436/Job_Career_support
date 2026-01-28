import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { Shield, Lock, Eye, Server, Mail, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const PrivacyPolicyPage = () => {
    const [activeSection, setActiveSection] = useState('collection');

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['collection', 'usage', 'security', 'ai-processing', 'contact'];
            const scrollPosition = window.scrollY + 150;

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element && element.offsetTop <= scrollPosition && (element.offsetTop + element.offsetHeight) > scrollPosition) {
                    setActiveSection(section);
                    break;
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
        <div className="min-h-screen bg-slate-50 font-sans">
            <SEO title="Privacy Policy" description="Privacy Policy for CareerFlux." />

            {/* Header / Hero */}
            <div className="bg-slate-900 text-white py-20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2"></div>
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl translate-y-1/2 translate-x-1/2"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 text-xs font-semibold mb-6">
                            <Lock className="w-3 h-3" />
                            <span>Data Protection</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Privacy Policy</h1>
                        <p className="text-xl text-slate-300 leading-relaxed">
                            Your privacy matters to us. This policy outlines how we collect, use, and protect your personal and professional data.
                        </p>
                        <div className="mt-8 flex items-center text-sm text-slate-400">
                            <span>Last Updated: January 8, 2026</span>
                            <span className="mx-3">•</span>
                            <span>Effective Immediately</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-1/4">
                        <div className="sticky top-24 space-y-1">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-3">On this page</p>
                            {[
                                { id: 'collection', label: '1. Information Collection' },
                                { id: 'usage', label: '2. How We Use Data' },
                                { id: 'security', label: '3. Data Security' },
                                { id: 'ai-processing', label: '4. AI Data Processing' },
                                { id: 'contact', label: '5. Contact Us' }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className={`w - full text - left px - 3 py - 2 rounded - lg text - sm transition - all duration - 200 flex items - center justify - between group ${activeSection === item.id
                                        ? 'bg-emerald-50 text-emerald-700 font-semibold'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                        } `}
                                >
                                    {item.label}
                                    {activeSection === item.id && <ChevronRight className="w-4 h-4 opacity-100" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:w-3/4"
                    >
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12 space-y-16">

                            {/* Section 1 */}
                            <section id="collection" className="scroll-mt-28">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <Eye className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">1. Information We Collect</h2>
                                </div>
                                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                                    <p className="mb-4">
                                        We collect information you provide directly to us when you create an account, upload a resume, or communicate with our support team.
                                    </p>
                                    <div className="grid sm:grid-cols-2 gap-4 mt-6">
                                        {[
                                            'Personal Identifiers (Name, Email)',
                                            'Professional History (Resumes)',
                                            'Usage Data & Analytics',
                                            'Device & Browser Information'
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                                <span className="text-sm font-medium">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            <hr className="border-slate-100" />

                            {/* Section 2 */}
                            <section id="usage" className="scroll-mt-28">
                                <h2 className="text-2xl font-bold text-slate-900 mb-6">2. How We Use Your Information</h2>
                                <p className="text-slate-600 mb-6 leading-relaxed">
                                    We use the collection information to provide, maintain, and improve our services, specifically for:
                                </p>
                                <div className="space-y-4">
                                    {[
                                        { title: 'Service Delivery', desc: 'Generating AI resume analysis, career roadmaps, and interview questions.' },
                                        { title: 'Communication', desc: 'Sending you technical notices, updates, security alerts, and support messages.' },
                                        { title: 'Improvement', desc: 'Analyzing usage trends to improve our AI models and user experience.' }
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-2.5 flex-shrink-0"></div>
                                            <div>
                                                <h4 className="font-bold text-slate-900">{item.title}</h4>
                                                <p className="text-sm text-slate-600">{item.desc}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <hr className="border-slate-100" />

                            {/* Section 3 */}
                            <section id="security" className="scroll-mt-28">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">3. Data Security</h2>
                                </div>
                                <p className="text-slate-600 leading-relaxed mb-6">
                                    We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
                                </p>
                                <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6">
                                    <h4 className="font-bold text-emerald-900 mb-2">Our Security Standards</h4>
                                    <ul className="space-y-2 text-sm text-emerald-800">
                                        <li>• End-to-end encryption for data in transit</li>
                                        <li>• Secure database storage with access controls</li>
                                        <li>• Regular security audits and updates</li>
                                    </ul>
                                </div>
                            </section>

                            <hr className="border-slate-100" />

                            {/* Section 4 */}
                            <section id="ai-processing" className="scroll-mt-28">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                                        <Server className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">4. AI Data Processing</h2>
                                </div>
                                <p className="text-slate-600 leading-relaxed">
                                    To provide our core services, your resume text is processed by third-party AI models (e.g., Groq). We transmit this data securely via encrypted channels for the sole purpose of analysis. We <strong>do not</strong> sell your personal data to third parties.
                                </p>
                            </section>

                            <hr className="border-slate-100" />

                            {/* Section 5 */}
                            <section id="contact" className="scroll-mt-28">
                                <div className="bg-slate-50 rounded-2xl p-8 border border-slate-200 text-center">
                                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mx-auto mb-4">
                                        <Mail className="w-6 h-6 text-slate-700" />
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-900 mb-2">Have questions about privacy?</h2>
                                    <p className="text-slate-600 mb-6">Our Data Protection Officer is here to help.</p>
                                    <Link to="/contact">
                                        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white">
                                            Contact Privacy Team
                                        </Button>
                                    </Link>
                                </div>
                            </section>

                        </div>
                    </motion.div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default PrivacyPolicyPage;
