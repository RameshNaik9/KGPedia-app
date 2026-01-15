/**
 * QuickActions - Web3 styled quick action shortcuts
 * Provides fast access to common tasks
 */

import React from 'react';
import Icon from '../ui/Icon';
import './QuickActions.css';

// Quick action items
const QUICK_ACTIONS = [
  {
    id: 'resume',
    label: 'Resume Review',
    icon: 'file',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
  },
  {
    id: 'mock',
    label: 'Mock Interview',
    icon: 'users',
    gradient: 'linear-gradient(135deg, #10b981, #14b8a6)',
  },
  {
    id: 'roadmap',
    label: 'Career Roadmap',
    icon: 'map',
    gradient: 'linear-gradient(135deg, #f59e0b, #eab308)',
  },
  {
    id: 'compare',
    label: 'Compare Roles',
    icon: 'layers',
    gradient: 'linear-gradient(135deg, #ec4899, #f472b6)',
  },
];

const QuickActions = () => {
  const handleActionClick = (actionId) => {
    console.log('[QuickActions] Clicked:', actionId);
    // TODO: Implement action handlers
  };

  return (
    <div className="quick-actions">
      <div className="quick-actions__header">
        <h3 className="quick-actions__title">
          <Icon name="zap" size={14} />
          Quick Actions
        </h3>
      </div>

      <div className="quick-actions__grid">
        {QUICK_ACTIONS.map((action) => (
          <button 
            key={action.id} 
            className="quick-action-btn"
            onClick={() => handleActionClick(action.id)}
          >
            <span 
              className="quick-action-btn__icon"
              style={{ background: action.gradient }}
            >
              <Icon name={action.icon} size={14} />
            </span>
            <span className="quick-action-btn__label">{action.label}</span>
          </button>
        ))}
      </div>

      {/* Future: Promo/Ad placeholder */}
      <div className="quick-actions__promo">
        <div className="promo-card">
          <div className="promo-card__glow" />
          <div className="promo-card__content">
            <span className="promo-card__badge">Pro Tip</span>
            <p className="promo-card__text">
              Use <kbd>Cmd+K</kbd> for quick navigation
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;

