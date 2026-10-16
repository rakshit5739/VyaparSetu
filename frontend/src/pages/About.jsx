import React from 'react';
import './AboutContact.css';

export default function About() {
  return (
    <div className="info-page">
      <div className="container">
        {/* Hero */}
        <div className="info-hero">
          <h2>About VyaparSetu</h2>
          <p>Connecting neighborhood shopkeepers with local buyers for transparent bulk procurement and quotations.</p>
        </div>

        {/* Section 1 */}
        <div className="about-grid">
          <div className="about-text">
            <h3>Our Mission</h3>
            <p>
              Traditional brick-and-mortar suppliers and merchants represent the backbone of local trade, yet bulk procurement remains dominated by confusing middlemen. VyaparSetu bridges this offline-online divide.
            </p>
            <p>
              We empower customers to request quotations for complete lists of materials — construction supplies, electricals, paints, plumbing, and bulk goods — and connect directly with local stores for transparent, competitive pricing.
            </p>
          </div>
          <div className="about-visual glass">
            📊💰🏪
          </div>
        </div>

        {/* Values cards */}
        <h3 style={{ textAlign: 'center', fontSize: '2rem', fontWeight: 800, marginBottom: '1rem' }}>Our Core Pillars</h3>
        <div className="mission-grid">
          <div className="mission-card glass">
            <span className="mission-num">01</span>
            <h4>Direct Procurement</h4>
            <p>Eliminate unnecessary commission agents and buy directly from verified brick-and-mortar suppliers in your city.</p>
          </div>

          <div className="mission-card glass" style={{ borderColor: 'rgba(6, 182, 212, 0.15)' }}>
            <span className="mission-num" style={{ color: 'var(--accent-cyan)' }}>02</span>
            <h4>Competitive Quotations</h4>
            <p>Compare multiple bids on your complete materials list and accept the best offer with full confidence.</p>
          </div>

          <div className="mission-card glass">
            <span className="mission-num" style={{ color: 'var(--accent-purple)' }}>03</span>
            <h4>Support Local Economies</h4>
            <p>Keep commercial capital within your own district, helping local suppliers and hardware stores thrive.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
