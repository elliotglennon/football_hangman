// lifelines.js — Lifeline logic

import { gameState, addGuessedLetter } from './state.js';
import { renderLetterDisplay, showHint, markLifelineUsed, markLifelineUnavailable } from './ui.js';

// Nationality → flag emoji mapping (common football nations)
const FLAG_MAP = {
  'English': '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  'Scottish': '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
  'Welsh': '🏴󠁧󠁢󠁷󠁬󠁳󠁿',
  'Irish': '🇮🇪',
  'Northern Irish': '🇬🇧',
  'Brazilian': '🇧🇷',
  'French': '🇫🇷',
  'Argentine': '🇦🇷',
  'Spanish': '🇪🇸',
  'Portuguese': '🇵🇹',
  'German': '🇩🇪',
  'Dutch': '🇳🇱',
  'Belgian': '🇧🇪',
  'Italian': '🇮🇹',
  'Norwegian': '🇳🇴',
  'Swedish': '🇸🇪',
  'Danish': '🇩🇰',
  'Croatian': '🇭🇷',
  'Serbian': '🇷🇸',
  'Polish': '🇵🇱',
  'Czech': '🇨🇿',
  'Slovak': '🇸🇰',
  'Austrian': '🇦🇹',
  'Swiss': '🇨🇭',
  'Greek': '🇬🇷',
  'Turkish': '🇹🇷',
  'South Korean': '🇰🇷',
  'Japanese': '🇯🇵',
  'Moroccan': '🇲🇦',
  'Algerian': '🇩🇿',
  'Tunisian': '🇹🇳',
  'Senegalese': '🇸🇳',
  'Ghanaian': '🇬🇭',
  'Nigerian': '🇳🇬',
  'Ivorian': '🇨🇮',
  'Cameroonian': '🇨🇲',
  'Egyptian': '🇪🇬',
  'Malian': '🇲🇱',
  'Ecuadorian': '🇪🇨',
  'Colombian': '🇨🇴',
  'Uruguayan': '🇺🇾',
  'Chilean': '🇨🇱',
  'Mexican': '🇲🇽',
  'American': '🇺🇸',
  'Canadian': '🇨🇦',
  'Australian': '🇦🇺',
  'New Zealander': '🇳🇿',
  'Icelandic': '🇮🇸',
  'Romanian': '🇷🇴',
  'Hungarian': '🇭🇺',
  'Ukrainian': '🇺🇦',
  'Russian': '🇷🇺',
  'Jamaican': '🇯🇲',
  'Trinidadian': '🇹🇹',
  'Albanian': '🇦🇱',
  'Montenegrin': '🇲🇪',
  'Bosnian': '🇧🇦',
  'Slovenian': '🇸🇮',
  'Finnish': '🇫🇮',
  'Israeli': '🇮🇱',
  'Georgian': '🇬🇪',
  'Kosovan': '🇽🇰',
  'North Macedonian': '🇲🇰',
  'Guinean': '🇬🇳',
  'Congolese': '🇨🇩',
  'Angolan': '🇦🇴',
  'Mozambican': '🇲🇿',
  'Zimbabwean': '🇿🇼',
  'South African': '🇿🇦',
  'Ugandan': '🇺🇬',
  'Kenyan': '🇰🇪',
  'Burkina Faso': '🇧🇫',
  'Burkinabé': '🇧🇫',
  'Gabonese': '🇬🇦',
};

function getFlagForNationality(nationality) {
  if (!nationality) return '🌍';
  for (const [key, flag] of Object.entries(FLAG_MAP)) {
    if (nationality.toLowerCase().includes(key.toLowerCase())) return flag;
  }
  return '🌍';
}

function useNationality() {
  const { playerData, lifelinesUsed } = gameState;
  if (lifelinesUsed.nationality) return;
  gameState.lifelinesUsed.nationality = true;
  markLifelineUsed('nationality');
  const nat = playerData.nationality || null;
  if (!nat) {
    showHint('nationality', '❓ Nationality not available for this player');
  } else {
    const flag = getFlagForNationality(nat);
    showHint('nationality', `${flag} ${nat}`);
  }
}

function useClubs() {
  const { playerData, lifelinesUsed } = gameState;
  if (lifelinesUsed.clubs) return;
  gameState.lifelinesUsed.clubs = true;
  markLifelineUsed('clubs');
  const clubs = playerData.clubs;
  if (!clubs || !clubs.length) {
    showHint('clubs', '❓ Club history not available for this player');
  } else {
    showHint('clubs', `🏟️ Has played for: ${clubs.join(', ')}`);
  }
}

function useGoals() {
  const { playerData, lifelinesUsed } = gameState;
  if (lifelinesUsed.goals) return;
  gameState.lifelinesUsed.goals = true;
  markLifelineUsed('goals');
  const goals = playerData.goals;
  if (goals === null || goals === undefined) {
    showHint('goals', '❓ Goals data not available for this player');
  } else {
    showHint('goals', `⚽ ${goals} career goals`);
  }
}

function useFreeLetter() {
  const { lifelinesUsed, guessedLetters, playerName, gameOver } = gameState;
  if (lifelinesUsed.freeLetter || gameOver) return;
  gameState.lifelinesUsed.freeLetter = true;
  markLifelineUsed('freeLetter');

  // Normalize the player name to find available consonants
  const VOWELS = 'aeiou';
  // Get all unique letters in the name
  const nameNormalized = playerName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const unguessedConsonants = [];

  for (const char of nameNormalized) {
    if (/[a-z]/.test(char) && !VOWELS.includes(char)) {
      // Check if this consonant (or its accented form) hasn't been guessed
      if (!guessedLetters.includes(char) && !unguessedConsonants.includes(char)) {
        unguessedConsonants.push(char);
      }
    }
  }

  if (unguessedConsonants.length === 0) {
    showHint('freeLetter', '✅ All consonants already revealed!');
    return;
  }

  const randomConsonant = unguessedConsonants[Math.floor(Math.random() * unguessedConsonants.length)];
  addGuessedLetter(randomConsonant);
  renderLetterDisplay();
}

function setupLifelines(difficulty) {
  // Hard: no freeLetter or goals
  if (difficulty === 'hard') {
    markLifelineUnavailable('freeLetter', difficulty);
    markLifelineUnavailable('goals', difficulty);
  }
}

export { useNationality, useClubs, useGoals, useFreeLetter, setupLifelines };
