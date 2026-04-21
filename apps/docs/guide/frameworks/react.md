# React Integration

The `@velosci-grid/react` package provides a first-class React component wrapper around the core VeloGrid library.

## Installation

```bash
pnpm add @velosci-grid/react @velosci-grid/core
```

## Usage

Use the `VeloGridReact` component in your application.

```tsx
import { VeloGridReact } from '@velosci-grid/react';
import { useMemo } from 'react';

const MyGrid = () => {
  const provider = useMemo(() => ({
    getRowCount: () => 1000,
    getColumnCount: () => 20,
    getCellData: (r, c) => `Value ${r},${c}`,
    getHeader: (c) => ({ name: `Col ${c}` })
  }), []);

  return (
    <div style={{ height: '500px', width: '100%' }}>
      <VeloGridReact 
        provider={provider}
        config={{
            rowHeight: 30,
            showRowNumbers: true
        }}
      />
    </div>
  );
};
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `provider` | `IDataGridProvider` | The data provider for the grid. |
| `config` | `Partial<GridConfig>` | Optional configuration overrides. |
| `className` | `string` | Additional CSS classes for the container. |
| `style` | `CSSProperties` | Inline styles for the container. |
