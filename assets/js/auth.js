// Authentication module for user login and localStorage management

const STORAGE_KEY = 'quiz_user';

/**
 * Get current user from localStorage
 * @returns {Object|null} User object or null
 */
export function getCurrentUser() {
  const userData = localStorage.getItem(STORAGE_KEY);
  return userData ? JSON.parse(userData) : null;
}

/**
 * Login user with username
 * @param {string} username - Username
 * @returns {Object} User object
 */
export function login(username) {
  const existingUser = getCurrentUser();
  
  if (existingUser && existingUser.username === username) {
    return existingUser;
  }
  
  const user = {
    id: generateUserId(),
    username: username.trim(),
    xp: existingUser?.xp || 0,
    level: existingUser?.level || 1,
    totalGames: existingUser?.totalGames || 0,
    correctAnswers: existingUser?.correctAnswers || 0,
    totalQuestions: existingUser?.totalQuestions || 0,
    createdAt: existingUser?.createdAt || new Date().toISOString(),
    lastPlayed: new Date().toISOString()
  };
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

/**
 * Logout user
 */
export function logout() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Update user stats after quiz
 * @param {number} xpEarned - XP earned in quiz
 * @param {number} correct - Number of correct answers
 * @param {number} total - Total questions answered
 * @returns {Object} Updated user object
 */
export function updateUserStats(xpEarned, correct, total) {
  const user = getCurrentUser();
  if (!user) return null;
  
  user.xp += xpEarned;
  user.correctAnswers += correct;
  user.totalQuestions += total;
  user.totalGames += 1;
  user.lastPlayed = new Date().toISOString();
  
  // Calculate level based on XP
  user.level = calculateLevel(user.xp);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

/**
 * Check if user is logged in
 * @returns {boolean} True if logged in
 */
export function isLoggedIn() {
  return getCurrentUser() !== null;
}

/**
 * Generate unique user ID
 * @returns {string} User ID
 */
function generateUserId() {
  return 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * Calculate level from XP
 * Formula: level = floor(sqrt(xp / 100)) + 1
 * @param {number} xp - Total XP
 * @returns {number} Level
 */
export function calculateLevel(xp) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Get XP needed for next level
 * @param {number} currentLevel - Current level
 * @returns {number} XP needed for next level
 */
export function getXpForNextLevel(currentLevel) {
  return currentLevel * currentLevel * 100;
}

/**
 * Get XP progress to next level
 * @param {number} xp - Current XP
 * @param {number} level - Current level
 * @returns {Object} Progress info
 */
export function getXpProgress(xp, level) {
  const currentLevelXp = (level - 1) * (level - 1) * 100;
  const nextLevelXp = level * level * 100;
  const xpInLevel = xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const percentage = Math.round((xpInLevel / xpNeeded) * 100);
  
  return {
    current: xpInLevel,
    needed: xpNeeded,
    percentage: Math.min(percentage, 100)
  };
}
