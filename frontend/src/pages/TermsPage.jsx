import React, { useState, useEffect } from 'react';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { Shield, FileText, Scale, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';

const TermsPage = () => {
    const [activeSection, setActiveSection] = useState('acceptance');

    useEffect(() => {
        const handleScroll = () => {
            const sections = ['acceptance', 'license', 'disclaimer', 'ai-analysis', 'limitations'];
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
            <SEO title="Terms of Service" description="Terms and Conditions for CareerFlux." />

            {/* Header / Hero */}
            <div className="bg-slate-900 text-white py-20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="max-w-3xl">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-blue-400 text-xs font-semibold mb-6">
                            <Scale className="w-3 h-3" />
                            <span>Legal Documents</span>
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-6">Terms of Service</h1>
                        <p className="text-xl text-slate-300 leading-relaxed">
                            Please read these terms carefully before using CareerFlux. They govern your use of our AI-powered career tools and services.
                        </p>
                        <div className="mt-8 flex items-center text-sm text-slate-400">
                            <span>Last Updated: January 8, 2026</span>
                            <span className="mx-3">•</span>
                            <span>Version 2.1</span>
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
                                { id: 'acceptance', label: '1. Acceptance of Terms' },
                                { id: 'license', label: '2. Use License' },
                                { id: 'disclaimer', label: '3. Disclaimer' },
                                { id: 'ai-analysis', label: '4. AI Analysis Disclaimer' },
                                { id: 'limitations', label: '5. Limitations' }
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => scrollToSection(item.id)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-200 flex items-center justify-between group ${activeSection === item.id
                                        ? 'bg-blue-50 text-blue-700 font-semibold'
                                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                                        }`}
                                >
                                    {item.label}
                                    {activeSection === item.id && <ChevronRight className="w-4 h-4 opacity-100" />}
                                </button>
                            ))}

                            <div className="mt-8 pt-8 border-t border-slate-200">
                                <p className="text-xs text-slate-500 mb-4 px-3">Need clarification?</p>
                                <Link to="/contact">
                                    <Button variant="outline" className="w-full justify-start text-slate-600">
                                        Contact Legal Team
                                    </Button>
                                </Link>
                            </div>
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
                            <section id="acceptance" className="scroll-mt-28">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">1. Acceptance of Terms</h2>
                                </div>
                                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                                    <p>
                                        By accessing or using CareerFlux ("Services"), you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
                                    </p>
                                    <p className="mt-4">
                                        These terms apply to all visitors, users, and others who access or use the Service. Your access to and use of the Service is conditioned on your acceptance of and compliance with these Terms.
                                    </p>
                                </div>
                            </section>

                            <hr className="border-slate-100" />

                            {/* Section 2 */}
                            <section id="license" className="scroll-mt-28">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Shield className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900">2. Use License</h2>
                                </div>
                                <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed">
                                    <p>
                                        Permission is granted to temporarily download one copy of the materials (information or software) on CareerFlux for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
                                    </p>
                                    <ul className="mt-4 space-y-2 list-none pl-0">
                                        {[
                                            'Modify or copy the materials',
                                            'Use the materials for any commercial purpose',
                                            'Attempt to decompile or reverse engineer any software',
                                            'Remove any copyright or other proprietary notations',
                                            'Transfer the materials to another person'
                                        ].map((item, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0"></div>
                                                <span>{item}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </section>

                            <hr className="border-slate-100" />

                            {/* Section 3 */}
                            <section id="disclaimer" className="scroll-mt-28">
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">3. Disclaimer</h2>
                                <p className="text-slate-600 mb-6 leading-relaxed">
                                    The materials on CareerFlux are provided on an 'as is' basis. CareerFlux makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
                                </p>
                                <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-6 flex gap-4">
                                    <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
                                    <div>
                                        <h4 className="font-bold text-yellow-800 mb-1">Important Note</h4>
                                        <p className="text-sm text-yellow-700">
                                            We do not guarantee that your use of our service will result in job offers or interviews. The hiring decision relies solely on the specific employer.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-slate-100" />

                            {/* Section 4 */}
                            <section id="ai-analysis" className="scroll-mt-28">
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">4. AI Analysis Disclaimer</h2>
                                <p className="text-slate-600 mb-4 leading-relaxed">
                                    Our resume analysis and career suggestions are generated by advanced Artificial Intelligence models. While we strive for high accuracy:
                                </p>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="border border-slate-200 rounded-xl p-5 hover:border-blue-200 transition-colors">
                                        <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" /> Accuracy
                                        </h4>
                                        <p className="text-sm text-slate-500">
                                            AI suggestions should be treated as guidance, not absolute fact. Validation is recommended.
                                        </p>
                                    </div>
                                    <div className="border border-slate-200 rounded-xl p-5 hover:border-blue-200 transition-colors">
                                        <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4 text-green-500" /> Bias
                                        </h4>
                                        <p className="text-sm text-slate-500">
                                            We actively work to minimize bias, but AI models may occasionally reflect data limitations.
                                        </p>
                                    </div>
                                </div>
                            </section>

                            <hr className="border-slate-100" />

                            {/* Section 5 */}
                            <section id="limitations" className="scroll-mt-28">
                                <h2 className="text-2xl font-bold text-slate-900 mb-4">5. Limitations</h2>
                                <p className="text-slate-600 leading-relaxed">
                                    In no event shall CareerFlux or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on CareerFlux, even if CareerFlux or a CareerFlux authorized representative has been notified orally or in writing of the possibility of such damage.
                                </p>
                            </section>

                        </div>
                    </motion.div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TermsPage;
