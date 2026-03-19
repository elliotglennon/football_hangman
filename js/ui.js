// ui.js — DOM manipulation and rendering

import { gameState } from './state.js';

// ─── Screen management ──────────────────────────────────────────────
export function setScreen(name) {
  document.body.setAttribute('data-screen', name);
  window.scrollTo(0, 0);
}

// Default leagues — used when config.js is absent (e.g. GitHub Pages)
const DEFAULT_LEAGUES = [
  { name: 'Premier League', code: 'PL',  flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'La Liga',        code: 'PD',  flag: '🇪🇸' },
  { name: 'Bundesliga',     code: 'BL1', flag: '🇩🇪' },
  { name: 'Serie A',        code: 'SA',  flag: '🇮🇹' },
  { name: 'Ligue 1',        code: 'FL1', flag: '🇫🇷' },
];

// ─── Home screen ────────────────────────────────────────────────────
export function renderHomeScreen() {
  const leagues = (typeof CONFIG !== 'undefined') ? CONFIG.LEAGUES : DEFAULT_LEAGUES;
  const activeLeague = (typeof CONFIG !== 'undefined') ? CONFIG.ACTIVE_LEAGUE : 'PL';
  const activeDifficulty = (typeof CONFIG !== 'undefined') ? CONFIG.DIFFICULTY : 'medium';

  // League cards
  const leagueContainer = document.getElementById('league-cards');
  leagueContainer.innerHTML = '';
  for (const league of leagues) {
    const card = document.createElement('button');
    card.className = 'league-card' + (league.code === activeLeague ? ' active' : '');
    card.setAttribute('aria-label', `Select ${league.name}`);
    card.dataset.code = league.code;
    card.innerHTML = `<span class="league-flag">${league.flag}</span><span class="league-name">${league.name}</span>`;
    card.addEventListener('click', () => {
      if (typeof CONFIG !== 'undefined') CONFIG.ACTIVE_LEAGUE = league.code;
      document.querySelectorAll('.league-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      sessionStorage.setItem('activeLeague', league.code);
    });
    leagueContainer.appendChild(card);
  }

  // Difficulty cards
  const difficulties = [
    { key: 'easy',   emoji: '🟢', label: 'Easy',   desc: 'Star players from top nations',     lifelines: '4 lifelines' },
    { key: 'medium', emoji: '🟡', label: 'Medium', desc: 'Solid squad players',                lifelines: '3 lifelines' },
    { key: 'hard',   emoji: '🔴', label: 'Hard',   desc: 'Fringe players & rare nationalities', lifelines: '2 lifelines, no free letter' }
  ];
  const diffContainer = document.getElementById('difficulty-cards');
  diffContainer.innerHTML = '';
  for (const d of difficulties) {
    const card = document.createElement('button');
    card.className = 'difficulty-card' + (d.key === activeDifficulty ? ' active' : '');
    card.setAttribute('aria-label', `Select ${d.label} difficulty`);
    card.dataset.difficulty = d.key;
    card.innerHTML = `
      <span class="diff-emoji">${d.emoji}</span>
      <span class="diff-label">${d.label}</span>
      <span class="diff-desc">${d.desc}</span>
      <span class="diff-lifelines">${d.lifelines}</span>
    `;
    card.addEventListener('click', () => {
      if (typeof CONFIG !== 'undefined') CONFIG.DIFFICULTY = d.key;
      document.querySelectorAll('.difficulty-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      sessionStorage.setItem('activeDifficulty', d.key);
    });
    diffContainer.appendChild(card);
  }

  // Restore selections from sessionStorage
  const savedLeague = sessionStorage.getItem('activeLeague');
  const savedDifficulty = sessionStorage.getItem('activeDifficulty');
  if (savedLeague && typeof CONFIG !== 'undefined') {
    CONFIG.ACTIVE_LEAGUE = savedLeague;
    document.querySelectorAll('.league-card').forEach(c => {
      c.classList.toggle('active', c.dataset.code === savedLeague);
    });
  }
  if (savedDifficulty && typeof CONFIG !== 'undefined') {
    CONFIG.DIFFICULTY = savedDifficulty;
    document.querySelectorAll('.difficulty-card').forEach(c => {
      c.classList.toggle('active', c.dataset.difficulty === savedDifficulty);
    });
  }
}

// ─── League tab bar on game screen ──────────────────────────────────
export function renderLeagueTabs() {
  const leagues = (typeof CONFIG !== 'undefined') ? CONFIG.LEAGUES : DEFAULT_LEAGUES;
  const activeLeague = (typeof CONFIG !== 'undefined') ? CONFIG.ACTIVE_LEAGUE : 'PL';
  const tabBar = document.getElementById('league-tab-bar');
  tabBar.innerHTML = '';
  for (const league of leagues) {
    const tab = document.createElement('button');
    tab.className = 'league-tab' + (league.code === activeLeague ? ' active' : '');
    tab.setAttribute('aria-label', `${league.name} — click to change league`);
    tab.innerHTML = `${league.flag} ${league.name}`;
    tab.addEventListener('click', () => {
      // Return to home with league pre-selected
      if (typeof CONFIG !== 'undefined') CONFIG.ACTIVE_LEAGUE = league.code;
      sessionStorage.setItem('activeLeague', league.code);
      import('./main.js').then(m => m.goHome());
    });
    tabBar.appendChild(tab);
  }
}

// ─── Player intro panel (photo + starter clues) ──────────────────────
export function renderPlayerIntro() {
  const panel = document.getElementById('player-intro');
  if (!panel) return;
  panel.innerHTML = `
    <div class="intro-photo-wrap" id="intro-photo-wrap">
      <div class="intro-photo-placeholder" aria-label="Loading player photo">
        <span class="photo-spinner">⚽</span>
      </div>
    </div>
  `;
}

export function setPlayerPhoto(imageUrl) {
  const wrap = document.getElementById('intro-photo-wrap');
  if (!wrap) return;
  if (imageUrl) {
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = 'Mystery footballer';
    img.className = 'intro-photo';
    img.addEventListener('load', () => { wrap.innerHTML = ''; wrap.appendChild(img); });
    img.addEventListener('error', () => { wrap.innerHTML = '<div class="intro-photo-placeholder">🧍</div>'; });
    // Start loading (load event fires when done)
    wrap.appendChild(img);
    wrap.querySelector('.intro-photo-placeholder')?.remove();
  } else {
    wrap.innerHTML = '<div class="intro-photo-placeholder">🧍</div>';
  }
}

export function clearPlayerIntro() {
  const panel = document.getElementById('player-intro');
  if (panel) panel.innerHTML = '';
}

// ─── Hangman SVG ────────────────────────────────────────────────────
const SVG_PARTS = [
  // 0 wrong: gallows base (always visible)
  // Parts added with wrong guesses:
  // 1: post
  (svg) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '80'); line.setAttribute('y1', '20');
    line.setAttribute('x2', '80'); line.setAttribute('y2', '200');
    line.setAttribute('class', 'hangman-part');
    svg.appendChild(line);
  },
  // 2: top beam
  (svg) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '80'); line.setAttribute('y1', '20');
    line.setAttribute('x2', '200'); line.setAttribute('y2', '20');
    line.setAttribute('class', 'hangman-part');
    svg.appendChild(line);
  },
  // 3: rope
  (svg) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '200'); line.setAttribute('y1', '20');
    line.setAttribute('x2', '200'); line.setAttribute('y2', '50');
    line.setAttribute('class', 'hangman-part');
    svg.appendChild(line);
  },
  // 4: head
  (svg) => {
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '200'); circle.setAttribute('cy', '70');
    circle.setAttribute('r', '20');
    circle.setAttribute('class', 'hangman-part');
    svg.appendChild(circle);
  },
  // 5: body
  (svg) => {
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', '200'); line.setAttribute('y1', '90');
    line.setAttribute('x2', '200'); line.setAttribute('y2', '145');
    line.setAttribute('class', 'hangman-part');
    svg.appendChild(line);
  },
  // 6: legs (both at once)
  (svg) => {
    const leftLeg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    leftLeg.setAttribute('x1', '200'); leftLeg.setAttribute('y1', '145');
    leftLeg.setAttribute('x2', '170'); leftLeg.setAttribute('y2', '185');
    leftLeg.setAttribute('class', 'hangman-part');
    svg.appendChild(leftLeg);
    const rightLeg = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    rightLeg.setAttribute('x1', '200'); rightLeg.setAttribute('y1', '145');
    rightLeg.setAttribute('x2', '230'); rightLeg.setAttribute('y2', '185');
    rightLeg.setAttribute('class', 'hangman-part');
    svg.appendChild(rightLeg);
  }
];

export function renderHangman(wrongGuesses) {
  const svg = document.getElementById('hangman-svg');
  // Remove all existing hangman parts (keep base)
  svg.querySelectorAll('.hangman-part').forEach(el => el.remove());
  // Add parts for each wrong guess
  for (let i = 0; i < wrongGuesses && i < SVG_PARTS.length; i++) {
    SVG_PARTS[i](svg);
  }
}

// ─── Letter display ─────────────────────────────────────────────────
export function renderLetterDisplay() {
  const container = document.getElementById('letter-display');
  container.innerHTML = '';
  const { playerName, guessedLetters } = gameState;

  // Split by spaces to group words
  const words = playerName.split(' ');

  for (let w = 0; w < words.length; w++) {
    const wordEl = document.createElement('div');
    wordEl.className = 'word-group';

    for (let c = 0; c < words[w].length; c++) {
      const char = words[w][c];
      const tile = document.createElement('div');

      if (/[a-zA-ZÀ-ÿ]/.test(char)) {
        const normalised = char.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        const revealed = guessedLetters.includes(normalised);
        tile.className = 'letter-tile' + (revealed ? ' revealed' : '');
        tile.textContent = revealed ? char.toUpperCase() : '';
        tile.setAttribute('aria-label', revealed ? `Letter ${char.toUpperCase()}, revealed` : 'Hidden letter');
      } else {
        // Hyphen, apostrophe etc — always visible
        tile.className = 'letter-tile punctuation';
        tile.textContent = char;
        tile.setAttribute('aria-label', `Punctuation: ${char}`);
      }

      wordEl.appendChild(tile);
    }

    container.appendChild(wordEl);

    // Space between words
    if (w < words.length - 1) {
      const spacer = document.createElement('div');
      spacer.className = 'word-spacer';
      container.appendChild(spacer);
    }
  }
}

// ─── Lives display ──────────────────────────────────────────────────
export function renderLives(lives) {
  const container = document.getElementById('lives-display');
  container.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const ball = document.createElement('span');
    ball.className = 'life-ball' + (i < lives ? '' : ' lost');
    ball.textContent = '⚽';
    ball.setAttribute('aria-label', i < lives ? 'Life remaining' : 'Life lost');
    container.appendChild(ball);
  }
}

// ─── On-screen keyboard ──────────────────────────────────────────────
export function renderKeyboard(onLetterClick) {
  const container = document.getElementById('keyboard');
  container.innerHTML = '';
  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i).toLowerCase();
    const btn = document.createElement('button');
    btn.className = 'key-btn';
    btn.textContent = letter.toUpperCase();
    btn.dataset.letter = letter;
    btn.setAttribute('aria-label', `Guess letter ${letter.toUpperCase()}`);
    btn.addEventListener('click', () => onLetterClick(letter));
    container.appendChild(btn);
  }
}

export function updateKeyboard(letter, correct) {
  const btn = document.querySelector(`.key-btn[data-letter="${letter}"]`);
  if (btn) {
    btn.classList.add(correct ? 'correct' : 'incorrect');
    btn.disabled = true;
    btn.setAttribute('aria-label', `Letter ${letter.toUpperCase()} — ${correct ? 'correct' : 'incorrect'}`);
  }
}

export function disableKeyboard() {
  document.querySelectorAll('.key-btn').forEach(btn => { btn.disabled = true; });
}

// ─── Difficulty badge ────────────────────────────────────────────────
export function renderDifficultyBadge(difficulty) {
  const badge = document.getElementById('difficulty-badge');
  const map = { easy: '🟢 Easy', medium: '🟡 Medium', hard: '🔴 Hard' };
  badge.textContent = map[difficulty] || difficulty;
  badge.dataset.difficulty = difficulty;
}

// ─── Lifelines ───────────────────────────────────────────────────────
export function markLifelineUsed(id) {
  const btn = document.getElementById(`lifeline-${id}`);
  if (btn) {
    btn.classList.add('used');
    btn.disabled = true;
    btn.setAttribute('aria-pressed', 'true');
  }
}

export function markLifelineUnavailable(id, difficulty) {
  const btn = document.getElementById(`lifeline-${id}`);
  if (btn) {
    btn.classList.add('locked');
    btn.disabled = true;
    btn.setAttribute('aria-label', btn.getAttribute('aria-label') + ` — Not available on ${difficulty} difficulty`);
    // Replace icon with padlock
    const icon = btn.querySelector('.lifeline-icon');
    if (icon) icon.textContent = '🔒';
    btn.title = `Not available on ${difficulty} difficulty`;
  }
}

export function resetLifelineButtons() {
  ['freeLetter', 'nationality', 'clubs', 'goals'].forEach(id => {
    const btn = document.getElementById(`lifeline-${id}`);
    if (btn) {
      btn.classList.remove('used', 'locked');
      btn.disabled = false;
      btn.setAttribute('aria-pressed', 'false');
      // Restore icons
      const icons = { freeLetter: '💌', nationality: '🌍', clubs: '🏟️', goals: '⚽' };
      const icon = btn.querySelector('.lifeline-icon');
      if (icon) icon.textContent = icons[id];
      btn.title = '';
    }
  });
}

// ─── Hints ───────────────────────────────────────────────────────────
export function showHint(type, text) {
  const container = document.getElementById('hints-display');
  // Check if hint of this type already shown
  let existing = container.querySelector(`[data-hint="${type}"]`);
  if (!existing) {
    existing = document.createElement('div');
    existing.className = 'hint';
    existing.dataset.hint = type;
    container.appendChild(existing);
  }
  existing.textContent = text;
}

export function clearHints() {
  const container = document.getElementById('hints-display');
  if (container) container.innerHTML = '';
}

// ─── Win / Loss screens ──────────────────────────────────────────────
export function showWinScreen(playerData) {
  setScreen('win');
  document.getElementById('win-name').textContent = playerData.name;
  const clubs = playerData.clubs?.join(', ') || 'Unknown clubs';
  const nat = playerData.nationality || 'Unknown nationality';
  document.getElementById('win-flavour').textContent = `${nat} · ${clubs}`;
  startConfetti();
}

export function showLossScreen(playerData) {
  setScreen('loss');
  document.getElementById('loss-name').textContent = playerData.name;
}

// ─── Confetti (CSS-only particle burst) ─────────────────────────────
function startConfetti() {
  const container = document.getElementById('confetti-container');
  container.innerHTML = '';
  const colours = ['#f0b429', '#ffffff', '#4caf50', '#e53e3e', '#2196f3'];
  for (let i = 0; i < 60; i++) {
    const dot = document.createElement('div');
    dot.className = 'confetti-dot';
    dot.style.left = Math.random() * 100 + 'vw';
    dot.style.animationDelay = Math.random() * 1.5 + 's';
    dot.style.animationDuration = (1.5 + Math.random() * 2) + 's';
    dot.style.background = colours[Math.floor(Math.random() * colours.length)];
    dot.style.width = dot.style.height = (6 + Math.random() * 8) + 'px';
    container.appendChild(dot);
  }
  setTimeout(() => { container.innerHTML = ''; }, 5000);
}

// ─── Error screen ────────────────────────────────────────────────────
export function showErrorScreen(message) {
  setScreen('error');
  const el = document.getElementById('error-message');
  if (el) el.textContent = message || "Couldn't find a footballer — check your connection and API key.";
}
