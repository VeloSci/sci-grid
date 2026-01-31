# Grid Configuration

The `GridConfig` interface controls the appearance and behavior of the grid.

## Core Properties

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `rowHeight` | `number` | `30` | Height of each row in pixels. |
| `columnWidth` | `number` | `100` | Default width of columns in pixels. |
| `headerHeight` | `number` | `30` | Height of the header row. |
| `showRowNumbers` | `boolean` | `false` | Whether to show the fixed index column. |
| `rowNumbersWidth` | `number` | `40` | Width of the row number column. |

## Feature Flags

| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `allowResizing` | `boolean` | `true` | Allow users to resize columns by dragging separators. |
| `allowFiltering` | `boolean` | `false` | Enable/Disable filtering UI (if available). |
| `persistenceKey` | `string` | `undefined` | If set, grid state (column width/order) is saved to localStorage. |

## Styling

| Property | Type | Description |
| :--- | :--- | :--- |
| `backgroundColor` | `string` | Canvas background color. |
| `gridLineColor` | `string` | Color of grid lines. |
| `textColor` | `string` | Default text color for cells. |
| `font` | `string` | CSS font string (e.g. `'12px sans-serif'`). |
| `selectionColor` | `string` | Background color for selected cells. |
| `selectedTextColor` | `string` | Text color for selected cells. |
| `headerBackground` | `string` | Background color of the header. |
| `headerTextColor` | `string` | Text color of the header title. |

## Advanced Header Styles

If `headerSubTextCount` is greater than 0, you can style individual header lines:

- `headerTitleStyle`
- `headerUnitsStyle`
- `headerDescriptionStyle`

Each accepts: `{ font?: string; color?: string; alpha?: number }`.
