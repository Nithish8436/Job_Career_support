import React from 'react';
import { Link } from 'react-router-dom';
import {
    Github, Twitter, Linkedin, Mail,
    Shield, FileText, Info, MessageSquare,
    ArrowRight
} from 'lucide-react';
import Logo from './Logo';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-white border-t border-slate-200 pt-16 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Column */}
                    <div>
                        <Link to="/" className="inline-block mb-6">
                            <Logo />
                        </Link>
                        <p className="text-slate-600 mb-6 leading-relaxed">
                            Empowering careers with AI-driven insights. Get the tools you need to land your dream job faster.
                        </p>
                        <div className="flex gap-4">
                            {[
                                { icon: Twitter, href: "#", label: "Twitter" },
                                { icon: Github, href: "#", label: "GitHub" },
                                { icon: Linkedin, href: "#", label: "LinkedIn" }
                            ].map((social, index) => (
                                <a
                                    key={index}
                                    href={social.href}
                                    className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Product Links */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-6">Product</h3>
                        <ul className="space-y-4">
                            {[
                                { label: "Resume Scanner", href: "/upload" },
                                { label: "Mock Interview", href: "/interview" },
                                { label: "Career Quiz", href: "/quiz" },
                                { label: "Success Stories", href: "/#testimonials" }
                            ].map((link, index) => (
                                <li key={index}>
                                    <Link
                                        to={link.href}
                                        className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2 group"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full bg-slate-300 group-hover:bg-blue-500 transition-colors"></span>
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Company Links */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-6">Company</h3>
                        <ul className="space-y-4">
                            {[
                                { label: "About Us", href: "/about", icon: Info },
                                { label: "Contact", href: "/contact", icon: MessageSquare },
                                { label: "Privacy Policy", href: "/privacy", icon: Shield },
                                { label: "Terms of Service", href: "/terms", icon: FileText }
                            ].map((link, index) => (
                                <li key={index}>
                                    <Link
                                        to={link.href}
                                        className="text-slate-600 hover:text-blue-600 transition-colors flex items-center gap-2"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Newsletter */}
                    <div>
                        <h3 className="font-bold text-slate-900 mb-6">Stay Updated</h3>
                        <p className="text-slate-600 mb-4 text-sm">
                            Subscribe to our newsletter for career tips and platform updates.
                        </p>
                        <div className="flex flex-col gap-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                className="px-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                            <button className="px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center justify-center gap-2">
                                Subscribe
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-slate-500 text-sm">
                        © {currentYear} CareerFlux. All rights reserved.
                    </p>
                    <div className="flex gap-6 text-sm text-slate-500">
                        <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy</Link>
                        <Link to="/terms" className="hover:text-blue-600 transition-colors">Terms</Link>
                        <Link to="/contact" className="hover:text-blue-600 transition-colors">Contact</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
