// src/components/Header.jsx
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import './Header.css'; // Ensure this CSS file is correctly linked
import { useCart } from '@/context/CartContext.jsx';
import { AuthContext } from '@/context/AuthContext.jsx';

const Header = ({ cartOpenButtonRef }) => {
    const { toggleCart, cartItems } = useCart();
    const { currentUser, logout } = useContext(AuthContext);
    const isLoggedIn = !!currentUser;

    // Calculate total items in cart for the badge
    const totalItemsInCart = cartItems.reduce((total, item) => total + item.quantity, 0);

    return (
        <header className="app-header">
            {/* Top Announcement Bar with Moving Text */}
            <div className="top-announcement-bar">
                <div className="marquee-container">
                    {/* The marquee-track holds duplicated content for a seamless looping animation */}
                    <div className="marquee-track">
                        {/* First set of content for the marquee */}
                        <span className="marquee-text-content">FREE DELIVERY FOR ORDERS OVER R2500</span>
                        <span className="marquee-text-content">FREE DELIVERY FOR ORDERS OVER R2500</span>
                        <span className="marquee-text-content">FREE DELIVERY FOR ORDERS OVER R2500</span>
                        {/* Second identical set of content to ensure the loop is seamless */}
                        <span className="marquee-text-content">FREE DELIVERY FOR ORDERS OVER R2500</span>
                        <span className="marquee-text-content">FREE DELIVERY FOR ORDERS OVER R2500</span>
                        <span className="marquee-text-content">FREE DELIVERY FOR ORDERS OVER R2500</span>
                    </div>
                </div>
            </div>

            <div className="header-content">
                {/* Logo Section - Links to the home page */}
                <div className="header-logo">
                    <Link to="/" className="logo-text">Altitude Technologies</Link>
                </div>

                {/* Main Navigation Links */}
                <nav className="header-nav">
                    <ul className="nav-list">
                        <li className="nav-item">
                            <Link to="/" className="nav-link">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/products" className="nav-link">Products</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/specials" className="nav-link">Specials</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/about" className="nav-link">About Us</Link>
                        </li>
                        <li className="nav-item">
                            <Link to="/contact" className="nav-link">Contact</Link>
                        </li>
                    </ul>
                </nav>

                {/* Action Icons (Search, Cart, User/Login/Logout) */}
                <div className="header-actions">
                    <button className="action-icon-button" aria-label="Search">
                        <i className="fa fa-search"></i>
                    </button>

                    {/* Shopping Cart Button with item count badge */}
                    <button
                        className="action-icon-button"
                        onClick={toggleCart}
                        ref={cartOpenButtonRef}
                        aria-label="Open Cart"
                    >
                        <i className="fa fa-shopping-cart"></i>
                        {totalItemsInCart > 0 && (
                            <span className="cart-badge">
                                {totalItemsInCart}
                            </span>
                        )}
                    </button>

                    {/* Login/Logout Link - Dynamically rendered based on user authentication status */}
                    {isLoggedIn ? (
                        <button className="action-icon-button" onClick={logout} aria-label="Logout">
                            <i className="fa fa-sign-out-alt"></i>
                        </button>
                    ) : (
                        <Link to="/login" className="action-icon-button" aria-label="Login">
                            <i className="fa fa-user"></i>
                        </Link>
                    )}
                </div>

                {/* Hamburger Menu for Mobile (hidden on desktop) */}
                <button className="menu-toggle-button" aria-label="Toggle Menu">
                    <i className="fa fa-bars"></i>
                </button>
            </div>
        </header>
    );
};

export default Header;
