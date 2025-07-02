# Structures

An interactive web application for visualizing and learning about data structures and algorithms, built with React.

## Stack

This project uses:
- **React v19** with TypeScript for the UI
- **TanStack Router** for routing
- **Tailwind CSS** for styling  
- **Motion** for animations
- **D3** for data structure visualization
- **Vite** for build tooling

## Getting Started

```bash
npm install
npm run dev  # Start development server on port 3000
npm run build  # Build for production
npm run test  # Run tests
```

## Features

### Data Structures Supported

#### Binary Search Tree (BST)
- [x] Insert operation with step-by-step visualization
- [x] Search operation with traversal highlighting  
- [x] Find minimum/maximum values
- [ ] Delete operation (planned)
- [ ] Predecessor/successor operations (planned)

#### Planned Data Structures
- [ ] AVL Tree (self-balancing)
  - [ ] Tree rotations
  - [ ] Insert with balancing
  - [ ] Delete with balancing
- [ ] Red-Black Tree
- [ ] Heap (Min/Max)
- [ ] Trie (Prefix Tree)

## Architecture

The project uses a modular architecture with:

- **Core Framework**: Generic time-machine architecture for operation history and animation
- **Renderers**: Data structure-specific visualization components  
- **Components**: Reusable UI components
- **Routes**: Page-level components using TanStack Router

Each data structure has its own renderer with dedicated:
- Operation controllers
- Algorithm implementations  
- Visualization components
- Type definitions

- [ ] Share as URL
- [ ] Visualization as line tracing


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

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
