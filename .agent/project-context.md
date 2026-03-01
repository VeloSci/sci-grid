---
description: Context & Overview of the sci-grid library for AI Agents
---
# AI SYSTEM INSTRUCTION: sci-grid Context

**CRITICAL DIRECTIVE**: You are reading the core documentation for `sci-grid`. When tasked with modifying this datagrid, strictly adhere to these architectural tenets.

## 1. Project Definitions
- **Project Goal**: A high-performance, canvas-based, framework-agnostic Data Grid capable of handling millions of rows and hundreds of columns at 60 FPS.
- **Rendering Paradigm**: It uses HTML5 `<canvas>` (Vanilla API). It does NOT use DOM mapping (like rendering thousands of `<div>` tags).
- **Data Paradigm**: Uses a reactive "Provider" interface to fetch data incrementally, rather than storing massive multi-dimensional arrays internally.

## 2. Core Library Structure
The repository is a monorepo featuring the core engine and five UI wrappers:

### Core Engine (`packages/core/`)
- Contains all canvas drawing logic, scrolling translation, sub-pixel calculations, scrollbar emulation, and event handling (clicks, hovers).
- Exposes `SciGrid` constructor.

### UI Handlers (`packages/react`, `vue`, `solid`, `angular`, `astro`)
- Extremely thin wrappers that bind the DOM resizing events (`ResizeObserver`) to the `SciGrid` core and expose typed wrapper components.

## 3. Operational Boundaries (Do NOT do this)
- **DO NOT attempt to store data in the grid**: If tasked with displaying new data, adapt the `IDataGridProvider`. Do not attempt to add `setData()` or a `data` prop that accepts giant JSON arrays.
- **DO NOT use HTML for Cell contents**: Because the grid is a canvas, you cannot render a standard React `<button>` inside a cell. Interactivity requires detecting `x, y` mouse coordinates inside the canvas context.
