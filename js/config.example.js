const CONFIG = {
  FOOTBALL_DATA_API_KEY: 'YOUR_KEY_HERE',
  LEAGUES: [
    { name: 'Premier League', code: 'PL',  flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { name: 'La Liga',        code: 'PD',  flag: '🇪🇸' },
    { name: 'Bundesliga',     code: 'BL1', flag: '🇩🇪' },
    { name: 'Serie A',        code: 'SA',  flag: '🇮🇹' },
    { name: 'Ligue 1',        code: 'FL1', flag: '🇫🇷' },
  ],
  ACTIVE_LEAGUE: 'PL',
  DIFFICULTY: 'medium',
  DIFFICULTY_SETTINGS: {
    easy:   { lifelineCount: 4, allowFreeLetter: true },
    medium: { lifelineCount: 3, allowFreeLetter: true },
    hard:   { lifelineCount: 2, allowFreeLetter: false }
  }
};
