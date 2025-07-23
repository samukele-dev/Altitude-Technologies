// src/components/HeaderCart.jsx
import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/context/CartContext.jsx'; // Make sure this is using the alias and .jsx
import './HeaderCart.css';
import productPlaceholder from '../assets/1.jpg';

const HeaderCart = ({ isLoggedIn, openCartButtonRef }) => {
    const { cartItems, cartTotal, isCartOpen, toggleCart, removeFromCart, incrementCartItemQuantity, decrementCartItemQuantity } = useCart();
    const cartRef = useRef(null);
    const navigate = useNavigate();

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                isCartOpen &&
                cartRef.current &&
                !cartRef.current.contains(event.target) &&
                !(openCartButtonRef && openCartButtonRef.current && openCartButtonRef.current.contains(event.target))
            ) {
                toggleCart();
            }
        };

        if (isCartOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isCartOpen, toggleCart, openCartButtonRef]);

    // *** IMPORTANT: Ensure this function is exactly as below ***
    const handleCheckoutClick = (e) => {
        e.preventDefault(); // Prevent default link behavior

        toggleCart(); // Close the cart sidebar immediately

        if (isLoggedIn) {
            // User is logged in, navigate directly to checkout
            navigate('/checkout');
        } else {
            // User is NOT logged in, navigate to login page,
            // AND pass the desired "after login" redirect path in state
            navigate('/login', { state: { from: '/checkout' } });
        }
    };

    return (
        <>
            {isCartOpen && <div className="overlay-sidebar js-hide-cart" onClick={toggleCart}></div>}

            <div className={`header-cart js-panel-cart ${isCartOpen ? 'show-header-cart' : ''}`} ref={cartRef}>
                <div className="header-cart-content flex-w flex-col">
                    <div className="header-cart-top flex-w flex-sb-m p-t-15 p-l-15 p-r-15">
                        {/* <span className="header-cart-title stext-102 cl2">YOUR CART</span> */}
                        <div className="js-hide-cart icon-close-cart cl2 hov-cl1 trans-04" onClick={toggleCart}>
                            <i className="fa fa-times" aria-hidden="true"></i>
                        </div>
                    </div>

                    <ul className="header-cart-wrapitem w-full js-pscroll">
                        {cartItems.length > 0 ? (
                            cartItems.map(item => (
                                <li className="header-cart-item flex-w flex-t m-b-12" key={item.id}>
                                    <div className="header-cart-item-img">
                                        <img src={item.image || productPlaceholder} alt={item.name} />
                                    </div>
                                    <div className="header-cart-item-txt p-t-8">
                                        <a href="#" className="header-cart-item-name m-b-18 hov-cl1 trans-04">
                                            {item.name}
                                        </a>
                                        <span className="header-cart-item-info">
                                            {item.quantity} x R{item.price ? item.price.toFixed(2) : '0.00'}
                                        </span>
                                        <div className="flex-w flex-sb-m size-w-105">
                                            <div
                                                className="btn-num-product-down cl8 hov-btn3 trans-04 flex-c-m"
                                                onClick={() => decrementCartItemQuantity(item.id)}
                                                style={{ cursor: item.quantity <= 1 ? 'not-allowed' : 'pointer' }}
                                            >
                                                -
                                            </div>
                                            <span>{item.quantity}</span>
                                            <div
                                                className="btn-num-product-up cl8 hov-btn3 trans-04 flex-c-m"
                                                onClick={() => incrementCartItemQuantity(item.id)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                +
                                            </div>
                                            <span className="remove-item cl2 hov-cl1 trans-04" onClick={() => removeFromCart(item.id)}>
                                                Remove
                                            </span>
                                        </div>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="header-cart-item flex-w flex-t m-b-12">
                                <div className="header-cart-item-txt p-t-8">
                                    <span className="stext-102 cl3">Your cart is empty.</span>
                                </div>
                            </li>
                        )}
                    </ul>

                    <div className="w-full">
                        <div className="header-cart-total w-full p-tb-40">
                            Total: R{cartTotal.toFixed(2)}
                        </div>
                        <div className="header-cart-buttons flex-w w-full">
                            <a href="/cart" className="flex-c-m stext-101 cl0 size-107 bg3 bor2 hov-btn3 p-lr-15 trans-04 m-r-8 m-b-10">
                                View Cart
                            </a>
                            <a
                                href="#"
                                className="flex-c-m stext-101 cl0 size-107 bg3 bor2 hov-btn3 p-lr-15 trans-04 m-b-10"
                                onClick={handleCheckoutClick} // This is connected to the function above
                            >
                                Check Out
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default HeaderCart;