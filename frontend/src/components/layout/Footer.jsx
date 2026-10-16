import { Link } from 'react-router-dom';
import {
  FiMail,
  FiPhone,
  FiMapPin,
  FiShield,
  FiCheckCircle,
} from 'react-icons/fi';
import Logo from '../common/Logo';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <div className="footer-logo-wrapper">
            <Logo size="sm" variant="simple" />
          </div>
          <p className="footer-tagline">
            India&apos;s local B2B procurement network connecting contractors, project builders, and bulk buyers directly with verified local shopkeepers.
          </p>
          <div className="footer-badges">
            <span className="footer-trust-badge">
              <FiShield /> Verified Merchants
            </span>
            <span className="footer-trust-badge">
              <FiCheckCircle /> Direct Billing
            </span>
          </div>
        </div>

        <div className="footer-col">
          <h4>Procurement</h4>
          <ul>
            <li><Link to="/requirements/upload">Post Purchase Request</Link></li>
            <li><Link to="/dashboard">Dashboard</Link></li>
            <li><Link to="/orders">Procurement Orders</Link></li>
            <li><Link to="/shops">Browse Local Stores</Link></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Key Categories</h4>
          <ul>
            <li><a href="#categories">Construction Materials</a></li>
            <li><a href="#categories">Borewell & Plumbing</a></li>
            <li><a href="#categories">Paints & Finishes</a></li>
            <li><a href="#categories">Electrical Supplies</a></li>
            <li><a href="#categories">Hardware & Fasteners</a></li>
          </ul>
        </div>

        <div className="footer-col">
          <h4>Platform Contact</h4>
          <div className="footer-contact-item">
            <FiMail />
            <span>procurement@vyaparsetu.com</span>
          </div>
          <div className="footer-contact-item">
            <FiPhone />
            <span>+91 98765 43210</span>
          </div>
          <div className="footer-contact-item">
            <FiMapPin />
            <span>Local Commercial Trade Network, India</span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} <strong>VyaparSetu</strong>. Built for local commerce & direct procurement. All rights reserved.</p>
      </div>
    </footer>
  );
}
