import React from 'react';
import { toast } from 'react-toastify';
import Icon from '../components/ui/Icon';

const iconForType = {
  success: <Icon name="check" size={16} />,
  error: <Icon name="x" size={16} />,
  warn: <Icon name="alertTriangle" size={16} />,
  info: <Icon name="info" size={16} />,
};

const positionForType = {
  success: 'bottom-center',
  error: 'top-right',
  warn: 'top-right',
  info: 'bottom-center',
};

const durationForType = {
  success: 2000,
  error: 3500,
  warn: 3500,
  info: 3000,
};

const baseOptions = {
  hideProgressBar: true,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: false,
};

const showToast = (type, message, options = {}) => {
  const toastOptions = {
    ...baseOptions,
    position: positionForType[type] || 'top-right',
    autoClose: durationForType[type] || 3000,
    icon: iconForType[type] || false,
    ...options,
  };

  return toast(message, toastOptions);
};

export const toastSuccess = (message, options) => showToast('success', message, options);
export const toastError = (message, options) => showToast('error', message, options);
export const toastWarn = (message, options) => showToast('warn', message, options);
export const toastInfo = (message, options) => showToast('info', message, options);

