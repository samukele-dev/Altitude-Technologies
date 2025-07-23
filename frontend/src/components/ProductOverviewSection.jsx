// src/components/ProductOverviewSection.jsx
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import './ProductOverviewSection.css'; // New CSS file for this component

// You can keep a generic placeholder for products that might not have any images uploaded yet,
// or for display when the API is not available (like in your fallback products).
import genericPlaceholderImage from '../assets/1.jpg'; // Corrected path for assets

// Import icons (assuming these are static and not from the backend)
// iconHeart1 and iconHeart2 are not used in the new design, but kept for reference if needed.
import iconHeart1 from '../assets/icons/heart.jpg';
import iconHeart2 from '../assets/icons/heart.jpg'; // This was imported but not used in the previous version's card design

// Define how many products to show initially. This is now just an initial display count.
const PRODUCTS_PER_PAGE = 12;

const ProductOverviewSection = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true); // Added loading state
    const [error, setError] = useState(null); // Added error state
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeModalTab, setActiveModalTab] = useState('description');
    // visibleProductsCount is still used for initial display, but not for "View More" button logic
    const [visibleProductsCount] = useState(PRODUCTS_PER_PAGE);
    const [selectedCategory, setSelectedCategory] = useState('all'); // State for category filter

    const { addToCart } = useCart();
    const navigate = useNavigate(); // Initialize useNavigate hook

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true); // Set loading to true when fetching starts
            setError(null); // Clear previous errors
            try {
                const response = await fetch('http://localhost:3000/api/products');
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
                const data = await response.json();

                const productsWithDetails = data.map(product => ({
                    ...product,
                    imageUrl: product.images && product.images.length > 0
                                        ? `http://localhost:3000${product.images[0]}`
                                        : genericPlaceholderImage,
                    fullDescription: product.fullDescription || product.description || "This is a detailed description of the product. It covers all the essential features, benefits, and specifications that a customer might want to know before making a purchase. This text would typically be much longer and more informative, highlighting unique selling points and use cases. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
                    reviews: product.reviews || [
                        { id: 1, author: "John Doe", rating: 5, date: "2024-05-15", comment: "Absolutely love this product! Exceeded my expectations. Highly recommend." },
                        { id: 2, author: "Jane Smith", rating: 4, date: "2024-04-20", comment: "Good quality, works as advertised. The battery life could be better." },
                        { id: 3, author: "Peter Jones", rating: 5, date: "2024-03-01", comment: "Fantastic value for money. Very satisfied with my purchase." }
                    ],
                    stock: product.stock !== undefined ? product.stock : 10,
                    category: (product.category ? String(product.category).trim() : 'Unknown'),
                    stockStatus: product.stock > 0 ? "In Stock With Supplier" : "Out of Stock",
                }));
                setProducts(productsWithDetails);
            } catch (error) {
                console.error('Failed to fetch products:', error);
                setError("Failed to load products. Please ensure your backend API is running.");
                // Fallback for development if API is down or empty
                setProducts([
                    { id: 1, name: 'Asus Vivobook 14X K3405VF-O158512B', category: 'Laptops & Notebooks', price: '12079.00', imageUrl: genericPlaceholderImage, stock: 10, stockStatus: "In Stock With Supplier", fullDescription: "Powerful and sleek laptop for everyday use and demanding tasks. Features a vibrant display and long battery life." },
                    { id: 2, name: 'Asus Vivobook 15 M1502YA-5851250W', category: 'Laptops & Notebooks', price: '9059.00', imageUrl: genericPlaceholderImage, stock: 5, stockStatus: "In Stock With Supplier", fullDescription: "Versatile 15-inch laptop with a focus on performance and portability. Ideal for students and professionals." },
                    { id: 3, name: 'Asus Vivobook 15 X1504VA-I38512BLO', category: 'Laptops & Notebooks', price: '13889.00', imageUrl: genericPlaceholderImage, stock: 15, stockStatus: "In Stock With Supplier", fullDescription: "High-performance Vivobook with advanced features for creative work and entertainment. Stunning visuals and fast processing." },
                    { id: 4, name: 'Sample Product 4', category: 'Computer Components', price: '2500.00', imageUrl: genericPlaceholderImage, stock: 0, stockStatus: "Out of Stock", fullDescription: "A generic computer component." },
                    { id: 5, name: 'Sample Product 5', category: 'Storage Devices', price: '1500.00', imageUrl: genericPlaceholderImage, stock: 8, stockStatus: "In Stock With Supplier", fullDescription: "A reliable storage device." },
                    { id: 6, name: 'Gaming PC Beast', category: 'Desktops & Workstations', price: '25000.00', imageUrl: genericPlaceholderImage, stock: 3, stockStatus: "In Stock With Supplier", fullDescription: "A powerful pre-built gaming computer designed for extreme performance.", reviews: [] },
                    { id: 7, name: 'High-Speed SSD', category: 'Storage Devices', price: '1200.00', imageUrl: genericPlaceholderImage, stock: 20, stockStatus: "In Stock With Supplier", fullDescription: "Blazing fast SSD for quick boot times and application loading.", reviews: [{ id: 4, author: "Tech Guru", rating: 5, date: "2024-06-20", comment: "Massive speed improvement!" }] },
                    { id: 8, name: 'Enterprise Server Rack', category: 'Servers', price: '50000.00', imageUrl: genericPlaceholderImage, stock: 2, stockStatus: "In Stock With Supplier", fullDescription: "Robust server solution for data centers and large businesses.", reviews: [] },
                    { id: 9, name: 'Smart Home Hub', category: 'Network Devices', price: '900.00', imageUrl: genericPlaceholderImage, stock: 15, stockStatus: "In Stock With Supplier", fullDescription: "Central hub to control all your smart home devices seamlessly.", reviews: [] },
                    { id: 10, name: 'Studio Headphones', category: 'Audio', price: '1800.00', imageUrl: genericPlaceholderImage, stock: 10, stockStatus: "In Stock With Supplier", fullDescription: "Professional studio headphones for crystal clear audio production.", reviews: [] },
                    { id: 11, name: 'GPU RTX 4090', category: 'Computer Components', price: '28000.00', imageUrl: genericPlaceholderImage, stock: 5, stockStatus: "In Stock With Supplier", fullDescription: "The ultimate graphics card for unparalleled gaming and rendering performance.", reviews: [] },
                    { id: 12, name: 'Ergonomic Gaming Chair', category: 'Peripherals & Accessories', price: '3000.00', imageUrl: genericPlaceholderImage, stock: 9, stockStatus: "In Stock With Supplier", fullDescription: "Comfortable and supportive gaming chair for long sessions.", reviews: [] },
                    { id: 13, name: 'Portable Bluetooth Speaker', category: 'Audio', price: '400.00', imageUrl: genericPlaceholderImage, stock: 25, stockStatus: "In Stock With Supplier", fullDescription: "Compact and powerful speaker for music on the go.", reviews: [] },
                    { id: 14, name: 'Custom Gaming Desktop', category: 'Desktops & Workstations', price: '18000.00', imageUrl: genericPlaceholderImage, stock: 4, stockStatus: "In Stock With Supplier", fullDescription: "Personalized gaming desktop built to your specifications.", reviews: [] },
                    { id: 15, name: 'Network Attached Storage (NAS)', category: 'Storage Devices', price: '3500.00', imageUrl: genericPlaceholderImage, stock: 7, stockStatus: "In Stock With Supplier", fullDescription: "Reliable NAS for centralized data storage and backup.", reviews: [] },
                ]);
            } finally {
                setLoading(false); // Set loading to false after fetch attempt
            }
        };

        fetchProducts();
    }, []); // Empty dependency array means this effect runs once on mount

    const handleQuickView = (product) => {
        setSelectedProduct(product);
        setQuantity(1);
        setActiveModalTab('description');
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedProduct(null);
    };

    // The following quantity and add to cart functions are only used within the Quick View Modal
    const handleQuantityChange = (e) => {
        const value = parseInt(e.target.value, 10);
        const maxStock = selectedProduct?.stock || Infinity;
        if (!isNaN(value) && value >= 1) {
            setQuantity(Math.min(value, maxStock));
        } else if (value === 0) {
            setQuantity(1);
        }
    };

    const incrementQuantity = () => {
        const maxStock = selectedProduct?.stock || Infinity;
        setQuantity(prevQuantity => Math.min(prevQuantity + 1, maxStock));
    };

    const decrementQuantity = () => {
        setQuantity(prevQuantity => Math.max(1, prevQuantity - 1));
    };

    const handleAddToCart = () => {
        if (selectedProduct && quantity > 0 && quantity <= selectedProduct.stock) {
            addToCart(selectedProduct, quantity);
            console.log(`Added ${quantity} of ${selectedProduct.name} to cart!`); // For debugging
            closeModal(); // Close modal after adding to cart
        } else if (selectedProduct.stock === 0) {
            console.log("This product is out of stock."); // For debugging
        } else {
            console.log("Please select a valid quantity."); // For debugging
        }
    };

    // Function to handle "View More Products" button click - now navigates
    const handleViewMoreProductsClick = () => {
        navigate('/products'); // Navigate to the /products route
    };

    // Filter products based on selectedCategory
    const filteredProducts = selectedCategory === 'all'
        ? products
        : products.filter(product => String(product.category).trim() === selectedCategory.trim());

    // The "View More" button should always be shown if there are more products than initially displayed
    // or if you want it to always be a navigation link.
    // For simplicity, let's assume it's always shown if there are products beyond the initial count.
    const showViewMoreButton = products.length > PRODUCTS_PER_PAGE;


    if (loading) {
        return <div className="loading-message">Loading products...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    return (
        <section className="bg0 p-t-23 p-b-0">
            <div className="container">
                <div className="p-b-10">
                    <h3 className="ltext-103 cl5">
                        Shop by Category
                    </h3>
                </div>

                <div className="product-filters-sort">
                    <div className="product-categories-nav">
                        <a
                            href="#"
                            className={`category-link ${selectedCategory === 'all' ? 'active' : ''}`}
                            onClick={(e) => { e.preventDefault(); setSelectedCategory('all'); /* setVisibleProductsCount(PRODUCTS_PER_PAGE); */ }}
                        >
                            All Products
                        </a>
                        <a
                            href="#"
                            className={`category-link ${selectedCategory === 'Laptops & Notebooks' ? 'active' : ''}`}
                            onClick={(e) => { e.preventDefault(); setSelectedCategory('Laptops & Notebooks'); /* setVisibleProductsCount(PRODUCTS_PER_PAGE); */ }}
                        >
                            Laptops & Notebooks <span className="dropdown-arrow">▾</span>
                        </a>
                        <a
                            href="#"
                            className={`category-link ${selectedCategory === 'Storage Devices' ? 'active' : ''}`}
                            onClick={(e) => { e.preventDefault(); setSelectedCategory('Storage Devices'); /* setVisibleProductsCount(PRODUCTS_PER_PAGE); */ }}
                        >
                            Storage Devices <span className="dropdown-arrow">▾</span>
                        </a>
                        <a
                            href="#"
                            className={`category-link ${selectedCategory === 'Computer Components' ? 'active' : ''}`}
                            onClick={(e) => { e.preventDefault(); setSelectedCategory('Computer Components'); /* setVisibleProductsCount(PRODUCTS_PER_PAGE); */ }}
                        >
                            Computer Components <span className="dropdown-arrow">▾</span>
                        </a>
                        <a
                            href="#"
                            className={`category-link ${selectedCategory === 'Desktops & Workstations' ? 'active' : ''}`}
                            onClick={(e) => { e.preventDefault(); setSelectedCategory('Desktops & Workstations'); /* setVisibleProductsCount(PRODUCTS_PER_PAGE); */ }}
                        >
                            Desktops & Workstations <span className="dropdown-arrow">▾</span>
                        </a>
                        <a
                            href="#"
                            className={`category-link ${selectedCategory === 'Peripherals & Accessories' ? 'active' : ''}`}
                            onClick={(e) => { e.preventDefault(); setSelectedCategory('Peripherals & Accessories'); /* setVisibleProductsCount(PRODUCTS_PER_PAGE); */ }}
                        >
                            Peripherals & Accessories <span className="dropdown-arrow">▾</span>
                        </a>
                        <a
                            href="#"
                            className={`category-link ${selectedCategory === 'Monitors' ? 'active' : ''}`}
                            onClick={(e) => { e.preventDefault(); setSelectedCategory('Monitors'); /* setVisibleProductsCount(PRODUCTS_PER_PAGE); */ }}
                        >
                            Monitors <span className="dropdown-arrow">▾</span>
                        </a>
                        <a
                            href="#"
                            className={`category-link ${selectedCategory === 'Audio' ? 'active' : ''}`}
                            onClick={(e) => { e.preventDefault(); setSelectedCategory('Audio'); /* setVisibleProductsCount(PRODUCTS_PER_PAGE); */ }}
                        >
                            Audio <span className="dropdown-arrow">▾</span>
                        </a>
                        <a
                            href="#"
                            className={`category-link ${selectedCategory === 'Network Devices' ? 'active' : ''}`}
                            onClick={(e) => { e.preventDefault(); setSelectedCategory('Network Devices'); /* setVisibleProductsCount(PRODUCTS_PER_PAGE); */ }}
                        >
                            Network Devices <span className="dropdown-arrow">▾</span>
                        </a>
                    </div>

                    <div className="product-actions-buttons">
                        <button className="action-button">
                            <span className="material-icons">filter_list</span> Filter
                        </button>
                        <button className="action-button">
                            <span className="material-icons">search</span> Search
                        </button>
                    </div>
                </div>

                <div className="products-grid">
                    {filteredProducts.length > 0 ? (
                        // Slice the filteredProducts array to show only the visible count
                        filteredProducts.slice(0, visibleProductsCount).map((product) => (
                            <div key={product.id} className="product-card">
                                <div className="product-card-image-container">
                                    <img src={product.imageUrl} alt={product.name} />
                                    <button
                                        className="quick-view-button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            handleQuickView(product);
                                        }}
                                    >
                                        Quick View
                                    </button>
                                </div>

                                <div className="product-card-details">
                                    {/* Product Category */}
                                    <span className="product-category">{product.category}</span>
                                    <h4 className="product-card-name">
                                        {product.name}
                                    </h4>
                                    {/* Stock Status */}
                                    <div className="stock-status">
                                        {product.stock > 0 ? (
                                            <i className="fa fa-check-circle stock-icon-in-stock"></i>
                                        ) : (
                                            <i className="fa fa-times-circle stock-icon-out-of-stock"></i>
                                        )}
                                        <span className="stock-text">{product.stockStatus}</span>
                                    </div>
                                    <span className="product-card-price">
                                        From R{parseFloat(product.price).toFixed(2)}
                                    </span>
                                    {/* The Add to Cart button is removed from here */}
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-products-message">No products available for the selected category.</p>
                    )}
                </div>

                {/* "View More" Button */}
                {showViewMoreButton && (
                    <div className="load-more-container">
                        <button
                            onClick={handleViewMoreProductsClick} // Changed to new handler
                            className="load-more-button"
                        >
                            View More Products
                        </button>
                    </div>
                )}
            </div>

            {/* --- Quick View Modal (same as before, but ensure styling is consistent) --- */}
            {showModal && selectedProduct && (
                <div className="wrap-modal1 js-modal1 show-modal1">
                    <div className="overlay-modal1 js-hide-modal1" onClick={closeModal}></div>
                    <div className="container">
                        <div className="bg0 p-lr-15 p-tb-27 respon3">
                            <button className="btn-close-modal hov-btn3 trans-04" onClick={closeModal}>
                                &times;
                            </button>
                            <div className="row">
                                <div className="col-md-6 col-lg-7 p-b-30">
                                    <div className="p-l-25 p-lr-0-lg">
                                        <div className="wrap-slick3 flex-sb flex-w">
                                            {/* Use selectedProduct.imageUrl here */}
                                            <img src={selectedProduct.imageUrl} alt={selectedProduct.name} style={{ maxWidth: '100%', height: 'auto' }} />
                                        </div>

                                        <div className="product-details-tabs p-t-40">
                                            <div className="tab-buttons flex-w flex-c-m p-b-15">
                                                <button
                                                    className={`tab-button ${activeModalTab === 'description' ? 'active' : ''}`}
                                                    onClick={() => setActiveModalTab('description')}
                                                >
                                                    Description
                                                </button>
                                                <button
                                                    className={`tab-button ${activeModalTab === 'reviews' ? 'active' : ''}`}
                                                    onClick={() => setActiveModalTab('reviews')}
                                                >
                                                    Reviews ({selectedProduct.reviews ? selectedProduct.reviews.length : 0})
                                                </button>
                                            </div>

                                            <div className="tab-content">
                                                {activeModalTab === 'description' && (
                                                    <div className="description-content stext-102 cl3">
                                                        <p>{selectedProduct.fullDescription}</p>
                                                    </div>
                                                )}

                                                {activeModalTab === 'reviews' && (
                                                    <div className="reviews-content">
                                                        {selectedProduct.reviews && selectedProduct.reviews.length > 0 ? (
                                                            selectedProduct.reviews.map((review) => (
                                                                <div key={review.id} className="review-item p-b-20 p-t-20">
                                                                    <div className="flex-w flex-sb-m p-b-8">
                                                                        <span className="mtext-107 cl2 p-r-20">{review.author}</span>
                                                                        <span className="stext-102 cl3">{review.date}</span>
                                                                    </div>
                                                                    <span className="stext-102 cl3 p-b-5">Rating: {review.rating} / 5</span>
                                                                    <p className="stext-102 cl3">{review.comment}</p>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <p className="stext-102 cl3">No reviews yet. Be the first to review this product!</p>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="col-md-6 col-lg-5 p-b-30">
                                    <div className="p-r-50 p-t-5 p-lr-0-lg">
                                        <h4 className="mtext-105 cl2 js-name-detail p-b-14">
                                            {selectedProduct.name}
                                        </h4>
                                        <span className="mtext-106 cl2">
                                            R{parseFloat(selectedProduct.price).toFixed(2)}
                                        </span>
                                        <p className="stext-102 cl3 p-t-23">
                                            {selectedProduct.description || 'No short description available.'}
                                        </p>

                                        <div className="p-t-33">
                                            <div className="flex-w flex-r-m p-b-10">
                                                <div className="size-204 flex-w flex-m respon6-next">
                                                    <span className="mtext-106 cl2 p-r-10">Stock:</span>
                                                    <span className={`stext-105 ${selectedProduct.stock > 0 ? 'cl-success' : 'cl-danger'}`}>
                                                        {selectedProduct.stock > 0 ? `${selectedProduct.stock} in stock` : 'Out of Stock'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex-w flex-r-m p-b-10">
                                                <div className="size-204 flex-w flex-m respon6-next">
                                                    <div
                                                        className="wrap-num-product flex-w m-r-20 m-tb-10"
                                                    >
                                                        <div
                                                            className="btn-num-product-down cl8 hov-btn3 trans-04 flex-c-m"
                                                            onClick={decrementQuantity}
                                                            style={{ cursor: quantity <= 1 ? 'not-allowed' : 'pointer' }}
                                                        >
                                                            <i className="fs-16 zmdi zmdi-minus">-</i>
                                                        </div>

                                                        <input
                                                            className="mtext-104 cl3 txt-center num-product"
                                                            type="number"
                                                            name="num-product"
                                                            value={quantity}
                                                            onChange={handleQuantityChange}
                                                            min="1"
                                                            max={selectedProduct.stock > 0 ? selectedProduct.stock : 1}
                                                            disabled={selectedProduct.stock <= 0}
                                                        />

                                                        <div
                                                            className="btn-num-product-up cl8 hov-btn3 trans-04 flex-c-m"
                                                            onClick={incrementQuantity}
                                                            style={{ cursor: quantity >= selectedProduct.stock || selectedProduct.stock <= 0 ? 'not-allowed' : 'pointer' }}
                                                        >
                                                            <i className="fs-16 zmdi zmdi-plus">+</i>
                                                        </div>
                                                    </div>

                                                    <button
                                                        className="flex-c-m stext-101 cl0 size-101 bg1 bor1 hov-btn1 p-lr-15 trans-04"
                                                        onClick={handleAddToCart}
                                                        disabled={selectedProduct.stock <= 0 || quantity > selectedProduct.stock || quantity <= 0}
                                                    >
                                                        ADD TO CART
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ProductOverviewSection;
