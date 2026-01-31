# Sorting

Implement client-side or server-side sorting by listening to the `onSort` callback. The grid doesn't mutate your data automatically; it tells you when the user asks for a sort.

```typescript
const onSort = (col, order) => {
    // Sort your data here...
    data.value.sort(customComparator);
    // Grid will re-render automatically if reactive (Vue/React) or call invalidate()
};
```

<SortingDemo />
