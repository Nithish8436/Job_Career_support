import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadUser = async () => {
            if (token) {
                console.log('🔑 Token found in localStorage:', token.substring(0, 20) + '...');
                try {
                    const response = await fetch('http://localhost:5000/api/auth/me', {
                        headers: {
                            'x-auth-token': token
                        }
                    });

                    console.log('📡 /api/auth/me response status:', response.status);

                    if (response.ok) {
                        const data = await response.json();
                        console.log('✅ User data received:', data);
                        console.log('👤 User object:', data.user);
                        console.log('🆔 User ID:', data.user?.id);
                        setUser(data.user);
                    } else {
                        console.log('❌ Auth failed, clearing token');
                        localStorage.removeItem('token');
                        setToken(null);
                        setUser(null);
                    }
                } catch (err) {
                    console.error('💥 Error loading user:', err);
                    localStorage.removeItem('token');
                    setToken(null);
                    setUser(null);
                }
            } else {
                console.log('⚠️ No token found in localStorage');
            }
            setLoading(false);
        };

        loadUser();
    }, [token]);

    const register = async (name, email, password) => {
        setError(null);
        try {
            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data.user);
            return true;
        } catch (err) {
            setError(err.message);
            return false;
        }
    };

    const login = async (email, password) => {
        setError(null);
        console.log('🔐 Attempting login for:', email);
        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();
            console.log('📨 Login response:', data);

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            console.log('✅ Login successful!');
            console.log('🎫 Token:', data.token?.substring(0, 20) + '...');
            console.log('👤 User:', data.user);
            console.log('🆔 User ID:', data.user?.id);

            localStorage.setItem('token', data.token);
            setToken(data.token);
            setUser(data.user);
            return true;
        } catch (err) {
            console.error('❌ Login error:', err.message);
            setError(err.message);
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
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
