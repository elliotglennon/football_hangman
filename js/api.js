// api.js — All API calls and data fetching

const HIGH_PROFILE_NATIONS = ['English','Brazilian','French','Argentine','Spanish','Portuguese','German','Dutch'];
const EASY_POSITIONS = ['Forward', 'Winger', 'Attacking Midfield'];
const HARD_POSITIONS = ['Goalkeeper'];

function filterByDifficulty(players, difficulty) {
  if (difficulty === 'easy') {
    const filtered = players.filter(p =>
      EASY_POSITIONS.some(pos => p.position?.includes(pos)) &&
      HIGH_PROFILE_NATIONS.some(nat => p.nationality?.includes(nat))
    );
    if (filtered.length >= 3) return filtered;
    console.warn('Easy pool too small, using full pool');
    return players;
  }
  if (difficulty === 'hard') {
    const filtered = players.filter(p =>
      HARD_POSITIONS.some(pos => p.position?.includes(pos)) ||
      !HIGH_PROFILE_NATIONS.some(nat => p.nationality?.includes(nat))
    );
    if (filtered.length >= 3) return filtered;
    console.warn('Hard pool too small, using full pool');
    return players;
  }
  // medium: everything not caught by easy or hard
  const filtered = players.filter(p =>
    !EASY_POSITIONS.some(pos => p.position?.includes(pos)) &&
    !HARD_POSITIONS.some(pos => p.position?.includes(pos))
  );
  if (filtered.length >= 3) return filtered;
  console.warn('Medium pool too small, using full pool');
  return players;
}

function normalisePlayer(raw) {
  // Map API response shape to our internal shape
  return {
    name: raw.name || raw.shortName || '',
    nationality: raw.nationality || '',
    position: raw.position || '',
    clubs: raw.currentTeam ? [raw.currentTeam.name] : [],
    goals: null // goals not directly in API; lifeline will show "N/A"
  };
}

async function fetchFromAPI(leagueCode, difficulty) {
  // CONFIG may not exist if user hasn't set up config.js
  if (typeof CONFIG === 'undefined' || !CONFIG.FOOTBALL_DATA_API_KEY || CONFIG.FOOTBALL_DATA_API_KEY === 'YOUR_KEY_HERE') {
    throw new Error('No API key configured');
  }

  const headers = { 'X-Auth-Token': CONFIG.FOOTBALL_DATA_API_KEY };

  // Fetch teams in the competition
  const teamsRes = await fetch(`https://api.football-data.org/v4/competitions/${leagueCode}/teams`, { headers });
  if (!teamsRes.ok) throw new Error(`Teams API error: ${teamsRes.status}`);
  const teamsData = await teamsRes.json();
  const teams = teamsData.teams || [];

  if (!teams.length) throw new Error('No teams returned');

  // Collect all squad members from all teams
  let allPlayers = [];
  for (const team of teams) {
    const squad = team.squad || [];
    for (const player of squad) {
      allPlayers.push({ ...player, currentTeam: { name: team.name, id: team.id } });
    }
  }

  if (!allPlayers.length) throw new Error('No players in squads');

  const normalised = allPlayers.map(normalisePlayer).filter(p => p.name);
  const filtered = filterByDifficulty(normalised, difficulty);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

async function fetchFromFallback(difficulty) {
  const res = await fetch('./assets/fallback.json');
  if (!res.ok) throw new Error('Fallback JSON failed to load');
  const players = await res.json();
  const filtered = filterByDifficulty(players, difficulty);
  return filtered[Math.floor(Math.random() * filtered.length)];
}

async function fetchPlayer(leagueCode, difficulty) {
  try {
    const player = await fetchFromAPI(leagueCode, difficulty);
    return player;
  } catch (err) {
    console.warn('Live API failed, falling back to static dataset:', err.message);
  }
  try {
    const player = await fetchFromFallback(difficulty);
    return player;
  } catch (err) {
    throw new Error('Both API and fallback failed: ' + err.message);
  }
}

export { fetchPlayer };
