import { Link } from 'react-router-dom';
import {
  FiGithub,
  FiTwitter,
  FiLinkedin,
  FiInstagram,
  FiMail,
  FiPhone,
  FiMapPin,
} from 'react-icons/fi';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <h3>MarketEase</h3>
          <p>
            Your smart companion for comparing prices across local shops.
            Save money, save time, and support local businesses.
          </p>
          <div className="footer-socials">
            <a href="#" id="footer-github" aria-label="GitHub"><FiGithub /></a>
            <a href="#" id="footer-twitter" aria-label="Twitter"><FiTwitter /></a>
            <a href="#" id="footer-linkedin" aria-label="LinkedIn"><FiLinkedin /></a>
            <a href="#" id="footer-instagram" aria-label="Instagram"><FiInstagram /></a>
          </div>
        </div>

        <div className="footer-col">
          <h4>Quick Links</h4>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/shops">Shops</Link></li>
            <li><Link to="/products">Products</Link></li>
            <li><Link to="/compare">Compare Prices</Link></li>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Categories</h4>
          <ul>
            <li><Link to="/products?category=Electronics">Electronics</Link></li>
            <li><Link to="/products?category=Groceries">Groceries</Link></li>
            <li><Link to="/products?category=Fashion">Fashion</Link></li>
            <li><Link to="/products?category=Home%20%26%20Kitchen">Home & Kitchen</Link></li>
            <li><Link to="/products?category=Sports">Sports</Link></li>
            <li><Link to="/products?category=Books">Books</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Contact Info</h4>
          <div className="footer-contact-item">
            <FiMail />
            <span>support@marketease.com</span>
          </div>
          <div className="footer-contact-item">
            <FiPhone />
            <span>+91 98765 43210</span>
          </div>
          <div className="footer-contact-item">
            <FiMapPin />
            <span>Mumbai, Maharashtra, India</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} <span>MarketEase</span>. All rights reserved.</p>
      </div>
    </footer>
  );
}
