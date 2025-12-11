import React from 'react';
import { Modal } from './ui/Modal';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

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

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Profile" size="md">
            <div className="space-y-6">
                {/* Avatar */}
                <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
                        {user.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                </div>

                {/* User Details */}
                <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <User className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-gray-500 font-medium">Full Name</p>
                            <p className="text-base text-gray-900 font-semibold">{user.name}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <Mail className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-gray-500 font-medium">Email Address</p>
                            <p className="text-base text-gray-900 font-semibold">{user.email}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <Calendar className="w-5 h-5 text-primary mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-gray-500 font-medium">Member Since</p>
                            <p className="text-base text-gray-900 font-semibold">{formatDate(user.createdAt)}</p>
                        </div>
                    </div>

                    <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <Shield className="w-5 h-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm text-green-700 font-medium">Account Status</p>
                            <p className="text-base text-green-900 font-semibold">Active</p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">0</p>
                        <p className="text-sm text-blue-700">Analyses</p>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">0</p>
                        <p className="text-sm text-purple-700">Interviews</p>
                    </div>
                </div>
            </div>
        </Modal>
    );
};

export default ProfileModal;
