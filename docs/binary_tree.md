# `BinaryTree`

A generic binary tree, and methods to visualize the binary tree.

Usage...

## Animation hints

Animation hints are registered with metadata schemas that define their expected format.
Each animation specifies exactly what metadata fields it expects and how to validate them.

When a BinaryTree with an animation hint renders into view, it will render the animation in.
When it exits the view, it will render the animation in reverse.

### Registered Animations:

* `traverse-down`: Renders a pulsing dot that travels along the link from `sourceValue` to `targetValue`. The link itself remains unchanged while a glowing blue dot animates along the path with subtle pulsing effects.

**Expected metadata format:**
```json
{
    "type": "traverse-down",
    "metadata": {
        "sourceValue": 42,
        "targetValue": 56
    }
}
```

The animation system automatically validates metadata and extracts target information based on each animation's registered schema. This allows for flexible animation definitions without hard-coding metadata field names in the renderer.
