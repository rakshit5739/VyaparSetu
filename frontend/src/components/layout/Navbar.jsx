import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { FiMenu, FiX, FiPlus, FiPackage, FiGrid, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';
import './Navbar.css';

export default function Navbar() {
  const { isAuthenticated, isCustomer, isShopkeeper, user, logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 15);
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
    <header id="navbar" className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        {/* Left: VyaparSetu Logo */}
        <Link to="/" className="navbar-brand-link" id="navbar-logo" onClick={closeMobile} aria-label="VyaparSetu Home">
          <Logo size="md" variant="simple" />
        </Link>

        {/* Minimal Landing Page Header: Only show Login / Register (or Dashboard if already authenticated) */}
        {isLandingPage ? (
          <div className="navbar-auth minimal-header-auth">
            {isAuthenticated ? (
              <div className="auth-session-pill">
                <span className="user-greeting">
                  <span className="user-name">{user?.name}</span>
                  <span className={`user-role-badge ${isShopkeeper ? 'badge-shop' : 'badge-cust'}`}>
                    {isShopkeeper ? 'Shopkeeper' : 'Customer'}
                  </span>
                </span>
                <Link to="/dashboard" className="btn-primary btn-sm" id="nav-dashboard">
                  Dashboard →
                </Link>
                <button onClick={handleLogout} className="btn-logout-icon" id="nav-logout" title="Sign Out">
                  <FiLogOut />
                </button>
              </div>
            ) : (
              <div className="header-actions">
                <Link to="/login" className="btn-secondary btn-header-login" id="nav-login">
                  Login
                </Link>
                <Link to="/register" className="btn-primary btn-header-register" id="nav-register">
                  Register
                </Link>
              </div>
            )}
          </div>
        ) : (
          /* Internal Pages: Clean, Role-Based Navigation */
          <>
            <nav className="navbar-links" aria-label="Main Navigation">
              {isAuthenticated ? (
                <>
                  <NavLink to="/dashboard" id="nav-dashboard" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <FiGrid className="nav-icon" /> Dashboard
                  </NavLink>
                  {isCustomer && (
                    <NavLink to="/requirements/upload" id="nav-upload-req" className={({ isActive }) => (isActive ? 'active' : '')}>
                      <FiPlus className="nav-icon" /> Request Quote
                    </NavLink>
                  )}
                  <NavLink to="/orders" id="nav-orders" className={({ isActive }) => (isActive ? 'active' : '')}>
                    <FiPackage className="nav-icon" /> Orders
                  </NavLink>
                </>
              ) : (
                <>
                  <NavLink to="/" end id="nav-home">Home</NavLink>
                  <NavLink to="/shops" id="nav-shops">Shops</NavLink>
                  <NavLink to="/products" id="nav-products">Products</NavLink>
                </>
              )}
            </nav>

            <div className="navbar-auth">
              {isAuthenticated ? (
                <div className="auth-session-pill">
                  <span className={`user-role-badge ${isShopkeeper ? 'badge-shop' : 'badge-cust'}`}>
                    {isShopkeeper ? 'Shopkeeper' : 'Customer'}
                  </span>
                  <NavLink to="/profile" className="btn-profile-link" id="nav-profile" title="View Profile">
                    <FiUser /> {user?.name?.split(' ')[0] || 'Profile'}
                  </NavLink>
                  <button onClick={handleLogout} className="btn-logout-icon" id="nav-logout" title="Sign Out">
                    <FiLogOut />
                  </button>
                </div>
              ) : (
                <div className="header-actions">
                  <Link to="/login" className="btn-secondary btn-header-login" id="nav-login">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary btn-header-register" id="nav-register">
                    Register
                  </Link>
                </div>
              )}
            </div>

            <button
              className="navbar-hamburger"
              onClick={() => setMobileOpen(true)}
              id="navbar-hamburger"
              aria-label="Open mobile menu"
            >
              <FiMenu />
            </button>
          </>
        )}
      </div>

      {/* Mobile Drawer Overlay */}
      <div
        className={`navbar-mobile-overlay ${mobileOpen ? 'open' : ''}`}
        onClick={closeMobile}
      />

      {/* Mobile Menu Drawer */}
      <div className={`navbar-mobile ${mobileOpen ? 'open' : ''}`}>
        <div className="mobile-header">
          <Logo size="sm" variant="simple" />
          <button className="navbar-mobile-close" onClick={closeMobile} aria-label="Close menu">
            <FiX />
          </button>
        </div>

        <div className="mobile-nav-links">
          <NavLink to="/" end onClick={closeMobile}>Home</NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" onClick={closeMobile}>Dashboard</NavLink>
              {isCustomer && (
                <NavLink to="/requirements/upload" onClick={closeMobile}>+ Request Quotation</NavLink>
              )}
              <NavLink to="/orders" onClick={closeMobile}>Orders</NavLink>
              <NavLink to="/profile" onClick={closeMobile}>My Profile</NavLink>
              <div className="mobile-divider" />
              <button onClick={handleLogout} className="btn-logout mobile-logout-btn">
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <div className="mobile-divider" />
              <div className="mobile-auth-btns">
                <Link to="/login" onClick={closeMobile} className="btn-secondary" style={{ textAlign: 'center' }}>
                  Login
                </Link>
                <Link to="/register" onClick={closeMobile} className="btn-primary" style={{ textAlign: 'center' }}>
                  Register
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
