# Vue Integration

The `@velosci-grid/vue` package offers a Vue 3 component for seamless integration.

## Installation

```bash
pnpm add @velosci-grid/vue @velosci-grid/core
```

## Usage

Import and use `VeloGridVue` in your Vue components.

```vue
<script setup lang="ts">
import { VeloGridVue } from '@velosci-grid/vue';
import { shallowRef } from 'vue';

const provider = shallowRef({
  getRowCount: () => 1000,
  getColumnCount: () => 20,
  getCellData: (r: number, c: number) => `Val ${r}-${c}`,
  getHeader: (c: number) => ({ name: `Col ${c}` })
});
</script>

<template>
  <div class="grid-container">
    <VeloGridVue 
      :provider="provider"
      :config="{ rowHeight: 35 }"
    />
  </div>
</template>

<style scoped>
.grid-container {
  height: 500px;
  width: 100%;
}
</style>
```

## Props

| Prop | Type | Description |
|------|------|-------------|
| `provider` | `IDataGridProvider` | The data provider for the grid. |
| `config` | `Partial<GridConfig>` | Optional configuration overrides. |
