import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Icon from '../components/ui/Icon';
import { useTheme } from '../context/ThemeContext';
import './AuthPage.css';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://www.kgpedia.com';
const KGPEDIA_LOGO = '/icons/kgpedia-seconday-logo-3D-v2.svg';

const AuthLogin = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [type, setType] = useState('password');
  const [showPassword, setShowPassword] = useState(false);

  const handleToggle = () => {
    if (type === 'password') {
      setType('text');
      setShowPassword(true);
    } else {
      setType('password');
      setShowPassword(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (email.trim() === '' || password.trim() === '') {
      toast.error('Please provide both email and password.');
      return;
    }
    try {
      const response = await axios.post(`${apiBaseUrl}/api/auth/login`, { email, password });
      if (response && response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('userId', response.data.user._id);
        localStorage.setItem('fullName', response.data.user.fullName);
        localStorage.setItem('email', response.data.user.email);
        localStorage.setItem('rollNumber', response.data.user.rollNumber);
        localStorage.setItem('department', response.data.user.department);
        localStorage.setItem('isVerified', response.data.user.isVerified);
        toast.success('Login successful!');
        navigate('/home/v2');
      } else {
        toast.error('Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login failed:', error.message);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  const loginVideoUrl = `${process.env.PUBLIC_URL}/media/Logo_Animation_With_Droste_Effect.mp4`;

  return (
    <div className="auth-page auth-page--login">
      <div className="auth-video-bg" aria-hidden="true">
        <video autoPlay muted loop playsInline>
          <source src={loginVideoUrl} type="video/mp4" />
        </video>
      </div>
      <div className="auth-glow" />
      <div className="auth-card">
        <div className="auth-brand">
          <img src={KGPEDIA_LOGO} alt="KGPedia" className="auth-logo" />
          <div>
            <h1>Welcome Back</h1>
            <p>Sign in to continue your KGPedia journey.</p>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} type="button">
            <Icon name={theme === 'light' ? 'moon' : 'sun'} size={16} />
          </button>
        </div>

        <form className="auth-form" onSubmit={handleLogin}>
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

          <label className="auth-label">
            Password
            <div className="auth-input-with-icon">
              <input
                type={type}
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
              <button type="button" className="icon-button" onClick={handleToggle}>
                <Icon name={showPassword ? 'eyeOff' : 'eye'} size={16} />
              </button>
            </div>
          </label>

          <button className="auth-submit" type="submit">
            Login
            <span className="auth-submit-glow" />
          </button>
        </form>

        <div className="auth-footer">
          <span>Don’t have an account?</span>
          <Link to="/v2/signup">Create one</Link>
        </div>
      </div>
      <ToastContainer toastClassName="Toastify__toast--custom" />
    </div>
  );
};

export default AuthLogin;

