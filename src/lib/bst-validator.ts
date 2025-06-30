import type { BinaryTreeNode, ValidationResult } from './types/binary-tree-node.js';

/**
 * Validation utilities for binary tree states and transitions
 */
export class BinaryTreeValidator {
  /**
   * Validate that a tree maintains BST properties
   */
  static validateTree(tree: BinaryTreeNode | null): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (!tree) {
      return { isValid: true, errors, warnings };
    }
    
    // Check BST property recursively
    this.validateBSTProperty(tree, Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, errors);
    
    // Check for valid node states
    this.validateNodeStates(tree, errors, warnings);
    
    // Check for valid traversal directions
    this.validateTraversalDirections(tree, errors, warnings);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate transition between two tree states
   */
  static validateTransition(from: BinaryTreeNode | null, to: BinaryTreeNode | null): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Both trees should be valid BSTs
    const fromValidation = this.validateTree(from);
    const toValidation = this.validateTree(to);
    
    errors.push(...fromValidation.errors.map(e => `From tree: ${e}`));
    errors.push(...toValidation.errors.map(e => `To tree: ${e}`));
    
    // Check that the transition is reasonable
    this.validateTransitionLogic(from, to, errors, warnings);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Validate BST property (left < root < right)
   */
  private static validateBSTProperty(
    node: BinaryTreeNode,
    min: number,
    max: number,
    errors: string[]
  ): void {
    if (node.value <= min || node.value >= max) {
      errors.push(`Node ${node.value} violates BST property (min: ${min}, max: ${max})`);
    }
    
    if (node.left) {
      this.validateBSTProperty(node.left, min, node.value, errors);
    }
    
    if (node.right) {
      this.validateBSTProperty(node.right, node.value, max, errors);
    }
  }

  /**
   * Validate that all node states are valid
   */
  private static validateNodeStates(
    node: BinaryTreeNode,
    errors: string[],
    warnings: string[]
  ): void {
    const validStates = ["default", "selected", "active", "new", "deleted"];
    
    if (!validStates.includes(node.state)) {
      errors.push(`Node ${node.value} has invalid state: ${node.state}`);
    }
    
    // Warn about potentially problematic state combinations
    if (node.state === "deleted" && (node.left || node.right)) {
      warnings.push(`Node ${node.value} is marked as deleted but still has children`);
    }
    
    if (node.left) {
      this.validateNodeStates(node.left, errors, warnings);
    }
    
    if (node.right) {
      this.validateNodeStates(node.right, errors, warnings);
    }
  }

  /**
   * Validate traversal directions make sense
   */
  private static validateTraversalDirections(
    node: BinaryTreeNode,
    errors: string[],
    warnings: string[]
  ): void {
    if (node.traversalDirection === "left" && !node.left) {
      warnings.push(`Node ${node.value} has left traversal direction but no left child`);
    }
    
    if (node.traversalDirection === "right" && !node.right) {
      warnings.push(`Node ${node.value} has right traversal direction but no right child`);
    }
    
    if (node.traversalDirection && !["left", "right"].includes(node.traversalDirection)) {
      errors.push(`Node ${node.value} has invalid traversal direction: ${node.traversalDirection}`);
    }
    
    if (node.left) {
      this.validateTraversalDirections(node.left, errors, warnings);
    }
    
    if (node.right) {
      this.validateTraversalDirections(node.right, errors, warnings);
    }
  }

  /**
   * Validate that a transition between states is logical
   */
  private static validateTransitionLogic(
    from: BinaryTreeNode | null,
    to: BinaryTreeNode | null,
    _errors: string[],
    warnings: string[]
  ): void {
    // Allow null to node (insertion) and node to null (deletion)
    if (!from && to) {
      if (to.state !== "new") {
        warnings.push("New node should typically have 'new' state");
      }
      return;
    }
    
    if (from && !to) {
      // Node was deleted - this is valid
      return;
    }
    
    if (!from && !to) {
      // Both null - no change, valid
      return;
    }
    
    if (from && to) {
      // Compare structural changes
      const fromValues = this.extractValues(from);
      const toValues = this.extractValues(to);
      
      // Check for major structural changes that might indicate errors
      const addedValues = toValues.filter(v => !fromValues.includes(v));
      const removedValues = fromValues.filter(v => !toValues.includes(v));
      
      if (addedValues.length > 1) {
        warnings.push(`Multiple nodes added in single transition: ${addedValues.join(', ')}`);
      }
      
      if (removedValues.length > 1) {
        warnings.push(`Multiple nodes removed in single transition: ${removedValues.join(', ')}`);
      }
    }
  }

  /**
   * Extract all values from a tree for comparison
   */
  private static extractValues(tree: BinaryTreeNode | null): number[] {
    if (!tree) return [];
    
    return [
      tree.value,
      ...this.extractValues(tree.left),
      ...this.extractValues(tree.right)
    ];
  }

  /**
   * Validate a complete state sequence (for operations like search/insert/delete)
   */
  static validateStateSequence(states: (BinaryTreeNode | null)[]): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    if (states.length === 0) {
      warnings.push("Empty state sequence");
      return { isValid: true, errors, warnings };
    }
    
    // Validate each individual state
    states.forEach((state, index) => {
      const validation = this.validateTree(state);
      errors.push(...validation.errors.map(e => `State ${index}: ${e}`));
      warnings.push(...validation.warnings.map(w => `State ${index}: ${w}`));
    });
    
    // Validate transitions between consecutive states
    for (let i = 0; i < states.length - 1; i++) {
      const transition = this.validateTransition(states[i], states[i + 1]);
      errors.push(...transition.errors.map(e => `Transition ${i}->${i + 1}: ${e}`));
      warnings.push(...transition.warnings.map(w => `Transition ${i}->${i + 1}: ${w}`));
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Quick validation for development/debugging
   */
  static quickValidate(tree: BinaryTreeNode | null): boolean {
    try {
      const result = this.validateTree(tree);
      if (!result.isValid) {
        console.warn('BST validation failed:', result.errors);
        return false;
      }
      return true;
    } catch (e) {
      console.error('BST validation error:', e);
      return false;
    }
  }
}
