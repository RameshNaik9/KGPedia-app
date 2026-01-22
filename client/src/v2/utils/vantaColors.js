/**
 * Vanta.js Color Utilities
 * Reads CSS variables and converts them to Vanta.js format
 * 
 * To change Vanta.js colors, update the CSS variables in:
 * client/src/v2/styles/variables.css
 */

/**
 * Get computed CSS variable value
 */
const getCSSVariable = (variableName) => {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(variableName)
    .trim();
};

/**
 * Convert hex color (#ffffff) to Vanta.js format (0xffffff)
 */
const hexToVantaColor = (hex) => {
  if (!hex) return 0x000000;
  // Remove # if present
  const cleanHex = hex.replace('#', '');
  // Convert to integer
  return parseInt(cleanHex, 16);
};

/**
 * Get Vanta.js colors based on theme
 * @param {string} theme - 'light' or 'dark'
 * @returns {Object} { color, backgroundColor } in Vanta.js format (0x...)
 */
export const getVantaColors = (theme) => {
  const isDark = theme === 'dark';
  
  // Get CSS variable values with fallbacks
  let colorHex = getCSSVariable(
    isDark ? '--vanta-color-dark' : '--vanta-color-light'
  );
  let bgHex = getCSSVariable(
    isDark ? '--vanta-bg-dark' : '--vanta-bg-light'
  );
  
  // Fallbacks if CSS variables not available yet
  if (!colorHex) {
    colorHex = isDark ? '#3f99ff' : '#6366f1';
  }
  if (!bgHex) {
    bgHex = isDark ? '#241d3c' : '#ffffff';
  }
  
  // Convert to Vanta.js format
  return {
    color: hexToVantaColor(colorHex),
    backgroundColor: hexToVantaColor(bgHex),
  };
};

/**
 * Get Vanta.js background color as CSS hex string
 * @param {string} theme - 'light' or 'dark'
 * @returns {string} Hex color string (e.g., '#ffffff')
 */
export const getVantaBackgroundColor = (theme) => {
  const isDark = theme === 'dark';
  
  // Try to get from CSS variable
  let bgHex = getCSSVariable(
    isDark ? '--vanta-bg-dark' : '--vanta-bg-light'
  );
  
  // Fallback if CSS variable not available yet
  if (!bgHex) {
    bgHex = isDark ? '#241d3c' : '#ffffff';
  }
  
  // Ensure it starts with #
  return bgHex.startsWith('#') ? bgHex : `#${bgHex}`;
};

