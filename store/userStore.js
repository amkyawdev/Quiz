// Alpine.js global store for user state

document.addEventListener('alpine:init', () => {
  Alpine.store('user', {
    data: null,
    
    // Initialize user from localStorage
    init() {
      const userData = localStorage.getItem('quiz_user');
      if (userData) {
        this.data = JSON.parse(userData);
      }
    },
    
    // Check if user is logged in
    isLoggedIn() {
      return this.data !== null;
    },
    
    // Login user
    login(username) {
      const existingUser = this.data;
      
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
      
      this.data = user;
      localStorage.setItem('quiz_user', JSON.stringify(user));
      return user;
    },
    
    // Logout user
    logout() {
      this.data = null;
      localStorage.removeItem('quiz_user');
    },
    
    // Update user stats
    updateStats(xpEarned, correct, total) {
      if (!this.data) return null;
      
      this.data.xp += xpEarned;
      this.data.correctAnswers += correct;
      this.data.totalQuestions += total;
      this.data.totalGames += 1;
      this.data.lastPlayed = new Date().toISOString();
      
      // Calculate level: level = floor(sqrt(xp / 100)) + 1
      this.data.level = Math.floor(Math.sqrt(this.data.xp / 100)) + 1;
      
      localStorage.setItem('quiz_user', JSON.stringify(this.data));
      return this.data;
    },
    
    // Get XP progress
    getXpProgress() {
      if (!this.data) return null;
      
      const currentLevelXp = (this.data.level - 1) * (this.data.level - 1) * 100;
      const nextLevelXp = this.data.level * this.data.level * 100;
      const xpInLevel = this.data.xp - currentLevelXp;
      const xpNeeded = nextLevelXp - currentLevelXp;
      const percentage = Math.round((xpInLevel / xpNeeded) * 100);
      
      return {
        current: xpInLevel,
        needed: xpNeeded,
        percentage: Math.min(percentage, 100),
        totalXp: this.data.xp
      };
    },
    
    // Get level title
    getLevelTitle() {
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
      
      const level = this.data?.level || 1;
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
    },
    
    // Get level color
    getLevelColor() {
      const level = this.data?.level || 1;
      if (level >= 10) return '#ffd700';
      if (level >= 8) return '#ff6b6b';
      if (level >= 6) return '#9b59b6';
      if (level >= 4) return '#3498db';
      if (level >= 2) return '#2ecc71';
      return '#95a5a6';
    }
  });
  
  // Quiz store
  Alpine.store('quiz', {
    questions: [],
    currentIndex: 0,
    score: 0,
    xpEarned: 0,
    correctAnswers: 0,
    streak: 0,
    maxStreak: 0,
    difficulty: 'easy',
    isActive: false,
    isFinished: false,
    
    // Start quiz
    async start(difficulty, questionCount = 5) {
      try {
        const response = await fetch('./data/questions.json');
        const data = await response.json();
        const allQuestions = data[difficulty] || [];
        
        // Shuffle and get random questions
        const shuffled = allQuestions.sort(() => Math.random() - 0.5);
        this.questions = shuffled.slice(0, Math.min(questionCount, allQuestions.length));
        
        this.currentIndex = 0;
        this.score = 0;
        this.xpEarned = 0;
        this.correctAnswers = 0;
        this.streak = 0;
        this.maxStreak = 0;
        this.difficulty = difficulty;
        this.isActive = true;
        this.isFinished = false;
        
        return this.questions;
      } catch (error) {
        console.error('Error starting quiz:', error);
        return [];
      }
    },
    
    // Get current question
    getCurrentQuestion() {
      return this.questions[this.currentIndex] || null;
    },
    
    // Answer question
    answer(answerIndex) {
      const question = this.getCurrentQuestion();
      if (!question) return null;
      
      const isCorrect = answerIndex === question.correct;
      
      if (isCorrect) {
        this.correctAnswers++;
        this.streak++;
        if (this.streak > this.maxStreak) this.maxStreak = this.streak;
        
        // Calculate XP with streak bonus
        const baseXp = { easy: 10, medium: 25, hard: 50 };
        const xp = (baseXp[this.difficulty] || 10) + Math.min(this.streak * 2, 10);
        this.xpEarned += xp;
        this.score += xp;
      } else {
        this.streak = 0;
      }
      
      this.currentIndex++;
      this.isFinished = this.currentIndex >= this.questions.length;
      
      return {
        isCorrect,
        correctIndex: question.correct,
        xpEarned: isCorrect ? (baseXp[this.difficulty] || 10) : 0,
        isFinished: this.isFinished
      };
    },
    
    // Get results
    getResults() {
      const total = this.questions.length;
      const percentage = total > 0 ? Math.round((this.correctAnswers / total) * 100) : 0;
      
      let rating;
      if (percentage >= 90) rating = 'Excellent!';
      else if (percentage >= 70) rating = 'Great Job!';
      else if (percentage >= 50) rating = 'Good Effort!';
      else if (percentage >= 30) rating = 'Keep Practicing!';
      else rating = 'Try Again!';
      
      return {
        totalQuestions: total,
        correctAnswers: this.correctAnswers,
        incorrectAnswers: total - this.correctAnswers,
        percentage,
        xpEarned: this.xpEarned,
        score: this.score,
        maxStreak: this.maxStreak,
        rating,
        difficulty: this.difficulty
      };
    },
    
    // Reset quiz
    reset() {
      this.questions = [];
      this.currentIndex = 0;
      this.score = 0;
      this.xpEarned = 0;
      this.correctAnswers = 0;
      this.streak = 0;
      this.maxStreak = 0;
      this.isActive = false;
      this.isFinished = false;
    }
  });
});
