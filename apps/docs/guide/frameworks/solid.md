# SolidJS Integration

The `@velosci-grid/solid` package provides a fine-grained reactive wrapper for SolidJS.

## Installation

```bash
pnpm add @velosci-grid/solid @velosci-grid/core
```

## Usage

```tsx
import { VeloGridSolid } from '@velosci-grid/solid';
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
      <VeloGridSolid 
        provider={provider()}
        config={{ rowHeight: 30 }}
      />
    </div>
  );
};

export default App;
```
