// Quiz flow logic module

import { shuffleArray, getRandomItems } from '../utils/helpers.js';
import { calculateXpReward } from './level.js';

let questions = [];
let currentQuestions = [];
let currentIndex = 0;
let score = 0;
let correctAnswers = 0;
let xpEarned = 0;
let streak = 0;
let maxStreak = 0;
let difficulty = 'easy';
let timePerQuestion = 15;
let timer = null;
let timeLeft = 0;

/**
 * Load questions from JSON
 * @param {string} difficultyLevel - Difficulty level (easy, medium, hard)
 * @param {string} dataFile - Data file name (default: questions.json)
 * @returns {Promise<Array>} Questions array
 */
export async function loadQuestions(difficultyLevel = 'easy', dataFile = 'questions.json') {
  try {
    const response = await fetch(`./data/${dataFile}`);
    const data = await response.json();
    questions = data[difficultyLevel] || [];
    return questions;
  } catch (error) {
    console.error('Error loading questions:', error);
    return [];
  }
}

/**
 * Start a new quiz
 * @param {string} difficultyLevel - Difficulty level
 * @param {number} questionCount - Number of questions
 * @returns {Object} First question and game state
 */
export function startQuiz(difficultyLevel, questionCount = 5) {
  difficulty = difficultyLevel;
  
  // Set time per question based on difficulty
  timePerQuestion = difficultyLevel === 'easy' ? 20 : difficultyLevel === 'medium' ? 15 : 10;
  
  // Shuffle and get random questions
  const shuffled = shuffleArray(questions);
  currentQuestions = shuffled.slice(0, Math.min(questionCount, shuffled.length));
  
  // Reset game state
  currentIndex = 0;
  score = 0;
  correctAnswers = 0;
  xpEarned = 0;
  streak = 0;
  maxStreak = 0;
  
  return {
    questions: currentQuestions,
    totalQuestions: currentQuestions.length,
    difficulty: difficulty
  };
}

/**
 * Get current question
 * @returns {Object} Current question object
 */
export function getCurrentQuestion() {
  return currentQuestions[currentIndex] || null;
}

/**
 * Answer a question
 * @param {number} answerIndex - Index of selected answer
 * @returns {Object} Answer result
 */
export function answerQuestion(answerIndex) {
  const question = getCurrentQuestion();
  if (!question) return null;
  
  const isCorrect = answerIndex === question.correct;
  
  if (isCorrect) {
    correctAnswers++;
    streak++;
    if (streak > maxStreak) maxStreak = streak;
    
    const xp = calculateXpReward(difficulty, streak);
    xpEarned += xp;
    score += xp;
  } else {
    streak = 0;
  }
  
  currentIndex++;
  
  return {
    isCorrect,
    correctIndex: question.correct,
    xpEarned: isCorrect ? calculateXpReward(difficulty, streak - 1) : 0,
    totalXp: xpEarned,
    streak: isCorrect ? streak : 0,
    isFinished: currentIndex >= currentQuestions.length
  };
}

/**
 * Get quiz progress
 * @returns {Object} Progress object
 */
export function getProgress() {
  return {
    current: currentIndex,
    total: currentQuestions.length,
    percentage: Math.round((currentIndex / currentQuestions.length) * 100),
    score: score,
    xpEarned: xpEarned,
    correctAnswers: correctAnswers,
    streak: streak,
    maxStreak: maxStreak
  };
}

/**
 * Check if quiz is finished
 * @returns {boolean} True if finished
 */
export function isFinished() {
  return currentIndex >= currentQuestions.length;
}

/**
 * Get quiz results
 * @returns {Object} Final results
 */
export function getResults() {
  const totalQuestions = currentQuestions.length;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  
  let rating;
  if (percentage >= 90) rating = 'Excellent!';
  else if (percentage >= 70) rating = 'Great Job!';
  else if (percentage >= 50) rating = 'Good Effort!';
  else if (percentage >= 30) rating = 'Keep Practicing!';
  else rating = 'Try Again!';
  
  return {
    totalQuestions,
    correctAnswers,
    incorrectAnswers: totalQuestions - correctAnswers,
    percentage,
    xpEarned,
    score,
    streak: maxStreak,
    rating,
    difficulty
  };
}

/**
 * Start timer for question
 * @param {Function} onTick - Callback for each tick
 * @param {Function} onTimeout - Callback when time runs out
 */
export function startTimer(onTick, onTimeout) {
  stopTimer();
  timeLeft = timePerQuestion;
  
  timer = setInterval(() => {
    timeLeft--;
    if (onTick) onTick(timeLeft);
    
    if (timeLeft <= 0) {
      stopTimer();
      if (onTimeout) onTimeout();
    }
  }, 1000);
}

/**
 * Stop the timer
 */
export function stopTimer() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

/**
 * Get time left for current question
 * @returns {number} Time left in seconds
 */
export function getTimeLeft() {
  return timeLeft;
}

/**
 * Reset quiz state
 */
export function resetQuiz() {
  currentQuestions = [];
  currentIndex = 0;
  score = 0;
  correctAnswers = 0;
  xpEarned = 0;
  streak = 0;
  maxStreak = 0;
  stopTimer();
}
