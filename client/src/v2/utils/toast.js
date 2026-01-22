import React from 'react';
import { cssTransition, toast } from 'react-toastify';
import Icon from '../components/ui/Icon';

/**
 * Toast notification system with iOS 26 glassmorphism style
 * 
 * Two styles:
 * - Bottom-center: Large card toasts for success/info (appear with blur fade)
 * - Top-right: Compact bar toasts for error/warn (slide in)
 */

const iconForType = {
  success: 'check',
  error: 'x',
  warn: 'alertTriangle',
  info: 'info',
};

const titleForType = {
  success: 'Success',
  error: 'Oops',
  warn: 'Attention',
  info: 'Info',
};

// Position mapping: bottom-center for positive, top-right for negative
const positionForType = {
  success: 'bottom-center',
  error: 'top-right',
  warn: 'top-right',
  info: 'bottom-center',
};

// Duration in ms
const durationForType = {
  success: 2500,
  error: 4000,
  warn: 4000,
  info: 3000,
};

// Base options for all toasts
const baseOptions = {
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
  pauseOnFocusLoss: false,
};

/**
 * Toast content component - renders the custom styled toast
 * Uses different layouts for bar (top-right) vs card (bottom-center) styles
 */
const ToastContent = ({ type, message, isBar = false }) => (
  <div className={`kg-toast kg-toast--${type} ${isBar ? 'kg-toast--bar' : 'kg-toast--card'}`}>
    <div className="kg-toast__icon">
      <Icon name={iconForType[type]} size={isBar ? 16 : 22} />
    </div>
    <div className="kg-toast__text">
      <div className="kg-toast__title">{titleForType[type]}</div>
      <div className="kg-toast__message">{message}</div>
    </div>
  </div>
);

/**
 * Show a toast notification
 * @param {string} type - success, error, warn, or info
 * @param {string} message - Message to display
 * @param {object} options - Optional react-toastify options override
 */
const showToast = (type, message, options = {}) => {
  const position = positionForType[type] || 'top-right';
  const isBar = position === 'top-right';
  
  const toastOptions = {
    ...baseOptions,
    position,
    autoClose: durationForType[type] || 3000,
    icon: false,
    className: isBar ? 'kg-toast-wrapper--bar' : 'kg-toast-wrapper--card',
    ...options,
  };

  return toast(<ToastContent type={type} message={message} isBar={isBar} />, toastOptions);
};

// Exported toast functions
export const toastSuccess = (message, options) => showToast('success', message, options);
export const toastError = (message, options) => showToast('error', message, options);
export const toastWarn = (message, options) => showToast('warn', message, options);
export const toastInfo = (message, options) => showToast('info', message, options);

// Custom CSS transition for glassmorphism blur effect
export const glassToastTransition = cssTransition({
  enter: 'kg-toast-animate-in',
  exit: 'kg-toast-animate-out',
  appendPosition: true,
  collapseDuration: 300,
});

// Dismiss all toasts utility
export const dismissAllToasts = () => toast.dismiss();

// Dismiss specific toast by ID
export const dismissToast = (toastId) => toast.dismiss(toastId);
