// src/pages/RegisterPage/index.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './RegisterPage.css';

const RegisterPage = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    // --- NEW STATE FOR ADDITIONAL FIELDS ---
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    // --- END NEW STATE ---

    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage('');
        setIsError(false);

        if (password !== confirmPassword) {
            setMessage('Passwords do not match.');
            setIsError(true);
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/customer/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    email,
                    password,
                    // --- NEW FIELDS IN REQUEST BODY ---
                    first_name: firstName, // Match backend snake_case if applicable
                    last_name: lastName,   // Match backend snake_case if applicable
                    phone_number: phoneNumber, // Match backend snake_case if applicable
                    address,
                    // --- END NEW FIELDS ---
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage(data.message || 'Registration successful! Please check your email to activate your account.');
                setIsError(false);
                // Clear all form fields
                setUsername('');
                setEmail('');
                setPassword('');
                setConfirmPassword('');
                setFirstName(''); // Clear new fields
                setLastName('');
                setPhoneNumber('');
                setAddress('');
            } else {
                setMessage(data.message || 'Registration failed. Please try again.');
                setIsError(true);
            }
        } catch (error) {
            console.error('Registration failed:', error);
            setMessage('Network error or server unavailable. Please try again later.');
            setIsError(true);
        }
    };

    return (
        <div className="register-page-container">
            <div className="register-left-side">
                <h1 className="register-page-title">Join Our Community!</h1>
                <p className="register-page-slogan">Create an account to unlock exclusive features and manage your orders.</p>
                <img src="/path/to/your/register-image.jpg" alt="Register Visual" className="register-image" /> {/* Update path */}
            </div>
            <div className="register-right-side">
                <form className="register-form" onSubmit={handleRegister}>
                    <h2>Register</h2>
                    {message && (
                        <p className={`register-message ${isError ? 'error' : 'success'}`}>
                            {message}
                        </p>
                    )}
                    <div className="form-group">
                        <label htmlFor="username">Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    {/* --- NEW INPUT FIELDS --- */}
                    <div className="form-group">
                        <label htmlFor="firstName">First Name</label>
                        <input
                            type="text"
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            // required={true} // Make required if desired
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="lastName">Last Name</label>
                        <input
                            type="text"
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            // required={true} // Make required if desired
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="phoneNumber">Phone Number</label>
                        <input
                            type="tel" // Use type="tel" for phone numbers
                            id="phoneNumber"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            // required={true} // Make required if desired
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="address">Address</label>
                        <textarea
                            id="address"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            rows="3"
                            // required={true} // Make required if desired
                        ></textarea>
                    </div>
                    {/* --- END NEW INPUT FIELDS --- */}
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="register-button">Register</button>
                    <p className="login-link">Already have an account? <Link to="/login">Login</Link></p>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;