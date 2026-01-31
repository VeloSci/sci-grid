<script setup lang="ts">
import { SciGridVue } from '@sci-grid/vue';
import { shallowRef, ref } from 'vue';
import { useGridTheme } from '../src/composables/useGridTheme';
import type { ColumnHeaderInfo } from '@sci-grid/core';

const { gridConfig } = useGridTheme();
const headers: ColumnHeaderInfo[] = [
  { name: "First Name", type: 'text' },
  { name: "Last Name", type: 'text' },
  { name: "Points", type: 'numeric' }
];
const data = [
  ["John", "Doe", 120],
  ["Jane", "Smith", 450],
  ["Bob", "Johnson", 300],
  ["Alice", "Williams", 250]
];
const provider = shallowRef({
  getRowCount: () => data.length,
  getColumnCount: () => headers.length,
  getCellData: (r: number, c: number) => data[r][c],
  getHeader: (c: number) => headers[c]
});

const selectionInfo = ref('Select cells...');
const onSelectionChange = (info: any) => {
    selectionInfo.value = `Mode: ${info.mode}, Selected: ${info.ranges.length} range(s). Anchor: [${info.anchorRow}, ${info.anchorCol}]`;
};
</script>

<template>
  <div class="demo-wrapper">
    <div class="demo-container">
        <SciGridVue :provider="provider" :config="{ ...gridConfig, showRowNumbers: true, onSelectionChange }" />
    </div>
    <div class="log">{{ selectionInfo }}</div>
  </div>
</template>

<style scoped>
.demo-wrapper { border: 1px solid var(--vp-c-divider); border-radius: 8px; overflow: hidden; margin: 1rem 0; }
.demo-container { height: 250px; width: 100%; }
.log { padding: 10px; background: var(--vp-c-bg-alt); color: var(--vp-c-text-1); font-family: monospace; font-size: 12px; border-top: 1px solid var(--vp-c-divider); }
</style>
