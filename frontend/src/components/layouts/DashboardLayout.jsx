// layouts/DashboardLayout.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../Sidebar';
import SidebarOverlay from '../SidebarOverlay';
import ProfileModal from '../ProfileModal';

const DashboardLayout = ({ children, pageTitle = "Dashboard" }) => {
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(true); // Start collapsed
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 flex">
            {/* Mobile Sidebar Overlay */}
            <SidebarOverlay
                isOpen={sidebarOpen}
                onClose={() => setSidebarOpen(false)}
            >
                <Sidebar
                    user={user}
                    collapsed={collapsed}
                    onToggleCollapse={() => setCollapsed(!collapsed)}
                    onLogout={handleLogout}
                    onProfileClick={() => setShowProfileModal(true)}
                    sidebarOpen={sidebarOpen}
                    onCloseSidebar={() => setSidebarOpen(false)}
                />
            </SidebarOverlay>

            {/* Desktop Sidebar */}
            <Sidebar
                user={user}
                collapsed={collapsed}
                onToggleCollapse={() => setCollapsed(!collapsed)}
                onLogout={handleLogout}
                onProfileClick={() => setShowProfileModal(true)}
            />

            {/* Main Content */}
            <div className="flex-1">
                {children}
            </div>

            {/* Profile Modal */}
            <ProfileModal
                isOpen={showProfileModal}
                onClose={() => setShowProfileModal(false)}
            />
        </div>
    );
};

export default DashboardLayout;