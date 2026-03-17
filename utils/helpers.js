// Utility functions for the Quiz app

/**
 * Generate a unique ID
 * @returns {string} Unique ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Shuffle an array using Fisher-Yates algorithm
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled array
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Calculate percentage
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {number} Percentage
 */
export function calculatePercentage(value, total) {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Get random items from array
 * @param {Array} array - Source array
 * @param {number} count - Number of items to get
 * @returns {Array} Random items
 */
export function getRandomItems(array, count) {
  const shuffled = shuffleArray(array);
  return shuffled.slice(0, count);
}

/**
 * Debounce function
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Show notification/message
 * @param {string} message - Message to show
 * @param {string} type - Type of notification (success, error, info)
 */
export function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 8px;
    background: ${type === 'success' ? '#48c774' : type === 'error' ? '#f14668' : '#329dce'};
    color: white;
    font-weight: bold;
    z-index: 10000;
    animation: slideIn 0.3s ease;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Get difficulty color
 * @param {string} difficulty - Difficulty level
 * @returns {string} Color hex code
 */
export function getDifficultyColor(difficulty) {
  const colors = {
    easy: '#48c774',
    medium: '#ffdd57',
    hard: '#f14668'
  };
  return colors[difficulty] || '#329dce';
}

/**
 * Get difficulty label
 * @param {string} difficulty - Difficulty level
 * @returns {string} Label
 */
export function getDifficultyLabel(difficulty) {
  const labels = {
    easy: 'Easy',
    medium: 'Medium',
    hard: 'Hard'
  };
  return labels[difficulty] || difficulty;
}
