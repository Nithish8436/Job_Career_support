import React from 'react';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';

const PrivacyPolicyPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-16">
            <SEO title="Privacy Policy" description="Privacy Policy for Career Compass." />
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-white rounded-2xl shadow-xl p-8 md:p-12 border border-slate-200"
                >
                    <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8">Privacy Policy</h1>

                    <div className="prose prose-slate max-w-none text-slate-600">
                        <p className="lead text-lg">
                            Last updated: {new Date().toLocaleDateString()}
                        </p>

                        <h3>1. Information We Collect</h3>
                        <p>
                            We collect information you provide directly to us, such as when you create an account, upload a resume, or contact us. This may include your name, email address, resume content, and employment history.
                        </p>

                        <h3>2. How We Use Your Information</h3>
                        <p>
                            We use the information we collect to:
                        </p>
                        <ul>
                            <li>Provide, maintain, and improve our services</li>
                            <li>Generate AI-powered resume analysis and career suggestions</li>
                            <li>Send you technical notices and support messages</li>
                            <li>Respond to your comments and questions</li>
                        </ul>

                        <h3>3. Data Security</h3>
                        <p>
                            We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction. Your resume data is processed securely and is not shared with third parties for marketing purposes.
                        </p>

                        <h3>4. AI Processing</h3>
                        <p>
                            To provide our core services, your resume text is processed by third-party AI models (e.g., Groq). We transmit this data securely for the sole purpose of analysis and do not store it for training purposes.
                        </p>

                        <h3>5. Contact Us</h3>
                        <p>
                            If you have any questions about this Privacy Policy, please contact us at support@careercompass.com.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
