# CYBER// BREACH

A cybersecurity-awareness training game, built as a bigger, React-powered follow-up to the
[cyberbreachchi](../Cyber-Breach/cyber-breachchi) prototype and inspired by the
"First Cyber Breach Quest" concept.

## What it is

You play a Junior Security Officer working through a mission map of realistic security
scenarios — phishing emails, suspicious calls, a dropped USB drive, a ransomware incident,
an insider-threat request, and more — ending in a multi-step "Full Breach Response" boss
mission. Each mission opens with a Mega Man-style action stage: move your character with
the arrow keys/WASD and shoot the threat enemies themed to that mission's category (phishing
lures, malware blobs, ransomware nodes, etc.) before the briefing and quiz unlock. Clearing
the action stage leads into the briefing/quiz, which gives immediate feedback explaining
*why* an answer is right or wrong, awards XP, and unlocks the next mission. XP drives a rank
progression from Rookie up to Elite Commander. Progress is saved to the browser's local
storage.

## Running it

```bash
npm install
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

## Project structure

- `src/data/missions.js` — all mission content (briefing, choices, correct answer, explanations).
- `src/data/ranks.js` — XP-to-rank thresholds.
- `src/state/useGameState.js` — game state + localStorage persistence.
- `src/data/characters.js` — character names/colors shared by character select and the action stage.
- `src/components/` — screens: `CharacterSelect`, `HQ`, `MissionMap`, `Mission`.
- `src/components/ActionStage.jsx` — the canvas-based run-and-gun stage that plays before a mission's briefing. Enemy look (`CATEGORY_THEME`) and difficulty (`DIFFICULTY_CONFIG`) are both keyed off the mission's `category`/`difficulty` fields, so new missions get a themed fight automatically.

## Adding a mission

Add an entry to the `MISSIONS` array in `src/data/missions.js`. Missions unlock in array
order, so a new mission slots in wherever you place it. The last mission in the file can use
`format: 'boss'` with a `steps` array for a multi-step scenario instead of a single
`prompt`/`choices` pair.
