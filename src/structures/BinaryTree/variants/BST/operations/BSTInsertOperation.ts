import { BaseOperation } from '@/lib/core/operations';
import type { PseudocodeLine } from '@/lib/core/types';
import type { BinaryTree } from '@/structures/BinaryTree/types';
import { generateBSTInsertStates } from '../algorithms';

export class BSTInsertOperation extends BaseOperation {
  static readonly pseudocode: PseudocodeLine[] = [
    { lineNumber: 1, content: 'function insert(value):', indentLevel: 0 },
    { lineNumber: 2, content: 'if tree is empty:', indentLevel: 1 },
    { lineNumber: 3, content: 'create new root with value', indentLevel: 2 },
    { lineNumber: 4, content: 'return', indentLevel: 2 },
    { lineNumber: 5, content: 'current = root', indentLevel: 1 },
    { lineNumber: 6, content: 'while current exists:', indentLevel: 1 },
    { lineNumber: 7, content: 'if value < current.value:', indentLevel: 2 },
    { lineNumber: 8, content: 'if current.left is null:', indentLevel: 3 },
    { lineNumber: 9, content: 'create new left child', indentLevel: 4 },
    { lineNumber: 10, content: 'return', indentLevel: 4 },
    { lineNumber: 11, content: 'current = current.left', indentLevel: 3 },
    { lineNumber: 12, content: 'else if value > current.value:', indentLevel: 2 },
    { lineNumber: 13, content: 'if current.right is null:', indentLevel: 3 },
    { lineNumber: 14, content: 'create new right child', indentLevel: 4 },
    { lineNumber: 15, content: 'return', indentLevel: 4 },
    { lineNumber: 16, content: 'current = current.right', indentLevel: 3 },
    { lineNumber: 17, content: 'else:', indentLevel: 2 },
    { lineNumber: 18, content: 'value already exists', indentLevel: 3 },
    { lineNumber: 19, content: 'return', indentLevel: 3 },
  ];

  pseudocode = BSTInsertOperation.pseudocode;
  private value: number;

  constructor(value: number) {
    super('insert', { value }, `Insert ${value}`);
    this.value = value;
  }

  generateStates(tree: BinaryTree): BinaryTree[] {
    return generateBSTInsertStates(tree, this.value);
  }

  generateHighlights(states: BinaryTree[], stepIndex: number): number[] {
    // Map state names to pseudocode line numbers
    const state = states[stepIndex];
    if (!state || !state.name) return [1];
    const name = state.name;
    if (name.startsWith('Inserting') && name.includes('as root')) return [1, 2, 3]; // function, if empty, create root
    if (name.startsWith('Comparing')) return [6, 7, 12]; // while, if <, else if >
    if (name === 'Going left') return [11]; // current = current.left
    if (name === 'Going right') return [16]; // current = current.right
    if (name.startsWith('Inserting') && name.includes('as left child')) return [8, 9]; // if left null, create left
    if (name.startsWith('Inserting') && name.includes('as right child')) return [13, 14]; // if right null, create right
    if (name.includes('already exists')) return [17, 18]; // else, value exists
    if (name === 'Insert complete') return [4, 10, 15, 19]; // return lines
    if (name === 'No changes made') return [19];
    return [1]; // fallback to function line
  }
}
