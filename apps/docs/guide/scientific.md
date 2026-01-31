# Scientific Computing Features

SciGrid is built with scientific datasets in mind, offering specialized features for engineering and laboratory applications.

## Automatic SI Scaling

Precision is key in scientific data, but readability is equally important. SciGrid automatically scales numeric values using standard SI prefixes (Y, Z, E, P, T, G, M, k, h, da, d, c, m, u, n, p, f, a, z, y).

To enable this, simply set the `type` of a column to `numeric` and provide a `units` string in the header configuration.

```typescript
const headers = [
  { 
    name: "Precision Voltage", 
    type: "numeric", 
    units: "V" 
  }
];
```

| Actual Value | Rendered Text |
| :--- | :--- |
| `0.000001` | `1μV` |
| `1500` | `1.5kV` |
| `0.1` | `100mV` |

## Complex Headers

Scientific data often requires more context than just a name. SciGrid supports multi-line headers to display **Units** and **Descriptions** without taking up valuable cell space.

Set `headerSubTextCount` in your config to `1` or `2` to enable sub-lines.

<ScientificDemo />

## Performance with Large Sets

SciGrid uses a custom canvas renderer that can handle millions of data points. By using `Float32Array` or `Float64Array` in your `IDataGridProvider`, you can minimize memory overhead and maximize throughput.

## Built-in Sparklines

Visualize trends directly in the grid. If a cell returns an array of numbers and the column type is set to `sparkline`, SciGrid will render a mini-chart.

```typescript
const provider = {
  getCellData: (r, c) => [10, 20, 15, 30, 25],
  getHeader: (c) => ({ type: 'sparkline', name: 'Trend' })
};
```
