# VeloGrid

A high-performance, canvas-based, framework-agnostic Data Grid engine designed for large datasets.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features
- **Extreme Performance**: Virtualized rendering using HTML5 Canvas. Handle millions of rows and hundreds of columns with 60FPS scrolling.
- **Framework Agnostic**: Core engine written in vanilla TypeScript with zero dependencies.
- **Native Adapters**: First-class support for **React**, **Vue**, **SolidJS**, **Angular**, and **Astro**.
- **Excel-like Experience**: Multi-line headers, column reordering (ghost reorder), resizing, and cell editing.
- **Sub-pixel Precision**: Smooth scrolling and fluid visual feedback.
- **Theming Engine**: Deeply customizable typography and colors, including glassmorphism and modern aesthetics.

## Installation

```bash
npm install velosci-grid
# or
pnpm add velosci-grid
```

## Core Concepts

### 1. The Provider System (`IDataGridProvider`)
Unlike traditional grids that store data internally, VeloGrid uses a **reactive provider pattern**. You tell the grid how to get your data, and it handles the visual virtualization.

```typescript
interface IDataGridProvider {
    getRowCount(): number;
    getColumnCount(): number;
    getCellData(row: number, col: number): string | number;
    getHeader(colIndex: number): ColumnHeaderInfo;
    // Optional: High-speed updates
    setCellData?(row: number, col: number, value: any): void;
}
```

### 2. Configuration (`GridConfig`)
Everything from row height to header sub-text styling is controlled via a unified config object.

---

## Framework Quick Start

### React
```tsx
import { VeloGridReact } from 'velosci-grid/react';

const myProvider = { /* ... implementation ... */ };

function App() {
  return (
    <div style={{ height: '500px' }}>
      <VeloGridReact 
        provider={myProvider} 
        config={{ headerHeight: 60, rowHeight: 30 }} 
      />
    </div>
  );
}
```

### Vue 3
```vue
<template>
  <div style="height: 500px">
    <VeloGridVue :provider="myProvider" :config="gridConfig" />
  </div>
</template>

<script setup>
import { VeloGridVue } from 'velosci-grid/vue';
const myProvider = { /* ... */ };
const gridConfig = { headerHeight: 60 };
</script>
```

### SolidJS
```tsx
import { VeloGridSolid } from 'velosci-grid/solid';

export const DataView = () => (
  <VeloGridSolid 
    provider={myProvider} 
    config={{ backgroundColor: '#1e1e1e', textColor: '#fff' }} 
  />
);
```

### Angular
```typescript
import { VeloGridAngular } from 'velosci-grid/angular';

@Component({
  standalone: true,
  imports: [VeloGridAngular],
  template: `<velogrid [provider]="myProvider" [config]="myConfig"></velogrid>`
})
export class AppComponent { ... }
```

### Astro
```astro
---
import VeloGrid from 'velosci-grid/astro';
const config = { headerHeight: 60 };
---
<VeloGrid id="main-grid" config={config} client:load />

<script>
  const provider = { ... };
  // Initialize with custom event
  window.dispatchEvent(new CustomEvent('velogrid-init-main-grid', { 
    detail: { provider } 
  }));
</script>
```

## Advanced Customization

### Professional Scientific Headers
VeloGrid supports multi-line scientific headers with units and descriptions:

```typescript
const config = {
  headerHeight: 60,
  headerSubTextCount: 2, // Enable units and description lines
  headerTitleStyle: { font: 'bold 12px Inter', color: '#222' },
  headerUnitsStyle: { font: 'italic 11px Inter', color: '#666' }
};

const provider = {
  getHeader: (c) => ({
    name: "Voltage",
    units: "mV",
    description: "Input range set to auto"
  }),
  // ...
};
```

## API Reference

### `VeloGrid` (Core)
- `new VeloGrid(container, provider, config)`
- `updateProvider(newProvider)`: Swap data source without re-mounting.
- `updateConfig(newConfig)`: Update styles or behavior on the fly.
- `destroy()`: Cleanup observers and listeners.

## Development

```bash
pnpm install
pnpm dev    # Playground
pnpm build  # Library Build
pnpm test   # Unit & Smoke Tests
```

## License
MIT - Created by VeloSci
