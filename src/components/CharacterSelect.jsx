import { useState } from 'react';
import TerminalFrame from './TerminalFrame.jsx';
import { CHARACTERS } from '../data/characters.js';

const OPTIONS = Object.entries(CHARACTERS).map(([id, data]) => ({
  id,
  name: data.name,
  accent: data.accentClass,
}));

export default function CharacterSelect({ onConfirm }) {
  const [selected, setSelected] = useState(null);

  return (
    <TerminalFrame title="Select Character" className="character-selection">
      <div className="character-options" role="group" aria-label="Choose your character">
        {OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            className={`character-option ${option.accent}`}
            data-character={option.id}
            aria-pressed={selected === option.id}
            onClick={() => setSelected(option.id)}
          >
            <svg className="stick-figure" viewBox="0 0 100 150" aria-hidden="true">
              <circle cx="50" cy="22" r="15" />
              <path d="M50 37v48M50 50 23 72M50 50l27 22M50 85 29 125M50 85l21 40" />
              {option.id === 'werdna' && <path className="figure-detail" d="M37 19q13-13 26 0" />}
            </svg>
            <span className="character-name">{option.name}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        className="primary-button continue-button"
        disabled={selected === null}
        onClick={() => onConfirm(selected)}
      >
        Continue
      </button>
    </TerminalFrame>
  );
}
