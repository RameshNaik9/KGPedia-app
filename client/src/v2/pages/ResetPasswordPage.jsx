import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer } from 'react-toastify';
import { toastError, toastSuccess, toastWarn } from '../utils/toast';
import { useTheme } from '../context/ThemeContext';
import { getVantaBackgroundColor, getVantaColors } from '../utils/vantaColors';
import './AuthPage.css';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://www.kgpedia.com';

const ResetPasswordPage = () => {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
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
    const resolvedBg = backgroundColor || fallbackBg;
    if (resolvedBg && resolvedBg !== fallbackBg) {
      document.body.style.backgroundColor = resolvedBg;
    }

    const overrideStyles = `
      body.auth-page-active {
        background: ${resolvedBg} !important;
        background-attachment: fixed;
      }
      body::before {
        display: none !important;
        content: none !important;
        background: none !important;
        filter: none !important;
        opacity: 0 !important;
      }
    `;

    if (!overrideStyleRef.current) {
      const style = document.createElement('style');
      style.id = 'auth-page-override';
      style.textContent = overrideStyles;
      document.head.appendChild(style);
      overrideStyleRef.current = style;
    } else {
      overrideStyleRef.current.textContent = overrideStyles;
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

      const isDarkTheme = theme === 'dark';
      const { color: darkColor, backgroundColor: darkBg } = getVantaColors('dark');
      const lightVantaColor = 0x3f99ff;
      const lightVantaBackground = 0xffffff;
      const color = isDarkTheme ? darkColor : lightVantaColor;
      const backgroundColor = isDarkTheme ? darkBg : lightVantaBackground;

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
    if (!token) {
      toastError('Invalid reset link.');
      return;
    }
    if (password.length < 4 || password.length > 128) {
      toastWarn('Password must be 4-128 characters.');
      return;
    }
    if (password !== confirmPassword) {
      toastWarn('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${apiBaseUrl}/api/auth/reset-password`, {
        token,
        password,
      });
      toastSuccess('Password updated. Please login.');
      navigate('/v2/auth', { replace: true, state: { mode: 'login' } });
    } catch (error) {
      console.error('Reset password failed:', error.message);
      if (error.response && error.response.data && error.response.data.error) {
        if (error.response.data.error.includes('Invalid or expired')) {
          toastError('Reset link expired. Request a new one.');
          return;
        }
        toastError('Unable to reset password.');
      } else {
        toastError('Unable to reset password. Try again.');
      }
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
            <h1>Reset password</h1>
            <p>Create a new password for your account.</p>
          </div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label className="auth-label">
            New Password
            <input
              type="password"
              placeholder="Enter a new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </label>

          <label className="auth-label">
            Confirm Password
            <input
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
            />
          </label>

          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Reset password'}
            <span className="auth-submit-glow" />
          </button>
        </form>

        <div className="auth-footer">
          <Link className="auth-footer-link" to="/v2/auth" state={{ mode: 'login' }}>
            Back to login
          </Link>
        </div>
      </div>

      <ToastContainer
        toastClassName="Toastify__toast--custom"
        bodyClassName="Toastify__toast-body--custom"
        position="top-right"
        closeButton={false}
      />
    </div>
  );
};

export default ResetPasswordPage;

