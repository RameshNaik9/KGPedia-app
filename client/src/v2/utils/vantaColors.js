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
 * Normalize CSS color to hex (#rrggbb)
 */
const normalizeCssColorToHex = (value) => {
  if (!value) return '';
  const trimmed = value.trim();
  if (trimmed.startsWith('#')) return trimmed;

  const rgbMatch = trimmed.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (!rgbMatch) return '';

  const toHex = (num) => Number(num).toString(16).padStart(2, '0');
  const [, r, g, b] = rgbMatch;
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

/**
 * Convert CSS color to Vanta.js format (0xffffff)
 */
const cssColorToVanta = (value) => {
  const hex = normalizeCssColorToHex(value);
  if (!hex) return 0x000000;
  return parseInt(hex.slice(1), 16);
};

/**
 * Get Vanta.js colors based on theme
 * @param {string} theme - 'light' or 'dark'
 * @returns {Object} { color, backgroundColor } in Vanta.js format (0x...)
 */
export const getVantaColors = (theme) => {
  const isDark = theme === 'dark';
  
  // Use dark line color in both themes, but keep theme-specific background
  let colorHex = getCSSVariable('--vanta-color-dark');
  let bgHex = getCSSVariable(isDark ? '--vanta-bg-dark' : '--vanta-bg-light');
  
  // Fallbacks if CSS variables not available yet
  if (!colorHex) {
    colorHex = '#3f99ff';
  }
  if (!bgHex) {
    bgHex = isDark ? '#241d3c' : '#ffffff';
  }
  
  // Convert to Vanta.js format
  return {
    color: cssColorToVanta(colorHex),
    backgroundColor: cssColorToVanta(bgHex),
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
  
  const normalized = normalizeCssColorToHex(bgHex);
  return normalized || bgHex;
};

