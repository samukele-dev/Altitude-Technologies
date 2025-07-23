// src/components/CategorySection.jsx
import React from 'react';
import './CategorySection.css'; // Styles for the general layout and categories
import './BrandSection.css';   // Styles specifically for the brand section

// Placeholder images for categories
import categoryLaptop from '../assets/images/1.png'; // Ensure these paths are correct
import categoryNetwork from '../assets/images/2.png';
import categoryAccess from '../assets/images/3.png';

// Import your brand logos here
import brandLogo1 from '../assets/hp.jpg'; // IMPORTANT: Replace with actual brand logo paths
import brandLogo2 from '../assets/Asus.png';
import brandLogo3 from '../assets/dell.jpg';
import brandLogo4 from '../assets/lenovo.png';
import brandLogo5 from '../assets/mecer.png';
// Ensure you have these images and their paths are correct.


const CategorySection = () => {
  const categories = [
    { name: 'Laptops & Notebooks', slogan: 'Shop now', image: categoryLaptop }, // Changed slogan for e-commerce feel
    { name: 'Networking Devices', slogan: 'Explore new connections', image: categoryNetwork },
    { name: 'PC Accessories', slogan: 'Enhance your setup', image: categoryAccess },
  ];

  const brandLogos = [
    brandLogo1,
    brandLogo2,
    brandLogo3,
    brandLogo4,
    brandLogo5,
    // Duplicate the logos to create a seamless loop
    brandLogo1,
    brandLogo2,
    brandLogo3,
    brandLogo4,
    brandLogo5,
  ];

  return (
    <div className="ecommerce-page-container"> {/* Main wrapper for an e-commerce page feel */}

      {/* Main content wrapper, potentially with sidebar or filters */}
      {/* This now comes first */}
      <div className="main-content-wrapper">
        {/* Category Section */}
        <section className="category-section-container">
          <div className="p-b-10">
                    <h3 className="ltext-103 cl5">
                        Popular Categories
                    </h3>
                </div>
          <div className="category-grid">
            {categories.map((category, index) => (
              <div key={index} className="category-card">
                <img src={category.image} alt={category.name} className="category-image" />
                <div className="category-info">
                  <h3 className="category-name">{category.name}</h3>
                  <p className="category-slogan">{category.slogan}</p>
                </div>
                <div className="category-overlay">
                  <span className="shop-now-text">SHOP NOW</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div> {/* End main-content-wrapper */}

      {/* Brands Section - MOVED TO THE BOTTOM (below the main content wrapper) */}
      <section className="brands-section-container">
        <div className="brands-marquee">
          <div className="brands-track">
            {brandLogos.map((logo, index) => (
              <div className="brand-logo-wrapper" key={index}>
                <img src={logo} alt={`Brand Logo ${index + 1}`} className="brand-logo" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* You can add more sections here like Featured Products, New Arrivals, etc. */}

    </div> // End ecommerce-page-container
  );
};

export default CategorySection;