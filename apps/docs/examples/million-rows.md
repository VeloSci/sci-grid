# Million Rows Example

SciGrid can handle datasets with millions of rows and thousands of columns without breaking a sweat, thanks to its virtualization engine.

```typescript
const provider = {
  getRowCount: () => 1_000_000,
  getColumnCount: () => 1000,
  getCellData: (r, c) => (Math.sin(r/100) * Math.cos(c/50)).toFixed(4),
  getHeader: (c) => ({ name: `Col ${c}` })
};
```

<MillionRowsDemo />
