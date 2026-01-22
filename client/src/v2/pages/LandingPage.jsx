import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
  return (
    <div className="v2-landing">
      <div className="v2-landing__card">
        <h1 className="v2-landing__title">Welcome to KGPedia</h1>
        <p className="v2-landing__subtitle">
          Sign in or create an account to continue.
        </p>
        <div className="v2-landing__actions">
          <Link
            className="v2-landing__btn v2-landing__btn--primary"
            to="/v2/auth"
            state={{ mode: 'login' }}
          >
            Login
          </Link>
          <Link className="v2-landing__btn" to="/v2/auth" state={{ mode: 'signup' }}>
            Signup
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;

