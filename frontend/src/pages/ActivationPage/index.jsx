// src/pages/ActivationPage/index.jsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom'; // Import useNavigate
import './ActivationPage.css';

const ActivationPage = () => {
    const [searchParams] = useSearchParams();
    const [message, setMessage] = useState('Activating your account...');
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate(); // Initialize useNavigate hook

    useEffect(() => {
        const token = searchParams.get('token');

        if (!token) {
            setMessage('Activation link is missing a token.');
            setIsError(true);
            return;
        }

        console.log('Frontend: Token extracted from URL:', token); // Keep for debugging if needed

        const activateAccount = async () => {
            try {
                const response = await fetch('http://localhost:3000/api/customer/activate-account', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });

                const data = await response.json();

                if (response.ok) {
                    setMessage(data.message || 'Account activated successfully! You can now log in.');
                    setIsError(false);
                    // --- ADD AUTOMATIC REDIRECT HERE ---
                    setTimeout(() => {
                        navigate('/login'); // Redirect to login page after 3 seconds
                        // Or navigate('/home'); if you want to auto-login the user or send them directly to home
                    }, 3000); // You can adjust the delay
                    // --- END REDIRECT ---
                } else {
                    setMessage(data.error || 'Account activation failed. The link might be invalid or expired.');
                    setIsError(true);
                }
            } catch (error) {
                console.error('Account activation network error:', error);
                setMessage('Network error or server unavailable during activation.');
                setIsError(true);
            }
        };

        activateAccount();
    }, [searchParams, navigate]); // Add navigate to dependency array

    return (
        <div className="activation-page-container">
            <div className="activation-content">
                <h2>Account Activation</h2>
                <p className={`activation-message ${isError ? 'error' : 'success'}`}>
                    {message}
                </p>
                {/* The links below will still be visible until the redirect happens */}
                {!isError && (
                    <Link to="/login" className="activation-login-link">Go to Login</Link>
                )}
                {isError && (
                    <Link to="/register" className="activation-register-link">Register New Account</Link>
                )}
            </div>
        </div>
    );
};

export default ActivationPage;