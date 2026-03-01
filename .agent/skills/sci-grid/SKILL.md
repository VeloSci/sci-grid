---
name: sci-grid
description: High-performance, canvas-based, framework-agnostic Data Grid engine capable of handling millions of rows.
---

# SciGrid Skill

This skill equips agents to integrate and extend **sci-grid**, a sub-pixel precision Canvas-driven datagrid for massive datasets.

## Quick Start (Provider Pattern)

To initialize a grid, you do NOT pass data arrays. You pass a Provider:

```tsx
import { SciGridReact } from '@sci-grid/react';

// 1. Implement the Data Provider interface
class FastMockProvider {
    getRowCount() { return 1000000; } // 1 Million Rows
    getColumnCount() { return 100; }
    
    getCellData(row, col) {
        return `R${row}C${col}`;
    }
    
    getHeader(col) {
        return { name: `Column ${col}`, units: 'N/A' };
    }
}

// 2. Render the Grid
function App() {
  const provider = new FastMockProvider();
  
  return (
    <div style={{ height: '800px', width: '100%' }}>
      <SciGridReact 
        provider={provider} 
        config={{ 
            headerHeight: 60, 
            rowHeight: 30,
            headerSubTextCount: 2 
        }} 
      />
    </div>
  );
}
```

## Core Concepts

- **True Virtualization**: Driven entirely by `<canvas>`. Only the cells visible on screen exist in memory or are drawn.
- **Provider Pattern**: Data is pulled reactively via `getCellData(row, col)` synchronously on the render tick.
- **Zero-DOM**: There are no standard HTML components (like `<div>` or `<button>`) inside the cells. All visuals are lines, filled rects, and text strokes.
- **Smooth Scrolling**: Sub-pixel translations calculate smooth kinetic scrolling automatically.

## Guidelines for Agents

1. **DOM Injection Ban**: DO NOT attempt to return React components for individual grid cells. `return <Button>Click</Button>` will crash the grid. If you need custom visuals, hook into the Core's `customRenderer` logic to use Canvas APIs (`ctx.fillRect`).
2. **Provider Speed**: The `getCellData` method must execute in O(1) time. Do NOT execute `fetch()` or heavy parsing inside it. If data is still loading, return a string like `"Loading..."` and asynchronously update the provider cache.
3. **Framework Wrappers**: The codebase provides `/react`, `/vue`, and `/solid`. Make sure to import the correct framework adapter rather than instantiating the Vanilla `SciGrid` class inside a framework component.
4. **Interactivity Limit**: Interactivity (clicks) is handled by mapping Global Canvas X/Y coordinates to Rows/Cols. Attach listeners to the Grid Instance, not the "cells".

## Synthesis of Possibilities

- **Scientific Headers**: Support for multi-line headers with units and metadata.
- **Real-time Streaming**: Connect the Provider to a WebSocket for a 60FPS scrolling ticker.
- **Cell Overlays**: Render Sparklines or progress bars natively via `ctx` strokes.
- **Ghost Columns**: Drag and drop column reordering with native visual shadows.

## Agent Implementation Checklist

When tasked with adding the data grid to a view:
1. **Data Source**: Inspect where the data comes from (API, Array).
2. **Provider Creation**: Implement an `IDataGridProvider` wrapper around that data source.
4. **Configuration**: Use `GridConfig` to match the UX Theme (Dark mode, glass, fonts).

## Comprehensive Guides
- [Provider Pattern Architecture](./resources/provider-pattern.md)
- [Canvas Rendering Loop](./resources/canvas-rendering.md)
- [Framework Adapters Lifecycle](./resources/framework-adapters.md)

## Practical Examples
- [React Provider Setup](./examples/react-provider.tsx)
- [Vue Provider Setup](./examples/vue-provider.vue)
- [SolidJS Provider Setup](./examples/solid-provider.tsx)
- [Angular Component Integration](./examples/angular-component.ts)
- [Custom Canvas Cell Renderer](./examples/custom-renderer.ts)
