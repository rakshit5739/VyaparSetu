import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHome, FiAlertTriangle } from 'react-icons/fi';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem',
      }}
    >
      <div
        className="glass"
        style={{
          maxWidth: '500px',
          width: '100%',
          padding: '3.5rem 2rem',
          textAlign: 'center',
          animation: 'scaleIn 0.4s ease-out',
        }}
      >
        <FiAlertTriangle
          style={{
            fontSize: '4.5rem',
            color: 'var(--accent-amber)',
            marginBottom: '1.5rem',
            filter: 'drop-shadow(0 0 15px rgba(245, 158, 11, 0.3))',
          }}
        />
        <h2 style={{ fontSize: '2.5rem', fontWeight: '900', marginBottom: '0.8rem' }}>404</h2>
        <h3 style={{ fontSize: '1.4rem', fontWeight: '700', marginBottom: '1.5rem' }}>Page Not Found</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '1rem', lineHeight: '1.6' }}>
          Oops! The page you are looking for does not exist or has been moved to a different directory.
        </p>

        <button
          className="btn-primary"
          onClick={() => navigate('/')}
          style={{ width: '100%', padding: '14px', gap: '10px' }}
        >
          <FiHome /> Back to Home
        </button>
      </div>
    </div>
  );
}
