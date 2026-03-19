// state.js — Shared game state (separate module to avoid circular imports)

export let gameState = {
  playerName: '',
  displayName: [],
  guessedLetters: [],
  livesRemaining: 6,
  difficulty: '',
  league: '',
  lifelinesUsed: { freeLetter: false, nationality: false, clubs: false, goals: false },
  playerData: {},
  gameOver: false,
  won: false
};

export function resetGameState(difficulty, league) {
  gameState.playerName = '';
  gameState.displayName = [];
  gameState.guessedLetters = [];
  gameState.livesRemaining = 6;
  gameState.difficulty = difficulty;
  gameState.league = league;
  gameState.lifelinesUsed = { freeLetter: false, nationality: false, clubs: false, goals: false };
  gameState.playerData = {};
  gameState.gameOver = false;
  gameState.won = false;
}

// Accent normalisation: guessing 'e' reveals 'é', etc.
export function normaliseChar(char) {
  return char.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

export function addGuessedLetter(letter) {
  const norm = normaliseChar(letter);
  if (!gameState.guessedLetters.includes(norm)) {
    gameState.guessedLetters.push(norm);
  }
}
