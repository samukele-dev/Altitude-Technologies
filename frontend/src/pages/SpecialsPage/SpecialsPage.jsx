// src/pages/SpecialsPage.jsx
import React, { useState, useEffect } from 'react';
import { useCart } from '../../context/CartContext'; // Adjust path if necessary
import './SpecialsPage.css'; // New CSS file for this page

// Generic placeholder image and icons
import genericPlaceholderImage from '../../assets/1.jpg';
import iconHeart1 from '../../assets/icons/heart.jpg';
import iconHeart2 from '../../assets/icons/heart.jpg';

const PRODUCTS_PER_PAGE_SPECIALS = 12; // Number of products to show per "Load More" on the specials page

const SpecialsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [activeModalTab, setActiveModalTab] = useState('description');

    const [visibleProductsCount, setVisibleProductsCount] = useState(PRODUCTS_PER_PAGE_SPECIALS);

    const { addToCart } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            setLoading(true);
            setError(null);
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
                    // Removed the hardcoded 'isSpecial' property here.
                    // Now, 'isSpecial' will only exist if provided by the backend API.
                }));
                setProducts(productsWithDetails);
            } catch (error) {
                console.error('Failed to fetch products:', error);
                setError("Failed to load special products. Please ensure your backend API is running.");
                // Fallback for development if API is down or empty
                // Ensure fallback products also don't have isSpecial: true unless explicitly desired for testing
                setProducts([
                    { id: 1, name: 'Sample Product 1', category: 'PERIPHERALS & ACCESSORIES', price: '500.00', imageUrl: genericPlaceholderImage, stock: 10, isSpecial: false, fullDescription: "This is a sample product description." },
                    { id: 2, name: 'Sample Product 2', category: 'LAPTOPS & NOTEBOOKS', price: '12000.00', imageUrl: genericPlaceholderImage, stock: 5, isSpecial: false, fullDescription: "This is another sample product description." },
                    { id: 3, name: 'Sample Product 3', category: 'STORAGE DEVICES', price: '999.00', imageUrl: genericPlaceholderImage, stock: 15, isSpecial: false, fullDescription: "This is a sample product description." },
                    // ... add more fallback products as needed, ensuring isSpecial is false or omitted
                ]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

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
            console.log(`Added ${quantity} of ${selectedProduct.name} to cart!`);
            closeModal();
        } else if (selectedProduct.stock === 0) {
            console.log("This product is out of stock.");
        } else {
            console.log("Please select a valid quantity.");
        }
    };

    // Filter products to only show those marked as special
    // This now relies entirely on the 'isSpecial' property from the fetched data
    const specialProducts = products.filter(product => product.isSpecial);

    // "Load More" button handler
    const handleLoadMore = () => {
        setVisibleProductsCount((prevCount) => prevCount + PRODUCTS_PER_PAGE_SPECIALS);
    };

    // Determine if the "Load More" button should be shown
    const showLoadMoreButton = visibleProductsCount < specialProducts.length;

    if (loading) {
        return <div className="loading-message">Loading specials...</div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    const getBreadcrumbs = () => "Home - Specials";

    return (
        <section className="specials-page-wrapper">
            <div className="breadcrumbs-bar">
                {getBreadcrumbs()}
            </div>
            <div className="specials-content-area">
                <h2 className="specials-title">DAILY DEALS & SPECIALS</h2>
                <p className="specials-description">
                    Don't miss out on our limited-time offers! Grab these amazing products at unbeatable prices while stocks last.
                </p>

                {specialProducts.length === 0 && !loading && !error && (
                    <p className="no-products-message">No special products available at the moment. Check back soon!</p>
                )}
                <div className="specials-grid">
                    {specialProducts.slice(0, visibleProductsCount).map((product) => (
                        <div key={product.id} className="product-card">
                            <div className="product-card-image-container">
                                <img src={product.imageUrl} alt={product.name} />
                                <button
                                    className="quick-view-button"
                                    onClick={() => handleQuickView(product)}
                                >
                                    Quick View
                                </button>
                            </div>
                            <div className="product-card-details">
                                <h4 className="product-card-name">{product.name}</h4>
                                <span className="product-card-price">
                                    {product.originalPrice && (
                                        <span className="original-price">R{parseFloat(product.originalPrice).toFixed(2)}</span>
                                    )}
                                    R{parseFloat(product.price).toFixed(2)}
                                </span>
                                <div className="product-card-actions">
                                    <button className="add-to-cart-button" onClick={() => addToCart(product, 1)} disabled={product.stock <= 0}>
                                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                                    </button>
                                    <button className="wishlist-button">
                                        <img className="icon-heart1" src={iconHeart1} alt="Add to Wishlist" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {showLoadMoreButton && (
                    <div className="load-more-container">
                        <button onClick={handleLoadMore} className="load-more-button">
                            Load More Specials
                        </button>
                    </div>
                )}
            </div>

            {/* --- Quick View Modal (reused from ProductsPage) --- */}
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
                                        {selectedProduct.originalPrice && (
                                            <span className="mtext-106 cl3 original-price-modal">
                                                <del>R{parseFloat(selectedProduct.originalPrice).toFixed(2)}</del>
                                            </span>
                                        )}
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

export default SpecialsPage;
