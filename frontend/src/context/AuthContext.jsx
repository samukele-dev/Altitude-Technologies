// src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check if token is expired
                if (decoded.exp * 1000 < Date.now()) {
                    console.log('Token expired.');
                    localStorage.removeItem('token');
                    setCurrentUser(null);
                } else {
                    setCurrentUser({
                        id: decoded.customerId,
                        email: decoded.email,
                        username: decoded.username,
                    });
                }
            } catch (error) {
                console.error('Failed to decode token:', error);
                localStorage.removeItem('token');
                setCurrentUser(null);
            }
        }
        setLoading(false);
    }, []);

    const login = (token, customerId, email, username) => {
        localStorage.setItem('token', token);
        setCurrentUser({ id: customerId, email, username });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setCurrentUser(null);
        // Important: Clear the cart from localStorage when logging out
        // The CartProvider will also react to currentUser changing to null
        // But explicitly clearing here ensures it's gone
        localStorage.removeItem(`shoppingCart_${currentUser?.id}`); // Clear specific user's cart
        // Also clear any generic cart if it was used for guests
        localStorage.removeItem('shoppingCart_guest');
    };

    if (loading) {
        return <div>Loading authentication...</div>; // Or a spinner
    }

    return (
        <AuthContext.Provider value={{ currentUser, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};