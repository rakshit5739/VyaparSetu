import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiSearch, FiDollarSign, FiClock, FiShoppingBag } from 'react-icons/fi';
import { getAllProducts } from '../services/productService';
import './Home.css';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  // Fetch search suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setLoadingSuggestions(true);
      try {
        // Fetch products matching search query
        const data = await getAllProducts({ search: searchQuery, limit: 8 });
        if (data && data.products) {
          // Remove duplicates based on product name
          const uniqueNames = [];
          const filtered = data.products.filter(p => {
            const isDuplicate = uniqueNames.includes(p.productName.toLowerCase());
            if (!isDuplicate) {
              uniqueNames.push(p.productName.toLowerCase());
              return true;
            }
            return false;
          });
          setSuggestions(filtered);
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/compare?productName=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSuggestionClick = (productName) => {
    setSearchQuery(productName);
    setShowSuggestions(false);
    navigate(`/compare?productName=${encodeURIComponent(productName)}`);
  };

  const categories = [
    { name: 'Electronics', icon: '💻' },
    { name: 'Groceries', icon: '🍎' },
    { name: 'Fashion', icon: '👕' },
    { name: 'Home & Kitchen', icon: '🍳' },
    { name: 'Sports', icon: '⚽' },
    { name: 'Books', icon: '📚' },
  ];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-content">
          <span className="hero-tagline">Price Comparison Made Easy</span>
          <h1>Compare Prices From Nearby Local Shops</h1>
          <p className="hero-desc">
            Save money, save time, and support local shopkeepers. Search for any product and compare rates instantly with one click.
          </p>

          {/* Search Bar */}
          <div className="search-wrapper" ref={searchRef}>
            <form onSubmit={handleSearchSubmit}>
              <div className="search-bar-container">
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Enter product name (e.g. iPhone, Milk, T-shirt)..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                />
                <button type="submit" className="btn-primary search-btn">
                  Compare
                </button>
              </div>
            </form>

            {/* Suggestions Dropdown */}
            {showSuggestions && (searchQuery.trim().length >= 2 || loadingSuggestions) && (
              <div className="suggestions-list">
                {loadingSuggestions ? (
                  <div className="suggestion-item text-muted">Loading suggestions...</div>
                ) : suggestions.length > 0 ? (
                  suggestions.map((item) => (
                    <div
                      key={item._id}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(item.productName)}
                    >
                      <FiSearch className="suggestion-icon" />
                      <span>{item.productName}</span>
                      <span className="suggestion-category">{item.category}</span>
                    </div>
                  ))
                ) : (
                  <div className="suggestion-item text-muted">No products found</div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Use MarketEase?</h2>
          <p className="section-subtitle">
            We bridge the gap between offline shopkeepers and local consumers to establish a smarter neighborhood marketplace.
          </p>
          <div className="features-grid">
            <div className="feature-card glass">
              <div className="feature-icon-wrapper" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-emerald)' }}>
                <FiDollarSign />
              </div>
              <h3>Save Money</h3>
              <p>Compare product costs across local shops to find the best deal without step-out haggling.</p>
            </div>

            <div className="feature-card glass">
              <div className="feature-icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
                <FiClock />
              </div>
              <h3>Save Time</h3>
              <p>Locate shops carrying your desired items in stock online before physically driving out.</p>
            </div>

            <div className="feature-card glass">
              <div className="feature-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent-purple)' }}>
                <FiShoppingBag />
              </div>
              <h3>Boost Local Stores</h3>
              <p>Support brick-and-mortar storefronts in your town by buying directly from nearby shopkeepers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Section */}
      <section className="categories-section">
        <div className="container">
          <h2 className="section-title">Popular Categories</h2>
          <p className="section-subtitle">
            Explore items across these top product groupings in your local city.
          </p>
          <div className="categories-grid">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/products?category=${encodeURIComponent(cat.name)}`}
                className="category-card glass"
              >
                <span className="category-icon">{cat.icon}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
