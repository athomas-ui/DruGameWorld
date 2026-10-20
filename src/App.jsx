import { useState } from 'react';
import './App.css';
import CharacterSelect from './components/CharacterSelect.jsx';
import HQ from './components/HQ.jsx';
import MissionMap from './components/MissionMap.jsx';
import Mission from './components/Mission.jsx';
import { useGameState } from './state/useGameState.js';

export default function App() {
  const game = useGameState();
  const [screen, setScreen] = useState('hq');
  const [activeMissionId, setActiveMissionId] = useState(null);

  if (!game.character) {
    return (
      <main className="screen-container">
        <CharacterSelect onConfirm={game.selectCharacter} />
      </main>
    );
  }

  return (
    <main className="screen-container">
      {screen === 'hq' && (
        <HQ
          characterName={game.characterName}
          xp={game.xp}
          missionsCompleted={game.missionsCompleted}
          totalMissions={game.totalMissions}
          onStart={() => setScreen('map')}
          onReset={() => {
            game.resetProgress();
            setScreen('hq');
          }}
        />
      )}

      {screen === 'map' && (
        <MissionMap
          completedMissionIds={game.completedMissionIds}
          isMissionUnlocked={game.isMissionUnlocked}
          onSelectMission={(id) => {
            setActiveMissionId(id);
            setScreen('mission');
          }}
          onBack={() => setScreen('hq')}
        />
      )}

      {screen === 'mission' && activeMissionId && (
        <Mission
          missionId={activeMissionId}
          characterId={game.character}
          onComplete={(id, xp) => game.completeMission(id, xp)}
          onExit={() => {
            setActiveMissionId(null);
            setScreen('map');
          }}
        />
      )}
    </main>
  );
}
