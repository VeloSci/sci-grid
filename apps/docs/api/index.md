# API Reference

Complete reference for the SciGrid Core API.

## Core Classes

### `SciGrid`

The main entry point for creating a grid instance.

| Constructor | Description |
| :--- | :--- |
| `new SciGrid(container, provider, config?)` | Initializes a new grid attached to the HTML element. |

#### Methods

- **`destroy()`**: Cleans up event listeners and DOM elements.
- **`updateConfig(config)`**: Merges new configuration options.
- **`renderNow()`**: Forces a synchronous render cycle.
- **`getSelection()`**: Returns the current selection state.

---

## Interfaces

### `IDataGridProvider`

The interface you must implement to supply data to the grid.

```typescript
interface IDataGridProvider {
  /** Total number of rows in the dataset */
  getRowCount(): number;

  /** Total number of columns */
  getColumnCount(): number;

  /** Return the value to display for a specific cell */
  getCellData(row: number, col: number): GridDataValue;

  /** Return header information for a column */
  getHeader(col: number): ColumnHeaderInfo;
  
  /** (Optional) Handle updates from the grid */
  setCellData?(row: number, col: number, value: any): void;
}
```

### `GridConfig`

Configuration object to customize grid appearance and behavior.

```typescript
interface GridConfig {
  /** Height of each row in pixels (default: 30) */
  rowHeight: number;
  
  /** Default width of columns in pixels (default: 100) */
  columnWidth: number;
  
  /** Height of the header row (default: 30) */
  headerHeight: number;
  
  /** Whether to show the fixed row number column */
  showRowNumbers: boolean;
  
  /** Background color of the grid canvas */
  backgroundColor: string;
  
  // ... see types source for full list
}
```

### `GridDataValue`

```typescript
type GridDataValue = string | number | boolean | null | undefined;
```
