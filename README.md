# SciGrid

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
npm install sci-grid
# or
pnpm add sci-grid
```

## Core Concepts

### 1. The Provider System (`IDataGridProvider`)
Unlike traditional grids that store data internally, SciGrid uses a **reactive provider pattern**. You tell the grid how to get your data, and it handles the visual virtualization.

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
import { SciGridReact } from 'sci-grid/react';

const myProvider = { /* ... implementation ... */ };

function App() {
  return (
    <div style={{ height: '500px' }}>
      <SciGridReact 
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
    <SciGridVue :provider="myProvider" :config="gridConfig" />
  </div>
</template>

<script setup>
import { SciGridVue } from 'sci-grid/vue';
const myProvider = { /* ... */ };
const gridConfig = { headerHeight: 60 };
</script>
```

### SolidJS
```tsx
import { SciGridSolid } from 'sci-grid/solid';

export const DataView = () => (
  <SciGridSolid 
    provider={myProvider} 
    config={{ backgroundColor: '#1e1e1e', textColor: '#fff' }} 
  />
);
```

### Angular
```typescript
import { SciGridAngular } from 'sci-grid/angular';

@Component({
  standalone: true,
  imports: [SciGridAngular],
  template: `<sci-grid [provider]="myProvider" [config]="myConfig"></sci-grid>`
})
export class AppComponent { ... }
```

### Astro
```astro
---
import SciGrid from 'sci-grid/astro';
const config = { headerHeight: 60 };
---
<SciGrid id="main-grid" config={config} client:load />

<script>
  const provider = { ... };
  // Initialize with custom event
  window.dispatchEvent(new CustomEvent('scigrid-init-main-grid', { 
    detail: { provider } 
  }));
</script>
```

## Advanced Customization

### Professional Scientific Headers
SciGrid supports multi-line scientific headers with units and descriptions:

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

### `SciGrid` (Core)
- `new SciGrid(container, provider, config)`
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
