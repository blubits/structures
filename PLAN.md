# PLAN.md

## Refactor: Create a class-based interface for defining binary structures

### Rationale

- Move from mutable, builder-based state transitions to immutable, constructor-based transitions on the BinaryTree class.
- Create a unified abstract base class for all data structures to ensure consistency and extensibility.
- Simplify API: all state changes are pure, using constructor specifications.
- Ensure normalization and immutability at every step.
- Improve documentation and developer experience.

### Implementation Preference

**Prefer rewriting existing classes and files vs. creating new ones.** For example, do **not** create a new `AbstractDataStructure` file; instead, rewrite `DataStructureState`/`DataStructureElement` in existing files to fit the new architecture.

---

## Stages

### Stage 1: Design the Unified Abstract DataStructure Class

- **Rewrite** `DataStructureState` and `DataStructureElement` interfaces in `src/types/data-structure.ts` to include abstract base class functionality.
- Add required methods and properties for all data structures (e.g., normalization, toJSON/from, reconciliation).
- Document how new data structures should extend this base class.

**Clarification:**

- Instead of creating new files, enhance the existing `DataStructureState` and `DataStructureElement` interfaces in `src/types/data-structure.ts`.
- Add abstract base class methods to the interfaces:
  - Normalization is always performed in the constructor to guarantee all instances are valid and normalized.
  - `toJSON()`: Serializes the structure for storage or transmission.
  - `from(json)`: Deserializes from JSON.
  - `reconcile(prevState)`: Preserves element identity between states (see `reconcileBinaryTree`).
  - `validate()`: Returns a validation result (see `StateValidator`).
  - All states must be immutable (no mutation of objects; always return new instances).
- How to extend: New structures should implement these enhanced interfaces, implement normalization in the constructor, reconciliation, and serialization, and ensure immutability.

### Stage 2: Design the New BinaryTree API

- List all high-level operations needed (e.g., startTraversal, traverseLeft, insertHere, etc.).
- Decide on metadata and animationHints handling for each operation.
- Document constructor specification usage pattern.

**Clarification:**

- High-level operations (from `BinaryTreeStateBuilder`):
  - `startTraversal()`
  - `traverseLeft()`
  - `traverseRight()`
  - `insertHere(value)`
  - `insertLeftChild(value)`
  - `insertRightChild(value)`
  - `compareWith(value)`
  - `markVisited()`
  - `resetAll()`
  - `setName(name)`
  - Utility: `getCurrentNode()`, `hasLeftChild()`, `hasRightChild()`, `getStates()`
- Edge cases: Inserting at root, traversing to non-existent child, marking visited on null node, etc.
- Metadata/animationHints: Each operation should accept or generate animation hints and metadata for the renderer (see `animationHints` in state objects).
- Method chaining: All operations should return new immutable instances, allowing chaining.

### Stage 3: Refactor the BinaryTree Class

- **Rewrite** the `BinaryTree` interface in `src/structures/BinaryTree/types.ts` to be a class that implements the enhanced `DataStructureState`.
- Move normalization logic into the constructor.
- Implement new methods for traversal, comparison, insertion, etc.
- Ensure immutability (readonly properties, Object.freeze, etc.).
- Add helper methods for metadata and animationHints.

**Clarification:**

- Transform the existing `BinaryTree` interface in `src/structures/BinaryTree/types.ts` into a class.
- Immutability enforcement: Use `readonly` properties and always return new objects (see `updateBinaryTreeNode`, `updateBinaryTree`). For deep immutability, copy nested objects and arrays.
- Normalization: Move normalization logic to the constructor (see `normalizeBinaryTree`).
- Reconciliation: Implement using `reconcileBinaryTree` to preserve node identity.
- Serialization: Implement `toJSON` and `from` methods.
- Helper methods: For metadata and animationHints, use the same pattern as in builder/state objects.

### Stage 4: Migrate BinaryTreeStateBuilder Logic

- **Rewrite** `src/structures/BinaryTree/utils/BinaryTreeStateBuilder.ts` to migrate all logic into `BinaryTree` class methods.
- Port algorithms and state transition logic to BinaryTree methods.
- Remove internal state tracking from BinaryTreeStateBuilder.
- Add any missing utility functions to BinaryTree or as static helpers.

**Clarification:**

- All logic in `BinaryTreeStateBuilder` should become methods on the `BinaryTree` class in `src/structures/BinaryTree/types.ts`.
- Use the same algorithms for traversal, insertion, marking visited, etc.
- Remove internal state tracking; all transitions should be pure and stateless.
- Utility functions (e.g., for updating nodes/trees) should be static helpers or instance methods.
- The file `src/structures/BinaryTree/utils/BinaryTreeStateBuilder.ts` can be deleted after migration.

### Stage 5: Update All Usages in the Codebase

- **Rewrite** all files that use `BinaryTreeStateBuilder` to use the new `BinaryTree` API.
- Update all state creation sites to use method chaining and immutable transitions.
- Refactor any array-of-states logic to use the new API.
- Update tests to cover new method-based transitions.

**Clarification:**

- Migration strategy: Search for all usages of `BinaryTreeStateBuilder` (see `src/structures/BinaryTree/variants/BST/algorithms.ts`, etc.).
- Replace with the new API, updating state creation to use method chaining and immutable transitions.
- Refactor any logic that relies on mutability.
- Update tests to cover new transitions.
- Key files to rewrite:
  - `src/structures/BinaryTree/variants/BST/algorithms.ts`
  - `src/structures/BinaryTree/index.ts` (remove BinaryTreeStateBuilder export)
  - Any other files importing or using `BinaryTreeStateBuilder`

### Stage 6: Update Documentation and Examples

- Rewrite all code examples in docs/architecture.md and elsewhere to use the new BinaryTree API and abstract base class.
- Document the new constructor specification pattern for state transitions.
- Remove references to BinaryTreeStateBuilder from documentation.

### Stage 7: Remove BinaryTreeStateBuilder

- **Delete** the `BinaryTreeStateBuilder` class and related files.
- Ensure all code and documentation references are removed or replaced.

**Files to delete:**

- `src/structures/BinaryTree/utils/BinaryTreeStateBuilder.ts`

### Stage 8: Test and Validate

- Run all unit and integration tests to ensure correctness.
- Manually test interactive demos and visualizations for smooth transitions.
- Validate that history, reconciliation, and animation still work as expected.

**Clarification:**

- Testing: Existing tests cover state transitions and rendering. New tests should be added for the new API, especially for edge cases and immutability.
- Manual testing: Use interactive demos and visualizations to validate transitions.
- Coverage: Ensure all new methods and edge cases are tested.

### Stage 9: Final Review and Cleanup

- Review the codebase for any lingering references to the old builder.
- Ensure all new BinaryTree methods and the abstract base class are well-documented and covered by tests.
- Solicit feedback from other developers or users if possible.

---

## Implementation Notes

- All data structures should extend the unified abstract base class and implement required methods.
- All BinaryTree methods should be pure and return new instances.
- Normalization should happen in the constructor, so all trees are always valid.
- Reconciliation logic should remain for smooth visual transitions.
- Serialization/deserialization should use toJSON/from methods as needed.
- Document the new API and base class thoroughly for contributors and users.

**Clarification:**

- All data structures must extend the base class and implement required methods.
- All methods must be pure and return new instances.
- Normalization must happen in the constructor.
- Reconciliation logic should use the provided helpers.
- Serialization/deserialization should use `toJSON`/`from`.
- Documentation should be thorough, with examples in `docs/architecture.md`.

---

## Example API Usage

```ts
// BinaryTree is now a class (rewritten from interface) that implements 
// the enhanced DataStructureState interface
class BinaryTree implements DataStructureState {
  // ...methods...
}

const tree1 = new BinaryTree({ root: ... });
const tree2 = tree1.startTraversal();
const tree3 = tree2.traverseLeft();
const tree4 = tree3.insertHere(3);
const steps = [tree1, tree2, tree3, tree4];
```

---

## Goals

- Modern, immutable, and extensible BinaryTree API
- Unified, extensible architecture for all data structures
- Easy to use and reason about
- Robust for history, animation, and visualization
- Clean, maintainable codebase

---

## Files to be Rewritten or Modified

### Core Type Files (Rewrite)

- **`src/types/data-structure.ts`**: Enhance `DataStructureState` and `DataStructureElement` interfaces to include abstract base class functionality (normalization, serialization, reconciliation, validation methods).

### Binary Tree Files (Rewrite)

- **`src/structures/BinaryTree/types.ts`**: Convert `BinaryTree` interface to a class implementing enhanced `DataStructureState`. Add all traversal, insertion, and state management methods from `BinaryTreeStateBuilder`.

- **`src/structures/BinaryTree/index.ts`**: Remove `BinaryTreeStateBuilder` export and update to export the new `BinaryTree` class.

### Algorithm Files (Rewrite)

- **`src/structures/BinaryTree/variants/BST/algorithms.ts`**: Replace all `BinaryTreeStateBuilder` usage with new `BinaryTree` class API. Update all BST algorithms to use method chaining.

### Files to Delete

- **`src/structures/BinaryTree/utils/BinaryTreeStateBuilder.ts`**: Delete after migrating all logic to `BinaryTree` class.

### Files That May Need Updates

- **`src/structures/BinaryTree/variants/BST/operations/BSTInsertOperation.ts`**: May need updates if it uses `BinaryTreeStateBuilder`.

- **`src/structures/BinaryTree/variants/BST/index.ts`**: May need updates for exports.

- **Test files**: Any test files that use `BinaryTreeStateBuilder` will need to be updated to use the new API.

- **Documentation files**:
  - `docs/architecture.md`
  - `docs/binary_tree.md`
  - Any other documentation referencing the old builder pattern.
