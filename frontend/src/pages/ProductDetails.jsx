import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMapPin, FiPhone, FiMail, FiShoppingBag, FiTag } from 'react-icons/fi';
import { getProductById } from '../services/productService';
import Spinner from '../components/common/Spinner';
import './ShopsProducts.css';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await getProductById(id);
        if (data && data.product) {
          setProduct(data.product);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return <Spinner />;
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '6rem 2rem', textAlignment: 'center' }}>
        <div className="no-data glass">
          <p>Product details not found or listing has been removed.</p>
          <button className="btn-primary" onClick={() => navigate('/products')}>
            Back to Products
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="details-container">
        {/* Left column: Image */}
        <div className="details-image">
          {product.image ? (
            <img src={product.image} alt={product.productName} />
          ) : (
            <div className="placeholder">📦</div>
          )}
        </div>

        {/* Right column: Info */}
        <div className="details-info">
          <span className="details-brand">{product.brand}</span>
          <h2 className="details-title">{product.productName}</h2>
          <span className="details-category">{product.category}</span>

          <div className="details-price-row">
            <span className="details-price-label">Price:</span>
            <span className="details-price-value">₹{product.price}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2rem', fontSize: '1rem', color: 'var(--text-secondary)' }}>
            <FiTag />
            <span>
              Stock status:{' '}
              <strong style={{ color: product.stock > 0 ? 'var(--accent-emerald)' : 'var(--accent-rose)' }}>
                {product.stock > 0 ? `${product.stock} units available` : 'Out of stock'}
              </strong>
            </span>
          </div>

          {/* Shopkeeper Details */}
          <div className="details-shop-box glass">
            <h3>🏪 Sold By Store</h3>
            <div className="details-shop-info">
              <div>
                <strong>Shop Name:</strong>{' '}
                <span style={{ color: 'var(--text-primary)', fontWeight: '600' }}>
                  {product.shopId?.shopName || 'Unknown Shop'}
                </span>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <FiMapPin style={{ marginTop: '4px', flexShrink: 0 }} />
                <span>
                  <strong>Address:</strong> {product.shopId?.address || 'Address not listed'},{' '}
                  {product.shopId?.city || ''}
                </span>
              </div>
              {product.shopId?.phone && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <FiPhone />
                  <span>
                    <strong>Phone:</strong> {product.shopId.phone}
                  </span>
                </div>
              )}
              {product.shopId?.email && (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <FiMail />
                  <span>
                    <strong>Email:</strong> {product.shopId.email}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="details-actions">
            <button className="btn-secondary" onClick={() => navigate(-1)}>
              <FiArrowLeft /> Back
            </button>
            <button
              className="btn-outline"
              onClick={() => navigate(`/products?shopId=${product.shopId?._id}`)}
            >
              <FiShoppingBag /> Store Products
            </button>
            <button
              className="btn-primary"
              onClick={() => navigate(`/compare?productName=${encodeURIComponent(product.productName)}`)}
            >
              Compare Prices
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
