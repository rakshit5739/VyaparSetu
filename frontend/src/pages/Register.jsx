import { useState } from 'react';
import { useNavigate, useLocation, Link, Navigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiAlertCircle, FiPhone, FiMapPin } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/common/Logo';
import './Auth.css';

const AVAILABLE_CATEGORIES = [
  'Construction',
  'Electrical',
  'Paint',
  'Plumbing',
  'Hardware',
  'Agriculture',
  'Others',
];

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const queryRole = new URLSearchParams(location.search).get('role');
  const defaultRole = queryRole === 'shopkeeper' ? 'shopkeeper' : 'customer';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: defaultRole,
    phone: '',
    city: '',
    address: '',
    businessCategories: [],
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const validate = () => {
    const tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      tempErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      tempErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      tempErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      tempErrors.password = 'Password must be at least 6 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone.trim()) {
      tempErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.trim())) {
      tempErrors.phone = 'Phone number must be exactly 10 digits';
    }

    if (!formData.city.trim()) {
      tempErrors.city = 'City is required';
    }

    if (!formData.address.trim()) {
      tempErrors.address = 'Address is required';
    }

    if (formData.role === 'shopkeeper' && formData.businessCategories.length === 0) {
      tempErrors.businessCategories = 'Please select at least one business category';
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const toggleCategory = (cat) => {
    setFormData((prev) => {
      const exists = prev.businessCategories.includes(cat);
      const updated = exists
        ? prev.businessCategories.filter((c) => c !== cat)
        : [...prev.businessCategories, cat];
      return { ...prev, businessCategories: updated };
    });
    if (errors.businessCategories) {
      setErrors((prev) => ({ ...prev, businessCategories: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        roles: [formData.role],
        phone: formData.phone,
        city: formData.city,
        address: formData.address,
        businessCategories:
          formData.role === 'shopkeeper' ? formData.businessCategories : [],
      };

      const data = await register(payload);
      if (data.success) {
        toast.success('Registration successful! Please log in with your credentials.');
        navigate('/login');
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Registration failed. Try a different email.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-card glass">
          <div className="auth-header">
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.25rem' }}>
              <Logo size="lg" variant="simple" />
            </div>
            <h2>Create an Account</h2>
            <p>Join VyaparSetu to connect with local buyers and sellers</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  className={`input-field auth-input ${errors.name ? 'is-invalid' : ''}`}
                  value={formData.name}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>
              {errors.name && (
                <span className="error-message">
                  <FiAlertCircle /> {errors.name}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">I want to register as a</label>
              <div className="role-options-container">
                <div
                  className={`role-option-card ${formData.role === 'customer' ? 'active' : ''}`}
                  onClick={() => !submitting && setFormData((prev) => ({ ...prev, role: 'customer' }))}
                >
                  <span className="role-icon">🛒</span>
                  <div className="role-info">
                    <h4>Customer</h4>
                    <p>Post requirement lists & buy</p>
                  </div>
                </div>
                <div
                  className={`role-option-card ${formData.role === 'shopkeeper' ? 'active' : ''}`}
                  onClick={() => !submitting && setFormData((prev) => ({ ...prev, role: 'shopkeeper' }))}
                >
                  <span className="role-icon">🏪</span>
                  <div className="role-info">
                    <h4>Shopkeeper</h4>
                    <p>Prepare quotations & sell</p>
                  </div>
                </div>
              </div>
            </div>

            {formData.role === 'shopkeeper' && (
              <div className="form-group">
                <label className="form-label">Business Categories (Select all that apply)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '6px' }}>
                  {AVAILABLE_CATEGORIES.map((cat) => {
                    const isSelected = formData.businessCategories.includes(cat);
                    return (
                      <button
                        type="button"
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          border: isSelected ? '1px solid var(--primary, #3b82f6)' : '1px solid rgba(255,255,255,0.15)',
                          background: isSelected ? 'var(--primary, #3b82f6)' : 'rgba(255,255,255,0.05)',
                          color: isSelected ? '#ffffff' : 'var(--text-secondary, #cbd5e1)',
                          cursor: 'pointer',
                          fontSize: '0.85rem',
                          fontWeight: '500',
                          transition: 'all 0.2s',
                        }}
                      >
                        {cat}
                      </button>
                    );
                  })}
                </div>
                {errors.businessCategories && (
                  <span className="error-message" style={{ display: 'block', marginTop: '6px' }}>
                    <FiAlertCircle /> {errors.businessCategories}
                  </span>
                )}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  className={`input-field auth-input ${errors.email ? 'is-invalid' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>
              {errors.email && (
                <span className="error-message">
                  <FiAlertCircle /> {errors.email}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <div className="input-wrapper">
                <FiPhone className="input-icon" />
                <input
                  type="text"
                  name="phone"
                  placeholder="9876543210"
                  className={`input-field auth-input ${errors.phone ? 'is-invalid' : ''}`}
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>
              {errors.phone && (
                <span className="error-message">
                  <FiAlertCircle /> {errors.phone}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">City</label>
              <div className="input-wrapper">
                <FiMapPin className="input-icon" />
                <input
                  type="text"
                  name="city"
                  placeholder="Mumbai"
                  className={`input-field auth-input ${errors.city ? 'is-invalid' : ''}`}
                  value={formData.city}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>
              {errors.city && (
                <span className="error-message">
                  <FiAlertCircle /> {errors.city}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <div className="input-wrapper">
                <FiMapPin className="input-icon" />
                <input
                  type="text"
                  name="address"
                  placeholder="Shop No. 5, Linking Road"
                  className={`input-field auth-input ${errors.address ? 'is-invalid' : ''}`}
                  value={formData.address}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>
              {errors.address && (
                <span className="error-message">
                  <FiAlertCircle /> {errors.address}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className={`input-field auth-input ${errors.password ? 'is-invalid' : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>
              {errors.password && (
                <span className="error-message">
                  <FiAlertCircle /> {errors.password}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="input-wrapper">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="••••••••"
                  className={`input-field auth-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>
              {errors.confirmPassword && (
                <span className="error-message">
                  <FiAlertCircle /> {errors.confirmPassword}
                </span>
              )}
            </div>

            <button
              type="submit"
              className="btn-primary auth-btn"
              disabled={submitting}
            >
              {submitting ? 'Registering...' : 'Register'}
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Login here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
