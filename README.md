# Structures

An interactive web application for visualizing and learning about data structures and algorithms. Built with React, TypeScript, and modern web technologies.

## Features

- **Binary Search Tree Visualizer**: Interactive visualization of BST operations including insertion, deletion, and search
- **Operation History**: Track and replay operations with a comprehensive history system
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Dark/Light Theme**: Toggle between dark and light modes
- **Smooth Animations**: Beautiful transitions and animations powered by Motion

## Getting Started

### Prerequisites

- Node.js (version 18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd structures
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`.

## Building for Production

To build the application for production:

```bash
npm run build
```

To preview the production build:

```bash
npm run serve
```

## Testing

Run the test suite with:

```bash
npm run test
```

## Project Structure

```
src/
├── components/           # React components
│   ├── BinaryTree/      # BST visualization components
│   ├── ui/              # Reusable UI components
│   └── ...
├── lib/                 # Utility functions and algorithms
│   ├── algorithms/      # Data structure implementations
│   └── ...
├── routes/              # Application routes
└── styles.css          # Global styles
```

## Technology Stack

- **React 19** - Modern React with latest features
- **TypeScript** - Type-safe JavaScript
- **TanStack Router** - File-based routing
- **Tailwind CSS** - Utility-first CSS framework
- **Motion** - Animation library
- **D3.js** - Data visualization
- **Vite** - Fast build tool
- **Vitest** - Testing framework

## Available Data Structures

### Binary Search Tree (BST)
- Interactive insertion and deletion
- Search operations with visual feedback
- Tree traversal animations
- Balance factor visualization

*More data structures coming soon!*

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
