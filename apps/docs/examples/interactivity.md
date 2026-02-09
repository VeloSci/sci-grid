# Interactivity & UX

SciGrid provides rich interactive features out of the box to feel like a native desktop application.

## Key Features

- **Zone-Aware Context Menus**: 4 distinct right-click zones (header, row number, single cell, multi-cell) with customizable items per zone.
- **Configurable Keyboard Shortcuts**: Every shortcut is overridable. Define your own custom actions.
- **Column Auto-Sizing**: Double-click column dividers in the header to fit the column width to its content.
- **CSV Export**: Built-in functionality to export the entire grid or selected ranges to CSV.
- **Empty States**: Configurable visual feedback when the grid has no data.
- **Accessible Menus**: Full ARIA support with keyboard navigation (Arrow keys, Enter, Escape).

## Interactive Demo

Try right-clicking on **headers**, **row numbers**, **single cells**, and **multi-cell selections** to see different context menus. Use `Shift+F10` to open the menu via keyboard.

<InteractivityDemo />

## Context Menu Zones

SciGrid detects where you right-click and shows the appropriate menu:

| Zone | Trigger | Use Case |
| :--- | :--- | :--- |
| `header` | Right-click column header | Sort, rename, hide columns |
| `rowNumber` | Right-click row number | Select, delete, insert rows |
| `cell` | Right-click single cell | Copy, edit, inspect |
| `multiCell` | Right-click with selection | Bulk operations, analysis |

### Customizing Items per Zone

```typescript
const grid = new SciGrid(container, provider, {
  getContextMenuItems: (defaults, ctx) => {
    if (ctx?.zone === 'header') {
      return [
        { label: 'Sort A→Z', action: () => sort(ctx.col, 'asc'), icon: '↑' },
        { label: 'Sort Z→A', action: () => sort(ctx.col, 'desc'), icon: '↓' },
      ];
    }
    if (ctx?.zone === 'multiCell') {
      return [
        ...defaults,
        { type: 'section', label: 'Analysis' },
        { label: 'Sum', action: () => sum() },
        { label: 'Average', action: () => avg() },
      ];
    }
    return defaults;
  }
});
```

### Advanced Menu Items

```typescript
// Checkbox items (toggles)
{ label: 'Show Units', checked: showUnits, action: () => toggle() }

// Disabled items
{ label: 'Paste', action: () => {}, disabled: true }

// Shortcut hints
{ label: 'Copy', action: () => copy(), shortcut: 'Ctrl+C' }

// Section headers (non-interactive labels)
{ type: 'section', label: 'Data Operations' }

// Sub-menus
{ label: 'Export', action: () => {}, children: [
    { label: 'CSV', action: () => exportCSV() },
    { label: 'JSON', action: () => exportJSON() },
]}
```

See the [Context Menus guide](/guide/context-menus) for full documentation.

## Keyboard Shortcuts

All shortcuts are configurable. Override defaults, disable them, or add your own:

```typescript
const grid = new SciGrid(container, provider, {
  keyboardShortcuts: {
    copy: { key: 'c', ctrl: true },           // default
    contextMenu: { key: 'F10', shift: true },  // default
    deleteRow: { key: 'Delete' },              // custom
    exportData: { key: 's', ctrl: true },      // custom
  },
  onShortcut: (action) => {
    if (action === 'deleteRow') deleteSelectedRows();
    if (action === 'exportData') exportToCSV();
  }
});
```

| Default Shortcut | Action |
| :--- | :--- |
| `Ctrl+C` | Copy selection |
| `Ctrl+A` | Select all |
| `Arrow keys` | Navigate cells |
| `Shift+Arrow` | Extend selection |
| `Page Up/Down` | Scroll by page |
| `Home/End` | Jump to first/last column |
| `Ctrl+Home/End` | Jump to first/last cell |
| `Shift+F10` | Open context menu |

See the [Keyboard Shortcuts guide](/guide/keyboard-shortcuts) for full documentation.

## Smart Selection & Navigation

- **Preserved Selections**: Right-clicking inside an existing multi-selection (created with `Shift` or `Ctrl`) **will not select a single cell**, but instead open the context menu for the entire selected block.
- **Out-of-Bounds Handling**: Selections are smoothly clamped to the grid edges even if the mouse leaves the canvas area, ensuring no "stuck" interactions.

## Dynamic Headers & Auto-Sizing

SciGrid's headers are "smart" and adapt their height based on the richness of information you provide.

### Dynamic Height
The grid automatically expands the header height to accommodate Units and Descriptions:
- **Simple (`0`)**: Compact view (default 40px).
- **Detailed (`1`)**: Adds a dedicated line for **Units**, expanding the header (~50px).
- **Rich (`2`)**: Adds lines for **Units** and **Description**, expanding further (~70px).

```typescript
const grid = new SciGrid(container, provider, {
  headerSubTextCount: 2, // Automatically sets height to ~70px
  // You can still force a specific height if needed:
  // headerHeight: 100 
});
```

### Content-Aware Resizing
Double-clicking a header divider triggers **Smart Auto-Sizing**. This algorithm doesn't just check text length—it understands:
*   **Scientific Units**: Properly measures formatted values (e.g., `20000myrs`).
*   **Header Metadata**: Ensures the column is wide enough to show the full Title, Units, and Description text.
