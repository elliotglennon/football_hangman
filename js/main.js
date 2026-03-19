// main.js — Game logic and orchestration

import { fetchPlayer, fetchWikipediaImage } from './api.js';
import { gameState, resetGameState, normaliseChar, addGuessedLetter } from './state.js';
import {
  setScreen, renderHomeScreen, renderLeagueTabs, renderHangman,
  renderLetterDisplay, renderLives, renderKeyboard, updateKeyboard,
  disableKeyboard, renderDifficultyBadge, resetLifelineButtons,
  clearHints, showWinScreen, showLossScreen, showErrorScreen,
  renderPlayerIntro, setPlayerPhoto, clearPlayerIntro
} from './ui.js';
import { useNationality, useClubs, useGoals, useFreeLetter, setupLifelines } from './lifelines.js';

// ─── Helpers ─────────────────────────────────────────────────────────
function isLetterInName(letter) {
  for (const char of gameState.playerName) {
    if (/[a-zA-ZÀ-ÿ]/.test(char) && normaliseChar(char) === normaliseChar(letter)) {
      return true;
    }
  }
  return false;
}

function checkWin() {
  for (const char of gameState.playerName) {
    if (/[a-zA-ZÀ-ÿ]/.test(char)) {
      if (!gameState.guessedLetters.includes(normaliseChar(char))) {
        return false;
      }
    }
  }
  return true;
}

// ─── Core game action ────────────────────────────────────────────────
export function handleGuess(letter) {
  if (gameState.gameOver) return;
  const norm = normaliseChar(letter);
  if (gameState.guessedLetters.includes(norm)) return;

  addGuessedLetter(norm);
  const correct = isLetterInName(norm);

  updateKeyboard(norm, correct);
  if (!correct) {
    gameState.livesRemaining--;
    renderHangman(6 - gameState.livesRemaining);
    renderLives(gameState.livesRemaining);
  }

  renderLetterDisplay();

  if (checkWin()) {
    gameState.gameOver = true;
    gameState.won = true;
    disableKeyboard();
    setTimeout(() => showWinScreen(gameState.playerData), 600);
  } else if (gameState.livesRemaining <= 0) {
    gameState.gameOver = true;
    disableKeyboard();
    setTimeout(() => showLossScreen(gameState.playerData), 600);
  }
}

// ─── New game ────────────────────────────────────────────────────────
async function startGame() {
  setScreen('loading');

  const difficulty = (typeof CONFIG !== 'undefined') ? CONFIG.DIFFICULTY : 'medium';
  const league = (typeof CONFIG !== 'undefined') ? CONFIG.ACTIVE_LEAGUE : 'PL';

  resetGameState(difficulty, league);

  try {
    const player = await fetchPlayer(league, difficulty);
    gameState.playerData = player;
    gameState.playerName = player.name;

    setScreen('game');
    renderLeagueTabs();
    renderDifficultyBadge(difficulty);
    renderHangman(0);
    renderLives(6);
    renderLetterDisplay();
    resetLifelineButtons();
    clearHints();
    renderKeyboard(handleGuess);
    setupLifelines(difficulty);
    renderPlayerIntro();

    // Fetch Wikipedia photo asynchronously — don't block game start
    fetchWikipediaImage(player.name).then(url => setPlayerPhoto(url));

    document.removeEventListener('keydown', handleKeyDown);
    document.addEventListener('keydown', handleKeyDown);

  } catch (err) {
    console.error('Failed to start game:', err);
    showErrorScreen(err.message);
  }
}

function handleKeyDown(e) {
  if (gameState.gameOver) return;
  if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
    handleGuess(e.key.toLowerCase());
  }
}

// ─── Navigation ──────────────────────────────────────────────────────
export function goHome() {
  document.removeEventListener('keydown', handleKeyDown);
  clearPlayerIntro();
  setScreen('home');
  renderHomeScreen();
}

// ─── Boot ────────────────────────────────────────────────────────────
function init() {
  const howBtn = document.getElementById('how-to-play-btn');
  const howContent = document.getElementById('how-to-play-content');
  if (howBtn && howContent) {
    howBtn.addEventListener('click', () => {
      const open = howContent.classList.toggle('open');
      howBtn.setAttribute('aria-expanded', String(open));
    });
  }

  document.getElementById('play-btn')?.addEventListener('click', startGame);

  document.querySelectorAll('.play-again-btn').forEach(btn => {
    btn.addEventListener('click', goHome);
  });

  document.getElementById('retry-btn')?.addEventListener('click', startGame);

  document.getElementById('lifeline-freeLetter')?.addEventListener('click', useFreeLetter);
  document.getElementById('lifeline-nationality')?.addEventListener('click', useNationality);
  document.getElementById('lifeline-clubs')?.addEventListener('click', useClubs);
  document.getElementById('lifeline-goals')?.addEventListener('click', useGoals);

  renderHomeScreen();
  setScreen('home');
}

document.addEventListener('DOMContentLoaded', init);
