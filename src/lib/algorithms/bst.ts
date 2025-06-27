/**
 * Binary Search Tree Algorithm Implementations
 * 
 * This module provides step-by-step visualization algorithms for common BST operations.
 * Each algorithm generates a sequence of TraversalStep objects that can be used to
 * animate and visualize the operation process, showing the decision-making and
 * path traversal that occurs during BST operations.
 * 
 * The algorithms implement the fundamental BST property: for any node, all values
 * in the left subtree are less than the node's value, and all values in the
 * right subtree are greater than the node's value.
 * 
 * This module is part of the core business logic and is separate from UI components,
 * providing pure algorithmic functionality that can be used by various controllers
 * and visualization systems.
 * 
 * @example
 * ```typescript
 * import { generateBSTInsertSteps, generateBSTSearchSteps } from './bst';
 * 
 * const tree = { value: 8, left: { value: 3 }, right: { value: 10 } };
 * 
 * // Generate steps for inserting value 5
 * const insertSteps = generateBSTInsertSteps(tree, 5);
 * console.log(`Insert operation has ${insertSteps.length} steps`);
 * 
 * // Generate steps for searching for value 3
 * const searchSteps = generateBSTSearchSteps(tree, 3);
 * console.log(`Search found target: ${searchSteps[searchSteps.length - 1].metadata.found}`);
 * ```
 */

/**
 * Represents a node in a binary tree structure
 * 
 * This is a simplified version of the BinaryTreeNode for use in algorithm
 * calculations. It focuses on the essential tree structure without UI-specific
 * properties.
 */
export interface BinaryTreeNode {
  value: number;
  left?: BinaryTreeNode;
  right?: BinaryTreeNode;
  id?: string;
  highlighted?: boolean;
  color?: string;
}

/**
 * Represents the decision made at each step during tree traversal
 * 
 * These decisions form the logical flow of tree algorithms and help
 * visualize the decision-making process.
 */
export type TraversalDecision = 
  | "comparing"      // Currently comparing values
  | "go_left"        // Decision to traverse left
  | "go_right"       // Decision to traverse right
  | "found"          // Target value found
  | "not_found"      // Target value not found
  | "insert_here"    // Location found for insertion
  | "delete_here";   // Node marked for deletion

/**
 * Represents a single step in a tree algorithm visualization
 * 
 * Each step captures the state of the algorithm at a specific point,
 * including the current node being examined, the decision made, and
 * descriptive metadata for user education.
 */
export interface TraversalStep {
  /** Unique identifier for this step */
  id: string;
  /** The node currently being examined */
  currentNode: BinaryTreeNode;
  /** The next node to be examined (if applicable) */
  nextNode?: BinaryTreeNode;
  /** The type of operation being performed */
  operation: string;
  /** The decision made at this step */
  decision: TraversalDecision;
  /** Additional metadata about this step */
  metadata: {
    /** Human-readable description of what's happening */
    description: string;
    /** The value being searched for or inserted (if applicable) */
    searchValue?: number;
    /** The comparison result ("less", "greater", "equal") */
    comparison?: string;
    /** Whether this step completes the operation */
    isComplete?: boolean;
    /** Whether the target was found (for search operations) */
    found?: boolean;
    /** Additional custom properties */
    [key: string]: any;
  };
}

/**
 * Creates a unique step ID generator for visualization steps
 * 
 * This utility function provides a closure-based ID generator that ensures
 * each step in a traversal sequence has a unique identifier, which is
 * essential for React rendering and step tracking.
 * 
 * @param prefix - The prefix to use for generated IDs
 * @returns Object with a next() method that returns unique IDs
 * 
 * @example
 * ```typescript
 * const generator = createStepIdGenerator("search");
 * console.log(generator.next()); // "search-0"
 * console.log(generator.next()); // "search-1"
 * ```
 */
function createStepIdGenerator(prefix: string = "step") {
  let id = 0;
  return {
    next: () => `${prefix}-${id++}`,
  };
}

/**
 * Generate visualization steps for BST insertion operation
 * 
 * Creates a sequence of steps that visualize the process of inserting a value
 * into a Binary Search Tree. The algorithm follows BST insertion rules:
 * - Compare with current node
 * - Go left if value is smaller, right if larger
 * - Insert when reaching an empty position
 * - Handle duplicates by ignoring them
 * 
 * @param node - The root node of the BST
 * @param value - The value to insert
 * @returns Array of TraversalStep objects representing the insertion process
 * 
 * @example
 * ```typescript
 * const tree = { value: 5, left: { value: 3 }, right: { value: 7 } };
 * const steps = generateBSTInsertSteps(tree, 4);
 * 
 * // Steps will show: compare with 5 -> go left -> compare with 3 -> go right -> insert
 * steps.forEach((step, i) => {
 *   console.log(`Step ${i + 1}: ${step.metadata.description}`);
 * });
 * ```
 */
export function generateBSTInsertSteps(
  node: BinaryTreeNode,
  value: number
): TraversalStep[] {
  const steps: TraversalStep[] = [];
  const stepIdGenerator = createStepIdGenerator("bst-insert");

  const traverse = (current: BinaryTreeNode): void => {
    steps.push({
      id: stepIdGenerator.next(),
      currentNode: current,
      operation: "insert",
      decision: "comparing",
      metadata: {
        searchValue: value,
        comparison: value < current.value ? "less" : value > current.value ? "greater" : "equal",
        description: `Comparing ${value} with ${current.value}`,
        isComplete: false,
      },
    });

    if (value < current.value) {
      if (current.left) {
        steps.push({
          id: stepIdGenerator.next(),
          currentNode: current,
          nextNode: current.left,
          operation: "insert",
          decision: "go_left",
          metadata: {
            searchValue: value,
            description: `${value} < ${current.value}, go left`,
            isComplete: false,
          },
        });
        traverse(current.left);
      } else {
        steps.push({
          id: stepIdGenerator.next(),
          currentNode: current,
          operation: "insert",
          decision: "insert_here",
          metadata: {
            searchValue: value,
            comparison: "less",
            description: `${value} < ${current.value}, insert as left child`,
            isComplete: true,
          },
        });
      }
    } else if (value > current.value) {
      if (current.right) {
        steps.push({
          id: stepIdGenerator.next(),
          currentNode: current,
          nextNode: current.right,
          operation: "insert",
          decision: "go_right",
          metadata: {
            searchValue: value,
            description: `${value} > ${current.value}, go right`,
            isComplete: false,
          },
        });
        traverse(current.right);
      } else {
        steps.push({
          id: stepIdGenerator.next(),
          currentNode: current,
          operation: "insert",
          decision: "insert_here",
          metadata: {
            searchValue: value,
            comparison: "greater",
            description: `${value} > ${current.value}, insert as right child`,
            isComplete: true,
          },
        });
      }
    } else {
      steps.push({
        id: stepIdGenerator.next(),
        currentNode: current,
        operation: "insert",
        decision: "found",
        metadata: {
          searchValue: value,
          comparison: "equal",
          description: `${value} = ${current.value}, value already exists`,
          isComplete: true,
        },
      });
    }
  };

  traverse(node);
  return steps;
}

/**
 * Generate visualization steps for BST search operation
 * 
 * Creates a sequence of steps that visualize the process of searching for a value
 * in a Binary Search Tree. The algorithm leverages the BST property for efficient
 * searching:
 * - Compare with current node
 * - Go left if target is smaller, right if larger
 * - Found if values match, not found if reaching null
 * 
 * @param node - The root node of the BST
 * @param value - The value to search for
 * @returns Array of TraversalStep objects representing the search process
 * 
 * @example
 * ```typescript
 * const tree = { 
 *   value: 8, 
 *   left: { value: 3, left: { value: 1 }, right: { value: 6 } },
 *   right: { value: 10, right: { value: 14 } }
 * };
 * 
 * const steps = generateBSTSearchSteps(tree, 6);
 * const lastStep = steps[steps.length - 1];
 * console.log('Found:', lastStep.metadata.found); // true
 * 
 * const notFoundSteps = generateBSTSearchSteps(tree, 5);
 * const lastNotFoundStep = notFoundSteps[notFoundSteps.length - 1];
 * console.log('Found:', lastNotFoundStep.metadata.found); // false
 * ```
 */
export function generateBSTSearchSteps(
  node: BinaryTreeNode,
  value: number
): TraversalStep[] {
  const steps: TraversalStep[] = [];
  const stepIdGenerator = createStepIdGenerator("bst-search");

  const traverse = (current: BinaryTreeNode | undefined): void => {
    if (!current) {
      steps.push({
        id: stepIdGenerator.next(),
        currentNode: node,
        operation: "search",
        decision: "not_found",
        metadata: {
          searchValue: value,
          description: `Value ${value} not found in tree`,
          isComplete: true,
          found: false,
        },
      });
      return;
    }

    steps.push({
      id: stepIdGenerator.next(),
      currentNode: current,
      operation: "search",
      decision: "comparing",
      metadata: {
        searchValue: value,
        comparison: value < current.value ? "less" : value > current.value ? "greater" : "equal",
        description: `Comparing ${value} with ${current.value}`,
        isComplete: false,
      },
    });

    if (value < current.value) {
      if (current.left) {
        steps.push({
          id: stepIdGenerator.next(),
          currentNode: current,
          nextNode: current.left,
          operation: "search",
          decision: "go_left",
          metadata: {
            searchValue: value,
            description: `${value} < ${current.value}, go left`,
            isComplete: false,
          },
        });
        traverse(current.left);
      } else {
        steps.push({
          id: stepIdGenerator.next(),
          currentNode: current,
          operation: "search",
          decision: "not_found",
          metadata: {
            searchValue: value,
            comparison: "less",
            description: `${value} < ${current.value}, but no left child. Not found.`,
            isComplete: true,
            found: false,
          },
        });
      }
    } else if (value > current.value) {
      if (current.right) {
        steps.push({
          id: stepIdGenerator.next(),
          currentNode: current,
          nextNode: current.right,
          operation: "search",
          decision: "go_right",
          metadata: {
            searchValue: value,
            description: `${value} > ${current.value}, go right`,
            isComplete: false,
          },
        });
        traverse(current.right);
      } else {
        steps.push({
          id: stepIdGenerator.next(),
          currentNode: current,
          operation: "search",
          decision: "not_found",
          metadata: {
            searchValue: value,
            comparison: "greater",
            description: `${value} > ${current.value}, but no right child. Not found.`,
            isComplete: true,
            found: false,
          },
        });
      }
    } else {
      steps.push({
        id: stepIdGenerator.next(),
        currentNode: current,
        operation: "search",
        decision: "found",
        metadata: {
          searchValue: value,
          comparison: "equal",
          description: `Found ${value}!`,
          isComplete: true,
          found: true,
        },
      });
    }
  };

  traverse(node);
  return steps;
}

/**
 * Generate visualization steps for finding the minimum value in BST
 * 
 * Creates a sequence of steps that visualize the process of finding the minimum
 * value in a Binary Search Tree. In a BST, the minimum value is always located
 * at the leftmost node, so the algorithm simply traverses left until it finds
 * a node with no left child.
 * 
 * @param node - The root node of the BST
 * @returns Array of TraversalStep objects representing the find minimum process
 * 
 * @example
 * ```typescript
 * const tree = { 
 *   value: 8, 
 *   left: { value: 3, left: { value: 1 }, right: { value: 6 } },
 *   right: { value: 10 }
 * };
 * 
 * const steps = generateBSTFindMinSteps(tree);
 * const lastStep = steps[steps.length - 1];
 * console.log('Minimum value found:', lastStep.currentNode.value); // 1
 * 
 * // Steps will show: start at 8 -> go left to 3 -> go left to 1 -> found minimum
 * ```
 */
export function generateBSTFindMinSteps(
  node: BinaryTreeNode
): TraversalStep[] {
  const steps: TraversalStep[] = [];
  const stepIdGenerator = createStepIdGenerator("bst-findMin");

  const traverse = (current: BinaryTreeNode): void => {
    if (current.left) {
      steps.push({
        id: stepIdGenerator.next(),
        currentNode: current,
        nextNode: current.left,
        operation: "findMin",
        decision: "go_left",
        metadata: {
          description: `Has left child, minimum is in left subtree`,
          isComplete: false,
        },
      });
      traverse(current.left);
    } else {
      steps.push({
        id: stepIdGenerator.next(),
        currentNode: current,
        operation: "findMin",
        decision: "found",
        metadata: {
          description: `No left child, ${current.value} is the minimum`,
          isComplete: true,
        },
      });
    }
  };

  traverse(node);
  return steps;
}

/**
 * Generate visualization steps for finding the maximum value in BST
 * 
 * Creates a sequence of steps that visualize the process of finding the maximum
 * value in a Binary Search Tree. In a BST, the maximum value is always located
 * at the rightmost node, so the algorithm simply traverses right until it finds
 * a node with no right child.
 * 
 * @param node - The root node of the BST
 * @returns Array of TraversalStep objects representing the find maximum process
 * 
 * @example
 * ```typescript
 * const tree = { 
 *   value: 8, 
 *   left: { value: 3 },
 *   right: { value: 10, right: { value: 14, right: { value: 20 } } }
 * };
 * 
 * const steps = generateBSTFindMaxSteps(tree);
 * const lastStep = steps[steps.length - 1];
 * console.log('Maximum value found:', lastStep.currentNode.value); // 20
 * 
 * // Steps will show: start at 8 -> go right to 10 -> go right to 14 -> go right to 20 -> found maximum
 * ```
 */
export function generateBSTFindMaxSteps(
  node: BinaryTreeNode
): TraversalStep[] {
  const steps: TraversalStep[] = [];
  const stepIdGenerator = createStepIdGenerator("bst-findMax");

  const traverse = (current: BinaryTreeNode): void => {
    if (current.right) {
      steps.push({
        id: stepIdGenerator.next(),
        currentNode: current,
        nextNode: current.right,
        operation: "findMax",
        decision: "go_right",
        metadata: {
          description: `Has right child, maximum is in right subtree`,
          isComplete: false,
        },
      });
      traverse(current.right);
    } else {
      steps.push({
        id: stepIdGenerator.next(),
        currentNode: current,
        operation: "findMax",
        decision: "found",
        metadata: {
          description: `No right child, ${current.value} is the maximum`,
          isComplete: true,
        },
      });
    }
  };

  traverse(node);
  return steps;
}

/**
 * Tree rotation operations for balancing and restructuring
 * 
 * Rotations are fundamental operations used in self-balancing trees like AVL and Red-Black trees.
 * They preserve the BST property while changing the tree structure to improve balance.
 */

/**
 * Represents the type of rotation being performed
 */
export type RotationType = "left" | "right";

/**
 * Performs a left rotation around a pivot node
 * 
 * Left rotation transforms:
 *    P               R
 *   / \             / \
 *  L   R    =>     P   RR
 *     / \         / \
 *    RL  RR      L   RL
 * 
 * @param tree - The tree containing the pivot
 * @param pivotValue - The value of the pivot node to rotate around
 * @returns Steps showing the rotation process
 */
export function generateLeftRotationSteps(
  tree: BinaryTreeNode,
  pivotValue: number
): TraversalStep[] {
  const steps: TraversalStep[] = [];
  const stepIdGenerator = createStepIdGenerator("left-rotation");

  // Find the pivot node
  let pivot: BinaryTreeNode | undefined;

  const findPivot = (current: BinaryTreeNode): void => {
    if (current.value === pivotValue) {
      pivot = current;
      return;
    }
    
    if (current.left && current.left.value === pivotValue) {
      pivot = current.left;
      return;
    }
    
    if (current.right && current.right.value === pivotValue) {
      pivot = current.right;
      return;
    }

    if (current.left) findPivot(current.left);
    if (current.right) findPivot(current.right);
  };

  findPivot(tree);

  if (!pivot) {
    steps.push({
      id: stepIdGenerator.next(),
      currentNode: tree,
      operation: "leftRotation",
      decision: "not_found",
      metadata: {
        searchValue: pivotValue,
        description: `Pivot node ${pivotValue} not found in tree`,
        isComplete: true,
      },
    });
    return steps;
  }

  if (!pivot.right) {
    steps.push({
      id: stepIdGenerator.next(),
      currentNode: pivot,
      operation: "leftRotation",
      decision: "not_found",
      metadata: {
        searchValue: pivotValue,
        description: `Cannot perform left rotation: node ${pivotValue} has no right child`,
        isComplete: true,
      },
    });
    return steps;
  }

  // Step 1: Locate the pivot
  steps.push({
    id: stepIdGenerator.next(),
    currentNode: pivot,
    operation: "leftRotation",
    decision: "found",
    metadata: {
      searchValue: pivotValue,
      description: `Located pivot node ${pivotValue} for left rotation`,
      isComplete: false,
    },
  });

  // Step 2: Identify the right child (new root)
  const rightChild = pivot.right;
  steps.push({
    id: stepIdGenerator.next(),
    currentNode: rightChild,
    operation: "leftRotation",
    decision: "comparing",
    metadata: {
      description: `Right child ${rightChild.value} will become the new root of this subtree`,
      isComplete: false,
      rotationType: "left",
      pivotValue: pivotValue,
      newRootValue: rightChild.value,
    },
  });

  // Step 3: Handle the right child's left subtree
  if (rightChild.left) {
    steps.push({
      id: stepIdGenerator.next(),
      currentNode: rightChild.left,
      operation: "leftRotation",
      decision: "comparing",
      metadata: {
        description: `Moving subtree rooted at ${rightChild.left.value} to become right child of pivot ${pivotValue}`,
        isComplete: false,
        rotationType: "left",
      },
    });
  } else {
    steps.push({
      id: stepIdGenerator.next(),
      currentNode: rightChild,
      operation: "leftRotation",
      decision: "comparing",
      metadata: {
        description: `No left subtree to move from ${rightChild.value}`,
        isComplete: false,
        rotationType: "left",
      },
    });
  }

  // Step 4: Perform the rotation
  steps.push({
    id: stepIdGenerator.next(),
    currentNode: pivot,
    nextNode: rightChild,
    operation: "leftRotation",
    decision: "comparing",
    metadata: {
      description: `Rotating: ${rightChild.value} becomes parent of ${pivot.value}`,
      isComplete: false,
      rotationType: "left",
      beforeRotation: {
        pivot: pivot.value,
        rightChild: rightChild.value,
        rightChildLeft: rightChild.left?.value,
      },
    },
  });

  // Step 5: Complete the rotation
  steps.push({
    id: stepIdGenerator.next(),
    currentNode: rightChild,
    operation: "leftRotation",
    decision: "found",
    metadata: {
      description: `Left rotation complete. Tree structure changed around ${pivotValue}`,
      isComplete: true,
      rotationType: "left",
      afterRotation: {
        newRoot: rightChild.value,
        leftChild: pivot.value,
      },
    },
  });

  return steps;
}

/**
 * Performs a right rotation around a pivot node
 * 
 * Right rotation transforms:
 *      P             L
 *     / \           / \
 *    L   R   =>   LL   P
 *   / \               / \
 *  LL  LR            LR  R
 * 
 * @param tree - The tree containing the pivot
 * @param pivotValue - The value of the pivot node to rotate around
 * @returns Steps showing the rotation process
 */
export function generateRightRotationSteps(
  tree: BinaryTreeNode,
  pivotValue: number
): TraversalStep[] {
  const steps: TraversalStep[] = [];
  const stepIdGenerator = createStepIdGenerator("right-rotation");

  // Find the pivot node
  let pivot: BinaryTreeNode | undefined;

  const findPivot = (current: BinaryTreeNode): void => {
    if (current.value === pivotValue) {
      pivot = current;
      return;
    }
    if (current.left) findPivot(current.left);
    if (current.right) findPivot(current.right);
  };

  findPivot(tree);

  if (!pivot) {
    steps.push({
      id: stepIdGenerator.next(),
      currentNode: tree,
      operation: "rightRotation",
      decision: "not_found",
      metadata: {
        searchValue: pivotValue,
        description: `Pivot node ${pivotValue} not found in tree`,
        isComplete: true,
      },
    });
    return steps;
  }

  if (!pivot.left) {
    steps.push({
      id: stepIdGenerator.next(),
      currentNode: pivot,
      operation: "rightRotation",
      decision: "not_found",
      metadata: {
        searchValue: pivotValue,
        description: `Cannot perform right rotation: node ${pivotValue} has no left child`,
        isComplete: true,
      },
    });
    return steps;
  }

  const leftChild = pivot.left;

  // Step 1: Locate the pivot
  steps.push({
    id: stepIdGenerator.next(),
    currentNode: pivot,
    operation: "rightRotation",
    decision: "found",
    metadata: {
      searchValue: pivotValue,
      description: `Located pivot node ${pivotValue} for right rotation`,
      isComplete: false,
    },
  });

  // Step 2: Identify the left child (new root)
  steps.push({
    id: stepIdGenerator.next(),
    currentNode: leftChild,
    operation: "rightRotation",
    decision: "comparing",
    metadata: {
      description: `Left child ${leftChild.value} will become the new root of this subtree`,
      isComplete: false,
      rotationType: "right",
      pivotValue: pivotValue,
      newRootValue: leftChild.value,
    },
  });

  // Step 3: Handle the left child's right subtree
  if (leftChild.right) {
    steps.push({
      id: stepIdGenerator.next(),
      currentNode: leftChild.right,
      operation: "rightRotation",
      decision: "comparing",
      metadata: {
        description: `Moving subtree rooted at ${leftChild.right.value} to become left child of pivot ${pivotValue}`,
        isComplete: false,
        rotationType: "right",
      },
    });
  } else {
    steps.push({
      id: stepIdGenerator.next(),
      currentNode: leftChild,
      operation: "rightRotation",
      decision: "comparing",
      metadata: {
        description: `No right subtree to move from ${leftChild.value}`,
        isComplete: false,
        rotationType: "right",
      },
    });
  }

  // Step 4: Complete the rotation
  steps.push({
    id: stepIdGenerator.next(),
    currentNode: leftChild,
    operation: "rightRotation",
    decision: "found",
    metadata: {
      description: `Right rotation complete. Tree structure changed around ${pivotValue}`,
      isComplete: true,
      rotationType: "right",
      afterRotation: {
        newRoot: leftChild.value,
        rightChild: pivot.value,
      },
    },
  });

  return steps;
}
