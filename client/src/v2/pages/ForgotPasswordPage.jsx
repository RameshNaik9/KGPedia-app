import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toastError, toastSuccess, toastWarn } from '../utils/toast';
import { useTheme } from '../context/ThemeContext';
import { getVantaBackgroundColor, getVantaColors } from '../utils/vantaColors';
import './AuthPage.css';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://www.kgpedia.com';

const ForgotPasswordPage = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [vantaLoaded, setVantaLoaded] = useState(false);
  const overrideStyleRef = useRef(null);
  const authPageRef = useRef(null);
  const vantaRef = useRef(null);
  const vantaEffect = useRef(null);
  const cursorStateRef = useRef({
    x: 0,
    y: 0,
    targetX: 0,
    targetY: 0,
    rafId: null
  });

  useLayoutEffect(() => {
    document.body.classList.add('auth-page-active');
    return () => {
      document.body.classList.remove('auth-page-active');
    };
  }, []);

  useLayoutEffect(() => {
    const isDark = theme === 'dark';
    const fallbackBg = isDark ? '#241d3c' : '#ffffff';
    document.body.style.backgroundColor = fallbackBg;
    document.body.style.transition = 'background-color 0.1s ease';

    const backgroundColor = getVantaBackgroundColor(theme);
    if (backgroundColor && backgroundColor !== fallbackBg) {
      document.body.style.backgroundColor = backgroundColor;
    }

    if (!overrideStyleRef.current) {
      const style = document.createElement('style');
      style.id = 'auth-page-override';
      style.textContent = `
        body::before {
          display: none !important;
          content: none !important;
          background: none !important;
          filter: none !important;
          opacity: 0 !important;
        }
      `;
      document.head.appendChild(style);
      overrideStyleRef.current = style;
    }
  }, [theme]);

  useEffect(() => {
    // Load Vanta.js scripts dynamically
    const loadVanta = async () => {
      if (window.THREE && window.VANTA) {
        initVanta();
        return;
      }

      if (!window.THREE) {
        const threeScript = document.createElement('script');
        threeScript.src = 'https://cdn.jsdelivr.net/npm/three@0.134.0/build/three.min.js';
        threeScript.async = true;
        document.body.appendChild(threeScript);

        threeScript.onload = () => {
          const vantaScript = document.createElement('script');
          vantaScript.src = 'https://cdn.jsdelivr.net/npm/vanta@latest/dist/vanta.net.min.js';
          vantaScript.async = true;
          document.body.appendChild(vantaScript);

          vantaScript.onload = () => {
            initVanta();
          };
        };
      } else if (!window.VANTA) {
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
      setVantaLoaded(false);

      if (vantaEffect.current) {
        vantaEffect.current.destroy();
      }

      const { color, backgroundColor } = getVantaColors(theme);

      vantaEffect.current = window.VANTA.NET({
        el: vantaRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200.0,
        minWidth: 200.0,
        scale: 1.0,
        scaleMobile: 1.0,
        color,
        backgroundColor,
        points: 15,
        maxDistance: 20,
        spacing: 15,
        showDots: true,
      });

      if (vantaRef.current) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            setVantaLoaded(true);
          }, 100);
        });
      }
    };

    loadVanta();

    return () => {
      if (vantaEffect.current) {
        vantaEffect.current.destroy();
        vantaEffect.current = null;
      }
    };
  }, [theme]);

  useEffect(() => {
    const authEl = authPageRef.current;
    if (!authEl) return;

    const state = cursorStateRef.current;
    const setCenter = () => {
      const rect = authEl.getBoundingClientRect();
      state.x = rect.width / 2;
      state.y = rect.height / 2;
      state.targetX = state.x;
      state.targetY = state.y;
      authEl.style.setProperty('--cursor-x', `${state.x}px`);
      authEl.style.setProperty('--cursor-y', `${state.y}px`);
    };

    const update = () => {
      const easing = 0.15;
      state.x += (state.targetX - state.x) * easing;
      state.y += (state.targetY - state.y) * easing;
      authEl.style.setProperty('--cursor-x', `${state.x}px`);
      authEl.style.setProperty('--cursor-y', `${state.y}px`);
      state.rafId = requestAnimationFrame(update);
    };

    const handlePointerMove = (event) => {
      const rect = authEl.getBoundingClientRect();
      state.targetX = event.clientX - rect.left;
      state.targetY = event.clientY - rect.top;
    };

    const handleResize = () => {
      setCenter();
    };

    setCenter();
    state.rafId = requestAnimationFrame(update);

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      if (state.rafId) {
        cancelAnimationFrame(state.rafId);
        state.rafId = null;
      }
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  useEffect(() => {
    return () => {
      if (overrideStyleRef.current) {
        overrideStyleRef.current.remove();
        overrideStyleRef.current = null;
      }
      document.body.style.backgroundColor = '';
      document.body.style.transition = '';
    };
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email.trim()) {
      toastWarn('Enter your email.');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${apiBaseUrl}/api/auth/forgot-password`, { email });
      setIsSubmitted(true);
      toastSuccess('If an account exists, we sent a reset link.');
    } catch (error) {
      console.error('Forgot password failed:', error.message);
      toastError('Server error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div ref={authPageRef} className="auth-page auth-page--login">
      <div
        ref={vantaRef}
        className={`auth-vanta-bg ${vantaLoaded ? 'vanta-loaded' : ''}`}
        aria-hidden="true"
      />
      <div className="auth-card">
        <div className="auth-brand">
          <div>
            <h1>Forgot password</h1>
            <p>Enter your email to receive a reset link.</p>
          </div>
        </div>

        {isSubmitted ? (
          <div className="auth-form">
            <p className="auth-helper-text" style={{ color: 'inherit' }}>
              Check your email for the reset link. It expires in 15 minutes.
            </p>
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit}>
            <label className="auth-label">
              Institute Email
              <input
                type="email"
                placeholder="yourname@kgpian.iitkgp.ac.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </label>

            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send reset link'}
              <span className="auth-submit-glow" />
            </button>
          </form>
        )}

        <div className="auth-footer">
          <Link className="auth-footer-link" to="/v2/auth" state={{ mode: 'login' }}>
            Back to login
          </Link>
        </div>
      </div>

    </div>
  );
};

export default ForgotPasswordPage;

