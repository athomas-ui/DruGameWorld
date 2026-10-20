import { useCallback, useEffect, useState } from 'react';
import { MISSIONS } from '../data/missions.js';
import { CHARACTERS } from '../data/characters.js';

const SAVE_KEY = 'cyberbreach_save_v1';

function loadSave() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch {
    return null;
  }
}

function defaultSave() {
  return {
    character: null,
    xp: 0,
    completedMissionIds: [],
  };
}

export function useGameState() {
  const [save, setSave] = useState(() => loadSave() ?? defaultSave());

  useEffect(() => {
    try {
      localStorage.setItem(SAVE_KEY, JSON.stringify(save));
    } catch {
      // ignore storage failures (private browsing, quota, etc.)
    }
  }, [save]);

  const selectCharacter = useCallback((characterId) => {
    if (!Object.hasOwn(CHARACTERS, characterId)) return;
    setSave((prev) => ({ ...prev, character: characterId }));
  }, []);

  const completeMission = useCallback((missionId, xpEarned) => {
    setSave((prev) => {
      if (prev.completedMissionIds.includes(missionId)) return prev;
      return {
        ...prev,
        xp: prev.xp + xpEarned,
        completedMissionIds: [...prev.completedMissionIds, missionId],
      };
    });
  }, []);

  const resetProgress = useCallback(() => {
    setSave(defaultSave());
  }, []);

  const isMissionUnlocked = useCallback(
    (missionIndex) => {
      if (missionIndex === 0) return true;
      const previousMission = MISSIONS[missionIndex - 1];
      return save.completedMissionIds.includes(previousMission.id);
    },
    [save.completedMissionIds],
  );

  return {
    character: save.character,
    characterName: save.character ? CHARACTERS[save.character].name : null,
    xp: save.xp,
    completedMissionIds: save.completedMissionIds,
    missionsCompleted: save.completedMissionIds.length,
    totalMissions: MISSIONS.length,
    selectCharacter,
    completeMission,
    resetProgress,
    isMissionUnlocked,
  };
}

export { CHARACTERS };
