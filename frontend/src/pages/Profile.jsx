import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiMapPin, FiAlertCircle, FiCheck, FiTag } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/authService';
import Spinner from '../components/common/Spinner';
import './Profile.css';

export default function Profile() {
  const { user, refreshUser } = useAuth();

  const [formData, setFormData] = useState({ name: '', email: '', city: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        city: user.city || '',
      });
    }
  }, [user]);

  const validate = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.city.trim()) {
      errors.city = 'City is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const response = await updateProfile(formData);
      if (response.success) {
        toast.success('Profile updated successfully!');
        if (refreshUser) await refreshUser();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update profile details');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return <Spinner />;
  }

  // Get initials for profile avatar
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'U';

  const userRoles = user.roles || (user.role ? [user.role] : ['customer']);

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-card glass">
          <div className="profile-avatar-row">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-meta">
              <h3>{user.name}</h3>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                {userRoles.map((role) => (
                  <span
                    key={role}
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      color: 'var(--primary, #3b82f6)',
                      padding: '2px 10px',
                      borderRadius: '12px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      textTransform: 'uppercase',
                    }}
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {user.businessCategories && user.businessCategories.length > 0 && (
            <div style={{ margin: '1rem 0', padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Registered Business Categories:
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {user.businessCategories.map((cat) => (
                  <span
                    key={cat}
                    style={{
                      background: 'rgba(16, 185, 129, 0.15)',
                      color: 'var(--accent-emerald, #10b981)',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                    }}
                  >
                    {cat}
                  </span>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="profile-form" noValidate>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrapper">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  name="name"
                  placeholder="Your name"
                  className={`input-field auth-input ${formErrors.name ? 'is-invalid' : ''}`}
                  value={formData.name}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>
              {formErrors.name && (
                <span className="error-message">
                  <FiAlertCircle /> {formErrors.name}
                </span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrapper">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  className={`input-field auth-input ${formErrors.email ? 'is-invalid' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>
              {formErrors.email && (
                <span className="error-message">
                  <FiAlertCircle /> {formErrors.email}
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
                  placeholder="Your city"
                  className={`input-field auth-input ${formErrors.city ? 'is-invalid' : ''}`}
                  value={formData.city}
                  onChange={handleChange}
                  disabled={submitting}
                />
              </div>
              {formErrors.city && (
                <span className="error-message">
                  <FiAlertCircle /> {formErrors.city}
                </span>
              )}
            </div>

            <div className="profile-btn-row">
              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
                style={{ padding: '12px 30px' }}
              >
                {submitting ? 'Saving...' : <>Save Changes</>}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
