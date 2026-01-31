# Column Types

SciGrid includes several built-in column types.

- **Text**: Default string rendering.
- **Checkbox**: Boolean toggles.
- **Progress**: Progress bars (0-100).
- **Select** (Dropdown): Single choice from list.

```typescript
const headers = [
  { name: "Task", type: 'text' },
  { name: "Status", type: 'checkbox' },
  { name: "Progress", type: 'progress' },
  { name: "Priority", type: 'select', selectOptions: ['Low', 'Medium', 'High'] }
];
```

<ColumnTypesDemo />
