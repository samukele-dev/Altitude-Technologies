// src/pages/CheckoutPage/index.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom'; // <--- Ensure useNavigate is imported
import { useCart } from '@/context/CartContext.jsx'; // To display cart items
import './CheckoutPage.css'; // We'll create this CSS file

// Placeholder image for products
import productPlaceholder from '@/assets/1.jpg'; // Adjust path if necessary

const CheckoutPage = () => { // <--- This is the correct and only declaration
    const { cartItems, cartTotal } = useCart();
    const navigate = useNavigate(); // <--- Initialize useNavigate here

    // Dummy shipping details for now
    const shippingMethodsAvailable = false; // Set to true/false based on your logic
    const shippingMessage = "There are no shipping methods available. Please double check your address, or contact us if you need any help.";

    // Render nothing or a loading state if cart items are not yet loaded
    if (!cartItems) {
        return <div className="checkout-loading">Loading cart...</div>;
    }

    // Function to handle proceeding to checkout
    const handleProceedToCheckoutClick = () => {
        // You might want to do some final client-side validation here
        // before navigating, e.g., check if cart is empty.
        if (cartItems.length === 0) {
            alert('Your cart is empty. Please add items before proceeding to checkout.');
            navigate('/'); // Or to a specific cart page
            return;
        }
        navigate('/order-confirm'); // Navigate to the new page
    };

    return (
        <div className="checkout-page-container">
            <div className="breadcrumb">
                Home / Shopping Cart
            </div>

            <div className="checkout-content">
                {/* Left Section: Product List and Coupon */}
                <div className="checkout-products-section">
                    <table className="product-table">
                        <thead>
                            <tr>
                                <th>PRODUCT</th>
                                <th>PRICE</th>
                                <th>QUANTITY</th>
                                <th>TOTAL</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cartItems.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="empty-cart-message">Your cart is empty.</td>
                                </tr>
                            ) : (
                                cartItems.map(item => (
                                    <tr key={item.id} className="product-item-row">
                                        <td>
                                            <div className="product-info">
                                                <img src={item.image || productPlaceholder} alt={item.name} className="product-thumbnail" />
                                                <span className="product-name">{item.name}</span>
                                            </div>
                                        </td>
                                        <td>R{item.price ? item.price.toFixed(2) : '0.00'}</td>
                                        <td>
                                            <div className="quantity-controls">
                                                {/* These buttons are for display; actual quantity change should be in cart view */}
                                                <button className="quantity-btn">-</button>
                                                <span>{item.quantity}</span>
                                                <button className="quantity-btn">+</button>
                                            </div>
                                        </td>
                                        <td>R{(item.price * item.quantity).toFixed(2)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className="coupon-section">
                        <input type="text" placeholder="Coupon Code" className="coupon-input" />
                        <button className="coupon-apply-btn">APPLY COUPON</button>
                        <button className="update-cart-btn">UPDATE CART</button>
                    </div>
                </div>

                {/* Right Section: Cart Totals */}
                <div className="cart-totals-section">
                    <h3 className="cart-totals-title">CART TOTALS</h3>
                    <div className="total-row">
                        <span>Subtotal:</span>
                        <span>R{cartTotal.toFixed(2)}</span>
                    </div>

                    <div className="shipping-section">
                        <h4>Shipping:</h4>
                        {shippingMethodsAvailable ? (
                            // Render shipping options here if available
                            <p>Shipping options will appear here.</p>
                        ) : (
                            <p className="shipping-message">{shippingMessage}</p>
                        )}
                        <h5 className="calculate-shipping-title">CALCULATE SHIPPING</h5>
                        <select className="shipping-select">
                            <option>Select a country...</option>
                            {/* Add country options dynamically */}
                        </select>
                        <input type="text" placeholder="State / country" className="shipping-input" />
                        <input type="text" placeholder="Postcode / Zip" className="shipping-input" />
                        <button className="update-totals-btn">UPDATE TOTALS</button>
                    </div>

                    <div className="total-row grand-total">
                        <span>Total:</span>
                        <span>R{cartTotal.toFixed(2)}</span>
                    </div>

                    <button
                        className="proceed-to-checkout-btn"
                        onClick={handleProceedToCheckoutClick} // <--- Add this onClick handler
                    >
                        PROCEED TO CHECKOUT
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;