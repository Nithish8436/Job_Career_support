import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation();
    const [processingToken, setProcessingToken] = useState(false);

    // Handle OAuth callback token before auth check
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const token = urlParams.get('token');

        if (token) {
            setProcessingToken(true);
            // Store token in localStorage
            localStorage.setItem('token', token);

            // Clean up URL and reload
            window.history.replaceState({}, document.title, location.pathname);
            window.location.reload();
        }
    }, [location]);

    if (loading || processingToken) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-12 h-12 animate-spin text-primary" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
