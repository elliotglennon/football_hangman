# Footballer Hangman ⚽

A browser-based Hangman game where every hidden answer is a real professional footballer. Built with vanilla HTML, CSS, and JavaScript — no frameworks, no build tools.

## Features

- Premier League players fetched live from [football-data.org](https://www.football-data.org/)
- Three difficulty levels: Easy, Medium, Hard
- Lifelines: Nationality, Clubs, Goals, Free Letter
- Progressive SVG hangman drawing
- On-screen + physical keyboard support
- Responsive — works on mobile
- Fallback to static dataset if API is unavailable

---

## Setup

### 1. Get a free API key

Register at [football-data.org](https://www.football-data.org/) to get a free tier API key (10 req/min).

### 2. Create your config file

Copy `js/config.example.js` to `js/config.js`:

```bash
cp js/config.example.js js/config.js
```

Then open `js/config.js` and replace `'YOUR_KEY_HERE'` with your actual API key:

```js
const CONFIG = {
  FOOTBALL_DATA_API_KEY: 'abc123yourkey',
  // ...
};
```

> `js/config.js` is in `.gitignore` — your key will never be committed.

### 3. Run locally

Open `index.html` directly in your browser, or use a local dev server:

```bash
# Using VS Code Live Server, or:
npx serve .
# or:
python3 -m http.server 8080
```

No API key? No problem — the game automatically falls back to a built-in dataset of ~100 Premier League players.

---

## Adding More Leagues

In `js/config.js`, add entries to the `LEAGUES` array:

```js
LEAGUES: [
  { name: 'Premier League', code: 'PL',  flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
  { name: 'La Liga',        code: 'PD',  flag: '🇪🇸' },
  { name: 'Bundesliga',     code: 'BL1', flag: '🇩🇪' },
  { name: 'Serie A',        code: 'SA',  flag: '🇮🇹' },
  { name: 'Ligue 1',        code: 'FL1', flag: '🇫🇷' },
],
```

The league selector and game tab bar render automatically from this array — no HTML changes needed.

---

## Deploy to GitHub Pages

1. Push to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to **Deploy from branch → main → / (root)**
4. Your game will be live at `https://yourusername.github.io/repo-name/`

> Note: your `config.js` (with the API key) is gitignored. On GitHub Pages the game will use the fallback dataset unless you find another way to inject the key (e.g. an environment-aware proxy).

---

## Project Structure

```
footballer-hangman/
├── index.html              # Single-page app shell
├── css/
│   └── style.css           # All styles
├── js/
│   ├── main.js             # Game state & logic
│   ├── api.js              # API calls & data fetching
│   ├── ui.js               # DOM manipulation & rendering
│   ├── lifelines.js        # Lifeline logic
│   ├── config.js           # Your API key (gitignored)
│   └── config.example.js   # Template — safe to commit
└── assets/
    └── fallback.json       # ~100 pre-loaded PL players
```
