import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Icon from '../components/ui/Icon';
import { useTheme } from '../context/ThemeContext';
import { getVantaColors, getVantaBackgroundColor } from '../utils/vantaColors';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import './AuthPage.css';

const KGPEDIA_LOGO = '/icons/kgpedia-seconday-logo-3D-v2.svg';

const AuthPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [vantaLoaded, setVantaLoaded] = useState(false);
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);
  const overrideStyleRef = useRef(null);

  useEffect(() => {
    // Set body background immediately to match Vanta.js (no delay, no black flash)
    // Use fallback values first, then update with CSS variables if available
    const isDark = theme === 'dark';
    const fallbackBg = isDark ? '#241d3c' : '#ffffff';
    
    // Set immediately with fallback
    document.body.style.backgroundColor = fallbackBg;
    document.body.style.transition = 'background-color 0.1s ease';
    
    // Update with CSS variable value (if available)
    const backgroundColor = getVantaBackgroundColor(theme);
    if (backgroundColor && backgroundColor !== fallbackBg) {
      document.body.style.backgroundColor = backgroundColor;
    }
    
    // Remove any body::before pseudo-elements (from HomeComponent.css)
    if (!overrideStyleRef.current) {
      const style = document.createElement('style');
      style.id = 'auth-page-override';
      style.textContent = `
        body:has(.auth-page)::before {
          display: none !important;
          content: none !important;
          background: none !important;
        }
      `;
      document.head.appendChild(style);
      overrideStyleRef.current = style;
    }

    // Load Vanta.js scripts dynamically
    const loadVanta = async () => {
      // Check if scripts are already loaded
      if (window.THREE && window.VANTA) {
        initVanta();
        return;
      }

      // Load Three.js
      if (!window.THREE) {
        const threeScript = document.createElement('script');
        threeScript.src = 'https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js';
        threeScript.async = true;
        document.body.appendChild(threeScript);
        
        threeScript.onload = () => {
          // Load Vanta.js
          const vantaScript = document.createElement('script');
          vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js';
          vantaScript.async = true;
          document.body.appendChild(vantaScript);
          
          vantaScript.onload = () => {
            initVanta();
          };
        };
      } else if (!window.VANTA) {
        // Three.js loaded but Vanta.js not loaded
        const vantaScript = document.createElement('script');
        vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js';
        vantaScript.async = true;
        document.body.appendChild(vantaScript);
        
        vantaScript.onload = () => {
          initVanta();
        };
      }
    };

    const initVanta = () => {
      if (!vantaRef.current || !window.VANTA) return;

      // Reset loaded state for fade-in
      setVantaLoaded(false);

      // Clean up previous effect
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }

      // Get theme-based colors from CSS variables
      const { color, backgroundColor } = getVantaColors(theme);

      // Initialize Vanta.NET
      vantaEffect.current = window.VANTA.NET({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.00,
        minWidth: 200.00,
        scale: 1.00,
        scaleMobile: 1.00,
        color: color,
        backgroundColor: backgroundColor,
        points: 15,
        maxDistance: 20,
        spacing: 15,
        showDots: true
      });

      // Add fade-in effect after initialization
      if (vantaRef.current) {
        // Wait a frame for canvas to be created
        requestAnimationFrame(() => {
          setTimeout(() => {
            setVantaLoaded(true);
          }, 100);
        });
      }
    };

    loadVanta();

    // Cleanup on unmount
    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
      // Remove override style
      if (overrideStyleRef.current) {
        overrideStyleRef.current.remove();
        overrideStyleRef.current = null;
      }
      // Reset body background on unmount
      document.body.style.backgroundColor = '';
      document.body.style.transition = '';
    };
  }, [theme]); // Re-initialize when theme changes

  return (
    <div className={`auth-page auth-page--${mode}`}>
      {/* Vanta.js Background */}
      <div 
        ref={vantaRef} 
        className={`auth-vanta-bg ${vantaLoaded ? 'vanta-loaded' : ''}`} 
        aria-hidden="true" 
      />
      
      {/* Auth Card */}
      <div className="auth-card auth-card--wide">
        <div className="auth-brand">
          <img src={KGPEDIA_LOGO} alt="KGPedia" className="auth-logo" />
          <div>
            <h1>{mode === 'login' ? 'Welcome Back' : 'Create your account'}</h1>
            <p>
              {mode === 'login' 
                ? 'Sign in to continue your KGPedia journey.' 
                : 'Join the KGPedia community and explore smarter insights.'}
            </p>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} type="button">
            <Icon name={theme === 'light' ? 'moon' : 'sun'} size={16} />
          </button>
        </div>

        {/* Mode Toggle Buttons */}
        <div className="auth-mode-toggle">
          <button
            type="button"
            className={`auth-mode-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => setMode('login')}
          >
            Login
          </button>
          <button
            type="button"
            className={`auth-mode-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => setMode('signup')}
          >
            Signup
          </button>
        </div>

        {/* Form Container with Animation */}
        <div className="auth-form-container">
          {mode === 'login' ? (
            <LoginForm />
          ) : (
            <SignupForm onSignupSuccess={() => setMode('login')} />
          )}
        </div>

        {/* Footer Link */}
        <div className="auth-footer">
          <span>
            {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}
          </span>
          <button
            type="button"
            className="auth-footer-link"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
          >
            {mode === 'login' ? 'Create one' : 'Login'}
          </button>
        </div>
      </div>
      
      <ToastContainer toastClassName="Toastify__toast--custom" />
    </div>
  );
};

export default AuthPage;

