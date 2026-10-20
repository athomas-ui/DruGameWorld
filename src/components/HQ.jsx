import TerminalFrame from './TerminalFrame.jsx';
import { getNextRank, getRankForXp } from '../data/ranks.js';

export default function HQ({ characterName, xp, missionsCompleted, totalMissions, onStart, onReset }) {
  const rank = getRankForXp(xp);
  const nextRank = getNextRank(xp);
  const allDone = missionsCompleted >= totalMissions;

  return (
    <TerminalFrame className="player-card">
      <h1>CYBER// BREACH</h1>
      <h2>
        Junior Security Officer: <span>{characterName}</span>
      </h2>
      <p>
        Rank: <span>{rank.title}</span>
      </p>
      <p>
        XP: <span>{xp}</span>
        {nextRank && <span className="muted"> (next rank at {nextRank.minXp} XP)</span>}
      </p>
      <p>
        Missions: <span>{missionsCompleted}</span>/{totalMissions}
      </p>
      <button type="button" className="primary-button" onClick={onStart}>
        {allDone ? 'Review Missions' : 'View Mission Map'}
      </button>
      <button type="button" className="ghost-button" onClick={onReset}>
        Reset Progress
      </button>
    </TerminalFrame>
  );
}
