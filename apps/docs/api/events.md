# Events API

SciGrid exposes user interaction events via configuration callbacks.

## `onSelectionChange`

Triggered whenever the user's selection changes (clicking cells, dragging ranges).

```typescript
(info: SelectionInfo) => void
```

### `SelectionInfo`

```typescript
interface SelectionInfo {
    mode: 'cell' | 'row' | 'column' | 'all';
    ranges: SelectionRange[];
    anchorRow: number | null;
    anchorCol: number | null;
}

interface SelectionRange {
    startRow: number;
    endRow: number;
    startCol: number;
    endCol: number;
}
```

## `onSort`

Triggered when a user clicks a sortable column header.

```typescript
(col: number, order: 'asc' | 'desc' | null) => void
```

- **`col`**: Index of the column being sorted.
- **`order`**: The new sort order requested.

## `onHeaderContextMenu`

Triggered when a user right-clicks on a column header.

```typescript
(col: number, e: MouseEvent) => void
```

## DOM Events

Since SciGrid renders to a standard canvas, you can also attach standard DOM listeners to the container if needed for custom behavior.
