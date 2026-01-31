# Basic Example

This is a minimal example showing how to setup SciGrid with static data.

```typescript
import { SciGrid } from '@sci-grid/core';

const container = document.getElementById('app');

// 1. Define Data Provider
const myData = [
  ['ID', 'Name', 'Age'],
  [1, 'Alice', 25],
  [2, 'Bob', 30],
  [3, 'Charlie', 22]
];

const provider = {
  getRowCount: () => myData.length - 1, // Exclude header row from data count
  getColumnCount: () => 3,
  getCellData: (row, col) => myData[row + 1][col], // +1 to skip header
  getHeader: (col) => ({ name: myData[0][col] as string })
};

// 2. Initialize Grid
const grid = new SciGrid(container, provider, {
  showRowNumbers: true,
  rowHeight: 35
});
```

<BasicDemo />
