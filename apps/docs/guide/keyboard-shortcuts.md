# Keyboard Shortcuts

SciGrid comes with a full set of keyboard shortcuts for desktop-class navigation. Every shortcut is **configurable** — you can override defaults, disable shortcuts, or define your own custom actions.

## Default Shortcuts

| Action | Default Key | Description |
| :--- | :--- | :--- |
| `copy` | `Ctrl+C` | Copy selected cells to clipboard |
| `paste` | `Ctrl+V` | Paste tabular data from clipboard |
| `undo` | `Ctrl+Z` | Undo last edit/paste/delete |
| `redo` | `Ctrl+Y` | Redo last undone action |
| `selectAll` | `Ctrl+A` | Select all cells |
| `edit` | `F2` | Open cell editor on current cell |
| `delete` | `Delete` | Clear selected cells |
| `moveUp` | `↑` | Move selection up one row |
| `moveDown` | `↓` | Move selection down one row |
| `moveLeft` | `←` | Move selection left one column |
| `moveRight` | `→` | Move selection right one column |
| `pageUp` | `Page Up` | Move selection up one page |
| `pageDown` | `Page Down` | Move selection down one page |
| `moveToStart` | `Home` | Move to first column (`Ctrl+Home` = first cell) |
| `moveToEnd` | `End` | Move to last column (`Ctrl+End` = last cell) |
| `contextMenu` | `Shift+F10` | Open context menu at current cell |

All navigation shortcuts support **Shift** for extending the selection range.

### Accessing Defaults Programmatically

The `DEFAULT_SHORTCUTS` object is exported so you can inspect or display the current defaults:

```typescript
import { DEFAULT_SHORTCUTS } from '@sci-grid/core';

// Show all default shortcuts
console.log(DEFAULT_SHORTCUTS);
// { copy: { key: 'c', ctrl: true }, paste: { key: 'v', ctrl: true }, ... }
```

## Overriding Shortcuts

Pass `keyboardShortcuts` in the grid config to override any default:

```typescript
const grid = new SciGrid(container, provider, {
  keyboardShortcuts: {
    // Change copy to Ctrl+Shift+C
    copy: { key: 'c', ctrl: true, shift: true },

    // Disable select-all
    selectAll: null,

    // Change context menu to F2
    contextMenu: { key: 'F2' },
  }
});
```

## KeyboardShortcut Interface

```typescript
interface KeyboardShortcut {
    key: string;      // The key name (e.g. 'c', 'ArrowUp', 'F10', 'Delete')
    ctrl?: boolean;   // Require Ctrl (or Cmd on macOS)
    shift?: boolean;  // Require Shift
    alt?: boolean;    // Require Alt
    meta?: boolean;   // Require Meta (Windows key / Cmd)
}
```

## Custom Shortcuts

You can define **your own** shortcut actions beyond the built-in ones. Custom actions are dispatched via the `onShortcut` callback:

```typescript
const grid = new SciGrid(container, provider, {
  keyboardShortcuts: {
    // Custom actions — any string key that isn't a built-in action
    deleteRow: { key: 'Delete' },
    insertRow: { key: 'Insert' },
    toggleFilter: { key: 'f', ctrl: true },
    exportData: { key: 's', ctrl: true },
  },

  onShortcut: (action, event) => {
    switch (action) {
      case 'deleteRow':
        deleteSelectedRows();
        break;
      case 'insertRow':
        insertRowAtCursor();
        break;
      case 'toggleFilter':
        toggleFilterPanel();
        break;
      case 'exportData':
        exportToCSV();
        break;
    }
  }
});
```

## Disabling All Shortcuts

To disable all keyboard shortcuts, set each one to `null`:

```typescript
const grid = new SciGrid(container, provider, {
  keyboardShortcuts: {
    copy: null,
    selectAll: null,
    moveUp: null,
    moveDown: null,
    moveLeft: null,
    moveRight: null,
    pageUp: null,
    pageDown: null,
    moveToStart: null,
    moveToEnd: null,
    contextMenu: null,
  }
});
```

## React Example

```tsx
import { SciGridReact } from '@sci-grid/react';

function DataGrid({ data }) {
  return (
    <SciGridReact
      provider={provider}
      config={{
        keyboardShortcuts: {
          exportData: { key: 's', ctrl: true },
        },
      }}
      onShortcut={(action) => {
        if (action === 'exportData') downloadCSV(data);
      }}
    />
  );
}
```
