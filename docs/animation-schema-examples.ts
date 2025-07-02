/**
 * Example: How to register different types of animations with schema-based metadata
 * 
 * This demonstrates the flexibility of the new animation system where each animation
 * can define its own expected metadata format.
 */

import { AnimationController } from '../lib/core/AnimationController';
import type { AnimationMetadataSchema } from '../lib/core/types';

// Example 1: Node animation that expects a single target
const pulseNodeSchema: AnimationMetadataSchema = {
  targetType: 'node',
  nodeTargetFields: ['targetValue', 'value'], // Try multiple field names
  validateMetadata: (metadata) => {
    return typeof (metadata.targetValue || metadata.value) === 'number';
  }
};

// Example 2: Link animation with source and target
const traverseDownSchema: AnimationMetadataSchema = {
  targetType: 'link',
  linkSourceField: 'sourceValue',
  linkTargetField: 'targetValue',
  validateMetadata: (metadata) => {
    return typeof metadata.sourceValue === 'number' && 
           typeof metadata.targetValue === 'number';
  }
};

// Example 3: Tree animation that affects the whole tree
const shakeTreeSchema: AnimationMetadataSchema = {
  targetType: 'tree',
  validateMetadata: (metadata) => {
    return metadata.intensity === undefined || typeof metadata.intensity === 'number';
  }
};

// Example 4: Complex animation with custom target extraction
const highlightPathSchema: AnimationMetadataSchema = {
  targetType: 'link',
  extractTargets: (metadata) => {
    // Custom logic: extract multiple link targets from a path
    if (!Array.isArray(metadata.path)) return [];
    
    const targets: string[] = [];
    for (let i = 0; i < metadata.path.length - 1; i++) {
      targets.push(`${metadata.path[i]}-${metadata.path[i + 1]}`);
    }
    return targets;
  },
  validateMetadata: (metadata) => {
    return Array.isArray(metadata.path) && metadata.path.length >= 2;
  }
};

// Usage examples:

/* 
// Single node animation
{
  type: 'pulse',
  metadata: { targetValue: 42 }
}

// Link traversal animation  
{
  type: 'traverse-down',
  metadata: { sourceValue: 42, targetValue: 56 }
}

// Tree-wide animation
{
  type: 'shake-tree',
  metadata: { intensity: 0.5 }
}

// Path highlighting animation
{
  type: 'highlight-path',
  metadata: { path: [10, 5, 3, 1] }
}
*/

export {
  pulseNodeSchema,
  traverseDownSchema,
  shakeTreeSchema,
  highlightPathSchema
};
