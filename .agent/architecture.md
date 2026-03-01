---
description: Architecture of sci-grid for AI Agents
---
# AI SYSTEM INSTRUCTION: sci-grid Architecture

**CRITICAL DIRECTIVE**: This document defines the engine's rendering architecture. Avoid making changes that force full canvas redraws.

## 1. The Rendering Loop

`sci-grid` achieves 60fps by strictly drawing only what is visible in the viewport.

- **Virtualization**: On `scroll`, the engine translates `scrollTop / scrollLeft` into `startRow`, `endRow`, `startCol`, `endCol` based on predefined row heights and column widths.
- **Draw Call**: The `CanvasRenderingContext2D` iterates exactly over the visible subset. It draws lines for borders, fills for backgrounds, and `fillText` for data.
- **Throttling**: Scroll events trigger via `requestAnimationFrame` to ensure tearing doesn't happen.

## 2. The Provider System (Data Source)

The `SciGrid` holds zero row data.
When it decides it needs to draw Row 5, Column 10 (`x=100, y=150`), it calls:
`provider.getCellData(5, 10)` synchronously.

If the user implements a provider that does a slow HTTP request inside `getCellData`, the entire grid will freeze. Network lazy-loading logic must be handled asynchronously inside the User's Provider, returning placeholders immediately and triggering an `update()` signal to the grid later.

## 3. State Management

- **Scroll State**: Managed internally via phantom DOM scrollbars or touch interpolation.
- **Config**: Visuals (colors, fonts, header height) are managed via a single `GridConfig` interface object to avoid massive prop-drilling.
- **Editing**: Cell editing uses an overlay input. `SciGrid` exposes `startEdit(row, col)`, which mounts an absolute-positioned HTML `<input>` directly over the canvas coordinate. Value submission calls `provider.setCellData(row, col, val)`.
