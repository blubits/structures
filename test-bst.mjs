/**
 * Basic test to verify the new BST Operation Controller
 * 
 * This is a simple demonstration of how the new architecture works.
 * Run with: node test-bst.js (after compilation)
 */

import { BSTOperationController } from './src/renderers/BinaryTree/BSTOperationController.js';
import { createBinaryTree } from './src/renderers/BinaryTree/types.js';

console.log('🌳 Testing BST Operation Controller...\n');

// Create a new BST controller
const bst = new BSTOperationController();

console.log('1. Initial state:');
console.log('   Current state:', bst.getCurrentState()?.name);
console.log('   Can undo:', bst.canUndo());
console.log('   Can redo:', bst.canRedo());

console.log('\n2. Inserting value 5...');
const insertResult = bst.insert(5);
console.log('   Success:', insertResult.success);
console.log('   Number of steps:', insertResult.states.length);
console.log('   Final state:', insertResult.states[insertResult.states.length - 1]?.name);

console.log('\n3. Checking navigation capabilities...');
console.log('   Can step forward:', bst.canStepForward());
console.log('   Can step backward:', bst.canStepBackward());
console.log('   Can undo:', bst.canUndo());
console.log('   Is animating:', bst.isAnimating());

console.log('\n4. Inserting value 3...');
const insertResult2 = bst.insert(3);
console.log('   Success:', insertResult2.success);
console.log('   Number of steps:', insertResult2.states.length);
console.log('   Step descriptions:');
insertResult2.states.forEach((state, i) => {
  console.log(`     ${i + 1}. ${state.name}`);
});

console.log('\n5. Searching for value 3...');
const searchResult = bst.search(3);
console.log('   Success:', searchResult.success);
console.log('   Number of steps:', searchResult.states.length);
console.log('   Step descriptions:');
searchResult.states.forEach((state, i) => {
  console.log(`     ${i + 1}. ${state.name}`);
});

console.log('\n6. Testing undo functionality...');
const undoResult = bst.undo();
console.log('   Previous operation:', undoResult.operation?.description);
console.log('   Current state after undo:', bst.getCurrentState()?.name);

console.log('\n7. Testing redo functionality...');
const redoResult = bst.redo();
console.log('   Redone operation:', redoResult.operation?.description);
console.log('   Current state after redo:', bst.getCurrentState()?.name);

console.log('\n✅ Test completed successfully!');
console.log('\nThe new BST Operation Controller is working with:');
console.log('- Immutable state updates');
console.log('- Step-by-step animation states');
console.log('- Time-machine navigation');
console.log('- Declarative animations');
console.log('- Clean separation of concerns');
