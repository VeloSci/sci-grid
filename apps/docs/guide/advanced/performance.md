# Performance Optimization

VeloGrid is designed to handle millions of rows. However, your implementation of `IDataGridProvider` can impact performance.

## 1. Fast `getCellData`

The `getCellData` is called thousands of times during scroll events. 
- **Avoid calculations**: Compute expensive values ahead of time or memoize them.
- **Avoid string formatting**: If possible, keep data raw and format it only when necessary.
- **No API calls**: Never make network requests inside `getCellData`.

## 2. Virtual High-Performance Scrolling

VeloGrid uses binary search to find visible columns, making horizontal scrolling instant even with 100,000 columns. Vertical scrolling is inherently O(1) due to fixed row heights or block-based calculation.

## 3. Passive Event Listeners

We use passive scroll listeners to decouple rendering from scrolling on the main thread where possible, ensuring smooth 60fps scrolling.

## 4. Avoiding React/Vue Overhead

While we provide wrappers, passing massive objects via props can be slow. `VeloGridReact` and `VeloGridVue` use `shallowRef` or direct refs to avoid Proxy overhead on the data provider itself.

### Bad Pattern
```tsx
// This re-creates the provider on every render!
<VeloGridReact provider={{ getRowCount: ... }} />
```

### Good Pattern
```tsx
const provider = useMemo(() => new MyBigDataProvider(), []);
<VeloGridReact provider={provider} />
```
