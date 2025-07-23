// src/App.jsx
import React, { useRef, useContext } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Use the alias imports here:
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import ActivationPage from '@/pages/ActivationPage';
import Header from '@/components/Header'; // Using alias
import HeaderCart from '@/components/HeaderCart'; // Using alias
import CheckoutPage from '@/pages/CheckoutPage';
import OrderConfirmationPage from '@/pages/OrderConfirmationPage';
import SpecialsPage from '@/pages/SpecialsPage/SpecialsPage';
import FooterPage from './components/FooterPage'; // Relative path for FooterPage
import ScrollToTop from './components/ScrollToTop'; // Import ScrollToTop

import { CartProvider } from '@/context/CartContext.jsx'; // Use alias and .jsx
import { AuthProvider, AuthContext } from '@/context/AuthContext.jsx'; // Use alias and .jsx

import './App.css';
import ProductsPage from './pages/ProductsPage/ProductsPage';

// AppContent component holds the main layout and routes
function AppContent() {
    const cartOpenButtonRef = useRef(null);
    const { currentUser } = useContext(AuthContext); // Only need currentUser for isLoggedIn check
    const isLoggedIn = !!currentUser;

    return (
        <div className="app-global-container">
            {/* Header component, which is sticky */}
            <Header
                cartOpenButtonRef={cartOpenButtonRef}
            />

            {/* Main content area where routes are rendered */}
            <main className="app-content-area">
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/activate" element={<ActivationPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/specials" element={<SpecialsPage />} />

                    {/* Protected Checkout Page: Renders CheckoutPage if logged in, otherwise LoginPage */}
                    <Route
                        path="/checkout"
                        element={isLoggedIn ? <CheckoutPage /> : <LoginPage />}
                    />
                    {/* Protected Order Confirmation Page: Renders OrderConfirmationPage if logged in, otherwise LoginPage */}
                    <Route
                        path="/order-confirm"
                        element={isLoggedIn ? <OrderConfirmationPage /> : <LoginPage />}
                    />
                </Routes>
            </main>

            {/* HeaderCart component */}
            <HeaderCart
                openCartButtonRef={cartOpenButtonRef}
                isLoggedIn={isLoggedIn}
            />

            {/* FooterPage is now correctly placed inside the app-global-container */}
            <FooterPage />
        </div>
    );
}

// Main App component with Providers and Router
function App() {
    return (
        <Router>
            {/* ScrollToTop must be rendered inside the Router to access useLocation */}
            <ScrollToTop />
            <AuthProvider>
                <CartProvider>
                    <AppContent />
                </CartProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
