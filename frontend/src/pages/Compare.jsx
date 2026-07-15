import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiSearch, FiMapPin, FiPhone, FiMail, FiUser, FiInfo, FiTag } from 'react-icons/fi';
import { compareProducts } from '../services/compareService';
import { getAllProducts } from '../services/productService';
import Spinner from '../components/common/Spinner';
import './Compare.css';

export default function Compare() {
  const [searchParams, setSearchParams] = useSearchParams();
  const productNameParam = searchParams.get('productName') || '';

  const [searchQuery, setSearchQuery] = useState(productNameParam);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchedName, setSearchedName] = useState('');

  // Suggestions state
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const searchRef = useRef(null);

  // Shop Info Modal state
  const [selectedShop, setSelectedShop] = useState(null);

  const navigate = useNavigate();

  // Sync searchQuery when URL param changes
  useEffect(() => {
    if (productNameParam) {
      setSearchQuery(productNameParam);
      runComparison(productNameParam);
    } else {
      setResults([]);
      setSearchedName('');
    }
  }, [productNameParam]);

  // Fetch search suggestions as user types
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (searchQuery.trim().length < 2) {
        setSuggestions([]);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const data = await getAllProducts({ search: searchQuery, limit: 6 });
        if (data && data.products) {
          // Unique product names
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
        console.error(err);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    const timer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside suggestions listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const runComparison = async (prodName) => {
    if (!prodName.trim()) return;

    setLoading(true);
    try {
      const data = await compareProducts(prodName);
      if (data && data.results) {
        setResults(data.results);
        setSearchedName(prodName);
      }
    } catch (err) {
      console.error(err);
      setResults([]);
      setSearchedName(prodName);
      toast.info(err.response?.data?.message || `No price listings found for "${prodName}"`);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ productName: searchQuery.trim() });
    }
  };

  const handleSuggestionClick = (name) => {
    setSearchQuery(name);
    setShowSuggestions(false);
    setSearchParams({ productName: name });
  };

  const openShopModal = (shop) => {
    setSelectedShop(shop);
  };

  return (
    <div className="compare-page">
      <div className="container">
        {/* Search Header */}
        <div className="compare-search-section">
          <h2>Compare Product Prices</h2>
          <p>Find which shop offers the lowest cost in your neighborhood.</p>

          <div className="search-wrapper" ref={searchRef} style={{ maxWidth: '550px' }}>
            <form onSubmit={handleSearchSubmit}>
              <div className="search-bar-container" style={{ borderRadius: 'var(--radius-md)' }}>
                <FiSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Enter product name (e.g. Milk, iPhone)..."
                  className="search-input"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  style={{ padding: '14px 110px 14px 45px', fontSize: '0.95rem' }}
                />
                <button type="submit" className="btn-primary search-btn" style={{ padding: '8px 18px' }}>
                  Compare
                </button>
              </div>
            </form>

            {/* Suggestions */}
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

        {/* Results Container */}
        {loading ? (
          <Spinner />
        ) : searchedName ? (
          <div className="compare-results">
            <div className="compare-results-header">
              <h3>
                Price Comparison for: <span>"{searchedName}"</span>
              </h3>
              <span className="results-count">Found {results.length} offers</span>
            </div>

            {results.length === 0 ? (
              <div className="no-data glass" style={{ minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <p>No local shops have listed details for "{searchedName}". Try a different product!</p>
              </div>
            ) : (
              <div className="compare-cards-list">
                {results.map((item, index) => (
                  <div
                    key={item.shop.shopId || index}
                    className={`compare-item-card glass ${item.isCheapest ? 'cheapest' : ''}`}
                  >
                    <div className="compare-shop-info">
                      <span className="compare-shop-name">{item.shop.shopName || 'Unknown Shop'}</span>
                      <span className="compare-shop-address">
                        <FiMapPin /> {item.shop.address || 'Address not listed'}, {item.shop.city || ''}
                      </span>
                    </div>

                    <div className="compare-price-visit">
                      <div className="compare-price">₹{item.price}</div>
                      <button
                        className="btn-primary compare-visit-btn"
                        onClick={() => openShopModal(item.shop)}
                      >
                        Visit Shop
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="no-data glass" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', padding: '3rem' }}>
            <FiTag style={{ fontSize: '2.5rem', color: 'var(--text-muted)', marginBottom: '1rem' }} />
            <p>Please enter a product name above to start comparing local rates.</p>
          </div>
        )}
      </div>

      {/* SHOP DETAILS POPUP MODAL */}
      {selectedShop && (
        <div className="modal-overlay">
          <div className="modal-content glass" style={{ maxWidth: '500px' }}>
            <button className="modal-close" onClick={() => setSelectedShop(null)}>×</button>
            <h3>Shop Details</h3>
            <div className="details-shop-info" style={{ marginTop: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--primary-light)', marginBottom: '1rem' }}>
                🏪 {selectedShop.shopName}
              </div>
              <div style={{ display: 'flex', gap: '10px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <FiUser style={{ marginTop: '4px', flexShrink: 0 }} />
                <span>
                  <strong>Owner:</strong> {selectedShop.ownerName || 'Not Listed'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <FiMapPin style={{ marginTop: '4px', flexShrink: 0 }} />
                <span>
                  <strong>Address:</strong> {selectedShop.address}, {selectedShop.city}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                <FiPhone style={{ marginTop: '4px', flexShrink: 0 }} />
                <span>
                  <strong>Phone:</strong> {selectedShop.phone || 'Not Listed'}
                </span>
              </div>
              {selectedShop.email && (
                <div style={{ display: 'flex', gap: '10px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  <FiMail style={{ marginTop: '4px', flexShrink: 0 }} />
                  <span>
                    <strong>Email:</strong> {selectedShop.email}
                  </span>
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '2rem', display: 'flex', gap: '12px' }}>
              <button
                className="btn-primary"
                onClick={() => {
                  setSelectedShop(null);
                  navigate(`/products?shopId=${selectedShop.shopId}`);
                }}
                style={{ flexGrow: 1 }}
              >
                View Shop's Products
              </button>
              <button className="btn-secondary" onClick={() => setSelectedShop(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
