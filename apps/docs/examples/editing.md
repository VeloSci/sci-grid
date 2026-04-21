# Editing

Enable basic editing by setting `isEditable: true` on your column definitions. 

Double-click to edit cells.

```typescript
const headers = [
  { name: "Product", type: 'text', isEditable: true },
  { name: "Available", type: 'checkbox', isEditable: true }
];
```

<EditingDemo />
