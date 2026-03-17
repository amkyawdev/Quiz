// Main application component with Alpine.js initialization

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initApp();
});

function initApp() {
  // Check current page and initialize appropriate functionality
  const path = window.location.pathname;
  
  if (path.includes('quiz.html')) {
    initQuizPage();
  } else if (path.includes('result.html')) {
    initResultPage();
  } else if (path.includes('profile.html')) {
    initProfilePage();
  } else {
    initIndexPage();
  }
  
  // Initialize navbar
  initNavbar();
}

/**
 * Initialize navbar across all pages
 */
function initNavbar() {
  const user = getCurrentUser();
  const navbarContainer = document.getElementById('navbar-container');
  
  if (navbarContainer && user) {
    navbarContainer.innerHTML = `
      <nav class="navbar-3d">
        <div class="nav-brand">
          <a href="index.html" class="brand-link">
            <span class="brand-icon">🎯</span>
            <span class="brand-text">QuizMaster</span>
          </a>
        </div>
        <div class="nav-links">
          <a href="index.html" class="nav-link">Home</a>
          <a href="profile.html" class="nav-link">Profile</a>
        </div>
        <div class="nav-user">
          <span class="user-name">${user.username}</span>
          <span class="user-level" style="background: ${getLevelColor(user.level)}">Lv.${user.level}</span>
        </div>
      </nav>
    `;
    
    // Add logout functionality
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        logout();
        window.location.href = 'index.html';
      });
    }
  }
}

/**
 * Initialize index page (login/level select)
 */
function initIndexPage() {
  const loginForm = document.getElementById('login-form');
  const usernameInput = document.getElementById('username');
  const startBtn = document.getElementById('start-btn');
  const difficultyBtns = document.querySelectorAll('.difficulty-btn');
  
  // Check if user is already logged in
  const user = getCurrentUser();
  if (user) {
    showLoggedInState(user);
  }
  
  // Handle login form submission
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = usernameInput.value.trim();
      if (username) {
        const user = login(username);
        showLoggedInState(user);
      }
    });
  }
  
  // Handle start button
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      const selectedDifficulty = document.querySelector('.difficulty-btn.active')?.dataset.difficulty || 'easy';
      if (!user && !getCurrentUser()) {
        const username = usernameInput.value.trim();
        if (!username) {
          alert('Please enter your username first!');
          return;
        }
        login(username);
      }
      window.location.href = `quiz.html?difficulty=${selectedDifficulty}`;
    });
  }
  
  // Handle difficulty selection
  difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      difficultyBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  
  // Show logged in state
  function showLoggedInState(user) {
    const loginSection = document.getElementById('login-section');
    const welcomeSection = document.getElementById('welcome-section');
    const usernameDisplay = document.getElementById('username-display');
    const userXp = document.getElementById('user-xp');
    const userLevel = document.getElementById('user-level');
    
    if (loginSection) loginSection.style.display = 'none';
    if (welcomeSection) welcomeSection.style.display = 'block';
    if (usernameDisplay) usernameDisplay.textContent = user.username;
    if (userXp) userXp.textContent = `${user.xp} XP`;
    if (userLevel) {
      userLevel.textContent = `Level ${user.level}`;
      userLevel.style.background = getLevelColor(user.level);
    }
  }
}

/**
 * Initialize quiz page
 */
function initQuizPage() {
  const urlParams = new URLSearchParams(window.location.search);
  const difficulty = urlParams.get('difficulty') || 'easy';
  
  // Initialize quiz state
  let questions = [];
  let currentIndex = 0;
  let score = 0;
  let xpEarned = 0;
  let correctAnswers = 0;
  let streak = 0;
  let maxStreak = 0;
  let timeLeft = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 15 : 10;
  let timer = null;
  
  // DOM elements
  const questionContainer = document.getElementById('question-container');
  const questionText = document.getElementById('question-text');
  const answersContainer = document.getElementById('answers-container');
  const progressText = document.getElementById('progress-text');
  const progressBar = document.getElementById('progress-bar');
  const scoreText = document.getElementById('score-text');
  const xpText = document.getElementById('xp-text');
  const streakText = document.getElementById('streak-text');
  const timerDisplay = document.getElementById('timer-display');
  const feedbackContainer = document.getElementById('feedback-container');
  
  // Load questions
  fetch('./data/questions.json')
    .then(res => res.json())
    .then(data => {
      const allQuestions = data[difficulty] || [];
      questions = allQuestions.sort(() => Math.random() - 0.5).slice(0, 5);
      showQuestion();
    })
    .catch(err => console.error('Error loading questions:', err));
  
  // Show current question
  function showQuestion() {
    if (currentIndex >= questions.length) {
      endQuiz();
      return;
    }
    
    const question = questions[currentIndex];
    questionText.textContent = question.question;
    progressText.textContent = `Question ${currentIndex + 1} of ${questions.length}`;
    progressBar.style.width = `${((currentIndex) / questions.length) * 100}%`;
    
    // Shuffle answers
    const answers = question.options.map((text, index) => ({ text, index }));
    
    answersContainer.innerHTML = answers.map((answer, i) => `
      <button class="answer-btn" data-index="${answer.index}">
        <span class="answer-letter">${String.fromCharCode(65 + i)}</span>
        <span class="answer-text">${answer.text}</span>
      </button>
    `).join('');
    
    // Add click handlers
    document.querySelectorAll('.answer-btn').forEach(btn => {
      btn.addEventListener('click', () => handleAnswer(parseInt(btn.dataset.index)));
    });
    
    // Start timer
    startTimer();
  }
  
  // Handle answer selection
  function handleAnswer(answerIndex) {
    stopTimer();
    
    const question = questions[currentIndex];
    const isCorrect = answerIndex === question.correct;
    const baseXp = { easy: 10, medium: 25, hard: 50 };
    
    // Show feedback
    showFeedback(isCorrect, question.correct);
    
    if (isCorrect) {
      correctAnswers++;
      streak++;
      if (streak > maxStreak) maxStreak = streak;
      
      const xp = baseXp[difficulty] + Math.min(streak * 2, 10);
      xpEarned += xp;
      score += xp;
    } else {
      streak = 0;
    }
    
    // Update UI
    scoreText.textContent = `Score: ${score}`;
    xpText.textContent = `+${xpEarned} XP`;
    streakText.textContent = `🔥 ${streak}`;
    
    // Disable buttons
    document.querySelectorAll('.answer-btn').forEach(btn => {
      btn.disabled = true;
      const idx = parseInt(btn.dataset.index);
      if (idx === question.correct) {
        btn.classList.add('correct');
      } else if (idx === answerIndex && !isCorrect) {
        btn.classList.add('incorrect');
      }
    });
    
    // Next question after delay
    setTimeout(() => {
      currentIndex++;
      feedbackContainer.innerHTML = '';
      showQuestion();
    }, 1500);
  }
  
  // Show feedback animation
  function showFeedback(isCorrect, correctIndex) {
    if (isCorrect) {
      feedbackContainer.innerHTML = `
        <div class="feedback feedback-correct">
          <span class="feedback-icon">✅</span>
          <span class="feedback-text">Correct!</span>
        </div>
      `;
    } else {
      feedbackContainer.innerHTML = `
        <div class="feedback feedback-incorrect">
          <span class="feedback-icon">❌</span>
          <span class="feedback-text">Wrong! The answer was ${String.fromCharCode(65 + correctIndex)}</span>
        </div>
      `;
    }
  }
  
  // Timer functions
  function startTimer() {
    timeLeft = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 15 : 10;
    updateTimerDisplay();
    
    timer = setInterval(() => {
      timeLeft--;
      updateTimerDisplay();
      
      if (timeLeft <= 0) {
        stopTimer();
        handleTimeout();
      }
    }, 1000);
  }
  
  function stopTimer() {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }
  
  function updateTimerDisplay() {
    if (timerDisplay) {
      timerDisplay.textContent = `⏱️ ${timeLeft}s`;
      timerDisplay.style.color = timeLeft <= 5 ? '#f14668' : timeLeft <= 10 ? '#ffdd57' : '#48c774';
    }
  }
  
  function handleTimeout() {
    const question = questions[currentIndex];
    streak = 0;
    streakText.textContent = `🔥 ${streak}`;
    
    showFeedback(false, question.correct);
    
    document.querySelectorAll('.answer-btn').forEach(btn => {
      btn.disabled = true;
      const idx = parseInt(btn.dataset.index);
      if (idx === question.correct) {
        btn.classList.add('correct');
      }
    });
    
    setTimeout(() => {
      currentIndex++;
      feedbackContainer.innerHTML = '';
      showQuestion();
    }, 1500);
  }
  
  // End quiz
  function endQuiz() {
    stopTimer();
    
    const results = {
      totalQuestions: questions.length,
      correctAnswers,
      xpEarned,
      score,
      maxStreak,
      difficulty
    };
    
    // Save results to sessionStorage for result page
    sessionStorage.setItem('quiz_results', JSON.stringify(results));
    
    // Update user stats
    const user = getCurrentUser();
    if (user) {
      updateUserStats(xpEarned, correctAnswers, questions.length);
    }
    
    // Redirect to result page
    window.location.href = 'result.html';
  }
}

/**
 * Initialize result page
 */
function initResultPage() {
  const results = JSON.parse(sessionStorage.getItem('quiz_results') || '{}');
  
  if (!results.totalQuestions) {
    window.location.href = 'index.html';
    return;
  }
  
  // Update DOM elements
  const percentage = Math.round((results.correctAnswers / results.totalQuestions) * 100);
  let rating;
  if (percentage >= 90) rating = 'Excellent!';
  else if (percentage >= 70) rating = 'Great Job!';
  else if (percentage >= 50) rating = 'Good Effort!';
  else if (percentage >= 30) rating = 'Keep Practicing!';
  else rating = 'Try Again!';
  
  document.getElementById('rating-text').textContent = rating;
  document.getElementById('score-value').textContent = results.score;
  document.getElementById('xp-value').textContent = `+${results.xpEarned}`;
  document.getElementById('correct-count').textContent = results.correctAnswers;
  document.getElementById('total-count').textContent = results.totalQuestions;
  document.getElementById('percentage-value').textContent = `${percentage}%`;
  document.getElementById('streak-value').textContent = results.maxStreak;
  
  // Add confetti for good scores
  if (percentage >= 70) {
    createConfetti();
  }
  
  // Play again button
  document.getElementById('play-again-btn').addEventListener('click', () => {
    window.location.href = 'quiz.html';
  });
  
  // Home button
  document.getElementById('home-btn').addEventListener('click', () => {
    window.location.href = 'index.html';
  });
  
  // Profile button
  document.getElementById('profile-btn')?.addEventListener('click', () => {
    window.location.href = 'profile.html';
  });
}

/**
 * Initialize profile page
 */
function initProfilePage() {
  const user = getCurrentUser();
  
  if (!user) {
    window.location.href = 'index.html';
    return;
  }
  
  // Calculate XP progress
  const currentLevelXp = (user.level - 1) * (user.level - 1) * 100;
  const nextLevelXp = user.level * user.level * 100;
  const xpInLevel = user.xp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  const percentage = Math.round((xpInLevel / xpNeeded) * 100);
  
  // Update DOM
  document.getElementById('profile-username').textContent = user.username;
  document.getElementById('profile-level').textContent = user.level;
  document.getElementById('level-title').textContent = getLevelTitle(user.level);
  document.getElementById('total-xp').textContent = `${user.xp} XP`;
  document.getElementById('xp-progress').style.width = `${percentage}%`;
  document.getElementById('xp-current').textContent = `${xpInLevel} / ${xpNeeded} XP`;
  document.getElementById('games-played').textContent = user.totalGames;
  document.getElementById('correct-answers').textContent = user.correctAnswers;
  document.getElementById('total-questions').textContent = user.totalQuestions;
  
  const accuracy = user.totalQuestions > 0 
    ? Math.round((user.correctAnswers / user.totalQuestions) * 100) 
    : 0;
  document.getElementById('accuracy').textContent = `${accuracy}%`;
  
  // Set level badge color
  const levelBadge = document.getElementById('level-badge');
  levelBadge.style.background = getLevelColor(user.level);
  
  // Logout button
  document.getElementById('logout-profile-btn').addEventListener('click', () => {
    logout();
    window.location.href = 'index.html';
  });
  
  // Play quiz button
  document.getElementById('play-quiz-btn').addEventListener('click', () => {
    window.location.href = 'quiz.html?difficulty=easy';
  });
}

// Helper functions (also used by other modules)
function getCurrentUser() {
  const userData = localStorage.getItem('quiz_user');
  return userData ? JSON.parse(userData) : null;
}

function login(username) {
  const existingUser = getCurrentUser();
  
  if (existingUser && existingUser.username === username) {
    return existingUser;
  }
  
  const user = {
    id: 'user_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
    username: username.trim(),
    xp: existingUser?.xp || 0,
    level: existingUser?.level || 1,
    totalGames: existingUser?.totalGames || 0,
    correctAnswers: existingUser?.correctAnswers || 0,
    totalQuestions: existingUser?.totalQuestions || 0,
    createdAt: existingUser?.createdAt || new Date().toISOString(),
    lastPlayed: new Date().toISOString()
  };
  
  localStorage.setItem('quiz_user', JSON.stringify(user));
  return user;
}

function logout() {
  localStorage.removeItem('quiz_user');
}

function updateUserStats(xpEarned, correct, total) {
  const user = getCurrentUser();
  if (!user) return null;
  
  user.xp += xpEarned;
  user.correctAnswers += correct;
  user.totalQuestions += total;
  user.totalGames += 1;
  user.lastPlayed = new Date().toISOString();
  user.level = Math.floor(Math.sqrt(user.xp / 100)) + 1;
  
  localStorage.setItem('quiz_user', JSON.stringify(user));
  return user;
}

function getLevelTitle(level) {
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

function getLevelColor(level) {
  if (level >= 10) return '#ffd700';
  if (level >= 8) return '#ff6b6b';
  if (level >= 6) return '#9b59b6';
  if (level >= 4) return '#3498db';
  if (level >= 2) return '#2ecc71';
  return '#95a5a6';
}

function createConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-container';
  document.body.appendChild(container);
  
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9'];
  
  for (let i = 0; i < 50; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = Math.random() * 100 + '%';
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.animationDelay = Math.random() * 2 + 's';
    confetti.style.width = (Math.random() * 10 + 5) + 'px';
    confetti.style.height = (Math.random() * 10 + 5) + 'px';
    container.appendChild(confetti);
  }
  
  setTimeout(() => container.remove(), 4000);
}
