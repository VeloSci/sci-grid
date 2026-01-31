# Custom Renderers (Advanced)

SciGrid is 100% Canvas-based. While it provides standard renderers for text, numbers, and checkboxes, you might want to draw custom shapes, sparklines, or images.

## How Rendering Works

The `GridRenderer` iterates over visible cells and calls internal drawing commands. To extend this, accessing the canvas context directly is technically possible but currently, we recommend using the `type` field in `ColumnHeaderInfo` to switch between built-in advanced types.

Supported types:
- `text` (default)
- `numeric`
- `checkbox`
- `progress`
- `sparkline` (coming soon)

## Implementing a Custom Renderer (Future API)

*Note: The Plugin API is currently in RFC status. Below is a preview of how custom cell renderers will work in v2.*

```typescript
// Register a custom renderer for a specific type
grid.registerRenderer('heatmap-cell', (ctx, rect, value) => {
    const intensity = Math.min(1, value / 100);
    ctx.fillStyle = `rgba(255, 0, 0, ${intensity})`;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
});
```

For now, use `provider.getCellData` to format what is displayed, or define new types in the Core core if you are forking the project.
