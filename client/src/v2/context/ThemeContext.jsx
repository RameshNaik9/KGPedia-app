/**
 * Theme Context - Global theme management for KGPedia v2
 * Supports light/dark mode with smooth Web3 transitions
 */

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const ThemeContext = createContext(undefined);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem('kgpedia-theme');
    if (savedTheme) return savedTheme;

    return 'dark';
  });
  
  const appRef = useRef(null);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('kgpedia-theme', theme);
  }, [theme]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      const savedTheme = localStorage.getItem('kgpedia-theme');
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Toggle theme with Web3 animation
  const toggleTheme = useCallback((event) => {
    // Get click position for ripple effect
    const app = document.querySelector('.v2-app');
    
    if (app && event) {
      // Get position from click event or button center
      let x, y;
      if (event.clientX && event.clientY) {
        x = event.clientX;
        y = event.clientY;
      } else if (event.target) {
        const rect = event.target.getBoundingClientRect();
        x = rect.left + rect.width / 2;
        y = rect.top + rect.height / 2;
      } else {
        x = window.innerWidth / 2;
        y = window.innerHeight / 2;
      }
      
      // Set CSS variables for animation origin
      app.style.setProperty('--theme-switch-x', `${x}px`);
      app.style.setProperty('--theme-switch-y', `${y}px`);
      
      // Add blur transition class
      app.classList.add('theme-blur-transition');
      
      // Remove class after animation
      setTimeout(() => {
        app.classList.remove('theme-blur-transition');
      }, 400);
    }
    
    // Toggle theme
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const value = {
    theme,
    setTheme,
    toggleTheme,
    isDark: theme === 'dark',
    isLight: theme === 'light',
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeContext;
