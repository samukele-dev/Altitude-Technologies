// src/pages/HomePage.jsx
import React, { useState, useEffect } from 'react';
import './HomePage.css'; // Assuming HomePage.css is in the same directory

// Import the specific content sections for HomePage
import CategorySection from '../components/CategorySection';
import ProductOverviewSection from '../components/ProductOverviewSection';

// Using placeholder images for the main slider to ensure compilation.
// Replace these with your actual image paths (e.g., import slideImage1 from '../assets/images/5.png';)
const slideImage1 = 'https://placehold.co/800x480/A8DADC/ffffff?text=Slide+1';
const slideImage2 = 'https://placehold.co/800x480/457B9D/ffffff?text=Slide+2';
const slideImage3 = 'https://placehold.co/800x480/1D3557/ffffff?text=Slide+3';
const slideImage4 = 'https://placehold.co/800x480/F4A261/ffffff?text=Slide+4';
const slideImage5 = 'https://placehold.co/800x480/E76F51/ffffff?text=Slide+5';

// Using placeholder images for the small gallery.
import smallImage1 from '../assets/images/2.png'; // Reusing for small image
import smallImage2 from '../assets/images/6.png'; // Reusing for small image


const HomePage = () => {
  // Array of images for the main slider
  const sliderImages = [
    slideImage1,
    slideImage2,
    slideImage3,
    slideImage4,
    slideImage5
  ];

  // State to keep track of the current slide index
  const [currentSlide, setCurrentSlide] = useState(0);

  // useEffect to handle automatic slide transitions
  useEffect(() => {
    // Set an interval to change the slide every 5 seconds (5000 milliseconds)
    const slideInterval = setInterval(() => {
      setCurrentSlide((prevSlide) =>
        // Cycle through slides: if it's the last slide, go back to the first (0)
        (prevSlide + 1) % sliderImages.length
      );
    }, 5000); // Change slide every 5 seconds

    // Cleanup function: clear the interval when the component unmounts
    return () => clearInterval(slideInterval);
  }, [sliderImages.length]); // Re-run effect if the number of slides changes

  // Function to handle clicking on pagination dots
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    // This div will contain all sections of the HomePage, stacked vertically.
    // It will be placed inside App.jsx's .app-content-area
    <div className="homepage-content-layout">

      {/* 1. Landing Section: Text Content + Image Gallery */}
      <section className="landing-section"> {/* This wraps both your text and image gallery */}
        <div className="content-section">
          <p className="company-tagline">A few words about company</p>
          <h1 className="main-title">Your Premier Tech Partner in South Africa</h1>
          <p className="description-text">
            The Biggest Supplier of Laptops, Parts, and Network Devices.
          </p>
          <div className="button-group">
            <button className="shop-now-btn">Shop Now</button>
          </div>
        </div>
        <div className="image-gallery">
          <div className="main-image-wrapper">
            {/* Display the current slide image */}
            <img
              src={sliderImages[currentSlide]}
              alt={`Slide ${currentSlide + 1}`}
              className="gallery-main-image"
            />
            {/* Pagination dots */}
            <div className="pagination-dots">
              {sliderImages.map((_, index) => (
                <span
                  key={index}
                  className={`dot ${currentSlide === index ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                ></span>
              ))}
            </div>
          </div>
          <div className="small-images-wrapper">
            <img src={smallImage1} alt="Small image 1" className="gallery-small-image" />
            <img src={smallImage2} alt="Small image 2" className="gallery-small-image" />
          </div>
        </div>
      </section>

      {/* 3. Product Overview Section - This will appear AFTER the Category Section */}
      <ProductOverviewSection />

      {/* 2. Categories Section - This will appear AFTER the landing section */}
      <CategorySection />

      

    </div>
  );
};

export default HomePage;
