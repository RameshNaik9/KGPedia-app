/**
 * V2App - Main wrapper for v2 application
 * Provides theme, layout, and conversations context with global styles
 */

import React from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LayoutProvider } from './context/LayoutContext';
import { ConversationsProvider } from './context/ConversationsContext';
import './styles/globals.css';

const V2App = ({ children }) => {
  return (
    <ThemeProvider>
      <LayoutProvider>
        <ConversationsProvider>
          <div className="v2-app">
            {children}
          </div>
        </ConversationsProvider>
      </LayoutProvider>
    </ThemeProvider>
  );
};

export default V2App;
