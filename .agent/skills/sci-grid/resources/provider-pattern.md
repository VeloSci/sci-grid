---
description: How the reactive Provider architecture functions
---
# The Provider Pattern Architecture

`sci-grid` achieves massive virtualization by completely avoiding the `data={array}` pattern. If an array of 5 million rows was passed to React, diffing the Virtual DOM would freeze the browser.

## Contract Protocol
The `IDataGridProvider` interface is a contract. The Grid will request sub-sections of this data precisely when the Canvas viewport overlaps those coordinates during a tick.

```typescript
export interface IDataGridProvider {
    getRowCount(): number;
    getColumnCount(): number;
    getCellData(row: number, col: number): string | number | any;
    getHeader(col: number): ColumnHeaderInfo;
    
    // Optional Event Callbacks
    setCellData?(row: number, col: number, value: any): void;
    onRowClick?(row: number): void;
}
```

## Lazy Loading & Caching
Because `getCellData` is synchronous, you cannot `await fetch()` inside it.
If an agent needs to implement infinite scrolling:
1. Initialize a Provider with an empty cache array.
2. In `getCellData`, if a row is null, return `"Loading..."`.
3. In parallel, dispatch the network fetch.
4. When the fetch resolves, update the cache array and call `Grid.forceUpdate()` so the next canvas tick redraws the loaded data.
