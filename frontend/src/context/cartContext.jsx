// src/context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext'; // Import your AuthContext

// Create the Context
const CartContext = createContext();

// Create a custom hook to use the CartContext
export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

// Create the Cart Provider Component
export const CartProvider = ({ children }) => {
    const { currentUser, loading: authLoading } = useContext(AuthContext); // Get currentUser and authLoading
    const customerId = currentUser?.id; // Get the ID, will be null if not logged in

    // Use a ref to store the previous customerId to detect changes
    const prevCustomerIdRef = React.useRef(customerId);

    // State to hold cart items
    // Initialize cart state by attempting to load from localStorage based on current user
    const [cartItems, setCartItems] = useState(() => {
        // This runs only on initial render of the provider
        if (authLoading) return []; // Return empty if auth is still loading

        const initialStorageKey = customerId ? `shoppingCart_${customerId}` : 'shoppingCart_guest';
        try {
            const savedCart = localStorage.getItem(initialStorageKey);
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error(`Failed to load initial cart from localStorage for ${initialStorageKey}:`, error);
            return []; // Return empty array if there's an error parsing
        }
    });

    // State to control the visibility of the cart sidebar
    const [isCartOpen, setIsCartOpen] = useState(false);
    // State to store the total amount (derived from cartItems)
    const [cartTotal, setCartTotal] = useState(0);

    // Effect to calculate total whenever cartItems change
    useEffect(() => {
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        setCartTotal(total);
    }, [cartItems]);

    // Effect to handle saving cart to localStorage and switching carts
    useEffect(() => {
        // Only run this effect after authentication state has settled
        if (authLoading) return;

        const currentStorageKey = customerId ? `shoppingCart_${customerId}` : 'shoppingCart_guest';
        const prevCustomerId = prevCustomerIdRef.current;

        // Logic for when the user ID changes (login, logout, user switch)
        if (customerId !== prevCustomerId) {
            console.log(`CartProvider: User ID changed from ${prevCustomerId} to ${customerId}.`);

            // 1. Save the cart of the *previous* user/guest
            // This is crucial to persist the cart of the user who just logged out/switched
            const prevStorageKey = prevCustomerId ? `shoppingCart_${prevCustomerId}` : 'shoppingCart_guest';
            try {
                localStorage.setItem(prevStorageKey, JSON.stringify(cartItems));
                console.log(`CartProvider: Saved previous cart to ${prevStorageKey}`);
            } catch (error) {
                console.error(`CartProvider: Failed to save previous cart for ${prevStorageKey}:`, error);
            }

            // 2. Load the cart for the *new* user/guest
            try {
                const savedCart = localStorage.getItem(currentStorageKey);
                const parsedCart = savedCart ? JSON.parse(savedCart) : [];
                setCartItems(parsedCart); // Update cart state with new user's cart
                console.log(`CartProvider: Loaded new cart from ${currentStorageKey}`);
            } catch (error) {
                console.error(`CartProvider: Failed to load new cart for ${currentStorageKey}:`, error);
                setCartItems([]); // Fallback to empty cart on error
            }
        } else {
            // Logic for when the cartItems change for the *same* user/guest
            // This ensures every change to cartItems is persisted
            try {
                localStorage.setItem(currentStorageKey, JSON.stringify(cartItems));
                // console.log(`CartProvider: Saved current cart to ${currentStorageKey}`); // Can be chatty
            } catch (error) {
                console.error(`CartProvider: Failed to save current cart for ${currentStorageKey}:`, error);
            }
        }

        // Update the ref for the next render's comparison
        prevCustomerIdRef.current = customerId;

    }, [cartItems, customerId, authLoading]); // Depend on cartItems, customerId, and authLoading

    // Function to add a product to the cart or update its quantity
    const addToCart = (product, quantityToAdd) => {
        setCartItems(prevItems => {
            const existingItemIndex = prevItems.findIndex(item => item.id === product.id);

            if (existingItemIndex > -1) {
                // If item exists, update its quantity
                const updatedItems = [...prevItems];
                updatedItems[existingItemIndex] = {
                    ...updatedItems[existingItemIndex],
                    quantity: updatedItems[existingItemIndex].quantity + quantityToAdd
                };
                return updatedItems;
            } else {
                // If item does not exist, add it to the cart
                return [...prevItems, {
                    id: product.id,
                    name: product.name,
                    price: parseFloat(product.price), // Ensure price is a number
                    image: product.image, // Use the product's image for the cart
                    quantity: quantityToAdd
                }];
            }
        });
    };

    // Function to remove an item from the cart
    const removeFromCart = (productId) => {
        setCartItems(prevItems => prevItems.filter(item => item.id !== productId));
    };

    // Function to increase item quantity in cart
    const incrementCartItemQuantity = (productId) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === productId ? { ...item, quantity: item.quantity + 1 } : item
            )
        );
    };

    // Function to decrease item quantity in cart
    const decrementCartItemQuantity = (productId) => {
        setCartItems(prevItems =>
            prevItems.map(item =>
                item.id === productId ? { ...item, quantity: Math.max(1, item.quantity - 1) } : item
            ).filter(item => item.quantity > 0) // Remove item if quantity drops to 0
        );
    };

    // Function to clear cart
    const clearCart = () => {
        setCartItems([]);
        // Also clear from localStorage immediately
        const storageKey = customerId ? `shoppingCart_${customerId}` : 'shoppingCart_guest';
        localStorage.removeItem(storageKey);
    };

    // Function to toggle cart visibility
    const toggleCart = () => {
        setIsCartOpen(prev => !prev);
    };

    // Value provided to children components
    const contextValue = {
        cartItems,
        cartTotal,
        isCartOpen,
        addToCart,
        removeFromCart,
        incrementCartItemQuantity,
        decrementCartItemQuantity,
        toggleCart,
        clearCart // Make sure clearCart is exposed
    };

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
};