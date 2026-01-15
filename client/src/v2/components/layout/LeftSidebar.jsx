/**
 * LeftSidebar - Navigation sidebar
 * 
 * Features:
 * - Compact Navigation: Icons only
 * - Full Navigation: Icons + labels
 * - Smooth expand/collapse animation
 * - Click: toggle expand/collapse
 * - Cmd/Ctrl + click: toggle visibility
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../ui/Icon';
import { useTheme } from '../../context/ThemeContext';
import { useLayout } from '../../context/LayoutContext';
import './LeftSidebar.css';

// KGPedia logo
const KGPEDIA_LOGO = '/icons/kgpedia-seconday-logo-3D-v2.svg';

const LeftSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { isLeftSidebarExpanded, isLeftSidebarVisible } = useLayout();

  // Navigation items
  const mainNavItems = [
    { 
      id: 'logo', 
      icon: null,
      logo: KGPEDIA_LOGO,
      label: 'KGPedia', 
      path: '/home/v2', 
      type: 'brand' 
    },
    { 
      id: 'group-chat', 
      icon: 'groupChat', 
      label: 'Group Chat', 
      path: '/home/v2/group-chat',
      type: 'nav'
    },
    { 
      id: 'career-assistant', 
      icon: 'briefcase', 
      label: 'Career Guide', 
      path: '/home/v2/career-assistant',
      type: 'assistant'
    },
    { 
      id: 'academics-assistant', 
      icon: 'graduationCap', 
      label: 'Academics Help', 
      path: '/home/v2/academics-assistant',
      type: 'assistant'
    },
    { 
      id: 'gymkhana-assistant', 
      icon: 'trophy', 
      label: 'Gymkhana Hub', 
      path: '/home/v2/gymkhana-assistant',
      type: 'assistant'
    },
    { 
      id: 'bhaat-assistant', 
      icon: 'utensils', 
      label: 'Bhaat Corner', 
      path: '/home/v2/bhaat-assistant',
      type: 'assistant'
    },
    { 
      id: 'private-chat', 
      icon: 'lock', 
      label: 'Private Messages', 
      path: '/home/v2/private-chat',
      type: 'nav'
    },
  ];

  // Bottom items
  const bottomItems = [
    { 
      id: 'theme', 
      icon: theme === 'light' ? 'moon' : 'sun', 
      label: theme === 'light' ? 'Dark Mode' : 'Light Mode', 
      action: toggleTheme,
      type: 'action'
    },
    { 
      id: 'settings', 
      icon: 'settings', 
      label: 'Settings', 
      path: '/home/v2/settings',
      type: 'nav'
    },
    { 
      id: 'profile', 
      icon: 'user', 
      label: 'Profile', 
      path: '/home/v2/profile',
      type: 'nav'
    },
  ];

  const handleNavClick = (item, event) => {
    if (item.action) {
      item.action(event);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const isActive = (path) => {
    if (!path) return false;
    if (path === '/home/v2') return location.pathname === '/home/v2';
    return location.pathname.startsWith(path);
  };

  const renderNavItem = (item, index) => {
    const isBrand = item.type === 'brand';
    const isAssistant = item.type === 'assistant';
    const active = isActive(item.path);

    return (
      <button
        key={item.id}
        className={`
          nav-item 
          ${isBrand ? 'nav-item--brand' : ''} 
          ${isAssistant ? 'nav-item--assistant' : ''} 
          ${active ? 'nav-item--active' : ''}
        `}
        onClick={(e) => handleNavClick(item, e)}
        title={!isLeftSidebarExpanded ? item.label : undefined}
        aria-label={item.label}
        style={{ animationDelay: `${index * 30}ms` }}
      >
        <span className="nav-item__icon">
          {item.logo ? (
            <img 
              src={item.logo} 
              alt={item.label} 
              className="nav-item__logo-img"
            />
          ) : (
            <Icon 
              name={item.icon} 
              size={20} 
              strokeWidth={1.75} 
            />
          )}
        </span>
        <span className="nav-item__label">{item.label}</span>
        {active && !isBrand && <span className="nav-item__indicator" />}
      </button>
    );
  };

  // Always render for smooth animations, CSS handles visibility
  return (
    <aside className={`left-sidebar ${isLeftSidebarExpanded ? 'is-expanded' : ''} ${!isLeftSidebarVisible ? 'is-hidden' : ''}`}>
      <nav className="sidebar-nav">
        <div className="nav-section nav-main">
          {mainNavItems.map((item, index) => renderNavItem(item, index))}
        </div>

        <div className="nav-separator" />

        <div className="nav-section nav-bottom">
          {bottomItems.map((item, index) => renderNavItem(item, index + mainNavItems.length))}
        </div>
      </nav>
    </aside>
  );
};

export default LeftSidebar;
