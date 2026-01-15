/**
 * HomePage - V2 Home/Landing page
 * Web3-styled vibrant welcome page
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const HomePage = () => {
  const navigate = useNavigate();

  const assistants = [
    {
      id: 'career',
      name: 'Career Guide',
      desc: 'Placements, internships & career growth',
      icon: '💼',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      glow: 'rgba(102, 126, 234, 0.4)',
      path: '/v2/career-assistant'
    },
    {
      id: 'academics',
      name: 'Academics Help',
      desc: 'Courses, exams & study strategies',
      icon: '📚',
      gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
      glow: 'rgba(56, 239, 125, 0.4)',
      path: '/v2/academics-assistant'
    },
    {
      id: 'gymkhana',
      name: 'Gymkhana Hub',
      desc: 'Clubs, fests & campus activities',
      icon: '🏆',
      gradient: 'linear-gradient(135deg, #fc466b 0%, #3f5efb 100%)',
      glow: 'rgba(252, 70, 107, 0.4)',
      path: '/v2/gymkhana-assistant'
    },
    {
      id: 'bhaat',
      name: 'Bhaat Corner',
      desc: 'Campus life & casual conversations',
      icon: '💬',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      glow: 'rgba(240, 147, 251, 0.4)',
      path: '/v2/bhaat-assistant'
    }
  ];

  return (
    <div className="home-page">
        {/* Animated Background */}
        <div className="home-bg">
          <div className="home-bg__gradient"></div>
          <div className="home-bg__grid"></div>
          <div className="home-bg__orbs">
            <div className="orb orb--1"></div>
            <div className="orb orb--2"></div>
            <div className="orb orb--3"></div>
            <div className="orb orb--4"></div>
          </div>
          <div className="home-bg__particles">
            {[...Array(20)].map((_, i) => (
              <div key={i} className={`particle particle--${i + 1}`}></div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="home-content">
          {/* Hero Section */}
          <div className="home-hero">
            <div className="home-hero__badge">
              <span className="badge-dot"></span>
              <span>Powered by AI</span>
            </div>
            
            <div className="home-hero__logo-wrapper">
              <div className="logo-glow"></div>
              <img 
                src="/icons/kgpedia-seconday-logo-3D-v2.svg" 
                alt="KGPedia" 
                className="home-hero__logo"
              />
            </div>

            <h1 className="home-hero__title">
              <span className="title-gradient">KGPedia</span>
            </h1>
            
            <p className="home-hero__tagline">
              Your AI-powered companion for everything at 
              <span className="highlight"> IIT Kharagpur</span>
            </p>

            <div className="home-hero__stats">
              <div className="stat">
                <span className="stat__value">4</span>
                <span className="stat__label">AI Assistants</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat__value">24/7</span>
                <span className="stat__label">Available</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat">
                <span className="stat__value">∞</span>
                <span className="stat__label">Knowledge</span>
              </div>
            </div>
          </div>

          {/* Assistant Cards */}
          <div className="home-assistants">
            <h2 className="home-assistants__title">Choose Your Assistant</h2>
            <div className="home-assistants__grid">
              {assistants.map((assistant, index) => (
                <button
                  key={assistant.id}
                  className="assistant-card"
                  onClick={() => navigate(assistant.path)}
                  style={{ 
                    '--card-gradient': assistant.gradient,
                    '--card-glow': assistant.glow,
                    animationDelay: `${index * 100}ms`
                  }}
                >
                  <div className="assistant-card__bg"></div>
                  <div className="assistant-card__content">
                    <div className="assistant-card__icon">{assistant.icon}</div>
                    <h3 className="assistant-card__name">{assistant.name}</h3>
                    <p className="assistant-card__desc">{assistant.desc}</p>
                    <div className="assistant-card__arrow">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="home-quick">
            <button className="quick-btn" onClick={() => navigate('/v2/group-chat')}>
              <span className="quick-btn__icon">👥</span>
              <span>Group Chat</span>
            </button>
            <button className="quick-btn" onClick={() => navigate('/v2/private-chat')}>
              <span className="quick-btn__icon">🔒</span>
              <span>Private Messages</span>
            </button>
          </div>
        </div>
      </div>
  );
};

export default HomePage;
