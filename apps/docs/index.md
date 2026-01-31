---
layout: home

hero:
  name: SciGrid
  text: Precision Orthogonal Grid
  tagline: High-performance, canvas-powered grid engine for massive scientific datasets and real-time visualization.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: Explore Examples
      link: /examples/
    - theme: alt
      text: GitHub
      link: https://github.com/VeloSci/sci-grid

features:
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><defs><linearGradient id="gridGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#3b82f6"/><stop offset="100%" style="stop-color:#00f2ff"/></linearGradient></defs><rect x="8" y="8" width="48" height="48" rx="4" stroke="url(#gridGrad)" stroke-width="3"/><path d="M8 24h48M8 40h48M24 8v48M40 8v48" stroke="url(#gridGrad)" stroke-width="2.5" opacity="0.6"/><path d="M32 24v16M24 32h16" stroke="#00f2ff" stroke-width="3" stroke-linecap="round"/></svg>'
    title: Infinite Scalability
    details: Handle millions of rows and thousands of columns with zero latency. Optimized memory management for big data.
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><defs><linearGradient id="perfGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#3b82f6"/><stop offset="100%" style="stop-color:#00f2ff"/></linearGradient></defs><path d="M12 48L32 12l20 36H12z" stroke="url(#perfGrad)" stroke-width="3" stroke-linejoin="round"/><path d="M32 24v16M28 32h8" stroke="#00f2ff" stroke-width="2.5" stroke-linecap="round"/></svg>'
    title: Canvas Rendering
    details: Leverages high-performance canvas drawing for sub-pixel precision and fluid 60 FPS interactions.
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><defs><linearGradient id="sciGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#3b82f6"/><stop offset="100%" style="stop-color:#00f2ff"/></linearGradient></defs><path d="M10 20h44M10 32h44M10 44h44" stroke="url(#sciGrad)" stroke-width="3"/><path d="M16 14v12M28 14v12M40 14v12M52 14v12M16 38v12" stroke="url(#sciGrad)" stroke-width="2" opacity="0.5"/></svg>'
    title: Scientific Utilities
    details: Built-in support for SI units, sparklines, progress bars, and high-precision scientific notation.
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><defs><linearGradient id="crossGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#3b82f6"/><stop offset="100%" style="stop-color:#00f2ff"/></linearGradient></defs><path d="M8 8l48 48M56 8L8 56" stroke="url(#crossGrad)" stroke-width="2" opacity="0.3"/><circle cx="32" cy="32" r="28" stroke="url(#crossGrad)" stroke-width="3"/><path d="M32 16v32M16 32h32" stroke="#00f2ff" stroke-width="3" stroke-linecap="round"/></svg>'
    title: Framework Agnostic
    details: Core engine written in TypeScript. Full-featured adapters for React, Vue, SolidJS, and Angular.
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><defs><linearGradient id="themeGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#3b82f6"/><stop offset="100%" style="stop-color:#00f2ff"/></linearGradient></defs><path d="M32 8C18.7 8 8 18.7 8 32s10.7 24 24 24c2.2 0 4-1.8 4-4 0-1-.4-2-1-2.7-.6-.7-1-1.6-1-2.7 0-2.2 1.8-4 4-4h4.7c8.8 0 16-7.2 16-16C58.7 17.3 47.3 8 32 8z" stroke="url(#themeGrad)" stroke-width="3"/><circle cx="20" cy="28" r="4" fill="#3b82f6"/><circle cx="28" cy="18" r="4" fill="#60a5fa"/><circle cx="40" cy="18" r="4" fill="#00f2ff"/><circle cx="48" cy="28" r="4" fill="#8b5cf6"/></svg>'
    title: Fully Themeable
    details: Dynamic CSS variables, custom cell renderers, and built-in dark mode support.
  - icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none"><defs><linearGradient id="extGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#3b82f6"/><stop offset="100%" style="stop-color:#00f2ff"/></linearGradient></defs><path d="M24 12V8a4 4 0 014-4h8a4 4 0 014 4v4M12 24H8a4 4 0 00-4 4v8a4 4 0 004 4h4M52 24h4a4 4 0 014 4v8a4 4 0 014 4h-4M24 52v4a4 4 0 004 4h8a4 4 0 004-4v-4" stroke="url(#extGrad)" stroke-width="3"/><rect x="24" y="24" width="16" height="16" rx="2" stroke="url(#extGrad)" stroke-width="3"/></svg>'
    title: Extensible Architecture
    details: Modular plugin system for sorting, filtering, selection, and custom interactions.
---

## Live Performance Demo

Experience the speed of SciGrid rendering **1,000,000 rows** without breaking a sweat.

<div class="demo-container-million-rows">
  <MillionRowsDemo />
</div>

## Quick Start

### Installation

```bash
npm install @sci-grid/core
# or
pnpm add @sci-grid/core
```

### Basic Usage (React)

```tsx
import { SciGridReact } from '@sci-grid/react';

const columns = [
  { key: 'id', title: 'ID', width: 80 },
  { key: 'name', title: 'Name', width: 200 },
  { key: 'value', title: 'Measurement', type: 'scientific' }
];

const data = [/* your massive dataset */];

function App() {
  return <Grid columns={columns} data={data} height={600} />;
}
```

## Comparisons

| Feature | SciGrid | AG Grid | TanStack Table |
|---------|---------|---------|----------------|
| Max Rows (Lag-free) | **∞ (Canvas)** | ~100k (DOM) | ~10k (DOM) |
| Multi-Framework | ✅ Native | ✅ Wrapper | ✅ Headless |
| Scientific Units | ✅ Built-in | ❌ | ❌ |
| Drawing Mode | Canvas 2D | DOM / Canvas | DOM Only |
| Real-time Updates | ✅ Optimized | ⚠️ Heavy | ⚠️ Heavy |

## Why SciGrid?

- **Zero DOM Overhead** - By using Canvas for the entire grid surface, we eliminate the performance bottlenecks of traditional table libraries.
- **Scientific Precision** - Designed by instrument developers for instrument developers.
- **Micro-Bundle** - Small footprint, zero external dependencies in the core engine.
- **Industrial Strength** - Built to run on laboratory equipment and high-performance monitoring stations.

---

<footer class="landing-footer">
  <p>© 2026 VeloSci Instrumentation / Powered by SciChart DNA</p>
</footer>

<style scoped>
.demo-container {
  margin: 2rem 0;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--sci-border);
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
}
.landing-footer {
  text-align: center;
  margin-top: 4rem;
  padding: 2rem;
  border-top: 1px solid var(--sci-border);
  color: var(--sci-text-muted);
  font-size: 0.85rem;
}
</style>
