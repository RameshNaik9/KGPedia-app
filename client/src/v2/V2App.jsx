/**
 * V2App - Main wrapper for v2 application
 * Provides theme and layout context with global styles
 */

import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LayoutProvider } from './context/LayoutContext';
import './styles/globals.css';

const V2App = ({ children }) => {
  return (
    <ThemeProvider>
      <LayoutProvider>
        <div className="v2-app">
          {children}
        </div>
      </LayoutProvider>
    </ThemeProvider>
  );
};

export default V2App;
