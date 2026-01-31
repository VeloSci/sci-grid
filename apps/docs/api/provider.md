# IDataGridProvider

The `IDataGridProvider` interface acts as the bridge between your data source and the SciGrid renderer.

## Interface Definition

```typescript
export interface IDataGridProvider {
    getRowCount(): number;
    getColumnCount(): number;
    getCellData(row: number, col: number): GridDataValue;
    getHeader(col: number): ColumnHeaderInfo;
    
    // Optional methods
    setCellData?(row: number, col: number, value: any): void;
    onRowsNeeded?(start: number, end: number): void;
    getRawData?(): Float32Array | Float64Array | null;
}
```

## Methods

### `getRowCount()`

**Returns:** `number`

Should return the total number of rows in your dataset.

### `getColumnCount()`

**Returns:** `number`

Should return the total number of columns available.

### `getCellData(row, col)`

**Parameters:**
- `row` (number): 0-based row index.
- `col` (number): 0-based column index.

**Returns:** `string | number | boolean | null | undefined`

Called by the renderer for every visible cell. This method must be fast. Avoid expensive calculations or network requests here.

### `getHeader(col)`

**Parameters:**
- `col` (number): 0-based column index.

**Returns:** `ColumnHeaderInfo`

Returns the metadata for a specific column header.

```typescript
interface ColumnHeaderInfo {
    name: string;              // Main text
    units?: string;            // Sub-text 1
    description?: string;      // Sub-text 2
    type?: ColumnType;         // 'text', 'numeric', 'checkbox', etc.
    isSortable?: boolean;
    isEditable?: boolean;
    // ...
}
```

### `setCellData(row, col, value)` (Optional)

Called when a user edits a cell. If not implemented, the grid will be read-only.

## Types

### `GridDataValue`

```typescript
type GridDataValue = string | number | boolean | null | undefined;
```
