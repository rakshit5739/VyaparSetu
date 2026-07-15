import { useState } from 'react';
import { toast } from 'react-toastify';
import { FiMail, FiPhone, FiMapPin, FiSend, FiAlertCircle } from 'react-icons/fi';
import './AboutContact.css';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) {
      tempErrors.name = 'Please provide your name';
    }

    if (!formData.email.trim()) {
      tempErrors.email = 'Email address is required';
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = 'Please provide a valid email address';
    }

    if (!formData.message.trim()) {
      tempErrors.message = 'Please type a message';
    } else if (formData.message.trim().length < 10) {
      tempErrors.message = 'Message must be at least 10 characters';
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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setSubmitting(false);
      toast.success('Your message has been received! We will get back to you shortly.');
      setFormData({ name: '', email: '', message: '' });
      setErrors({});
    }, 1200);
  };

  return (
    <div className="info-page">
      <div className="container">
        {/* Hero */}
        <div className="info-hero" style={{ marginBottom: '4rem' }}>
          <h2>Get in Touch</h2>
          <p>Have questions, feedback, or need assistance? Reach out to our developer team.</p>
        </div>

        {/* Contact Grid */}
        <div className="contact-grid">
          {/* Info Column */}
          <div className="contact-info-col">
            <div className="contact-card glass">
              <h3>Contact Details</h3>
              <div className="contact-methods">
                <div className="contact-method-item">
                  <FiMail className="contact-icon" />
                  <div className="contact-method-detail">
                    <h5>Email Support</h5>
                    <p>support@marketease.com</p>
                  </div>
                </div>

                <div className="contact-method-item">
                  <FiPhone className="contact-icon" />
                  <div className="contact-method-detail">
                    <h5>Call Us</h5>
                    <p>+91 98765 43210</p>
                  </div>
                </div>

                <div className="contact-method-item">
                  <FiMapPin className="contact-icon" />
                  <div className="contact-method-detail">
                    <h5>Headquarters</h5>
                    <p>Mumbai, Maharashtra, India</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="contact-card glass" style={{ borderColor: 'rgba(6, 182, 212, 0.15)' }}>
              <h3>Working Hours</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                Our support team is active Monday to Saturday from 9:00 AM to 6:00 PM IST.
              </p>
            </div>
          </div>

          {/* Form Column */}
          <div className="contact-form-card glass">
            <h3>Send a Message</h3>
            <form onSubmit={handleSubmit} className="auth-form" noValidate>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. John Doe"
                  className={`input-field ${errors.name ? 'is-invalid' : ''}`}
                  value={formData.name}
                  onChange={handleChange}
                  disabled={submitting}
                />
                {errors.name && (
                  <span className="error-message">
                    <FiAlertCircle /> {errors.name}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  className={`input-field ${errors.email ? 'is-invalid' : ''}`}
                  value={formData.email}
                  onChange={handleChange}
                  disabled={submitting}
                />
                {errors.email && (
                  <span className="error-message">
                    <FiAlertCircle /> {errors.email}
                  </span>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Message</label>
                <textarea
                  name="message"
                  placeholder="Type your question or query here..."
                  className={`input-field ${errors.message ? 'is-invalid' : ''}`}
                  value={formData.message}
                  onChange={handleChange}
                  disabled={submitting}
                ></textarea>
                {errors.message && (
                  <span className="error-message">
                    <FiAlertCircle /> {errors.message}
                  </span>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary"
                style={{ width: '100%', padding: '14px', gap: '10px' }}
                disabled={submitting}
              >
                {submitting ? (
                  'Sending Message...'
                ) : (
                  <>
                    <FiSend /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
