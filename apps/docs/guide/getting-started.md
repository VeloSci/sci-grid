# Getting Started

SciGrid is a high-performance data grid designed for scientific and data-heavy applications. It uses HTML5 Canvas for rendering, allowing it to handle massive datasets without the overhead of thousands of DOM elements.

## Installation

Install the core package using your favorite package manager:

```bash
pnpm add @sci-grid/core
```

If you are using a framework, you can also install the dedicated adapter:

```bash
# For React
pnpm add @sci-grid/react

# For Vue
pnpm add @sci-grid/vue
```

## Basic Usage

Here is how you can initialize a basic grid in vanilla JavaScript:

```typescript
import { SciGrid } from '@sci-grid/core';

const container = document.getElementById('grid-container');
const provider = {
    getRowCount: () => 1000,
    getColumnCount: () => 100,
    getCellData: (r, c) => `Cell ${r}:${c}`,
    getHeader: (c) => ({ name: `Column ${c}` })
};

const grid = new SciGrid(container, provider);
```

## Next Steps

Check out the framework guides to see how to integrate SciGrid into your application:
- [React Integration](./frameworks/react)
- [Vue Integration](./frameworks/vue)

Learn about SciGrid's interactive features:
- [Context Menus](./context-menus) — Zone-aware menus with sections, checkboxes, sub-menus, and ARIA.
- [Keyboard Shortcuts](./keyboard-shortcuts) — Configurable shortcuts with custom actions.
- [Core Concepts](./core-concepts) — Virtualization, canvas rendering, and the data provider pattern.
