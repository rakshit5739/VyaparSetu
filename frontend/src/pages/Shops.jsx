import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiMapPin, FiPhone, FiMail, FiShoppingBag, FiSearch } from 'react-icons/fi';
import { getAllShops } from '../services/shopService';
import Spinner from '../components/common/Spinner';
import './ShopsProducts.css';

export default function Shops() {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cityFilter, setCityFilter] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const navigate = useNavigate();

  const fetchShops = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 9,
      };
      if (cityFilter.trim()) {
        params.city = cityFilter.trim();
      }
      
      const data = await getAllShops(params);
      if (data && data.shops) {
        setShops(data.shops);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.count || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShops();
  }, [page, cityFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCityFilter(searchInput);
    setPage(1); // Reset to page 1 on new search
  };

  const handleReset = () => {
    setSearchInput('');
    setCityFilter('');
    setPage(1);
  };

  return (
    <div className="catalog-page">
      <div className="container">
        {/* Header */}
        <div className="catalog-header">
          <h2 className="section-title">Local Shopkeepers</h2>
          <p className="section-subtitle">
            Browse through local shops offering competitive prices in your neighborhood.
          </p>
        </div>

        {/* Layout */}
        <div className="catalog-layout">
          {/* Sidebar Filters */}
          <aside className="filters-sidebar glass">
            <h3>Filters</h3>
            <form onSubmit={handleSearchSubmit}>
              <div className="filter-group">
                <label className="form-label">Search by City</label>
                <div className="input-wrapper" style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    className="input-field"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '1.2rem' }}>
                <button type="submit" className="btn-primary" style={{ flexGrow: 1, padding: '10px' }}>
                  Filter
                </button>
                {(cityFilter || searchInput) && (
                  <button type="button" className="btn-secondary" onClick={handleReset} style={{ padding: '10px' }}>
                    Reset
                  </button>
                )}
              </div>
            </form>
          </aside>

          {/* Shops Grid Viewport */}
          <main className="catalog-viewport">
            <div className="catalog-controls">
              <span className="results-count">
                Showing {shops.length} of {totalCount} shops {cityFilter && `in "${cityFilter}"`}
              </span>
            </div>

            {loading ? (
              <Spinner />
            ) : shops.length === 0 ? (
              <div className="no-data glass" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div>
                  <p>No shops found matching your filters.</p>
                  <button className="btn-secondary" onClick={handleReset}>Clear Filter</button>
                </div>
              </div>
            ) : (
              <>
                <div className="items-grid">
                  {shops.map((shop) => (
                    <div key={shop._id} className="catalog-card glass">
                      <div className="card-img-wrapper">
                        <div className="card-placeholder-img">🏪</div>
                        <span className="card-badge badge-blue">{shop.city}</span>
                      </div>
                      
                      <div className="card-details">
                        <span className="card-brand">Shopkeeper Store</span>
                        <h3 className="card-title">{shop.shopName}</h3>
                        
                        <div className="card-meta">
                          <div className="meta-item">
                            <FiMapPin /> <span>{shop.address}</span>
                          </div>
                          <div className="meta-item">
                            <FiPhone /> <span>{shop.phone}</span>
                          </div>
                          {shop.email && (
                            <div className="meta-item">
                              <FiMail /> <span>{shop.email}</span>
                            </div>
                          )}
                        </div>

                        <div className="card-price-action">
                          <div className="card-price">
                            <span className="price-label">Owner</span>
                            <span className="price-value" style={{ fontSize: '1.1rem' }}>{shop.ownerName}</span>
                          </div>
                          <button
                            className="btn-primary card-btn"
                            onClick={() => navigate(`/products?shopId=${shop._id}`)}
                          >
                            <FiShoppingBag /> Products
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="pagination">
                    <button
                      className="pagination-btn"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(p - 1, 1))}
                    >
                      &lt;
                    </button>
                    <span className="pagination-info">
                      Page {page} of {totalPages}
                    </span>
                    <button
                      className="pagination-btn"
                      disabled={page === totalPages}
                      onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                    >
                      &gt;
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
