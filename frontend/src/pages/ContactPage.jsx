import React from 'react';
import SEO from '../components/SEO';
import { motion } from 'framer-motion';
import { Mail, MapPin, Phone } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const ContactPage = () => {
    return (
        <div className="min-h-screen bg-slate-50 pt-24 pb-16">
            <SEO title="Contact Us" description="Get in touch with the Career Compass team." />
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid lg:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl font-bold text-slate-900 mb-6">Get in Touch</h1>
                        <p className="text-lg text-slate-600 mb-10">
                            Have questions about our AI analysis? Need help with your account? We're here to help!
                        </p>

                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Mail className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-1">Email Us</h3>
                                    <p className="text-slate-600">support@careercompass.com</p>
                                    <p className="text-slate-600">partnerships@careercompass.com</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <MapPin className="w-6 h-6 text-blue-600" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 mb-1">Visit Us</h3>
                                    <p className="text-slate-600">123 Innovation Drive</p>
                                    <p className="text-slate-600">Tech Valley, CA 94025</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Contact Form */}
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200"
                    >
                        <form className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                                    <Input className="w-full bg-slate-50 border-slate-200" placeholder="John" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                                    <Input className="w-full bg-slate-50 border-slate-200" placeholder="Doe" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <Input className="w-full bg-slate-50 border-slate-200" placeholder="john@example.com" type="email" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                                <textarea
                                    className="w-full h-32 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-600 outline-none resize-none"
                                    placeholder="How can we help you?"
                                ></textarea>
                            </div>
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl">
                                Send Message
                            </Button>
                        </form>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
