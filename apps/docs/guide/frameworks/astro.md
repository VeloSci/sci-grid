# Astro Integration

The `@velo-sci/astro` adapter allows you to easily embed SciGrid in your Astro static or hybrid sites.

## Installation

```bash
pnpm add @velo-sci/astro @velo-sci/core
```

## Usage

Use the component in your `.astro` files. Warning: Since SciGrid is a client-side library, it will only render on the client.

```astro
---
import SciGrid from '@velo-sci/astro';

const gridConfig = {
  rowHeight: 35,
  showRowNumbers: true
};
---

<div class="my-grid-wrapper">
    <!-- The grid will initialize when available -->
    <SciGrid id="main-grid" config={gridConfig} />
</div>

<script>
  // You need to emit the provider from client-side script
  const provider = {
    getRowCount: () => 100,
    getColumnCount: () => 10,
    getCellData: (r, c) => `Cell ${r}-${c}`,
    getHeader: (c) => ({ name: `Col ${c}` })
  };

  // Dispatch event to initialize the grid with data
  window.dispatchEvent(new CustomEvent('scigrid-init-main-grid', {
    detail: { provider }
  }));
</script>

<style>
.my-grid-wrapper {
  height: 500px;
}
</style>
```

This event-based approach ensures that your data provider (which might contain complex logic or massive data) stays in the client bundle and isn't serialized unnecessarily during SSG.
