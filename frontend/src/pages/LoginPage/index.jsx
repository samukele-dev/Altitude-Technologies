// src/pages/LoginPage/index.jsx
import React, { useState, useContext } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom'; // <--- Import useLocation
import './LoginPage.css';
import { AuthContext } from '@/context/AuthContext.jsx';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();
    const location = useLocation(); // <--- Initialize useLocation hook

    // Get the login function from AuthContext
    const { login } = useContext(AuthContext);

    // REMOVE THESE LINES FROM HERE! They are causing the immediate redirect.
    // const from = location.state?.from || '/';
    // navigate(from, { replace: true });

    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        try {
            const response = await fetch('http://localhost:3000/api/customer/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Login successful!');
                setIsError(false);

                // Call the login function from AuthContext
                login(data.token, data.customerId, data.email, data.username);

                // <--- MOVE THE REDIRECT LOGIC HERE, AFTER SUCCESSFUL LOGIN
                const from = location.state?.from || '/';
                navigate(from, { replace: true }); // Redirect to 'from' path, replacing the current history entry
                // <--- END OF MOVED LOGIC

            } else {
                setMessage(data.message || 'Login failed. Please check your email and password.');
                setIsError(true);
            }
        } catch (error) {
            console.error('Login failed:', error);
            setMessage('Network error or server unavailable. Please try again later.');
            setIsError(true);
        }
    };

    return (
        <div className="login-page-container">
            <div className="login-left-side">
                <h1 className="login-page-title">Welcome Back!</h1>
                <p className="login-page-slogan">Log in to continue your shopping experience.</p>
                <img src="/path/to/your/login-image.jpg" alt="Login Visual" className="login-image" />
            </div>
            <div className="login-right-side">
                <form className="login-form" onSubmit={handleLogin}>
                    <h2>Login</h2>
                    {message && (
                        <p className={`login-message ${isError ? 'error' : 'success'}`}>
                            {message}
                        </p>
                    )}
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="text"
                            id="email"
                            name="email" // <--- Add name attribute for better autofill behavior
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password" // <--- Add name attribute for better autofill behavior
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="login-button">Login</button>
                    <p className="signup-link">Don't have an account? <Link to="/register">Sign Up</Link></p>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;