# SciGrid Class

The `SciGrid` class is the core entry point of the library. It manages the canvas lifecycle, renders the grid, and handles user interactions.

## Constructor

```typescript
new SciGrid(container: HTMLElement, provider: IDataGridProvider, config?: Partial<GridConfig>)
```

### Parameters

| Name | Type | Description |
| :--- | :--- | :--- |
| `container` | `HTMLElement` | The DOM element where the grid will be rendered. It should have a defined height. |
| `provider` | `IDataGridProvider` | The data source for the grid. See [Provider API](./provider). |
| `config` | `Partial<GridConfig>` | (Optional) Configuration options. |

## Methods

### `destroy()`

Destroys the grid instance, removing all event listeners and DOM elements (canvas) attached to the container.

```typescript
grid.destroy(): void
```

### `updateConfig(config)`

Updates the grid configuration. Merges the provided options with the existing configuration. Triggers a re-render.

```typescript
grid.updateConfig(config: Partial<GridConfig>): void
```

### `updateProvider(provider)`

Replaces the current data provider with a new one. Useful for completely swapping datasets.

```typescript
grid.updateProvider(provider: IDataGridProvider): void
```

### `renderNow()`

Forces an immediate synchronous render of the grid. Usually, the grid renders automatically on interaction or `requestAnimationFrame`, but this can be used to force an update after external data changes.

```typescript
grid.renderNow(): void
```

### `invalidate()`

Marks the grid as dirty and requests a render in the next animation frame. This is the preferred way to trigger updates after data changes.

```typescript
grid.invalidate(): void
```

### `getSelection()`

Returns the current selection information.

```typescript
grid.getSelection(): SelectionInfo
```
