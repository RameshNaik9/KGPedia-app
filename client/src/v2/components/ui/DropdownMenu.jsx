/**
 * DropdownMenu - Portal-based dropdown menu
 * Renders outside the DOM hierarchy to avoid overflow clipping issues
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './DropdownMenu.css';

const DropdownMenu = ({
  isOpen,
  onClose,
  triggerRef, // Ref to the button that triggered the menu
  children,
  align = 'right', // 'left' or 'right'
  className = '',
}) => {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  // Calculate position based on trigger element
  const updatePosition = useCallback(() => {
    if (!triggerRef?.current || !isOpen) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 160; // Approximate menu width
    const padding = 8;

    let top = triggerRect.bottom + padding;
    let left = align === 'right' 
      ? triggerRect.right - menuWidth 
      : triggerRect.left;

    // Keep within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Adjust horizontal position if off-screen
    if (left < padding) {
      left = padding;
    } else if (left + menuWidth > viewportWidth - padding) {
      left = viewportWidth - menuWidth - padding;
    }

    // If menu would go below viewport, show above trigger
    const menuHeight = menuRef.current?.offsetHeight || 200;
    if (top + menuHeight > viewportHeight - padding) {
      top = triggerRect.top - menuHeight - padding;
    }

    setPosition({ top, left });
  }, [triggerRef, isOpen, align]);

  // Update position on open and resize
  useEffect(() => {
    if (isOpen) {
      updatePosition();
      window.addEventListener('resize', updatePosition);
      window.addEventListener('scroll', updatePosition, true);
      return () => {
        window.removeEventListener('resize', updatePosition);
        window.removeEventListener('scroll', updatePosition, true);
      };
    }
  }, [isOpen, updatePosition]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      // Check if click is inside main menu
      if (menuRef.current && menuRef.current.contains(e.target)) {
        return;
      }
      
      // Check if click is on the trigger button
      if (triggerRef?.current && triggerRef.current.contains(e.target)) {
        return;
      }
      
      // Check if click is inside any submenu portal
      const submenuPortals = document.querySelectorAll('.dropdown-submenu-portal');
      for (const portal of submenuPortals) {
        if (portal.contains(e.target)) {
          return; // Don't close if clicking inside a submenu
        }
      }
      
      onClose();
    };

    // Delay to prevent immediate close on open click
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      ref={menuRef}
      className={`dropdown-menu-portal ${className}`}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 9999,
      }}
    >
      {children}
    </div>,
    document.body
  );
};

/**
 * Submenu component - appears to the side of a menu item
 */
export const DropdownSubmenu = ({
  isOpen,
  onClose,
  triggerRef,
  children,
  className = '',
}) => {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  const updatePosition = useCallback(() => {
    if (!triggerRef?.current || !isOpen) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const menuWidth = 160;
    const padding = 4;

    let top = triggerRect.top;
    let left = triggerRect.right + padding;

    // If submenu would go off right edge, show on left
    if (left + menuWidth > window.innerWidth - padding) {
      left = triggerRect.left - menuWidth - padding;
    }

    // Keep within viewport vertically
    const menuHeight = menuRef.current?.offsetHeight || 200;
    if (top + menuHeight > window.innerHeight - padding) {
      top = window.innerHeight - menuHeight - padding;
    }

    setPosition({ top, left });
  }, [triggerRef, isOpen]);

  useEffect(() => {
    if (isOpen) {
      updatePosition();
    }
  }, [isOpen, updatePosition]);

  // Handle click outside to close
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      // Don't close if clicking inside the submenu
      if (menuRef.current && menuRef.current.contains(e.target)) {
        return;
      }
      // Don't close if clicking on the trigger
      if (triggerRef?.current && triggerRef.current.contains(e.target)) {
        return;
      }
      onClose();
    };

    // Small delay to prevent immediate close
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 10);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, triggerRef]);

  if (!isOpen) return null;

  // Handle click inside submenu - the menu stays open until button handler closes it
  const handleSubmenuClick = (e) => {
    // Don't stop propagation - let the button handlers work
    // The button handlers will close the menu after their action
  };

  return createPortal(
    <div
      ref={menuRef}
      className={`dropdown-submenu-portal ${className}`}
      style={{
        position: 'fixed',
        top: `${position.top}px`,
        left: `${position.left}px`,
        zIndex: 10000,
      }}
      onClick={handleSubmenuClick}
    >
      {children}
    </div>,
    document.body
  );
};

export default DropdownMenu;

