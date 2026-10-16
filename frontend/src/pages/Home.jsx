import { Link } from 'react-router-dom';
import {
  FiFileText,
  FiSend,
  FiCheckCircle,
  FiArrowRight,
  FiMapPin,
  FiShield,
  FiClock,
  FiLayers,
  FiDroplet,
  FiTool,
  FiZap,
  FiShoppingBag,
  FiBox,
} from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import './Home.css';

export default function Home() {
  const { isAuthenticated, isCustomer, isShopkeeper, user } = useAuth();

  const categories = [
    {
      id: 'construction',
      name: 'Construction Materials',
      icon: <FiLayers />,
      items: ['Cement', 'TMT Steel Bars', 'Bricks & AAC Blocks', 'Sand & Aggregates'],
      accent: '#2563eb',
    },
    {
      id: 'borewell',
      name: 'Borewell & Plumbing',
      icon: <FiDroplet />,
      items: ['Submersible Pumps', 'CPVC / UPVC Pipes', 'Column Pipes', 'Valves & Fittings'],
      accent: '#0284c7',
    },
    {
      id: 'paint',
      name: 'Paints & Finishes',
      icon: <FiBox />,
      items: ['Exterior Emulsions', 'Interior Wall Paints', 'Waterproofing Compounds', 'Primers & Putty'],
      accent: '#d97706',
    },
    {
      id: 'electrical',
      name: 'Electrical Supplies',
      icon: <FiZap />,
      items: ['Armoured Cables', 'Industrial Wires', 'MCBs & Switchgear', 'Conduit Fittings'],
      accent: '#7c3aed',
    },
    {
      id: 'hardware',
      name: 'Hardware & Tools',
      icon: <FiTool />,
      items: ['Fasteners & Screws', 'Binding Wire', 'Power Tools', 'Roofing & GI Sheets'],
      accent: '#059669',
    },
    {
      id: 'agriculture',
      name: 'Agriculture Supplies',
      icon: <FiShoppingBag />,
      items: ['Drip Irrigation Kits', 'PVC Flexible Pipes', 'Sprayer Pumps', 'Farm Accessories'],
      accent: '#16a34a',
    },
  ];

  return (
    <div className="landing-page">
      {/* 1. Hero Section */}
      <section className="landing-hero" id="hero">
        <div className="landing-hero-container">
          <div className="hero-badge">
            <FiMapPin className="badge-icon" />
            <span>Indian Local Procurement Network</span>
          </div>

          <h1 className="hero-headline">
            Compare Bulk Material Quotations Directly From Local Shopkeepers
          </h1>

          <p className="hero-subheadline">
            VyaparSetu connects contractors, builders, and project owners needing bulk materials with verified local vendors.
            Post your material list, receive competitive itemized quotations from nearby stores, and procure with complete clarity.
          </p>

          {/* Primary & Secondary Call to Actions */}
          <div className="hero-cta-group">
            {isAuthenticated ? (
              isShopkeeper ? (
                <Link to="/dashboard" className="btn-primary hero-btn-primary" id="hero-cta-shopkeeper">
                  Review Open Requests <FiArrowRight />
                </Link>
              ) : (
                <Link to="/requirements/upload" className="btn-primary hero-btn-primary" id="hero-cta-customer">
                  <FiFileText /> Request Material Quotations
                </Link>
              )
            ) : (
              <Link to="/register" className="btn-primary hero-btn-primary" id="hero-cta-start">
                <FiFileText /> Request Material Quotations
              </Link>
            )}

            <a href="#how-it-works" className="btn-secondary hero-btn-secondary" id="hero-cta-workflow">
              How It Works
            </a>
          </div>

          {/* Verified Marketplace Highlights */}
          <div className="hero-highlights">
            <div className="highlight-item">
              <FiCheckCircle className="highlight-icon" />
              <span>Verified Local Merchants</span>
            </div>
            <div className="highlight-item">
              <FiShield className="highlight-icon" />
              <span>Itemized Quotations</span>
            </div>
            <div className="highlight-item">
              <FiClock className="highlight-icon" />
              <span>Direct Vendor Contact</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Three-Step Workflow Explanation */}
      <section className="workflow-section" id="how-it-works">
        <div className="container">
          <div className="section-header-centered">
            <span className="section-pill">How VyaparSetu Works</span>
            <h2 className="section-title-large">A Simple Three-Step Procurement Process</h2>
            <p className="section-desc-medium">
              Eliminate endless market trips and phone calls. Get multiple competing quotations directly on your dashboard.
            </p>
          </div>

          <div className="workflow-grid">
            {/* Step 1 */}
            <div className="workflow-card">
              <div className="step-counter">01</div>
              <div className="workflow-icon-box" style={{ background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb' }}>
                <FiFileText />
              </div>
              <h3 className="workflow-step-title">Submit a Material List</h3>
              <p className="workflow-step-desc">
                Enter your required items, quantities, and delivery timeframe. You can also upload a document, handwritten bill, or BOQ specification.
              </p>
              <div className="step-tag">Step 1 • Requirements</div>
            </div>

            {/* Step 2 */}
            <div className="workflow-card">
              <div className="step-counter">02</div>
              <div className="workflow-icon-box" style={{ background: 'rgba(217, 119, 6, 0.1)', color: '#d97706' }}>
                <FiSend />
              </div>
              <h3 className="workflow-step-title">Receive Quotations</h3>
              <p className="workflow-step-desc">
                Verified shopkeepers in your city review your requirements and submit formal, itemized price estimates along with delivery terms.
              </p>
              <div className="step-tag">Step 2 • Quotations</div>
            </div>

            {/* Step 3 */}
            <div className="workflow-card">
              <div className="step-counter">03</div>
              <div className="workflow-icon-box" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#059669' }}>
                <FiCheckCircle />
              </div>
              <h3 className="workflow-step-title">Compare & Choose</h3>
              <p className="workflow-step-desc">
                Evaluate competing bids side by side based on total price, item availability, and delivery conditions. Accept the best offer to place your direct order.
              </p>
              <div className="step-tag">Step 3 • Procurement</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Procurement Categories */}
      <section className="categories-compact-section" id="categories">
        <div className="container">
          <div className="section-header-centered">
            <span className="section-pill">Material Sectors</span>
            <h2 className="section-title-large">Popular Bulk Procurement Categories</h2>
            <p className="section-desc-medium">
              Source bulk supplies from specialist hardware, construction, and plumbing suppliers near you.
            </p>
          </div>

          <div className="categories-compact-grid">
            {categories.map((cat) => (
              <div key={cat.id} className="category-compact-card">
                <div className="cat-card-header">
                  <span className="cat-icon-wrapper" style={{ color: cat.accent }}>
                    {cat.icon}
                  </span>
                  <h3 className="cat-name">{cat.name}</h3>
                </div>
                <ul className="cat-items-list">
                  {cat.items.map((item, idx) => (
                    <li key={idx} className="cat-item-pill">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Two-Sided Platform Value */}
      <section className="value-section">
        <div className="container">
          <div className="value-grid">
            {/* For Customers */}
            <div className="value-card">
              <div className="value-header">
                <span className="role-chip chip-customer">For Buyers & Builders</span>
                <h3>Smarter Sourcing Without Travel</h3>
              </div>
              <ul className="value-checklist">
                <li>
                  <FiCheckCircle className="check-icon" />
                  <div>
                    <strong>Local Market Comparison</strong>
                    <p>Compare actual quotes from multiple verified shops in your city instead of accepting single-store retail prices.</p>
                  </div>
                </li>
                <li>
                  <FiCheckCircle className="check-icon" />
                  <div>
                    <strong>Convenient BOQ Uploads</strong>
                    <p>Post structured material lists or simply attach a clear photo of handwritten requirements and project documents.</p>
                  </div>
                </li>
                <li>
                  <FiCheckCircle className="check-icon" />
                  <div>
                    <strong>Direct Merchant Communication</strong>
                    <p>Once you accept a quotation, deal directly with the merchant without platform commissions or middleman markups.</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* For Shopkeepers */}
            <div className="value-card">
              <div className="value-header">
                <span className="role-chip chip-shopkeeper">For Local Shopkeepers</span>
                <h3>Direct Commercial Customer Leads</h3>
              </div>
              <ul className="value-checklist">
                <li>
                  <FiCheckCircle className="check-icon" />
                  <div>
                    <strong>Targeted City Demand</strong>
                    <p>View genuine bulk material requirements posted by contractors and builders located in your specific operational city.</p>
                  </div>
                </li>
                <li>
                  <FiCheckCircle className="check-icon" />
                  <div>
                    <strong>Transparent Bid Submission</strong>
                    <p>Prepare realistic price estimates and message the customer with custom payment or delivery conditions.</p>
                  </div>
                </li>
                <li>
                  <FiCheckCircle className="check-icon" />
                  <div>
                    <strong>Empowering Offline Stores</strong>
                    <p>Strengthen local trade by winning institutional and residential projects right in your neighborhood.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Clean Action Banner */}
      <section className="cta-banner-section">
        <div className="container">
          <div className="cta-banner">
            <div className="cta-banner-content">
              <h2>Ready to Procure Materials for Your Next Project?</h2>
              <p>
                Join contractors, homeowners, and shopkeepers building a more efficient local trade network across India.
              </p>
              <div className="cta-banner-actions">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="btn-primary cta-btn">
                    Go to Your Dashboard <FiArrowRight />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="btn-primary cta-btn">
                      Get Started Today
                    </Link>
                    <Link to="/login" className="btn-secondary cta-btn">
                      Sign In to Account
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
