import { useMemo, useState } from 'react';
import TerminalFrame from './TerminalFrame.jsx';
import ActionStage from './ActionStage.jsx';
import { getMissionById } from '../data/missions.js';
import { CHARACTERS } from '../data/characters.js';

const FORMAT_LABELS = {
  email: 'Incoming Email',
  sms: 'Incoming Text',
  chat: 'Team Chat',
  call: 'Incoming Call',
  scene: 'Scenario',
  boss: 'Incident Report',
};

function Briefing({ mission }) {
  const label = FORMAT_LABELS[mission.format] ?? 'Scenario';
  const { briefing } = mission;

  return (
    <div className={`briefing briefing--${mission.format}`}>
      <p className="briefing-label">{label}</p>
      {briefing.from && (
        <p>
          <strong>FROM</strong> {briefing.from}
        </p>
      )}
      {briefing.subject && (
        <p>
          <strong>SUBJECT</strong> {briefing.subject}
        </p>
      )}
      {briefing.caller && (
        <p>
          <strong>CALLER</strong> {briefing.caller}
        </p>
      )}
      {briefing.chatWith && (
        <p>
          <strong>FROM</strong> {briefing.chatWith}
        </p>
      )}
      {briefing.sceneTitle && <p className="briefing-scene-title">{briefing.sceneTitle}</p>}
      <p className="briefing-body">{briefing.body}</p>
    </div>
  );
}

export default function Mission({ missionId, characterId, onComplete, onExit }) {
  const mission = useMemo(() => getMissionById(missionId), [missionId]);
  const characterColor = CHARACTERS[characterId]?.color ?? '#00ff9d';

  const steps = useMemo(() => {
    if (mission.format === 'boss') return mission.steps;
    return [{ prompt: mission.prompt, choices: mission.choices, correct: mission.correct, explain: mission.explain }];
  }, [mission]);

  const [phase, setPhase] = useState('action');
  const [actionAttempt, setActionAttempt] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [missionDone, setMissionDone] = useState(false);

  const currentStep = steps[stepIndex];
  const isAnswered = selectedId !== null;
  const isCorrect = isAnswered && selectedId === currentStep.correct;

  function handleChoose(choiceId) {
    if (isAnswered) return;
    setSelectedId(choiceId);
  }

  function handleRetry() {
    setSelectedId(null);
  }

  function handleContinue() {
    const isLastStep = stepIndex === steps.length - 1;
    if (!isLastStep) {
      setStepIndex((i) => i + 1);
      setSelectedId(null);
      return;
    }
    setMissionDone(true);
    onComplete(mission.id, mission.xp);
  }

  if (phase === 'action') {
    return (
      <TerminalFrame
        title={`Mission ${mission.id.replace('m', '')}: ${mission.title}`}
        className="mission-card"
      >
        <ActionStage
          key={actionAttempt}
          mission={mission}
          characterColor={characterColor}
          onClear={() => setPhase('quiz')}
          onRetry={() => setActionAttempt((a) => a + 1)}
          onExit={onExit}
        />
      </TerminalFrame>
    );
  }

  if (missionDone) {
    return (
      <TerminalFrame title="Mission Complete" className="mission-card mission-card--complete">
        <p className="feedback feedback--correct">{mission.explain.correct}</p>
        <p className="xp-award">+{mission.xp} XP</p>
        <button type="button" className="primary-button" onClick={onExit}>
          Back to Mission Map
        </button>
      </TerminalFrame>
    );
  }

  return (
    <TerminalFrame
      title={`Mission ${mission.id.replace('m', '')}: ${mission.title}`}
      className="mission-card"
    >
      {mission.format === 'boss' && (
        <p className="briefing-label">
          Step {stepIndex + 1} of {steps.length}
        </p>
      )}
      <Briefing mission={mission} />
      <p className="mission-prompt">{currentStep.prompt}</p>

      <div className="answer-list">
        {currentStep.choices.map((choice) => {
          let state = '';
          if (isAnswered) {
            if (choice.id === currentStep.correct) state = 'answer-btn--correct';
            else if (choice.id === selectedId) state = 'answer-btn--incorrect';
          }
          return (
            <button
              key={choice.id}
              type="button"
              className={`answer-btn ${state}`}
              disabled={isAnswered}
              onClick={() => handleChoose(choice.id)}
            >
              {choice.id}. {choice.text}
            </button>
          );
        })}
      </div>

      {isAnswered && (
        <div className={`feedback-panel ${isCorrect ? 'feedback-panel--correct' : 'feedback-panel--incorrect'}`}>
          <p className="feedback">{isCorrect ? currentStep.explain.correct : currentStep.explain.incorrect}</p>
          {isCorrect ? (
            <button type="button" className="primary-button" onClick={handleContinue}>
              {stepIndex === steps.length - 1 ? 'Complete Mission' : 'Next Step'}
            </button>
          ) : (
            <button type="button" className="primary-button" onClick={handleRetry}>
              Try Again
            </button>
          )}
        </div>
      )}

      <button type="button" className="ghost-button" onClick={onExit}>
        Abort Mission
      </button>
    </TerminalFrame>
  );
}
