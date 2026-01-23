/**
 * useSwipeGesture - Touch swipe detection hook for mobile/tablet navigation
 * 
 * Features:
 * - Swipe from left edge to open left sidebar
 * - Swipe from right edge to open right panel
 * - Swipe left/right to close open panels
 * - Configurable edge detection zone
 * - Configurable swipe threshold
 */

import { useEffect, useRef, useCallback } from 'react';

const EDGE_ZONE = 20; // Pixels from edge to trigger edge swipe
const SWIPE_THRESHOLD = 50; // Minimum pixels to trigger swipe
const SWIPE_VELOCITY_THRESHOLD = 0.3; // Minimum velocity (px/ms)

export const useSwipeGesture = ({
  onSwipeLeftFromRight,  // Open right panel
  onSwipeRightFromLeft,  // Open left sidebar
  onSwipeLeft,           // Close right panel (when open)
  onSwipeRight,          // Close left sidebar (when open)
  isLeftOpen = false,
  isRightOpen = false,
  enabled = true,
}) => {
  const touchStartRef = useRef(null);
  const touchStartTimeRef = useRef(null);

  const handleTouchStart = useCallback((e) => {
    if (!enabled) return;
    
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      isFromLeftEdge: touch.clientX < EDGE_ZONE,
      isFromRightEdge: touch.clientX > window.innerWidth - EDGE_ZONE,
    };
    touchStartTimeRef.current = Date.now();
  }, [enabled]);

  const handleTouchEnd = useCallback((e) => {
    if (!enabled || !touchStartRef.current) return;

    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - touchStartRef.current.x;
    const deltaY = touch.clientY - touchStartRef.current.y;
    const duration = Date.now() - touchStartTimeRef.current;
    const velocity = Math.abs(deltaX) / duration;

    // Check if horizontal swipe (not vertical scroll)
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      touchStartRef.current = null;
      return;
    }

    // Check threshold
    const isValidSwipe = Math.abs(deltaX) > SWIPE_THRESHOLD || velocity > SWIPE_VELOCITY_THRESHOLD;
    
    if (!isValidSwipe) {
      touchStartRef.current = null;
      return;
    }

    const { isFromLeftEdge, isFromRightEdge } = touchStartRef.current;

    // Swipe right (finger moves left to right)
    if (deltaX > 0) {
      if (isFromLeftEdge && !isLeftOpen) {
        // Swipe from left edge - open left sidebar
        onSwipeRightFromLeft?.();
      } else if (isRightOpen) {
        // Swipe right when right panel is open - close it
        onSwipeRight?.();
      }
    }
    
    // Swipe left (finger moves right to left)
    if (deltaX < 0) {
      if (isFromRightEdge && !isRightOpen) {
        // Swipe from right edge - open right panel
        onSwipeLeftFromRight?.();
      } else if (isLeftOpen) {
        // Swipe left when left sidebar is open - close it
        onSwipeLeft?.();
      }
    }

    touchStartRef.current = null;
  }, [
    enabled,
    isLeftOpen,
    isRightOpen,
    onSwipeLeftFromRight,
    onSwipeRightFromLeft,
    onSwipeLeft,
    onSwipeRight,
  ]);

  useEffect(() => {
    if (!enabled) return;

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [enabled, handleTouchStart, handleTouchEnd]);
};

export default useSwipeGesture;

