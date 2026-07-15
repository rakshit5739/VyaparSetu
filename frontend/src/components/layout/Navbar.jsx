import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FiMenu, FiX } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav id="navbar" className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <Link to="/" className="navbar-logo" id="navbar-logo">
          VyaparSetu
        </Link>

        <div className="navbar-links">
          <NavLink to="/" end id="nav-home">Home</NavLink>
          <NavLink to="/about" id="nav-about">About</NavLink>
          <NavLink to="/contact" id="nav-contact">Contact</NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/dashboard" id="nav-dashboard">Dashboard</NavLink>
              <NavLink to="/orders" id="nav-orders">Orders</NavLink>
            </>
          )}
        </div>

        <div className="navbar-auth">
          {isAuthenticated ? (
            <>
              <NavLink to="/profile" className="btn-login" id="nav-profile">Profile</NavLink>
              <button onClick={handleLogout} className="btn-logout" id="nav-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-login" id="nav-login">Login</Link>
              <Link to="/register" className="btn-register" id="nav-register">Register</Link>
            </>
          )}
        </div>

        <button
          className="navbar-hamburger"
          onClick={() => setMobileOpen(true)}
          id="navbar-hamburger"
          aria-label="Open menu"
        >
          <FiMenu />
        </button>
      </div>

      {/* Mobile overlay */}
      <div
        className={`navbar-mobile-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={closeMobile}
      />

      {/* Mobile menu */}
      <div className={`navbar-mobile ${mobileOpen ? 'open' : ''}`}>
        <button className="navbar-mobile-close" onClick={closeMobile} aria-label="Close menu">
          <FiX />
        </button>
        <NavLink to="/" end onClick={closeMobile}>Home</NavLink>
        <NavLink to="/about" onClick={closeMobile}>About</NavLink>
        <NavLink to="/contact" onClick={closeMobile}>Contact</NavLink>
        <div className="mobile-divider" />
        {isAuthenticated ? (
          <>
            <NavLink to="/dashboard" onClick={closeMobile}>Dashboard</NavLink>
            <NavLink to="/orders" onClick={closeMobile}>Orders</NavLink>
            <NavLink to="/profile" onClick={closeMobile}>Profile</NavLink>
            <button onClick={handleLogout} className="btn-logout">Logout</button>
          </>
        ) : (
          <>
            <NavLink to="/login" onClick={closeMobile}>Login</NavLink>
            <NavLink to="/register" onClick={closeMobile}>Register</NavLink>
          </>
        )}
      </div>
    </nav>
  );
}

