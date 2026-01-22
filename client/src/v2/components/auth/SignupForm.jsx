import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { toastError, toastSuccess, toastWarn } from '../../utils/toast';
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
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);
  const [departmentDirection, setDepartmentDirection] = useState('down');
  const [highlightedDepartment, setHighlightedDepartment] = useState('');
  const departmentRef = useRef(null);
  const departmentTriggerRef = useRef(null);
  const departmentOptionRefs = useRef({});
  const departmentSearchBufferRef = useRef('');
  const departmentSearchTimeoutRef = useRef(null);

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

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!departmentRef.current || !isDepartmentOpen) return;
      if (!departmentRef.current.contains(event.target)) {
        setIsDepartmentOpen(false);
      }
    };

    window.addEventListener('mousedown', handleOutsideClick);
    return () => window.removeEventListener('mousedown', handleOutsideClick);
  }, [isDepartmentOpen]);

  useEffect(() => {
    if (!isDepartmentOpen) {
      setHighlightedDepartment('');
      departmentSearchBufferRef.current = '';
      return;
    }

    updateDepartmentDirection();
    if (department) {
      const selectedEl = departmentOptionRefs.current[department];
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'start' });
      }
    }

    const handleKeyDown = (event) => {
      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === 'Backspace') {
        departmentSearchBufferRef.current = departmentSearchBufferRef.current.slice(0, -1);
      } else if (event.key.length === 1) {
        departmentSearchBufferRef.current += event.key;
      } else {
        return;
      }

      const query = departmentSearchBufferRef.current.trim().toLowerCase();
      if (!query) {
        setHighlightedDepartment('');
        return;
      }

      const match =
        departments.find((dept) => dept.toLowerCase().startsWith(query)) ||
        departments.find((dept) => dept.toLowerCase().includes(query));

      if (match) {
        setHighlightedDepartment(match);
        const optionEl = departmentOptionRefs.current[match];
        if (optionEl) {
          optionEl.scrollIntoView({ block: 'start' });
        }
      }

      if (departmentSearchTimeoutRef.current) {
        clearTimeout(departmentSearchTimeoutRef.current);
      }
      departmentSearchTimeoutRef.current = setTimeout(() => {
        departmentSearchBufferRef.current = '';
      }, 700);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (departmentSearchTimeoutRef.current) {
        clearTimeout(departmentSearchTimeoutRef.current);
      }
    };
  }, [isDepartmentOpen]);

  const updateDepartmentDirection = () => {
    if (!departmentTriggerRef.current) return;
    const rect = departmentTriggerRef.current.getBoundingClientRect();
    const dropdownHeight = Math.min(240, window.innerHeight * 0.4);
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const shouldOpenUp = spaceBelow < dropdownHeight && spaceAbove > spaceBelow;
    setDepartmentDirection(shouldOpenUp ? 'up' : 'down');
  };

  const handleDepartmentToggle = () => {
    updateDepartmentDirection();
    setIsDepartmentOpen((prev) => !prev);
  };

  const handleDepartmentSelect = (value) => {
    setDepartment(value);
    setIsDepartmentOpen(false);
  };


  const handleSignup = async (e) => {
    e.preventDefault();
    if (!department) {
      toastWarn('Please select a department.');
      return;
    }
    if (passwordError) {
      toastWarn('Use a stronger password.');
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
        toastSuccess('Account created. Please login.');
        // Switch to login mode after a short delay
        setTimeout(() => {
          if (onSignupSuccess) {
            onSignupSuccess();
          }
          toastSuccess('Please login with your credentials.');
        }, 1500);
      } else {
        toastError('Signup failed. Try again.');
      }
    } catch (error) {
      console.error('Signup failed:', error.message);
      const serverMessage = error.response?.data?.error || '';
      if (serverMessage.includes('Roll Number') || serverMessage.includes('Roll number')) {
        toastError('Roll number already registered.');
        return;
      }
      if (serverMessage.includes('Email') || serverMessage.includes('registered')) {
        toastError('Email already registered.');
        return;
      }
      if (serverMessage.includes('IIT Kharagpur email')) {
        toastWarn('Use your IIT KGP email.');
        return;
      }
      if (serverMessage.includes('Invalid Roll Number')) {
        toastWarn('Enter a valid roll number.');
        return;
      }
      toastError('Signup failed. Try again.');
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
        <div
          ref={departmentRef}
          className={`auth-select ${isDepartmentOpen ? 'auth-select--open' : ''} ${
            departmentDirection === 'up' ? 'auth-select--up' : ''
          }`}
        >
          <button
            ref={departmentTriggerRef}
            type="button"
            className="auth-select-trigger"
            onClick={handleDepartmentToggle}
            aria-haspopup="listbox"
            aria-expanded={isDepartmentOpen}
          >
            <span className={`auth-select-value ${department ? '' : 'auth-select-placeholder'}`}>
              {department || 'Select Department'}
            </span>
            <Icon name={isDepartmentOpen ? 'chevronUp' : 'chevronDown'} size={16} />
          </button>
          <div className="auth-select-list" aria-hidden={!isDepartmentOpen}>
            <ul className="auth-select-options" role="listbox">
              {departments.map((dept) => (
                <li key={dept} role="option" aria-selected={department === dept}>
                  <button
                    type="button"
                    ref={(el) => {
                      if (el) {
                        departmentOptionRefs.current[dept] = el;
                      }
                    }}
                    className={`auth-select-option ${
                      department === dept ? 'is-selected' : ''
                    } ${highlightedDepartment === dept ? 'is-match' : ''}`}
                    onClick={() => handleDepartmentSelect(dept)}
                  >
                    <span className="auth-select-option-text">{dept}</span>
                    {department === dept && (
                      <span
                        role="button"
                        tabIndex={0}
                        className="auth-select-option-clear"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          setDepartment('');
                          setHighlightedDepartment('');
                        }}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            setDepartment('');
                            setHighlightedDepartment('');
                          }
                        }}
                      >
                        x
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
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

