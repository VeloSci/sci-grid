# Advanced Headers

Headers in SciGrid can support multiple lines of text, units, descriptions, and custom styling.

```typescript
const headers = [
  { name: "Voltage", units: "mV", description: "Input range" }
];

const config = {
  headerHeight: 65,
  headerSubTextCount: 2 // Enable sub-text rows
};
```

<HeadersDemo />
