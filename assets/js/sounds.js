// Sound effects module for Quiz app

// Audio context for generating sounds
let audioContext = null;

// Initialize audio context on first user interaction
function initAudio() {
  if (!audioContext) {
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioContext;
}

// Generate beep sound for button clicks
function playButtonSound() {
  try {
    const ctx = initAudio();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.1);
  } catch (e) {
    console.log('Audio not supported');
  }
}

// Generate applause sound (celebration)
function playApplauseSound() {
  try {
    const ctx = initAudio();
    const duration = 1.5;
    
    // Create noise for applause
    for (let i = 0; i < 50; i++) {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);
      
      oscillator.type = 'sawtooth';
      oscillator.frequency.value = 100 + Math.random() * 200;
      
      const startTime = ctx.currentTime + Math.random() * duration;
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.1, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
      
      oscillator.start(startTime);
      oscillator.stop(startTime + 0.3);
    }
  } catch (e) {
    console.log('Audio not supported');
  }
}

// Generate groan/disappointment sound
function playGroanSound() {
  try {
    const ctx = initAudio();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sawtooth';
    oscillator.frequency.setValueAtTime(200, ctx.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(80, ctx.currentTime + 0.5);
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.5);
  } catch (e) {
    console.log('Audio not supported');
  }
}

// Generate correct answer sound (pleasant ding)
function playCorrectSound() {
  try {
    const ctx = initAudio();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523, ctx.currentTime); // C5
    oscillator.frequency.setValueAtTime(659, ctx.currentTime + 0.1); // E5
    
    gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.log('Audio not supported');
  }
}

// Generate wrong answer sound (buzz)
function playWrongSound() {
  try {
    const ctx = initAudio();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(150, ctx.currentTime);
    oscillator.frequency.setValueAtTime(100, ctx.currentTime + 0.15);
    
    gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 0.3);
  } catch (e) {
    console.log('Audio not supported');
  }
}

// Background music using Web Audio API
let bgmOscillators = [];
let bgmGain = null;
let isBgmPlaying = false;

function playBackgroundMusic() {
  if (isBgmPlaying) return;
  
  try {
    const ctx = initAudio();
    bgmGain = ctx.createGain();
    bgmGain.connect(ctx.destination);
    bgmGain.gain.value = 0.05; // Very quiet background music
    
    // Simple melody loop
    const melody = [261, 293, 329, 349, 392, 329, 293, 261]; // C D E F G E D C
    let noteIndex = 0;
    
    function playNote() {
      if (!isBgmPlaying) return;
      
      const osc = ctx.createOscillator();
      const noteGain = ctx.createGain();
      
      osc.connect(noteGain);
      noteGain.connect(bgmGain);
      
      osc.type = 'sine';
      osc.frequency.value = melody[noteIndex];
      
      noteGain.gain.setValueAtTime(0.5, ctx.currentTime);
      noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.4);
      
      noteIndex = (noteIndex + 1) % melody.length;
      
      setTimeout(playNote, 500);
    }
    
    isBgmPlaying = true;
    playNote();
  } catch (e) {
    console.log('Audio not supported');
  }
}

function stopBackgroundMusic() {
  isBgmPlaying = false;
  if (bgmGain) {
    bgmGain.disconnect();
    bgmGain = null;
  }
}

// Export functions
window.SoundManager = {
  playButton: playButtonSound,
  playApplause: playApplauseSound,
  playGroan: playGroanSound,
  playCorrect: playCorrectSound,
  playWrong: playWrongSound,
  playBgm: playBackgroundMusic,
  stopBgm: stopBackgroundMusic,
  initAudio: initAudio
};
