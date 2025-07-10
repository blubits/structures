import type { PseudocodeLine } from '../types';

/**
 * Helper to parse pseudocode from a string array or string into PseudocodeLine[]
 */
export function parsePseudocode(lines: string[] | string): PseudocodeLine[] {
  const arr = Array.isArray(lines) ? lines : lines.split('\n');
  return arr.map((content, i) => {
    const indentLevel = content.match(/^\s*/)?.[0].length ?? 0;
    return {
      lineNumber: i + 1,
      content: content.trim(),
      indentLevel: Math.floor(indentLevel / 2), // 2 spaces per indent
    };
  });
}

/**
 * Helper to map a step index to pseudocode line numbers (default: 1-to-1 mapping)
 */
export function defaultHighlightMap(stepIndex: number): number[] {
  return [stepIndex + 1];
}
