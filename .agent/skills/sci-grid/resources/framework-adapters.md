---
description: Details about framework wrappers
---
# Framework Adapters

The UI wrappers (`@sci-grid/react`, `@sci-grid/vue`, `@sci-grid/solid`, `@sci-grid/angular`, `astro`) do very little.

Their entire purpose is:
1. Mounting a `<div ref={container}>`.
2. Initializing `new SciGrid(container.current, provider, config)`.
3. Binding a `ResizeObserver` to the container so that if the window changes size, the Canvas automatically adjusts its internal `width` and `height` properties (fixing DPI blurriness).
4. Calling `destroy()` on unmount to prevent memory leaks.

Agents should ALWAYS use the framework adapters when available, rather than recreating this ResizeObserver logic manually.
