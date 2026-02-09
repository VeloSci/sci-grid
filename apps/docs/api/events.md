# Events API

SciGrid exposes user interaction events via configuration callbacks.

## Selection

### `onSelectionChange`

Triggered whenever the user's selection changes (clicking cells, dragging ranges, keyboard navigation).

```typescript
(info: SelectionInfo) => void
```

#### `SelectionInfo`

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

## Sorting

### `onSort`

Triggered when a user clicks a sortable column header.

```typescript
(col: number, order: 'asc' | 'desc' | null) => void
```

- **`col`**: Index of the column being sorted.
- **`order`**: The new sort order requested.

## Context Menus

SciGrid detects **4 distinct zones** for right-click context menus. Each zone has its own callback.

### `onHeaderContextMenu`

Triggered when a user right-clicks on a **column header**.

```typescript
(col: number, e: MouseEvent) => void
```

If you set this callback, the built-in context menu is **suppressed** for headers — you handle the menu yourself.

### `onRowNumberContextMenu`

Triggered when a user right-clicks on a **row number** cell.

```typescript
(row: number, e: MouseEvent) => void
```

If you set this callback, the built-in context menu is **suppressed** for row numbers.

### `onContextMenu`

Triggered when a user right-clicks on a **data cell** (single or multi-selection).

```typescript
(row: number, col: number, e: MouseEvent) => void
```

Call `e.preventDefault()` inside the handler to suppress the built-in menu. If you don't prevent default, the built-in menu will still appear.

### `getContextMenuItems`

Customize the built-in context menu items for **any zone**. Receives the default items and a `ContextMenuContext` describing where the click happened.

```typescript
(
  defaultItems: (ContextMenuItem | 'divider' | ContextMenuSection)[],
  context?: ContextMenuContext
) => (ContextMenuItem | 'divider' | ContextMenuSection)[]
```

#### `ContextMenuContext`

```typescript
type ContextMenuZone = 'header' | 'rowNumber' | 'cell' | 'multiCell';

interface ContextMenuContext {
    zone: ContextMenuZone;
    row?: number;
    col?: number;
    selectedRows?: number[];
    selectedCols?: number[];
    selectionRanges?: SelectionRange[];
}
```

#### Example: Different items per zone

```typescript
const grid = new SciGrid(container, provider, {
  getContextMenuItems: (defaults, ctx) => {
    if (ctx?.zone === 'header') {
      return [
        { label: 'Sort Ascending', action: () => sortCol(ctx.col, 'asc'), icon: '↑' },
        { label: 'Sort Descending', action: () => sortCol(ctx.col, 'desc'), icon: '↓' },
        'divider',
        { label: 'Hide Column', action: () => hideCol(ctx.col) },
      ];
    }
    if (ctx?.zone === 'multiCell') {
      return [
        { label: 'Copy Selection', action: () => copy(), shortcut: 'Ctrl+C' },
        { label: 'Clear Selection', action: () => clear() },
        { type: 'section', label: 'Analysis' },
        { label: 'Sum', action: () => sum() },
        { label: 'Average', action: () => avg() },
      ];
    }
    return defaults;
  }
});
```

#### `ContextMenuItem`

```typescript
interface ContextMenuItem {
    id?: string;
    label: string;
    action: () => void;
    icon?: string;           // Character/emoji shown before the label
    disabled?: boolean;       // Grayed out, not clickable
    checked?: boolean;        // Shows a ✓ checkmark (for toggles)
    shortcut?: string;        // Hint text on the right (e.g. 'Ctrl+C')
    children?: MenuEntry[];   // Sub-menu items (opens on hover)
}
```

#### `ContextMenuSection`

A labeled section header — non-interactive, used to group items visually.

```typescript
interface ContextMenuSection {
    type: 'section';
    label: string;
}
```

## Keyboard Shortcuts

### `onShortcut`

Triggered when a user presses a **custom** keyboard shortcut (one you defined in `keyboardShortcuts` that is not a built-in action).

```typescript
(action: string, e: KeyboardEvent) => void
```

See the [Keyboard Shortcuts guide](/guide/keyboard-shortcuts) for details on configuring shortcuts.

## DOM Events

Since SciGrid renders to a standard canvas, you can also attach standard DOM listeners to the container if needed for custom behavior.
