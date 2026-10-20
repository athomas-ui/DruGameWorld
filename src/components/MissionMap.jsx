import TerminalFrame from './TerminalFrame.jsx';
import { MISSIONS } from '../data/missions.js';

export default function MissionMap({ completedMissionIds, isMissionUnlocked, onSelectMission, onBack }) {
  return (
    <TerminalFrame title="Mission Map" className="mission-map">
      <ol className="mission-list">
        {MISSIONS.map((mission, index) => {
          const unlocked = isMissionUnlocked(index);
          const completed = completedMissionIds.includes(mission.id);
          const status = completed ? 'completed' : unlocked ? 'unlocked' : 'locked';

          return (
            <li key={mission.id} className={`mission-entry mission-entry--${status}`}>
              <button
                type="button"
                className="mission-entry-button"
                disabled={!unlocked}
                onClick={() => onSelectMission(mission.id)}
              >
                <span className="mission-entry-index">{String(index + 1).padStart(2, '0')}</span>
                <span className="mission-entry-body">
                  <span className="mission-entry-title">{mission.title}</span>
                  <span className="mission-entry-meta">
                    {mission.category} · {mission.difficulty} · {mission.xp} XP
                  </span>
                </span>
                <span className="mission-entry-status">
                  {status === 'completed' ? '✔ Done' : status === 'locked' ? '🔒 Locked' : '▶ Ready'}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
      <button type="button" className="ghost-button" onClick={onBack}>
        Back to HQ
      </button>
    </TerminalFrame>
  );
}
