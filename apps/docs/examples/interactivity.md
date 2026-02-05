# Interactivity & UX

SciGrid provides rich interactive features out of the box to feel like a native desktop application.

## Key Features

- **Context Menu**: Right-click to access actions like Copy, Export CSV, and custom commands.
- **Column Auto-Sizing**: Double-click column dividers in the header to fit the column width to its content.
- **CSV Export**: Built-in functionality to export the entire grid or selected ranges to CSV.
- **Empty States**: Configurable visual feedback when the grid has no data.

## Interactive Demo

Try right-clicking, selecting ranges, and resizing columns in the grid below.

<InteractivityDemo />

## Customizing the Context Menu

The context menu is fully customizable. default items now come with IDs (`copy`, `export-csv`, `refresh`), allowing you to modify, filter, or reorder them easily.

### Example: Modifying Default Items

```typescript
const grid = new SciGrid(container, provider, {
  getContextMenuItems: (defaultItems) => {
    // 1. Modify the 'Refresh' label
    const items = defaultItems.map(item => {
      if (typeof item !== 'string' && item.id === 'refresh') {
        return { ...item, label: '🔄 Reload Data' };
      }
      return item;
    });

    // 2. Remove 'Export CSV'
    const filtered = items.filter(i => 
      typeof i === 'string' || i.id !== 'export-csv'
    );

    // 3. Add Custom Actions
    return [
      ...filtered, 
      'divider',
      {
        label: '⚡ Custom Action',
        action: () => alert('Clicked!'),
      }
    ];
  }
});
```

## Smart Selection & Navigation

- **Preserved Selections**: Right-clicking inside an existing Multi-selection (created with `Shift` or `Ctrl`) **will not select a single cell**, but instead open the context menu for the entire selected block.
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
