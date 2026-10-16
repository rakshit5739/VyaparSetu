import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiSearch, FiSliders, FiDollarSign, FiShoppingBag, FiTag } from 'react-icons/fi';
import { getAllProducts } from '../services/productService';
import Spinner from '../components/common/Spinner';
import './ShopsProducts.css';

export default function Products() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get initial params from search queries (URL)
  const shopIdParam = searchParams.get('shopId') || '';
  const categoryParam = searchParams.get('category') || '';

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(categoryParam);
  const [brand, setBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('createdAt');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Sync categoryParam from URL if it changes
  useEffect(() => {
    if (categoryParam) {
      setCategory(categoryParam);
      setPage(1);
    }
  }, [categoryParam]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 9,
      };

      if (search.trim()) params.search = search.trim();
      if (category) params.category = category;
      if (brand.trim()) params.brand = brand.trim();
      if (minPrice) params.minPrice = minPrice;
      if (maxPrice) params.maxPrice = maxPrice;
      if (sort && sort !== 'createdAt') params.sort = sort;
      if (shopIdParam) params.shopId = shopIdParam;

      const data = await getAllProducts(params);
      if (data && data.products) {
        setProducts(data.products);
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
    fetchProducts();
  }, [page, category, sort, shopIdParam]);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const handleResetFilters = () => {
    setSearch('');
    setCategory('');
    setBrand('');
    setMinPrice('');
    setMaxPrice('');
    setSort('createdAt');
    setPage(1);
    
    // Clear URL parameters
    setSearchParams({});
  };

  return (
    <div className="catalog-page">
      <div className="container">
        {/* Header */}
        <div className="catalog-header">
          <h2 className="section-title">All Products</h2>
          <p className="section-subtitle">
            Search items, filter categories, and check rates before shopping locally.
          </p>
        </div>

        {/* Layout */}
        <div className="catalog-layout">
          {/* Filters Sidebar */}
          <aside className="filters-sidebar glass">
            <h3>Filters</h3>
            <form onSubmit={handleFilterSubmit}>
              <div className="filter-group">
                <label className="form-label">Search Name</label>
                <div className="input-wrapper">
                  <FiSearch className="input-icon" />
                  <input
                    type="text"
                    placeholder="e.g. Milk, iPhone..."
                    className="input-field auth-input"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="filter-group">
                <label className="form-label">Category</label>
                <select
                  className="input-field"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="">All Categories</option>
                  <option value="Groceries">Groceries</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home & Kitchen">Home & Kitchen</option>
                  <option value="Sports">Sports</option>
                  <option value="Books">Books</option>
                </select>
              </div>

              <div className="filter-group">
                <label className="form-label">Brand</label>
                <input
                  type="text"
                  placeholder="e.g. Amul, Apple"
                  className="input-field"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                />
              </div>

              <div className="filter-group">
                <label className="form-label">Price Range (₹)</label>
                <div className="price-range-inputs">
                  <input
                    type="number"
                    placeholder="Min"
                    className="input-field"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    className="input-field"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
                <button type="submit" className="btn-primary" style={{ flexGrow: 1, padding: '10px' }}>
                  Apply
                </button>
                <button type="button" className="btn-secondary" onClick={handleResetFilters} style={{ padding: '10px' }}>
                  Reset
                </button>
              </div>
            </form>
          </aside>

          {/* Products Viewport */}
          <main className="catalog-viewport">
            <div className="catalog-controls">
              <span className="results-count">
                Showing {products.length} of {totalCount} items {shopIdParam && '(filtered by shop)'}
              </span>

              <select
                className="input-field sort-select"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  setPage(1);
                }}
              >
                <option value="createdAt">Newest First</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
              </select>
            </div>

            {loading ? (
              <Spinner />
            ) : products.length === 0 ? (
              <div className="no-data glass" style={{ minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div>
                  <p>No products found matching your current filter criteria.</p>
                  <button className="btn-secondary" onClick={handleResetFilters}>Clear Filters</button>
                </div>
              </div>
            ) : (
              <>
                <div className="items-grid">
                  {products.map((product) => (
                    <div key={product._id} className="catalog-card glass">
                      <div className="card-img-wrapper">
                        {product.image ? (
                          <img src={product.image} alt={product.productName} />
                        ) : (
                          <div className="card-placeholder-img">📦</div>
                        )}
                        <span className="card-badge badge-blue" style={{ textTransform: 'capitalize' }}>
                          {product.category}
                        </span>
                      </div>

                      <div className="card-details">
                        <span className="card-brand">{product.brand}</span>
                        <h3 className="card-title">{product.productName}</h3>

                        <div className="card-meta">
                          <div className="meta-item">
                            <FiShoppingBag />
                            <span>
                              {product.shopId ? product.shopId.shopName : 'Unknown Shop'}{' '}
                              {product.shopId?.city && `(${product.shopId.city})`}
                            </span>
                          </div>
                          <div className="meta-item">
                            <FiTag />
                            <span>
                              Stock:{' '}
                              <strong
                                style={{
                                  color:
                                    product.stock > 0
                                      ? 'var(--accent-emerald)'
                                      : 'var(--accent-rose)',
                                }}
                              >
                                {product.stock > 0 ? `${product.stock} units` : 'Out of stock'}
                              </strong>
                            </span>
                          </div>
                        </div>

                        <div className="card-price-action">
                          <div className="card-price">
                            <span className="price-label">Price</span>
                            <span className="price-value">₹{product.price}</span>
                          </div>
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button
                              className="btn-secondary card-btn"
                              onClick={() => navigate(`/products/${product._id}`)}
                              title="View Product Details"
                              style={{ padding: '8px 12px' }}
                            >
                              Details
                            </button>
                            <button
                              className="btn-primary card-btn"
                              onClick={() =>
                                navigate(`/compare?productName=${encodeURIComponent(product.productName)}`)
                              }
                              title="Compare prices across shops"
                              style={{ padding: '8px 12px' }}
                            >
                              Compare
                            </button>
                          </div>
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
