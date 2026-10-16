import { useState, useEffect, useRef } from 'react';
import Logo from './Logo';
import './LogoIntro.css';

const INTRO_SESSION_KEY = 'vyaparsetu_intro_seen';
const INTRO_DISPLAY_MS = 800; // Duration before initiating fade-out
const INTRO_FADEOUT_MS = 300; // Duration of fade-out animation

export default function LogoIntro() {
  const [visible, setVisible] = useState(() => {
    try {
      // Check if user already saw intro during current session
      const alreadySeen = sessionStorage.getItem(INTRO_SESSION_KEY);
      if (alreadySeen === 'true') {
        return false;
      }
      // Check user's reduced motion preference
      if (typeof window !== 'undefined' && window.matchMedia) {
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) {
          sessionStorage.setItem(INTRO_SESSION_KEY, 'true');
          return false;
        }
      }
      return true;
    } catch {
      return false;
    }
  });

  const [fadingOut, setFadingOut] = useState(false);
  const fadeTimerRef = useRef(null);
  const removeTimerRef = useRef(null);

  const dismissIntro = () => {
    try {
      sessionStorage.setItem(INTRO_SESSION_KEY, 'true');
    } catch {
      // Ignore sessionStorage exceptions
    }
    setFadingOut(true);
    setTimeout(() => {
      setVisible(false);
    }, 150);
  };

  useEffect(() => {
    if (!visible) return;

    // Start fade-out after ~800ms
    fadeTimerRef.current = setTimeout(() => {
      setFadingOut(true);
      try {
        sessionStorage.setItem(INTRO_SESSION_KEY, 'true');
      } catch {
        // Ignore
      }
    }, INTRO_DISPLAY_MS);

    // Completely unmount after fade-out finishes
    removeTimerRef.current = setTimeout(() => {
      setVisible(false);
    }, INTRO_DISPLAY_MS + INTRO_FADEOUT_MS);

    // Allow user to click or press a key to skip
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === ' ' || e.key === 'Enter') {
        dismissIntro();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      if (removeTimerRef.current) clearTimeout(removeTimerRef.current);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <aside
      className={`logo-intro-overlay ${fadingOut ? 'fading-out' : ''}`}
      onClick={dismissIntro}
      role="status"
      aria-label="VyaparSetu Intro Screen"
      aria-live="polite"
    >
      <div className="logo-intro-glow" />
      <div className="logo-intro-container">
        <div className="logo-intro-badge">
          {/* Vertical stacked logo with large icon */}
          <Logo variant="stacked" size="xl" showTagline={false} theme="dark" />
          <div className="logo-intro-tagline">
            <span>Direct Procurement</span>
            <span style={{ color: '#f59e0b' }}>•</span>
            <span>Local Vendors</span>
          </div>
          <div className="logo-intro-progress-bar">
            <div className="logo-intro-progress-fill" />
          </div>
        </div>
      </div>
    </aside>
  );
}
