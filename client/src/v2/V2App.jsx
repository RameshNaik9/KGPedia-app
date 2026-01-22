/**
 * V2App - Main wrapper for v2 application
 * Provides theme, layout, conversations context, and global toast notifications
 */

import React from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ThemeProvider } from './context/ThemeContext';
import { LayoutProvider } from './context/LayoutContext';
import { ConversationsProvider } from './context/ConversationsContext';
import { glassToastTransition } from './utils/toast';
import './styles/globals.css';
import './styles/toast.css';

const V2App = ({ children }) => {
  return (
    <ThemeProvider>
      <LayoutProvider>
        <ConversationsProvider>
          <div className="v2-app">
            {children}
          </div>
          
          {/* Single global ToastContainer for the entire v2 app */}
          <ToastContainer
            position="top-right"
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss={false}
            draggable={false}
            pauseOnHover
            theme="colored"
            transition={glassToastTransition}
            limit={5}
            toastClassName="kg-toast-wrapper"
            bodyClassName="kg-toast-body"
          />
        </ConversationsProvider>
      </LayoutProvider>
    </ThemeProvider>
  );
};

export default V2App;
