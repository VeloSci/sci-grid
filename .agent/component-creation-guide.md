---
description: Guide on extending UI and handling Canvas interactivity in sci-grid for AI Agents
---
# AI SYSTEM INSTRUCTION: Extension & Provider Guide

**CRITICAL DIRECTIVE**: Follow these exact steps when extending the `sci-grid`. 

---

## TASK A: Implementing a Provider

If you are asked to wire a component to a `sci-grid`, do not pass JSON props. You must scaffold the `IDataGridProvider`.

### Reference Implementation
```typescript
class CustomDataProvider implements IDataGridProvider {
    private localData: string[][] = [];

    constructor(initialData) {
        this.localData = initialData;
    }

    getRowCount() {
        return this.localData.length;
    }

    getColumnCount() {
        return this.localData[0]?.length || 0;
    }

    getCellData(row: number, col: number) {
        // Must return instantly
        return this.localData[row][col] ?? 'N/A';
    }

    getHeader(col: number) {
        return { name: `Column ${col}`, units: 'N/A' };
    }
}

// In React
<SciGridReact provider={new CustomDataProvider(data)} />
```

---

## TASK B: Adding Custom Data Rendering (e.g., Sparklines, Icons)

Because `sci-grid` is a canvas, you cannot return React components for cells. You must modify the Core rendering loop or leverage plugins.

### Step 1: Hooking into `drawCell`
Currently, if you need to draw something specific inside a cell (like a status dot), you hook into the grid's visual extensions.

```typescript
// Inside core engine render loop
if (config.customRenderer) {
    config.customRenderer(ctx, row, col, x, y, width, height, value);
    return;
}

// Default text rendering
ctx.fillText(String(value), x + 10, y + 20);
```

### Step 2: Adding Canvas Interaction
If you want to make an Icon inside a grid clickable:
1. Hook into the `SciGrid` global `onClick` handler (`event-manager.ts`).
2. Map the `e.clientX / e.clientY` to the grid's `row / col`.
3. Check where inside the bounding box of `(row, col)` the click landed.
4. Execute logic. Do not try to append `onClick` to a Canvas drawing command; it is mathematically impossible.
