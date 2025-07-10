import type { PseudocodeLine } from '../types';

/**
 * Validates a pseudocode array for correct structure.
 */
export function validatePseudocode(pseudocode: PseudocodeLine[]): boolean {
  return Array.isArray(pseudocode) && pseudocode.every(line =>
    typeof line.lineNumber === 'number' &&
    typeof line.content === 'string' &&
    typeof line.indentLevel === 'number'
  );
}
