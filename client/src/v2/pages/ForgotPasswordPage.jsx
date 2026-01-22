import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';
import { getVantaBackgroundColor } from '../utils/vantaColors';
import './AuthPage.css';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://www.kgpedia.com';

const ForgotPasswordPage = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const overrideStyleRef = useRef(null);

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
      toast.error('Please enter your email.');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${apiBaseUrl}/api/auth/forgot-password`, { email });
      setIsSubmitted(true);
      toast.success('If an account exists, a reset link has been sent.');
    } catch (error) {
      console.error('Forgot password failed:', error.message);
      toast.error('Unable to process request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page auth-page--login">
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

      <ToastContainer toastClassName="Toastify__toast--custom" />
    </div>
  );
};

export default ForgotPasswordPage;

