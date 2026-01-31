<script setup lang="ts">
import { SciGridVue } from '@sci-grid/vue';
import type { ColumnHeaderInfo } from '@sci-grid/core';
import { shallowRef } from 'vue';
import { useGridTheme } from '../src/composables/useGridTheme';

const { gridConfig } = useGridTheme();
const headers: ColumnHeaderInfo[] = [
  { name: "CPU", type: 'text', markIcon: '💻' },
  { name: "Usage", type: 'progress' },
  { name: "History", type: 'sparkline', description: 'Last 10s' },
  { name: "Temp", type: 'numeric', units: '°C', markIcon: '🔥' }
];

const data = [
  ["Core 0", 45, [10, 20, 45, 30, 60, 45], 55.4],
  ["Core 1", 88, [80, 85, 90, 82, 88, 88], 62.1],
  ["GPU", 12, [5, 8, 12, 10, 15, 12], 42.0]
];

const provider = shallowRef({
  getRowCount: () => data.length,
  getColumnCount: () => headers.length,
  getCellData: (r: number, c: number) => data[r][c],
  getHeader: (c: number) => headers[c]
});
</script>

<template>
  <div class="demo-container">
    <SciGridVue :provider="provider" :config="{ ...gridConfig, headerHeight: 50, headerSubTextCount: 1 as 0 | 1 | 2 }" />
  </div>
</template>

<style scoped>
.demo-container { height: 300px; width: 100%; border: 1px solid var(--vp-c-divider); border-radius: 8px; margin: 1rem 0; }
</style>
