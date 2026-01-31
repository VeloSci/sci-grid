# SolidJS Integration

The `@velo-sci/solid` package provides a fine-grained reactive wrapper for SolidJS.

## Installation

```bash
pnpm add @velo-sci/solid @velo-sci/core
```

## Usage

```tsx
import { SciGridSolid } from '@velo-sci/solid';
import { createMemo } from 'solid-js';

const App = () => {
  const provider = createMemo(() => ({
    getRowCount: () => 1000,
    getColumnCount: () => 20,
    getCellData: (r, c) => `Value ${r},${c}`,
    getHeader: (c) => ({ name: `Col ${c}` })
  }));

  return (
    <div style="height: 500px; width: 100%">
      <SciGridSolid 
        provider={provider()}
        config={{ rowHeight: 30 }}
      />
    </div>
  );
};

export default App;
```
