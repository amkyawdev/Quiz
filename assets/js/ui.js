// UI helpers module

/**
 * Create a 3D card element
 * @param {string} title - Card title
 * @param {string} content - Card content
 * @param {string} color - Card accent color
 * @returns {string} HTML string
 */
export function create3DCard(title, content, color = '#3498db') {
  return `
    <div class="card-3d" style="--accent-color: ${color}">
      <div class="card-front">
        <h3 class="card-title">${title}</h3>
        <div class="card-content">${content}</div>
      </div>
      <div class="card-back">
        <div class="card-content">${content}</div>
      </div>
    </div>
  `;
}

/**
 * Create a progress bar
 * @param {number} percentage - Progress percentage
 * @param {string} color - Bar color
 * @returns {string} HTML string
 */
export function createProgressBar(percentage, color = '#3498db') {
  return `
    <div class="progress-container">
      <div class="progress-bar" style="width: ${Math.min(percentage, 100)}%; background: ${color}"></div>
      <span class="progress-text">${percentage}%</span>
    </div>
  `;
}

/**
 * Create an XP bar
 * @param {number} current - Current XP
 * @param {number} needed - XP needed for next level
 * @param {number} level - Current level
 * @returns {string} HTML string
 */
export function createXpBar(current, needed, level) {
  const percentage = Math.round((current / needed) * 100);
  return `
    <div class="xp-bar-container">
      <div class="xp-bar">
        <div class="xp-bar-fill" style="width: ${percentage}%"></div>
      </div>
      <div class="xp-info">
        <span class="xp-current">${current} XP</span>
        <span class="xp-level">Level ${level}</span>
        <span class="xp-needed">${needed} XP</span>
      </div>
    </div>
  `;
}

/**
 * Create answer button
 * @param {string} text - Answer text
 * @param {number} index - Answer index
 * @returns {string} HTML string
 */
export function createAnswerButton(text, index) {
  const letters = ['A', 'B', 'C', 'D'];
  return `
    <button class="answer-btn" data-index="${index}">
      <span class="answer-letter">${letters[index]}</span>
      <span class="answer-text">${text}</span>
    </button>
  `;
}

/**
 * Create difficulty selector
 * @param {string} selected - Currently selected difficulty
 * @returns {string} HTML string
 */
export function createDifficultySelector(selected = 'easy') {
  const difficulties = [
    { value: 'easy', label: 'Easy', color: '#48c774', icon: '⭐' },
    { value: 'medium', label: 'Medium', color: '#ffdd57', icon: '⭐⭐' },
    { value: 'hard', label: 'Hard', color: '#f14668', icon: '⭐⭐⭐' }
  ];
  
  return difficulties.map(d => `
    <button 
      class="difficulty-btn ${selected === d.value ? 'active' : ''}" 
      data-difficulty="${d.value}"
      style="--btn-color: ${d.color}"
    >
      <span class="difficulty-icon">${d.icon}</span>
      <span class="difficulty-label">${d.label}</span>
    </button>
  `).join('');
}

/**
 * Create level badge
 * @param {number} level - Level number
 * @param {string} title - Level title
 * @param {string} color - Badge color
 * @returns {string} HTML string
 */
export function createLevelBadge(level, title, color = '#3498db') {
  return `
    <div class="level-badge" style="--badge-color: ${color}">
      <span class="level-number">${level}</span>
      <span class="level-title">${title}</span>
    </div>
  `;
}

/**
 * Create stat card
 * @param {string} label - Stat label
 * @param {string|number} value - Stat value
 * @param {string} icon - Icon emoji
 * @returns {string} HTML string
 */
export function createStatCard(label, value, icon = '') {
  return `
    <div class="stat-card">
      ${icon ? `<span class="stat-icon">${icon}</span>` : ''}
      <span class="stat-value">${value}</span>
      <span class="stat-label">${label}</span>
    </div>
  `;
}

/**
 * Create confetti effect
 * @param {number} count - Number of confetti pieces
 * @returns {string} HTML string
 */
export function createConfetti(count = 50) {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'];
  const confetti = [];
  
  for (let i = 0; i < count; i++) {
    const color = colors[Math.floor(Math.random() * colors.length)];
    const left = Math.random() * 100;
    const delay = Math.random() * 2;
    const size = Math.random() * 10 + 5;
    
    confetti.push(`
      <div class="confetti" style="
        left: ${left}%;
        background: ${color};
        animation-delay: ${delay}s;
        width: ${size}px;
        height: ${size}px;
      "></div>
    `);
  }
  
  return confetti.join('');
}

/**
 * Create timer display
 * @param {number} seconds - Time in seconds
 * @returns {string} HTML string
 */
export function createTimerDisplay(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const display = `${minutes}:${secs.toString().padStart(2, '0')}`;
  const color = seconds <= 5 ? '#f14668' : seconds <= 10 ? '#ffdd57' : '#48c774';
  
  return `
    <div class="timer-display" style="--timer-color: ${color}">
      <span class="timer-icon">⏱️</span>
      <span class="timer-value">${display}</span>
    </div>
  `;
}

/**
 * Create navbar
 * @param {Object} user - User object
 * @returns {string} HTML string
 */
export function createNavbar(user) {
  const isLoggedIn = user !== null;
  
  return `
    <nav class="navbar-3d">
      <div class="nav-brand">
        <span class="brand-icon">🎯</span>
        <span class="brand-text">QuizMaster</span>
      </div>
      <div class="nav-links">
        <a href="index.html" class="nav-link">Home</a>
        ${isLoggedIn ? `
          <a href="profile.html" class="nav-link">Profile</a>
          <button id="logout-btn" class="nav-link logout">Logout</button>
        ` : ''}
      </div>
      ${isLoggedIn ? `
        <div class="nav-user">
          <span class="user-name">${user.username}</span>
          <span class="user-level">Lv.${user.level}</span>
        </div>
      ` : ''}
    </nav>
  `;
}
