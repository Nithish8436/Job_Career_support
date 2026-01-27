import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    // Check both storages on initial load
    const [token, setToken] = useState(localStorage.getItem('token') || sessionStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                // console.log('🔑 Token found:', token.substring(0, 20) + '...');
                try {
                    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/me`, {
                        headers: {
                            'x-auth-token': token
                        }
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setUser(data.user);
                    } else {
                        console.log('❌ Auth failed, clearing token');
                        localStorage.removeItem('token');
                        sessionStorage.removeItem('token');
                        setToken(null);
                        setUser(null);
                    }
                } catch (err) {
                    console.error('💥 Error loading user:', err);
                    localStorage.removeItem('token');
                    sessionStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            }
            setLoading(false);
        };

        loadUser();
    }, [token]);

    // Auto-clear error after 5 seconds
    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    const register = async (name, email, password, securityQuestion, securityAnswer) => {
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password, securityQuestion, securityAnswer })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            // Default to localStorage for register
            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data.user);
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const login = async (email, password, rememberMe = true) => {
        setError(null);
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            if (rememberMe) {
                localStorage.setItem('token', data.token);
                sessionStorage.removeItem('token');
            } else {
                sessionStorage.setItem('token', data.token);
                localStorage.removeItem('token');
            }

            setToken(data.token);
            setUser(data.user);
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        sessionStorage.removeItem('token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            error,
            register,
            login,
            logout,
            isAuthenticated: !!user
        }}>
            {children}
        </AuthContext.Provider>
    );
};
