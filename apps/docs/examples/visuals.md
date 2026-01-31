# Sparklines & Visuals

SciGrid is built for scientific data. You can visualize data trends directly in cells using the `sparkline` column type.

Also, headers can include icons.

```typescript
const headers = [
  { name: "History", type: 'sparkline', description: 'Last 10s' },
  { name: "CPU", markIcon: '💻' }
];

// Data should be an array of numbers for sparkline cells
const rowData = [
  // ...
  [10, 20, 50, 40, 30] // Sparkline data
];
```

<VisualsDemo />
