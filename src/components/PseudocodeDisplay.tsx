import React from 'react';
import type { OperationWithPseudocode } from '@/types/data-structure';

export interface PseudocodeDisplayProps {
  operation: OperationWithPseudocode;
  currentStepIndex: number;
  states: any[];
  isCollapsed?: boolean;
  onToggle?: (collapsed: boolean) => void;
  className?: string;
}

export const PseudocodeDisplay: React.FC<PseudocodeDisplayProps> = ({
  operation,
  currentStepIndex,
  states,
  isCollapsed = false,
  onToggle,
  className = '',
}) => {
  const highlightedLines = operation.generateHighlights(states, currentStepIndex);

  return (
    <div className={`pseudocode-panel ${className}`.trim()}>
      <div className="pseudocode-header">
        <button onClick={() => onToggle?.(!isCollapsed)} aria-label="Toggle pseudocode">
          {isCollapsed ? 'Show Pseudocode' : 'Hide Pseudocode'}
        </button>
        <span className="pseudocode-title">Pseudocode: {operation.description}</span>
      </div>
      {!isCollapsed && (
        <pre className="pseudocode-display">
          {operation.pseudocode.map(line => (
            <div
              key={line.lineNumber}
              className={`pseudocode-line${highlightedLines.includes(line.lineNumber) ? ' bg-yellow-200 dark:bg-yellow-700' : ''}`}
              style={{ paddingLeft: `${line.indentLevel * 1.5}em` }}
            >
              <span className="pseudocode-line-number">{line.lineNumber.toString().padStart(2, '0')}</span>
              <span className="pseudocode-line-content">{line.content}</span>
            </div>
          ))}
        </pre>
      )}
    </div>
  );
};

// Basic styles (could be moved to CSS file)
// .pseudocode-panel { border: 1px solid #ccc; border-radius: 6px; background: var(--pseudocode-bg, #f9f9f9); margin: 1em 0; }
// .pseudocode-header { display: flex; align-items: center; gap: 1em; padding: 0.5em; }
// .pseudocode-title { font-weight: bold; }
// .pseudocode-display { font-family: 'Fira Mono', monospace; font-size: 1em; margin: 0; padding: 0.5em; }
// .pseudocode-line { display: flex; align-items: baseline; }
// .pseudocode-line-number { color: #888; width: 2em; text-align: right; margin-right: 0.5em; }
// .pseudocode-line-content { white-space: pre; }
