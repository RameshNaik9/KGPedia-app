import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Icon from '../ui/Icon';

const apiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://www.kgpedia.com';

const departments = [
  'Aerospace Engineering',
  'Agricultural & Food Engineering',
  'Architecture & Regional Planning',
  'Biotechnology',
  'Chemical Engineering',
  'Chemistry',
  'Civil Engineering',
  'Computer Science & Engineering',
  'Cryogenic Engineering',
  'Center for Educational Technology',
  'Electrical Engineering',
  'Electronics & Electrical Communication Engineering',
  'Geology & Geophysics',
  'Humanities & Social Sciences',
  'Industrial Engineering & Management',
  'Information Technology',
  'Materials Science',
  'Mathematics',
  'Mechanical Engineering',
  'Medical Science & Technology',
  'Metallurgical & Materials Engineering',
  'Mining Engineering',
  'Ocean Engineering & Naval Architecture',
  'Oceans, Rivers, Atmosphere and Land Sciences',
  'Physics & Meteorology',
  'Rajiv Gandhi School of Intellectual Property Law',
  'Reliability Engineering Centre',
  'Rubber Technology Centre',
  'Rural Development Centre',
  'Vinod Gupta School of Management',
];

const SignupForm = ({ onSignupSuccess }) => {
  const [rollNumber, setRollNumber] = useState('');
  const [department, setDepartment] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [type, setType] = useState('password');
  const [showPassword, setShowPassword] = useState(false);

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);

    const strongPasswordPattern = /^(?=.*[A-Z])(?=.*[!@#$%^&*])(?=.*[0-9])/;
    if (!strongPasswordPattern.test(value)) {
      setPasswordError('Strong Password Recommended!');
    } else {
      setPasswordError('');
    }
  };

  const handleToggle = () => {
    if (type === 'password') {
      setType('text');
      setShowPassword(true);
    } else {
      setType('password');
      setShowPassword(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (passwordError) {
      toast.error('Please correct the errors before submitting.');
      return;
    }
    try {
      const response = await axios.post(`${apiBaseUrl}/api/auth/register`, {
        rollNumber,
        department,
        fullName,
        email,
        password,
      });

      if (response && response.data) {
        setRollNumber('');
        setDepartment('');
        setFullName('');
        setEmail('');
        setPassword('');
        toast.success('Registration successful!');
        // Switch to login mode after a short delay
        setTimeout(() => {
          if (onSignupSuccess) {
            onSignupSuccess();
          }
          toast.info('Please login with your credentials.');
        }, 1500);
      } else {
        toast.error('Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup failed:', error.message);
      if (error.response && error.response.data && error.response.data.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error('An unexpected error occurred. Please try again.');
      }
    }
  };

  return (
    <form className="auth-form auth-form--grid" onSubmit={handleSignup}>
      <label className="auth-label">
        Full Name
        <input
          type="text"
          placeholder="Your full name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          autoComplete="name"
        />
      </label>

      <label className="auth-label">
        Roll Number
        <input
          type="text"
          placeholder="Roll number"
          value={rollNumber}
          onChange={(e) => setRollNumber(e.target.value)}
          required
          autoComplete="off"
        />
      </label>

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
        Department
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          required
        >
          <option value="" disabled>Select Department</option>
          {departments.map((dept) => (
            <option key={dept} value={dept}>
              {dept}
            </option>
          ))}
        </select>
      </label>

      <label className="auth-label auth-label--full">
        Password
        <div className="auth-input-with-icon">
          <input
            type={type}
            name="password"
            placeholder="Create a strong password"
            value={password}
            onChange={handlePasswordChange}
            required
            autoComplete="new-password"
          />
          <button type="button" className="icon-button" onClick={handleToggle}>
            <Icon name={showPassword ? 'eyeOff' : 'eye'} size={16} />
          </button>
        </div>
        {passwordError && (
          <span className="auth-helper-text">{passwordError}</span>
        )}
      </label>

      <button className="auth-submit auth-submit--full" type="submit">
        Create Account
        <span className="auth-submit-glow" />
      </button>
    </form>
  );
};

export default SignupForm;

