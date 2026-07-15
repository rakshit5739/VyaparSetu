import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { FiUser, FiMail, FiLock, FiAlertCircle, FiCheck } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/authService';
import Spinner from '../components/common/Spinner';
import './Profile.css';

export default function Profile() {
  const { user, token } = useAuth();
  
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
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
        toast.success('Profile updated successfully! Refreshing details...');
        // Wait a short bit and reload page so context refreshes user object
        setTimeout(() => {
          window.location.reload();
        }, 1000);
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

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-card glass">
          <div className="profile-avatar-row">
            <div className="profile-avatar">{initials}</div>
            <div className="profile-meta">
              <h3>{user.name}</h3>
              <p>Registered Member</p>
            </div>
          </div>

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
