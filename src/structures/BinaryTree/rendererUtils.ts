import type { BinaryTreeNode } from '@structures/BinaryTree/types';

/**
 * Data structure for node rendering information.
 */
export type NodeData = {
  value: number;
  x: number;
  y: number;
  state: string;
  id?: string; // Include node ID for better reconciliation
};

/**
 * Data structure for link rendering information.
 */
export type LinkData = {
  source: { x: number; y: number };
  target: { x: number; y: number };
  id: string;
  sourceValue: number;
  targetValue: number;
};

/**
 * Calculates node positions for a binary tree layout.
 */
export function calculateTreeLayout(root: BinaryTreeNode | null, CONFIG: any): Map<number, {x: number, y: number}> {
  const positions = new Map<number, {x: number, y: number}>();
  if (!root) return positions;

  // Calculate horizontal spacing based on tree width
  const getTreeWidth = (node: BinaryTreeNode | null): number => {
    if (!node) return 0;
    if (!node.left && !node.right) return 1;
    return getTreeWidth(node.left) + getTreeWidth(node.right);
  };

  const treeWidth = getTreeWidth(root);
  const totalWidth = Math.max(treeWidth * CONFIG.siblingDistance, 400);

  // Position nodes using in-order traversal
  let currentX = CONFIG.margins.left;
  
  const positionNodes = (node: BinaryTreeNode | null, depth: number = 0): void => {
    if (!node) return;

    // Position left subtree first
    if (node.left) {
      positionNodes(node.left, depth + 1);
    }

    // Position current node
    const y = CONFIG.margins.top + depth * CONFIG.levelHeight;
    positions.set(node.value, { x: currentX, y });
    currentX += CONFIG.siblingDistance;

    // Position right subtree
    if (node.right) {
      positionNodes(node.right, depth + 1);
    }
  };

  positionNodes(root);
  
  // Center the tree horizontally
  const allPositions = Array.from(positions.values());
  const minX = Math.min(...allPositions.map(p => p.x));
  const maxX = Math.max(...allPositions.map(p => p.x));
  const treeActualWidth = maxX - minX;
  const offsetX = (totalWidth - treeActualWidth) / 2;

  // Apply horizontal centering
  for (const [value, pos] of positions.entries()) {
    positions.set(value, { x: pos.x + offsetX, y: pos.y });
  }

  return positions;
}

/**
 * Returns the fill color for a node based on its state.
 */
export function getNodeFillColor(state: string, colors: any): string {
  switch (state) {
    case 'active': return colors.node.active;
    case 'visited': return colors.node.visited;
    default: return colors.node.default;
  }
}

/**
 * Returns the animation duration in ms for a given speed.
 */
export function getAnimationDuration(speed: 'slow' | 'normal' | 'fast'): number {
  switch (speed) {
    case 'slow': return 1000;
    case 'fast': return 300;
    default: return 600;
  }
}

/**
 * Collects all nodes and links for rendering, assigning stable IDs for reconciliation.
 */
export function collectNodesAndLinks(
  tree: BinaryTreeNode,
  positions: Map<number, { x: number; y: number }>
): { nodes: NodeData[]; links: LinkData[] } {
  const nodes: NodeData[] = [];
  const links: LinkData[] = [];

  const traverse = (node: BinaryTreeNode | null): void => {
    if (!node) return;

    const pos = positions.get(node.value);
    if (!pos) return;

    // Use the node's internal state directly
    const nodeState = node.state || 'default';

    nodes.push({
      value: node.value,
      x: pos.x,
      y: pos.y,
      state: nodeState,
      id: node.id // Use the stable ID from reconciliation
    });

    // Add links to children with stable IDs based on node relationships
    if (node.left) {
      const childPos = positions.get(node.left.value);
      if (childPos) {
        links.push({
          source: { x: pos.x, y: pos.y },
          target: { x: childPos.x, y: childPos.y },
          // Use node IDs for stable link identity (important for reconciliation)
          id: `${node.id}-${node.left.id}`,
          sourceValue: node.value,
          targetValue: node.left.value
        });
      }
      traverse(node.left);
    }

    if (node.right) {
      const childPos = positions.get(node.right.value);
      if (childPos) {
        links.push({
          source: { x: pos.x, y: pos.y },
          target: { x: childPos.x, y: childPos.y },
          // Use node IDs for stable link identity (important for reconciliation)
          id: `${node.id}-${node.right.id}`,
          sourceValue: node.value,
          targetValue: node.right.value
        });
      }
      traverse(node.right);
    }
  };

  traverse(tree);
  return { nodes, links };
}
