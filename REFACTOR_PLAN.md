# BST Algorithm Refactor Plan

## Overview
Refactor the BST algorithms to closely mirror actual BST implementations while maintaining educational value through step-by-step visualization. The key insight is to create a `BinaryTreeStateBuilder` that tracks the current path automatically, so algorithm implementations can focus on the BST logic rather than path management.

## Current Issues
1. **Complex path management**: Algorithms manually track paths through the tree
2. **Verbose state creation**: Lots of boilerplate for creating tree states
3. **Doesn't mirror actual BST**: Current implementation is recursive and complex
4. **Limited animations**: Only `traverse-down` is actually implemented

## Proposed Solution

### 1. Smart BinaryTreeStateBuilder
Create a builder that:
- **Tracks current path automatically** - no manual path management needed
- **Provides high-level operations** - `compareWith()`, `traverseLeft()`, `traverseRight()`, `insertHere()`, etc.
- **Handles all tree manipulation internally** - uses existing utility functions
- **Creates states automatically** - each operation adds a state

```typescript
class BinaryTreeStateBuilder {
  private currentTree: NormalizedBinaryTree;
  private states: NormalizedBinaryTree[] = [];
  private currentPath: string[] = [];

  constructor(initialTree: NormalizedBinaryTree) {
    this.currentTree = initialTree;
  }

  // Navigation operations (automatically update path)
  compareWith(value: number): this  // Sets current node to active, adds compare state
  traverseLeft(): this             // Moves to left child, adds traverse state with animation
  traverseRight(): this            // Moves to right child, adds traverse state with animation
  insertHere(value: number): this  // Inserts node at current path, adds insert state
  
  // State management
  markVisited(): this              // Marks current node as visited
  resetAll(): this                // Resets all nodes to default state
  setName(name: string): this      // Sets the name of the current tree state
  
  // Queries
  getCurrentNode(): BinaryTreeNode | null
  hasLeftChild(): boolean
  hasRightChild(): boolean
  nodeExists(): boolean
  
  // Results
  getStates(): NormalizedBinaryTree[]
}
```

### 2. Simplified BST Insert Algorithm
With the smart builder, the algorithm becomes:

```typescript
export function generateBSTInsertStates(tree: NormalizedBinaryTree, value: number): NormalizedBinaryTree[] {
  const builder = new BinaryTreeStateBuilder(tree);
  
  // Handle empty tree
  if (!tree.root) {
    return builder
      .insertHere(value)
      .resetAll()
      .setName('Insert complete')
      .getStates();
  }
  
  // Standard BST insertion - mirrors actual BST algorithm
  while (builder.nodeExists()) {
    const currentNode = builder.getCurrentNode()!;
    
    // Compare step
    builder.compareWith(value);
    
    if (value === currentNode.value) {
      // Value already exists
      return builder
        .setName(`${value} already exists - no insertion`)
        .resetAll()
        .setName('No changes made')
        .getStates();
    }
    
    // Choose direction and traverse
    if (value < currentNode.value) {
      if (builder.hasLeftChild()) {
        builder.markVisited().traverseLeft();
      } else {
        return builder
          .markVisited()
          .traverseLeft()  // This will handle the "going left" state
          .insertHere(value)
          .resetAll()
          .setName('Insert complete')
          .getStates();
      }
    } else {
      if (builder.hasRightChild()) {
        builder.markVisited().traverseRight();
      } else {
        return builder
          .markVisited()
          .traverseRight()  // This will handle the "going right" state
          .insertHere(value)
          .resetAll()
          .setName('Insert complete')
          .getStates();
      }
    }
  }
  
  return builder.getStates();
}
```

### 3. Simplified BST Search Algorithm
```typescript
export function generateBSTSearchStates(tree: NormalizedBinaryTree, value: number): NormalizedBinaryTree[] {
  const builder = new BinaryTreeStateBuilder(tree);
  
  // Handle empty tree
  if (!tree.root) {
    return builder
      .setName(`Tree is empty - ${value} not found`)
      .getStates();
  }
  
  // Standard BST search - mirrors actual BST algorithm
  while (builder.nodeExists()) {
    const currentNode = builder.getCurrentNode()!;
    
    // Compare step
    builder.compareWith(value);
    
    if (value === currentNode.value) {
      // Found!
      return builder
        .setName(`Found ${value}!`)
        .resetAll()
        .setName('Search complete')
        .getStates();
    }
    
    // Choose direction and traverse
    builder.markVisited();
    
    if (value < currentNode.value) {
      if (builder.hasLeftChild()) {
        builder.traverseLeft();
      } else {
        return builder
          .setName(`${value} not found`)
          .resetAll()
          .setName('Search complete')
          .getStates();
      }
    } else {
      if (builder.hasRightChild()) {
        builder.traverseRight();
      } else {
        return builder
          .setName(`${value} not found`)
          .resetAll()
          .setName('Search complete')
          .getStates();
      }
    }
  }
  
  return builder.getStates();
}
```

### 4. Animation Considerations
Since only `traverse-down` is implemented:
- `traverseLeft()` and `traverseRight()` will use `traverse-down` animation
- `insertHere()` will not use animations (no `appear` animation available)
- `compareWith()` will not use animations (no highlight animation available)

### 5. Builder Implementation Details
The builder will internally use existing utility functions:
- `updateTreeAtPath()` for tree manipulation
- `updateBinaryTreeNode()` for node updates
- `createBinaryTreeFromSpec()` for state creation
- `resetAllNodesToDefault()` for cleanup

### 6. Benefits of This Approach
1. **Mirrors actual BST algorithms** - while loops with clear conditions
2. **No path management** - builder handles all path tracking
3. **Clean, readable code** - focus on BST logic, not visualization details
4. **Reusable pattern** - same builder can be used for other tree operations
5. **Educational value** - algorithms look like textbook implementations

### 7. Implementation Steps
1. Create the `BinaryTreeStateBuilder` class
2. Implement the core operations (`compareWith`, `traverseLeft`, etc.)
3. Refactor `generateBSTInsertStates` to use the builder
4. Refactor `generateBSTSearchStates` to use the builder
5. Remove old helper functions that are no longer needed
6. Test the new implementation

### 8. Additional BST Operations
With this pattern, implementing other BST operations becomes straightforward:

#### BST Delete
```typescript
export function generateBSTDeleteStates(tree: NormalizedBinaryTree, value: number): NormalizedBinaryTree[] {
  const builder = new BinaryTreeStateBuilder(tree);
  
  if (!tree.root) {
    return builder.setName(`Tree is empty - cannot delete ${value}`).getStates();
  }
  
  // Search for the node to delete
  while (builder.nodeExists()) {
    const currentNode = builder.getCurrentNode()!;
    
    builder.compareWith(value);
    
    if (value === currentNode.value) {
      // Found node to delete - handle three cases
      if (!builder.hasLeftChild() && !builder.hasRightChild()) {
        // Case 1: Leaf node
        return builder
          .setName(`Deleting leaf node ${value}`)
          .removeNode()
          .resetAll()
          .setName('Delete complete')
          .getStates();
      } else if (!builder.hasLeftChild() || !builder.hasRightChild()) {
        // Case 2: One child
        return builder
          .setName(`Deleting node ${value} with one child`)
          .replaceWithChild()
          .resetAll()
          .setName('Delete complete')
          .getStates();
      } else {
        // Case 3: Two children - find successor
        builder.setName(`Deleting node ${value} with two children - finding successor`);
        builder.traverseRight();
        
        while (builder.hasLeftChild()) {
          builder.markVisited().traverseLeft();
        }
        
        const successorValue = builder.getCurrentNode()!.value;
        return builder
          .setName(`Found successor: ${successorValue}`)
          .replaceNodeValue(successorValue)
          .removeSuccessor()
          .resetAll()
          .setName('Delete complete')
          .getStates();
      }
    }
    
    // Continue searching
    builder.markVisited();
    if (value < currentNode.value) {
      if (builder.hasLeftChild()) {
        builder.traverseLeft();
      } else {
        return builder.setName(`${value} not found - cannot delete`).getStates();
      }
    } else {
      if (builder.hasRightChild()) {
        builder.traverseRight();
      } else {
        return builder.setName(`${value} not found - cannot delete`).getStates();
      }
    }
  }
  
  return builder.getStates();
}
```

#### BST Find Minimum
```typescript
export function generateBSTFindMinStates(tree: NormalizedBinaryTree): NormalizedBinaryTree[] {
  const builder = new BinaryTreeStateBuilder(tree);
  
  if (!tree.root) {
    return builder.setName('Tree is empty - no minimum').getStates();
  }
  
  // Keep going left until we find the leftmost node
  while (builder.hasLeftChild()) {
    builder
      .compareWith(builder.getCurrentNode()!.value)
      .setName(`Current node: ${builder.getCurrentNode()!.value}, going left to find minimum`)
      .markVisited()
      .traverseLeft();
  }
  
  const minValue = builder.getCurrentNode()!.value;
  return builder
    .compareWith(minValue)
    .setName(`Found minimum: ${minValue}`)
    .resetAll()
    .setName('Find minimum complete')
    .getStates();
}
```

#### BST Find Maximum
```typescript
export function generateBSTFindMaxStates(tree: NormalizedBinaryTree): NormalizedBinaryTree[] {
  const builder = new BinaryTreeStateBuilder(tree);
  
  if (!tree.root) {
    return builder.setName('Tree is empty - no maximum').getStates();
  }
  
  // Keep going right until we find the rightmost node
  while (builder.hasRightChild()) {
    builder
      .compareWith(builder.getCurrentNode()!.value)
      .setName(`Current node: ${builder.getCurrentNode()!.value}, going right to find maximum`)
      .markVisited()
      .traverseRight();
  }
  
  const maxValue = builder.getCurrentNode()!.value;
  return builder
    .compareWith(maxValue)
    .setName(`Found maximum: ${maxValue}`)
    .resetAll()
    .setName('Find maximum complete')
    .getStates();
}
```

Note: The delete operation would require additional builder methods:
- `removeNode()` - Remove current node
- `replaceWithChild()` - Replace node with its single child
- `replaceNodeValue(value)` - Replace node's value (for successor case)
- `removeSuccessor()` - Remove the successor node

### 9. Updated Builder Interface
The final `BinaryTreeStateBuilder` interface should include:

```typescript
class BinaryTreeStateBuilder {
  private currentTree: NormalizedBinaryTree;
  private states: NormalizedBinaryTree[] = [];
  private currentPath: string[] = [];

  constructor(initialTree: NormalizedBinaryTree) {
    this.currentTree = initialTree;
  }

  // Navigation operations (automatically update path and add states)
  compareWith(value: number): this     // Sets current node to active, adds compare state
  traverseLeft(): this                // Moves to left child, adds traverse state with animation
  traverseRight(): this               // Moves to right child, adds traverse state with animation
  insertHere(value: number): this     // Inserts node at current path, adds insert state
  
  // State management
  markVisited(): this                 // Marks current node as visited
  resetAll(): this                   // Resets all nodes to default state
  setName(name: string): this        // Sets the name of the current tree state (adds new state)
  
  // Tree modification operations (for delete)
  removeNode(): this                 // Remove current node
  replaceWithChild(): this           // Replace node with its single child  
  replaceNodeValue(value: number): this // Replace node's value
  removeSuccessor(): this            // Remove the successor node
  
  // Queries
  getCurrentNode(): BinaryTreeNode | null
  hasLeftChild(): boolean
  hasRightChild(): boolean
  nodeExists(): boolean
  
  // Results
  getStates(): NormalizedBinaryTree[]
}
```

1. Create the `BinaryTreeStateBuilder` class with core navigation methods
2. Implement the state management methods (`setName`, `markVisited`, `resetAll`)
3. Implement the tree modification methods for delete operations
4. Refactor `generateBSTInsertStates` to use the builder
5. Refactor `generateBSTSearchStates` to use the builder
6. Implement `generateBSTDeleteStates` using the builder
7. Implement `generateBSTFindMinStates` and `generateBSTFindMaxStates`
8. Remove old helper functions that are no longer needed
9. Test all operations with the new implementation

### 11. Files to Modify
- `/src/renderers/BinaryTree/algorithms/bst.ts` - Main refactor
- Create new `BinaryTreeStateBuilder` class (could be in same file or separate)
- Update any tests that depend on the current implementation

### 12. Animation Limitations
- Only `traverse-down` animation is available
- No `appear`, `shake`, or `found` animations are implemented
- Builder should be designed to gracefully handle missing animations

This refactor will make the BST algorithms much more maintainable and educational while preserving all current functionality.
