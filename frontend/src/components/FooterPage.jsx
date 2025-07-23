// src/components/FooterPage.jsx
import React from 'react';
import './FooterPage.css'; // Import the CSS for styling

const FooterPage = () => {
    return (
        <footer className="footer-container">
            <div className="footer-content">
                {/* Section 1: Company Info */}
                <div className="footer-section company-info">
                    <h3 className="footer-logo">ALTITUDE TECHNOLOGIES</h3>
                    <p className="footer-description">
                        Your premier destination for high-quality laptops, computer components,
                        and network solutions in South Africa. We are committed to providing
                        cutting-edge technology and exceptional service.
                    </p>
                    <div className="social-icons">
                        <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
                            <i className="fa-brands fa-facebook-f"></i>
                        </a>
                        <a href="https://www.twitter.com" target="_blank" rel="noopener noreferrer">
                            <i className="fa-brands fa-twitter"></i>
                        </a>
                        <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
                            <i className="fa-brands fa-instagram"></i>
                        </a>
                        <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer">
                            <i className="fa-brands fa-linkedin-in"></i>
                        </a>
                    </div>
                </div>

                {/* Section 2: Quick Links */}
                <div className="footer-section">
                    <h4>Quick Links</h4>
                    <ul>
                        <li><a href="/about">About Us</a></li>
                        <li><a href="/products">Shop Products</a></li>
                        <li><a href="/contact">Contact Us</a></li>
                        <li><a href="/privacy">Privacy Policy</a></li>
                        <li><a href="/terms">Terms & Conditions</a></li>
                    </ul>
                </div>

                {/* Section 3: Customer Service */}
                <div className="footer-section">
                    <h4>Customer Service</h4>
                    <ul>
                        <li><a href="/faq">FAQ</a></li>
                        <li><a href="/shipping">Shipping Information</a></li>
                        <li><a href="/returns">Returns & Exchanges</a></li>
                        <li><a href="/warranty">Warranty</a></li>
                        <li><a href="/sitemap">Sitemap</a></li>
                    </ul>
                </div>

                {/* Section 4: Contact Info */}
                <div className="footer-section contact-info">
                    <h4>Contact Us</h4>
                    {/* <p><i className="fa-solid fa-map-marker-alt"></i> 123 Tech Avenue, Innovation City, 1685</p> */}
                    <p><i className="fa-solid fa-phone"></i> +27 11 555 1234</p>
                    <p><i className="fa-solid fa-envelope"></i> info@altitudetech.co.za</p>
                    <p><i className="fa-solid fa-clock"></i> Mon - Fri: 9:00 AM - 5:00 PM</p>
                </div>
            </div>

            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Altitude Technologies. All rights reserved.</p>
                <div className="payment-methods">
                    {/* Placeholder for payment method icons */}
                    <i className="fa-brands fa-cc-visa"></i>
                    <i className="fa-brands fa-cc-mastercard"></i>
                    <i className="fa-brands fa-cc-paypal"></i>
                    <i className="fa-brands fa-bitcoin"></i>
                </div>
            </div>
        </footer>
    );
};

export default FooterPage;
