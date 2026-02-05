# Core Concepts

SciGrid is built on a few key concepts that allow it to be extremely performant.

## Virtualization

Unlike traditional HTML tables that render a DOM node for every cell, SciGrid uses a "virtual viewport". It only calculates and draws the cells that are currently visible to the user. This means the performance is independent of the dataset size—whether you have 100 rows or 1,000,000 rows, the rendering cost is the same.

## The Canvas Renderer

We use the HTML5 `<canvas>` element for all rendering. This provides:
- **Zero DOM Overhead**: No DOM nodes are created for cells.
- **Sub-pixel Precision**: Smooth scrolling and rendering.
- **Hardware Acceleration**: Browsers optimize canvas drawing operations.

## Data Provider Pattern

SciGrid doesn't store your data. Instead, it asks for it via the `IDataGridProvider` interface.

```typescript
interface IDataGridProvider {
    getRowCount(): number;
    getColumnCount(): number;
    getCellData(row: number, col: number): GridDataValue;
    getHeader(col: number): ColumnHeaderInfo;
}
```

This "pull" model means you can connect SciGrid directly to your state management store, a WebWorker, or even stream data lazily, without duplicating it into the grid's internal memory.

## Interactivity

SciGrid comes with desktop-class interactivity built-in:
- **Context Menus**: Native-feeling menus for quick actions.
- **Auto-Resizing**: Double-click headers to fit content.
- **Data Export**: Copy-paste compatibility and CSV export.
- **Keyboard Navigation**: Excel-like shortcuts for power users.
