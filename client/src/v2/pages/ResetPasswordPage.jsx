import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useTheme } from '../context/ThemeContext';
import { getVantaBackgroundColor } from '../utils/vantaColors';
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
    if (!token) {
      toast.error('Invalid reset link. Please request a new one.');
      return;
    }
    if (password.length < 4 || password.length > 128) {
      toast.error('Password must be between 4 and 128 characters.');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await axios.post(`${apiBaseUrl}/api/auth/reset-password`, {
        token,
        password,
      });
      toast.success('Password reset successful. Please login.');
      navigate('/v2/auth', { replace: true, state: { mode: 'login' } });
    } catch (error) {
      console.error('Reset password failed:', error.message);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('Unable to reset password. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page auth-page--login">
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

      <ToastContainer toastClassName="Toastify__toast--custom" />
    </div>
  );
};

export default ResetPasswordPage;

