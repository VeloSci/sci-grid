<script setup lang="ts">
import { SciGridVue } from '@sci-grid/vue';
import { shallowRef } from 'vue';

const headers = [
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
  getCellData: (r, c) => data[r][c],
  getHeader: (c) => headers[c],
  setCellData: (r, c, val) => { data[r][c] = val; }
});
</script>

<template>
  <div class="demo-container">
    <SciGridVue :provider="provider" />
  </div>
</template>

<style scoped>
.demo-container { height: 300px; width: 100%; border: 1px solid var(--vp-c-divider); border-radius: 8px; margin: 1rem 0; }
</style>
