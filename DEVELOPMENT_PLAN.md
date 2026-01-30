# SciGrid Development Roadmap & Adapter Strategy

## Core Philosophy
SciGrid is designed as a **performance-first, framework-agnostic** Data Grid engine. The core logic resides in vanilla TypeScript, interacting directly with the Canvas API and DOM for maximum efficiency. This architecture allows us to provide native-feeling experiences across any modern web framework without duplicating the complex grid logic.

---

## 1. Adapter Architecture (`./adapters`)
To support multiple frameworks, we will implement a "Thin Wrapper" strategy. The core `SciGrid` class remains the source of truth, and each adapter handles:
1. **Lifecycle Management**: Initialization on mount, cleanup on unmount.
2. **Reactivity Mapping**: Connecting framework-specific state (Props/Signals) to `SciGrid.updateConfig()` or `SciGrid.updateProvider()`.
3. **Event Propagation**: Tunneling grid events (selection, edits) into framework-native event systems.

### Proposed Structure
```text
/adapters
  ├── react/     # React Hooks & Context components
  ├── vue/       # Vue 3 Composition API wrappers
  ├── astro/     # Integration for Astro components
  ├── angular/   # Directives & Service-based components
  └── solid/     # Signal-based optimized wrappers
```

---

## 2. Technical Roadmap

### Phase 1: Core Engine Hardening (Current & Near-term)
- [ ] **Advanced Cell Types**: Support for checkboxes, dropdowns, and custom sparklines.
- [ ] **Viewport Virtualization 2.0**: Optimize `visibleCols` calculation for datasets with 5000+ columns.
- [ ] **Theming System**: Move from inline config to a full Design System Token approach.
- [ ] **Persistence Layer**: Built-in state serialization for column order and widths.

### Phase 2: Interactivity & UX
- [ ] **Multi-Range Selection**: Allow selecting multiple non-contiguous areas (Ctrl+Drag).
- [ ] **Keyboard Shortcuts**: Excel-like shortcuts (Ctrl+C/V, Ctrl+Z, Home/End).
- [ ] **Infinite Loading**: Data Provider hooks for fetching remote chunks as the user scrolls.

### Phase 3: Adapter Implementation
- [ ] **React Adapter**: High-priority. Create a `useSciGrid` hook and `<SciGrid />` component.
- [ ] **Vue/Solid Adapters**: Leverage their fine-grained reactivity for configuration updates.

---

## 3. Implementation Patterns for Adapters

### Example: The React Pattern
```typescript
// adapters/react/SciGrid.tsx
export const SciGridComponent = ({ data, config }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<SciGrid | null>(null);

  useEffect(() => {
    if (containerRef.current) {
      gridRef.current = new SciGrid(containerRef.current, data, config);
    }
    return () => gridRef.current?.destroy();
  }, []);

  useEffect(() => {
    gridRef.current?.updateConfig(config);
  }, [config]);

  return <div ref={containerRef} style={{ width: '100%', height: '100%' }} />;
};
```

---

## 4. Build & Distribution
- **Monorepo Strategy**: Move to a workspace (e.g., PNPM or NX) where `@scigrid/core` is a dependency for `@scigrid/react`, etc.
- **Tree-shaking**: Ensure the renderer and logic are completely modular.
- **WASM Integration**: Explore moving heavy data processing (sorting/filtering large sets) to a Rust/WASM module.
