import React from 'react';
import './AboutContact.css';

export default function About() {
  return (
    <div className="info-page">
      <div className="container">
        {/* Hero */}
        <div className="info-hero">
          <h2>About MarketEase</h2>
          <p>Connecting neighborhood shopkeepers with local consumers for a smarter shopping experience.</p>
        </div>

        {/* Section 1 */}
        <div className="about-grid">
          <div className="about-text">
            <h3>Our Mission</h3>
            <p>
              Traditional brick-and-mortar stores represent the backbone of local economies, yet they are often overlooked in the digital age. MarketEase was built to bridge this offline-online divide.
            </p>
            <p>
              We empower customers to search and check prices from neighboring retailers with a single click. This simple capability helps shoppers save money and time, while allowing shopkeepers to reach digital customers organically.
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
            <h4>Support Local Business</h4>
            <p>We actively direct neighborhood sales to offline retailers, helping small shops thrive in a competitive market.</p>
          </div>

          <div className="mission-card glass" style={{ borderColor: 'rgba(6, 182, 212, 0.15)' }}>
            <span className="mission-num" style={{ color: 'var(--accent-cyan)' }}>02</span>
            <h4>Save Time & Energy</h4>
            <p>No more physical store-hopping. Instantly confirm stock levels and match item prices in seconds.</p>
          </div>

          <div className="mission-card glass">
            <span className="mission-num" style={{ color: 'var(--accent-purple)' }}>03</span>
            <h4>Maximized Savings</h4>
            <p>Identify which store offers the cheapest deal, ensuring you get the absolute best price on your purchases.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
