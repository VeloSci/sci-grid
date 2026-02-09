# SciGrid Class

The `SciGrid` class is the core entry point of the library. It manages the canvas lifecycle, renders the grid, and handles user interactions.

## Constructor

```typescript
new SciGrid(container: HTMLElement, provider: IDataGridProvider, config?: Partial<GridConfig>)
```

### Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| `container` | `HTMLElement` | The DOM element where the grid will be rendered. It should have a defined height. |
| `provider` | `IDataGridProvider` | The data source for the grid. See [Provider API](./provider). |
| `config` | `Partial<GridConfig>` | (Optional) Configuration options. |

## Methods

### `destroy()`

Destroys the grid instance, removing all event listeners and DOM elements (canvas) attached to the container.

```typescript
grid.destroy(): void
```

### `updateConfig(config)`

Updates the grid configuration. Merges the provided options with the existing configuration. Triggers a re-render.

```typescript
grid.updateConfig(config: Partial<GridConfig>): void
```

### `updateProvider(provider)`

Replaces the current data provider with a new one. Useful for completely swapping datasets.

```typescript
grid.updateProvider(provider: IDataGridProvider): void
```

### `renderNow()`

Forces an immediate synchronous render of the grid. Usually, the grid renders automatically on interaction or `requestAnimationFrame`, but this can be used to force an update after external data changes.

```typescript
grid.renderNow(): void
```

### `invalidate()`

Marks the grid as dirty and requests a render in the next animation frame. This is the preferred way to trigger updates after data changes.

```typescript
grid.invalidate(): void
```

### `getSelection()`

Returns the current selection information.

```typescript
grid.getSelection(): SelectionInfo
```

### `editCell(row, col, value)`

Edits a cell value with validation and undo tracking. If a validator is configured for the column and the value fails validation, the edit is silently rejected.

```typescript
grid.editCell(row: number, col: number, value: any): void
```

### `addSort(col, order)`

Adds or updates a sort on a column. Supports multi-column sorting.

```typescript
grid.addSort(col: number, order: 'asc' | 'desc'): void
```

### `clearSort()`

Removes all active sorts.

```typescript
grid.clearSort(): void
```

### `addFilter(filter)`

Adds or updates a filter on a column.

```typescript
grid.addFilter(filter: ColumnFilter): void
```

### `removeFilter(col)`

Removes the filter from a specific column.

```typescript
grid.removeFilter(col: number): void
```

### `clearFilters()`

Removes all active filters.

```typescript
grid.clearFilters(): void
```

### `setGroupBy(col, aggregations?)`

Groups rows by a column, optionally with per-column aggregations.

```typescript
grid.setGroupBy(col: number, aggregations?: Record<number, AggregationType>): void
```

### `clearGroupBy()`

Removes row grouping.

```typescript
grid.clearGroupBy(): void
```

### `toggleGroup(groupValue)`

Expands or collapses a group by its value.

```typescript
grid.toggleGroup(groupValue: string): void
```

### `getAggregation(col, type)`

Computes an aggregation over visible (filtered) rows.

```typescript
grid.getAggregation(col: number, type: AggregationType): GridDataValue
```

### `rebuildDataView()`

Rebuilds the internal data view (filter + sort + group). Call this after changing `config.filters`, `config.sortState`, or `config.groupBy` directly.

```typescript
grid.rebuildDataView(): void
```

### `getRealRow(virtualRow)`

Maps a virtual (displayed) row index to the real row index in the data provider.

```typescript
grid.getRealRow(virtualRow: number): number
```

### `getVisibleRowCount()`

Returns the number of visible rows after filtering.

```typescript
grid.getVisibleRowCount(): number
```
