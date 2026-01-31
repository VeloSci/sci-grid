<script setup lang="ts">
import { SciGridVue } from '@sci-grid/vue';
import type { ColumnHeaderInfo } from '@sci-grid/core';
import { shallowRef } from 'vue';
import { useGridTheme } from '../src/composables/useGridTheme';

const { gridConfig } = useGridTheme();
const headers: ColumnHeaderInfo[] = [
  { name: "Product", type: 'text', isEditable: true },
  { name: "Category", type: 'select', selectOptions: ['Electronics', 'Food', 'Books'], isEditable: true },
  { name: "Stock", type: 'numeric', isEditable: true },
  { name: "Available", type: 'checkbox', isEditable: true }
];
const data = [
  ["Laptop", "Electronics", 50, true],
  ["Apple", "Food", 200, true],
  ["JS Guide", "Books", 30, false]
];

const provider = shallowRef({
  getRowCount: () => data.length,
  getColumnCount: () => headers.length,
  getCellData: (r: number, c: number) => data[r][c],
  getHeader: (c: number) => headers[c],
  setCellData: (r: number, c: number, val: any) => { data[r][c] = val; }
});
</script>

<template>
  <div class="demo-container">
    <SciGridVue :provider="provider" :config="gridConfig" />
  </div>
</template>

<style scoped>
.demo-container { height: 300px; width: 100%; border: 1px solid var(--vp-c-divider); border-radius: 8px; margin: 1rem 0; }
</style>
