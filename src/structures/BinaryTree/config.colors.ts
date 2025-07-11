// BinaryTree color config for global use
export const BINARY_TREE_COLORS = {
  light: {
    node: {
      default: '#fff', // white
      active: 'oklch(78.5% 0.19 49.8)', // orange-500
      visited: 'oklch(93.5% 0.02 257.1)', // gray-200
      border: {
        default: 'oklch(65% 0.02 257.1)', // gray-600 (much more distinct)
        active: 'oklch(65% 0.19 49.8)', // darker orange for better contrast
        visited: 'oklch(70% 0.03 257.1)' // gray-500 (more visible)
      },
      text: '#374151'
    },
    link: {
      default: 'oklch(60% 0.03 257.1)', // gray-600 (more distinct)
      active: 'oklch(78.5% 0.19 49.8)', // orange-500
      visited: 'oklch(70% 0.02 257.1)' // gray-500 (more visible)
    }
  },
  dark: {
    node: {
      default: '#fff', // white
      active: 'oklch(78.5% 0.19 49.8)', // orange-500
      visited: 'oklch(89.5% 0.03 257.1)', // gray-300
      border: {
        default: 'oklch(97.5% 0.01 257.1)', // gray-100 (light gray)
        active: 'oklch(60% 0.19 49.8)', // darker orange
        visited: 'oklch(77.5% 0.03 257.1)' // gray-300
      },
      text: '#000'
    },
    link: {
      default: '#fff',
      active: 'oklch(78.5% 0.19 49.8)',
      visited: 'oklch(75% 0.04 257.1)'
    }
  }
} as const;
