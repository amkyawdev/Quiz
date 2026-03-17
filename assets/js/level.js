// Level and XP system module

/**
 * Calculate level from total XP
 * Formula: level = floor(sqrt(xp / 100)) + 1
 * @param {number} xp - Total XP
 * @returns {number} Level
 */
export function calculateLevel(xp) {
  return Math.floor(Math.sqrt(xp / 100)) + 1;
}

/**
 * Get XP required for a specific level
 * @param {number} level - Target level
 * @returns {number} XP required
 */
export function getXpForLevel(level) {
  return level * level * 100;
}

/**
 * Get XP progress to next level
 * @param {number} xp - Current XP
 * @param {number} level - Current level
 * @returns {Object} Progress object with current, needed, percentage
 */
export function getXpProgress(xp, level) {
  const currentLevelXp = getXpForLevel(level - 1);
  const nextLevelXp = getXpForLevel(level);
  const xpInLevel = xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const percentage = Math.round((xpInLevel / xpNeeded) * 100);
  
  return {
    current: xpInLevel,
    needed: xpNeeded,
    percentage: Math.min(percentage, 100),
    totalXp: xp,
    nextLevelXp: nextLevelXp
  };
}

/**
 * Get level title based on level number
 * @param {number} level - Current level
 * @returns {string} Level title
 */
export function getLevelTitle(level) {
  const titles = {
    1: 'Novice',
    2: 'Apprentice',
    3: 'Student',
    4: 'Scholar',
    5: 'Expert',
    6: 'Master',
    7: 'Grandmaster',
    8: 'Legend',
    9: 'Hero',
    10: 'Champion'
  };
  
  if (level >= 10) return titles[10];
  if (level >= 9) return titles[9];
  if (level >= 8) return titles[8];
  if (level >= 7) return titles[7];
  if (level >= 6) return titles[6];
  if (level >= 5) return titles[5];
  if (level >= 4) return titles[4];
  if (level >= 3) return titles[3];
  if (level >= 2) return titles[2];
  return titles[1];
}

/**
 * Get level badge color
 * @param {number} level - Current level
 * @returns {string} Color hex
 */
export function getLevelColor(level) {
  if (level >= 10) return '#ffd700'; // Gold
  if (level >= 8) return '#ff6b6b';  // Red
  if (level >= 6) return '#9b59b6';  // Purple
  if (level >= 4) return '#3498db';  // Blue
  if (level >= 2) return '#2ecc71';  // Green
  return '#95a5a6'; // Gray
}

/**
 * Calculate XP reward based on difficulty and streak
 * @param {string} difficulty - Question difficulty
 * @param {number} streak - Current correct answer streak
 * @returns {number} XP reward
 */
export function calculateXpReward(difficulty, streak = 0) {
  const baseXp = {
    easy: 10,
    medium: 25,
    hard: 50
  };
  
  const base = baseXp[difficulty] || 10;
  const streakBonus = Math.min(streak * 2, 10); // Max 10 XP bonus from streak
  
  return base + streakBonus;
}

/**
 * Get all level milestones
 * @returns {Array} Array of level objects
 */
export function getLevelMilestones() {
  const milestones = [];
  for (let i = 1; i <= 20; i++) {
    milestones.push({
      level: i,
      xp: getXpForLevel(i),
      title: getLevelTitle(i),
      color: getLevelColor(i)
    });
  }
  return milestones;
}
