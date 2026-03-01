---
description: How SciGrid handles Canvas 2D operations and interactions
---
# Canvas Rendering Architecture

`sci-grid` relies entirely on a single `<canvas>` element. There are no DOM nodes for cells or rows.

## The Draw Loop
The engine (`SciGrid` class) hooks into a `requestAnimationFrame` loop synced with scroll events.
It calculates:
1. `scrollTop` and `scrollLeft`
2. Visible `startRow` / `endRow` based on `config.rowHeight`
3. Visible `startCol` / `endCol` based on `config.colWidth`

It iterates over this 2D slice, issuing raw path commands:
```typescript
ctx.fillStyle = config.rowEvenColor;
ctx.fillRect(x, y, width, height);

ctx.fillStyle = config.textColor;
ctx.fillText(text, x + 10, y + 20);
```

## Interaction Limitation
If you are tasked with adding a dropdown or a button inside a cell:
1. You **cannot** put an HTML `<button>` inside a canvas.
2. You must draw a rectangle that looks like a button using `ctx.fillRect`.
3. You must listen to the global Canvas `onClick` event.
4. You map the mouse `clientX` back into Grid Coordinates to detect if the click landed on your drawn "button".
5. For complex inputs (like a DatePicker), you mount an absolutely positioned HTML element floating *over* the canvas at those exact `x, y` coordinates.
