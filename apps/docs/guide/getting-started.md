# Getting Started

SciGrid is a high-performance data grid designed for scientific and data-heavy applications. It uses HTML5 Canvas for rendering, allowing it to handle massive datasets without the overhead of thousands of DOM elements.

## Installation

Install the core package using your favorite package manager:

```bash
pnpm add @velo-sci/core
```

If you are using a framework, you can also install the dedicated adapter:

```bash
# For React
pnpm add @velo-sci/react

# For Vue
pnpm add @velo-sci/vue
```

## Basic Usage

Here is how you can initialize a basic grid in vanilla JavaScript:

```typescript
import { SciGrid } from '@velo-sci/core';

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
