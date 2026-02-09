# Context Menus

SciGrid provides a powerful, zone-aware context menu system. Right-clicking on different parts of the grid shows different menus, and every aspect is customizable.

## Menu Zones

The grid detects **4 distinct zones** when you right-click:

| Zone | Area | When |
| :--- | :--- | :--- |
| `header` | Column headers | Right-click on any column header |
| `rowNumber` | Row number column | Right-click on a row number |
| `cell` | Single data cell | Right-click with 0 or 1 cell selected |
| `multiCell` | Multiple cells | Right-click when multiple cells/rows/columns are selected |

Each zone can have completely different menu items, or share common items.

## Built-in Menu

By default, SciGrid shows a simple menu with:

- **Copy Selected** — Copies selection to clipboard
- **Export as CSV** — Downloads the grid data as CSV
- **Refresh Grid** — Forces a re-render

## Customizing Items per Zone

Use `getContextMenuItems` to return different items based on the zone:

```typescript
const grid = new SciGrid(container, provider, {
  getContextMenuItems: (defaults, ctx) => {
    switch (ctx?.zone) {
      case 'header':
        return [
          { label: 'Sort A→Z', action: () => sort(ctx.col, 'asc'), icon: '↑' },
          { label: 'Sort Z→A', action: () => sort(ctx.col, 'desc'), icon: '↓' },
          'divider',
          { label: 'Hide Column', action: () => hide(ctx.col) },
          { label: 'Auto-fit Width', action: () => autoFit(ctx.col) },
        ];

      case 'rowNumber':
        return [
          { label: 'Select Row', action: () => selectRow(ctx.row) },
          { label: 'Delete Row', action: () => deleteRow(ctx.row), icon: '🗑' },
        ];

      case 'multiCell':
        return [
          ...defaults,
          { type: 'section', label: 'Analysis' },
          { label: 'Sum', action: () => showSum() },
          { label: 'Average', action: () => showAvg() },
          { label: 'Count', action: () => showCount() },
        ];

      default: // 'cell'
        return defaults;
    }
  }
});
```

## Item Types

### Regular Items

```typescript
{ label: 'Copy', action: () => copy(), icon: '📋', shortcut: 'Ctrl+C' }
```

| Property | Type | Description |
| :--- | :--- | :--- |
| `label` | `string` | Text displayed in the menu |
| `action` | `() => void` | Function called when clicked |
| `icon` | `string?` | Character/emoji before the label |
| `shortcut` | `string?` | Hint text on the right side |
| `disabled` | `boolean?` | If true, item is grayed out |
| `id` | `string?` | Identifier for programmatic access |

### Checkbox Items

Items with a `checked` property show a ✓ checkmark:

```typescript
{
  label: 'Show Units',
  checked: showUnits,
  action: () => { showUnits = !showUnits; grid.invalidate(); }
}
```

### Section Headers

Non-interactive labels that group items visually:

```typescript
{ type: 'section', label: 'Data Operations' }
```

### Dividers

Simple horizontal lines:

```typescript
'divider'
```

### Sub-menus

Items with `children` open a nested menu on hover:

```typescript
{
  label: 'Export',
  icon: '📤',
  action: () => {},
  children: [
    { label: 'CSV', action: () => exportCSV() },
    { label: 'JSON', action: () => exportJSON() },
    'divider',
    { label: 'Clipboard', action: () => copyAll(), shortcut: 'Ctrl+C' },
  ]
}
```

## Taking Full Control

If you want to handle the context menu entirely yourself (e.g., using your own React/Vue component), use the zone-specific callbacks:

```typescript
const grid = new SciGrid(container, provider, {
  // Header — you handle it, built-in menu is suppressed
  onHeaderContextMenu: (col, e) => {
    showMyCustomMenu(e.clientX, e.clientY, { type: 'header', col });
  },

  // Row numbers — you handle it
  onRowNumberContextMenu: (row, e) => {
    showMyCustomMenu(e.clientX, e.clientY, { type: 'row', row });
  },

  // Data cells — call e.preventDefault() to suppress built-in menu
  onContextMenu: (row, col, e) => {
    e.preventDefault();
    showMyCustomMenu(e.clientX, e.clientY, { type: 'cell', row, col });
  },
});
```

## Keyboard Access

The context menu can be opened via keyboard with **Shift+F10** (configurable):

```typescript
const grid = new SciGrid(container, provider, {
  keyboardShortcuts: {
    contextMenu: { key: 'F10', shift: true }, // default
  }
});
```

The menu opens at the currently focused cell position and supports full keyboard navigation:

| Key | Action |
| :--- | :--- |
| `↑` / `↓` | Navigate between items |
| `Enter` / `Space` | Activate focused item |
| `→` | Open sub-menu |
| `Escape` | Close menu |

## Accessibility

The context menu is fully accessible:

- Menu container has `role="menu"`
- Items have `role="menuitem"` (or `role="menuitemcheckbox"` for checked items)
- Dividers have `role="separator"`
- Section headers have `role="presentation"`
- `aria-checked` is set for checkbox items
- `aria-disabled` is set for disabled items
- `aria-haspopup` is set for items with sub-menus

## React Example

```tsx
import { SciGridReact } from '@sci-grid/react';
import type { ContextMenuContext } from '@sci-grid/core';

function DataGrid() {
  const menuHandler = useCallback((defaults, ctx?: ContextMenuContext) => {
    if (ctx?.zone === 'header') {
      return [
        { label: 'Rename', action: () => rename(ctx.col) },
        { label: 'Delete', action: () => deleteCol(ctx.col) },
      ];
    }
    return defaults;
  }, []);

  return (
    <SciGridReact
      provider={provider}
      getContextMenuItems={menuHandler}
    />
  );
}
```
