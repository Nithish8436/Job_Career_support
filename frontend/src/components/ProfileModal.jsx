import React from 'react';
import { Modal } from './ui/Modal';
import { User, Mail, Calendar, Shield, FileText, Mic, Sparkles, Award } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

const ProfileModal = ({ isOpen, onClose }) => {
    const { user } = useAuth();

    if (!user) return null;

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Mock stats (you can replace these with real data)
    const stats = {
        analyses: 12,
        interviews: 8,
        quizzes: 5,
        level: 3
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Your Profile" size="md">
            <div className="space-y-6">
                {/* Avatar with Gradient */}
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-600 via-cyan-500 to-purple-600 flex items-center justify-center text-white text-4xl font-bold shadow-xl shadow-blue-600/30">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                            <Award className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div className="mt-4 text-center">
                        <h3 className="text-xl font-bold text-slate-900">{user.name}</h3>
                        <p className="text-sm text-slate-600">Premium Member</p>
                    </div>
                </div>

                {/* User Details */}
                <div className="space-y-3">
                    <div className={cn(
                        "flex items-center gap-3 p-4 rounded-xl transition-all duration-300",
                        "bg-gradient-to-r from-blue-50/80 to-cyan-50/80",
                        "border border-blue-200/50 hover:border-blue-300",
                        "group hover:shadow-md"
                    )}>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                            <User className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-blue-800 uppercase tracking-wider">Full Name</p>
                            <p className="text-lg font-bold text-slate-900">{user.name}</p>
                        </div>
                    </div>

                    <div className={cn(
                        "flex items-center gap-3 p-4 rounded-xl transition-all duration-300",
                        "bg-gradient-to-r from-purple-50/80 to-pink-50/80",
                        "border border-purple-200/50 hover:border-purple-300",
                        "group hover:shadow-md"
                    )}>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                            <Mail className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-purple-800 uppercase tracking-wider">Email Address</p>
                            <p className="text-lg font-bold text-slate-900">{user.email}</p>
                        </div>
                    </div>

                    <div className={cn(
                        "flex items-center gap-3 p-4 rounded-xl transition-all duration-300",
                        "bg-gradient-to-r from-green-50/80 to-emerald-50/80",
                        "border border-green-200/50 hover:border-green-300",
                        "group hover:shadow-md"
                    )}>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform">
                            <Calendar className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-green-800 uppercase tracking-wider">Member Since</p>
                            <p className="text-lg font-bold text-slate-900">{formatDate(user.createdAt)}</p>
                        </div>
                    </div>

                    <div className={cn(
                        "flex items-center gap-3 p-4 rounded-xl transition-all duration-300",
                        "bg-gradient-to-r from-cyan-50/80 to-blue-50/80",
                        "border border-cyan-200/50 hover:border-cyan-300",
                        "group hover:shadow-md",
                        "shadow-sm"
                    )}>
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-100 to-cyan-50 flex items-center justify-center text-cyan-600 group-hover:scale-110 transition-transform">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-semibold text-cyan-800 uppercase tracking-wider">Account Status</p>
                            <p className="text-lg font-bold text-cyan-900 flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-yellow-500" />
                                Active Premium
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-200/50">
                    <div className={cn(
                        "text-center p-4 rounded-xl transition-all duration-300",
                        "bg-gradient-to-br from-blue-50 to-blue-100/50",
                        "border border-blue-200 hover:border-blue-300",
                        "hover:shadow-md"
                    )}>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center mx-auto mb-3 text-blue-600">
                            <FileText className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-bold text-blue-700">{stats.analyses}</p>
                        <p className="text-sm font-semibold text-blue-800">Analyses</p>
                    </div>

                    <div className={cn(
                        "text-center p-4 rounded-xl transition-all duration-300",
                        "bg-gradient-to-br from-purple-50 to-purple-100/50",
                        "border border-purple-200 hover:border-purple-300",
                        "hover:shadow-md"
                    )}>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-100 to-purple-50 flex items-center justify-center mx-auto mb-3 text-purple-600">
                            <Mic className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-bold text-purple-700">{stats.interviews}</p>
                        <p className="text-sm font-semibold text-purple-800">Interviews</p>
                    </div>

                    <div className={cn(
                        "text-center p-4 rounded-xl transition-all duration-300",
                        "bg-gradient-to-br from-green-50 to-green-100/50",
                        "border border-green-200 hover:border-green-300",
                        "hover:shadow-md"
                    )}>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center mx-auto mb-3 text-green-600">
                            <Award className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-bold text-green-700">{stats.quizzes}</p>
                        <p className="text-sm font-semibold text-green-800">Quizzes</p>
                    </div>

                    <div className={cn(
                        "text-center p-4 rounded-xl transition-all duration-300",
                        "bg-gradient-to-br from-amber-50 to-amber-100/50",
                        "border border-amber-200 hover:border-amber-300",
                        "hover:shadow-md"
                    )}>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-amber-50 flex items-center justify-center mx-auto mb-3 text-amber-600">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <p className="text-3xl font-bold text-amber-700">Level {stats.level}</p>
                        <p className="text-sm font-semibold text-amber-800">Career Level</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="pt-4 border-t border-slate-200/50">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="font-semibold text-slate-700">Profile Completion</span>
                        <span className="font-bold text-blue-700">85%</span>
                    </div>
                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-500 rounded-full transition-all duration-1000"
                            style={{ width: '85%' }}
                        />
                    </div>
                    <p className="text-xs text-slate-500 mt-2">Complete your profile for better job matches</p>
                </div>
            </div>
        </Modal>
    );
};

export default ProfileModal;