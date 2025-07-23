// src/components/ScrollToTop.jsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop component
 * This component listens for route changes and scrolls the window to the top
 * whenever the pathname (URL path) changes.
 * It's crucial for single-page applications to ensure users always start
 * at the top of a new "page" after navigation.
 */
function ScrollToTop() {
  // useLocation hook provides access to the current location object
  const { pathname } = useLocation();

  // useEffect hook to perform side effects (like scrolling)
  // It runs after every render where its dependencies have changed.
  useEffect(() => {
    // Scrolls the window to the top-left corner (0,0)
    window.scrollTo(0, 0);
  }, [pathname]); // Dependency array: effect re-runs whenever 'pathname' changes

  // This component doesn't render any UI, so it returns null.
  return null;
}

export default ScrollToTop;
