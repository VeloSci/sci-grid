# Advanced Headers

Headers in SciGrid can support multiple lines of text, units, descriptions, and custom styling.

```typescript
const headers = [
  { name: "Voltage", units: "mV", description: "Input range" },
  { name: "Current", units: "mA", description: "Peak load" },
  { name: "Phase", units: "deg", description: "Angle" }
];

const config = {
  headerHeight: 65,
  headerSubTextCount: 2, // Enable 2 extra lines for Units and Description
  headerTitleStyle: { color: '#58a6ff', font: 'bold 12px Inter' },
  headerUnitsStyle: { color: '#8b949e', font: '10px Inter' },
  headerDescriptionStyle: { color: '#444c56', font: 'italic 10px Inter' }
};
```

This feature is particularly useful for scientific data where units and context are as important as the value itself.

<HeadersDemo />
