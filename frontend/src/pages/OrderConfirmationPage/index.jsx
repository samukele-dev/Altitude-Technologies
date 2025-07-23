// src/pages/OrderConfirmationPage/index.jsx
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext.jsx';
import { AuthContext } from '@/context/AuthContext.jsx';
import './OrderConfirmationPage.css'; // Import the new CSS file

// Placeholder image for products
import productPlaceholder from '@/assets/1.jpg'; // Adjust path if necessary

const OrderConfirmationPage = () => {
    const navigate = useNavigate();
    const { cartItems, cartTotal, clearCart } = useCart();
    const { currentUser } = useContext(AuthContext);

    // Shipping address state
    const [shippingAddress, setShippingAddress] = useState({
        fullName: currentUser?.username || '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
    });
    const [billingAddressSameAsShipping, setBillingAddressSameAsShipping] = useState(true);
    // Separate billing address state
    const [billingAddress, setBillingAddress] = useState({
        fullName: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
    });
    const [paymentMethod, setPaymentMethod] = useState('credit_card'); // Default
    const [cardNumber, setCardNumber] = useState('');
    const [expiryDate, setExpiryDate] = useState('');
    const [cvv, setCvv] = useState('');
    const [processingOrder, setProcessingOrder] = useState(false);
    const [orderMessage, setOrderMessage] = useState('');
    const [isOrderError, setIsOrderError] = useState(false);

    // States for interactive card
    const [cardType, setCardType] = useState('default'); // 'visa', 'mastercard', 'amex', 'discover', 'default'
    const [isCardFlipped, setIsCardFlipped] = useState(false); // For CVV input animation

    useEffect(() => {
        if (cartItems.length === 0) {
            navigate('/cart');
            return; // Prevent further execution if cart is empty
        }
        // If billing address is same as shipping, update it whenever shipping changes
        if (billingAddressSameAsShipping) {
            setBillingAddress(shippingAddress);
        }
    }, [cartItems, navigate, billingAddressSameAsShipping, shippingAddress]);

    // Function to detect card type based on card number
    const detectCardType = (number) => {
        // Remove non-digit characters
        const cleanedNumber = number.replace(/\D/g, '');
        if (/^4/.test(cleanedNumber)) {
            return 'visa';
        } else if (/^5[1-5]/.test(cleanedNumber)) {
            return 'mastercard';
        } else if (/^3[47]/.test(cleanedNumber)) {
            return 'amex';
        } else if (/^6(?:011|5)/.test(cleanedNumber)) {
            return 'discover';
        }
        return 'default';
    };

    const formatCardNumber = (value) => {
        // Remove all non-digit characters
        const cleanedValue = value.replace(/\D/g, '');
        // Insert spaces every 4 digits
        return cleanedValue.replace(/(.{4})/g, '$1 ').trim();
    };

    const formatExpiryDate = (value) => {
        // Remove all non-digit characters
        const cleanedValue = value.replace(/\D/g, '');
        // Add a slash after the second digit if more than 2 digits are typed
        if (cleanedValue.length > 2) {
            return `${cleanedValue.slice(0, 2)}/${cleanedValue.slice(2, 4)}`;
        }
        return cleanedValue;
    };

    const handleCardNumberChange = (e) => {
        const value = e.target.value;
        setCardNumber(formatCardNumber(value));
        setCardType(detectCardType(value));
    };

    const handleExpiryDateChange = (e) => {
        setExpiryDate(formatExpiryDate(e.target.value));
    };

    const handleCvvChange = (e) => {
        setCvv(e.target.value);
    };

    const handleShippingChange = (e) => {
        const { name, value } = e.target;
        setShippingAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleBillingChange = (e) => {
        const { name, value } = e.target;
        setBillingAddress(prev => ({ ...prev, [name]: value }));
    };

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        setProcessingOrder(true);
        setOrderMessage('');
        setIsOrderError(false);

        // Basic validation
        if (!shippingAddress.fullName || !shippingAddress.addressLine1 || !shippingAddress.city || !shippingAddress.country || !shippingAddress.zipCode) {
            setOrderMessage('Please fill in all required shipping details.');
            setIsOrderError(true);
            setProcessingOrder(false);
            return;
        }

        if (!billingAddressSameAsShipping && (!billingAddress.fullName || !billingAddress.addressLine1 || !billingAddress.city || !billingAddress.country || !billingAddress.zipCode)) {
            setOrderMessage('Please fill in all required billing details.');
            setIsOrderError(true);
            setProcessingOrder(false);
            return;
        }

        if (paymentMethod === 'credit_card' && (!cardNumber || !expiryDate || !cvv)) {
            setOrderMessage('Please fill in all credit card details.');
            setIsOrderError(true);
            setProcessingOrder(false);
            return;
        }

        try {
            const finalBillingAddress = billingAddressSameAsShipping ? shippingAddress : billingAddress;

            const orderDetails = {
                customerId: currentUser?.id,
                items: cartItems.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                })),
                shippingAddress,
                billingAddress: finalBillingAddress,
                paymentMethod,
                paymentDetails: {
                    cardNumber: paymentMethod === 'credit_card' ? cardNumber : undefined,
                    expiryDate: paymentMethod === 'credit_card' ? expiryDate : undefined,
                    cvv: paymentMethod === 'credit_card' ? cvv : undefined,
                },
                totalAmount: cartTotal,
            };

            const token = localStorage.getItem('token');

            const response = await fetch('http://localhost:3000/api/orders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(orderDetails),
            });

            const data = await response.json();

            if (response.ok) {
                setOrderMessage('Order placed successfully! Your order number is: ' + data.orderId);
                setIsOrderError(false);
                clearCart();
                navigate('/order-confirm', { state: { orderId: data.orderId } });
            } else {
                setOrderMessage(data.message || 'Failed to place order. Please try again.');
                setIsOrderError(true);
            }
        } catch (error) {
            console.error('Error placing order:', error);
            setOrderMessage('Network error or server unavailable. Could not place order.');
            setIsOrderError(true);
        } finally {
            setProcessingOrder(false);
        }
    };

    // Helper to get card icon based on type
    const getCardIcon = (type) => {
        switch (type) {
            case 'visa':
                return <i className="fab fa-cc-visa"></i>;
            case 'mastercard':
                return <i className="fab fa-cc-mastercard"></i>;
            case 'amex':
                return <i className="fab fa-cc-amex"></i>;
            case 'discover':
                return <i className="fab fa-cc-discover"></i>;
            default:
                return <i className="fas fa-credit-card"></i>; // Generic card icon
        }
    };

    return (
        <div className="order-confirmation-page-container">
            <div className="breadcrumb">
                Home / Checkout / Order Confirmation
            </div>

            <h2 className="page-title">Finalize Your Order</h2>

            {orderMessage && (
                <div className={`order-message ${isOrderError ? 'error' : 'success'}`}>
                    {orderMessage}
                </div>
            )}

            <form onSubmit={handlePlaceOrder} className="order-form">
                <div className="checkout-form-grid">
                    {/* Left Column: Shipping & Billing Address Section */}
                    <div className="form-section address-column">
                        {/* Shipping Address Section */}
                        <div className="shipping-address-section">
                            <h3>1. Shipping Address</h3>
                            <div className="form-group">
                                <label htmlFor="fullName">Full Name</label>
                                <input type="text" id="fullName" name="fullName" value={shippingAddress.fullName} onChange={handleShippingChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="addressLine1">Address Line 1</label>
                                <input type="text" id="addressLine1" name="addressLine1" value={shippingAddress.addressLine1} onChange={handleShippingChange} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="addressLine2">Address Line 2 (Optional)</label>
                                <input type="text" id="addressLine2" name="addressLine2" value={shippingAddress.addressLine2} onChange={handleShippingChange} />
                            </div>
                            <div className="form-group-row">
                                <div className="form-group">
                                    <label htmlFor="city">City</label>
                                    <input type="text" id="city" name="city" value={shippingAddress.city} onChange={handleShippingChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="state">State / Province</label>
                                    <input type="text" id="state" name="state" value={shippingAddress.state} onChange={handleShippingChange} />
                                </div>
                            </div>
                            <div className="form-group-row">
                                <div className="form-group">
                                    <label htmlFor="zipCode">Zip / Postcode</label>
                                    <input type="text" id="zipCode" name="zipCode" value={shippingAddress.zipCode} onChange={handleShippingChange} required />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="country">Country</label>
                                    <input type="text" id="country" name="country" value={shippingAddress.country} onChange={handleShippingChange} required />
                                </div>
                            </div>
                        </div>

                        {/* Billing Address Sub-Section within the left column */}
                        <div className="billing-address-sub-section">
                            <h3>2. Billing Address</h3>
                            <div className="checkbox-group">
                                <input
                                    type="checkbox"
                                    id="billingSame"
                                    checked={billingAddressSameAsShipping}
                                    onChange={(e) => setBillingAddressSameAsShipping(e.target.checked)}
                                />
                                <label htmlFor="billingSame">Same as shipping address</label>
                            </div>
                            {!billingAddressSameAsShipping && (
                                <>
                                    <div className="form-group">
                                        <label htmlFor="billingFullName">Full Name</label>
                                        <input type="text" id="billingFullName" name="fullName" value={billingAddress.fullName} onChange={handleBillingChange} required={!billingAddressSameAsShipping} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="billingAddressLine1">Address Line 1</label>
                                        <input type="text" id="billingAddressLine1" name="addressLine1" value={billingAddress.addressLine1} onChange={handleBillingChange} required={!billingAddressSameAsShipping} />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="billingAddressLine2">Address Line 2 (Optional)</label>
                                        <input type="text" id="billingAddressLine2" name="addressLine2" value={billingAddress.addressLine2} onChange={handleBillingChange} />
                                    </div>
                                    <div className="form-group-row">
                                        <div className="form-group">
                                            <label htmlFor="billingCity">City</label>
                                            <input type="text" id="billingCity" name="city" value={billingAddress.city} onChange={handleBillingChange} required={!billingAddressSameAsShipping} />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="billingState">State / Province</label>
                                            <input type="text" id="billingState" name="state" value={billingAddress.state} onChange={handleBillingChange} />
                                        </div>
                                    </div>
                                    <div className="form-group-row">
                                        <div className="form-group">
                                            <label htmlFor="billingZipCode">Zip / Postcode</label>
                                            <input type="text" id="billingZipCode" name="zipCode" value={billingAddress.zipCode} onChange={handleBillingChange} required={!billingAddressSameAsShipping} />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="billingCountry">Country</label>
                                            <input type="text" id="billingCountry" name="country" value={billingAddress.country} onChange={handleBillingChange} required={!billingAddressSameAsShipping} />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Payment Method Section & Interactive Card */}
                    <div className="form-section payment-method-section">
                        <h3>3. Payment Method</h3>
                        <div className="payment-options-grid"> {/* Changed to grid for better layout */}
                            {/* Credit Card Option */}
                            <div
                                className={`payment-option-card ${paymentMethod === 'credit_card' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('credit_card')}
                            >
                                <i className="fas fa-credit-card payment-icon"></i>
                                <span>Credit Card</span>
                            </div>

                            {/* PayPal Option */}
                            <div
                                className={`payment-option-card ${paymentMethod === 'paypal' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('paypal')}
                            >
                                <i className="fab fa-paypal payment-icon"></i>
                                <span>PayPal</span>
                            </div>

                            {/* PayFast Option */}
                            <div
                                className={`payment-option-card ${paymentMethod === 'payfast' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('payfast')}
                            >
                                <img src="https://www.payfast.co.za/images/payfast_logo_small.png" alt="PayFast" className="payment-icon-img" />
                                <span>PayFast</span>
                            </div>

                            {/* Ozow Option */}
                            <div
                                className={`payment-option-card ${paymentMethod === 'ozow' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('ozow')}
                            >
                                <img src="https://www.ozow.com/assets/img/logo-ozow.svg" alt="Ozow" className="payment-icon-img" />
                                <span>Ozow</span>
                            </div>
                        </div>

                        {paymentMethod === 'credit_card' && (
                            <div className="credit-card-details-section">
                                {/* Interactive Credit Card Visual */}
                                <div className={`credit-card-mockup ${isCardFlipped ? 'flipped' : ''}`}>
                                    <div className="card-front"> {/* Background now handled by CSS */}
                                        <div className="card-chip"></div>
                                        <div className="card-logo">
                                            {getCardIcon(cardType)}
                                        </div>
                                        <div className="card-number">{cardNumber || '#### #### #### ####'}</div>
                                        <div className="card-holder-info">
                                            <div className="card-label">Card Holder</div>
                                            <div className="card-holder-name">{shippingAddress.fullName || 'FULL NAME'}</div>
                                        </div>
                                        <div className="card-expiry-info">
                                            <div className="card-label">Expires</div>
                                            <div className="card-expiry">{expiryDate || 'MM/YY'}</div>
                                        </div>
                                    </div>
                                    <div className="card-back"> {/* Background now handled by CSS */}
                                        <div className="card-magnetic-stripe"></div>
                                        <div className="card-cvv-section">
                                            <div className="card-label">CVV</div>
                                            <div className="card-cvv-number">{cvv}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Credit Card Input Fields */}
                                <div className="credit-card-form-fields">
                                    <div className="form-group">
                                        <label htmlFor="cardNumber">Card Number</label>
                                        <input
                                            type="text"
                                            id="cardNumber"
                                            value={cardNumber}
                                            onChange={handleCardNumberChange}
                                            onFocus={() => setIsCardFlipped(false)} // Flip to front on card number focus
                                            maxLength="19" // 16 digits + 3 spaces
                                            required={paymentMethod === 'credit_card'}
                                        />
                                    </div>
                                    <div className="form-group-row">
                                        <div className="form-group">
                                            <label htmlFor="expiryDate">Expiry Date (MM/YY)</label>
                                            <input
                                                type="text"
                                                id="expiryDate"
                                                value={expiryDate}
                                                onChange={handleExpiryDateChange}
                                                placeholder="MM/YY"
                                                maxLength="5"
                                                required={paymentMethod === 'credit_card'}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label htmlFor="cvv">CVV</label>
                                            <input
                                                type="text"
                                                id="cvv"
                                                value={cvv}
                                                onChange={handleCvvChange}
                                                onFocus={() => setIsCardFlipped(true)} // Flip to back on CVV focus
                                                onBlur={() => setIsCardFlipped(false)} // Flip back on blur
                                                maxLength="4"
                                                required={paymentMethod === 'credit_card'}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(paymentMethod === 'paypal' || paymentMethod === 'payfast' || paymentMethod === 'ozow') && (
                            <p className="payment-info-redirect">
                                You will be redirected to {paymentMethod.charAt(0).toUpperCase() + paymentMethod.slice(1)} to complete your purchase.
                            </p>
                        )}
                    </div>
                </div>

                {/* Order Summary Section */}
                <div className="order-summary-final form-section">
                    <h3>4. Order Summary</h3>
                    <div className="summary-items">
                        {cartItems.map(item => (
                            <div key={item.id} className="summary-item">
                                <img src={item.imageUrl || productPlaceholder} alt={item.name} className="summary-thumbnail" />
                                <span className="summary-name">{item.name}</span>
                                <span className="summary-quantity">x {item.quantity}</span>
                                <span className="summary-price">R{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="summary-totals">
                        <div className="total-line">
                            <span>Subtotal:</span>
                            <span>R{cartTotal.toFixed(2)}</span>
                        </div>
                        <div className="total-line">
                            <span>Shipping:</span>
                            <span>R0.00</span> {/* Assuming free shipping for now */}
                        </div>
                        <div className="total-line grand-total-final">
                            <span>Order Total:</span>
                            <span>R{cartTotal.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                <button type="submit" className="place-order-btn" disabled={processingOrder}>
                    {processingOrder ? 'Processing...' : 'Place Order'}
                </button>
            </form>
        </div>
    );
};

export default OrderConfirmationPage;
