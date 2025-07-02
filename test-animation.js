// Quick test to verify animation hints
import { generateBSTInsertStates } from './src/renderers/BinaryTree/algorithms/bst.js';
import { createBinaryTree } from './src/renderers/BinaryTree/types.js';

// Create empty tree
const emptyTree = createBinaryTree(null, 'Empty tree', undefined);

// Test insertion
console.log('Testing BST Insert...');
const insertStates = generateBSTInsertStates(emptyTree, 10);

console.log('Generated states:', insertStates.length);

insertStates.forEach((state, index) => {
  console.log(`State ${index + 1}: ${state.name}`);
  if (state.animationHints) {
    console.log('  Animation hints:', state.animationHints.map(hint => ({
      type: hint.type,
      metadata: hint.metadata
    })));
  }
});

// Test insertion into existing tree
if (insertStates.length > 0) {
  const treeWithRoot = insertStates[insertStates.length - 1];
  console.log('\nTesting insertion into existing tree...');
  const moreStates = generateBSTInsertStates(treeWithRoot, 5);
  
  console.log('Generated states:', moreStates.length);
  
  moreStates.forEach((state, index) => {
    console.log(`State ${index + 1}: ${state.name}`);
    if (state.animationHints) {
      console.log('  Animation hints:', state.animationHints.map(hint => ({
        type: hint.type,
        metadata: hint.metadata
      })));
    }
  });
}
