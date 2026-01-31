<script setup lang="ts">
import { SciGridVue } from '@sci-grid/vue';
import { shallowRef } from 'vue';
import { useGridTheme } from '../src/composables/useGridTheme';
import type { ColumnHeaderInfo } from '@sci-grid/core';

const { gridConfig } = useGridTheme();
const headers: ColumnHeaderInfo[] = [
  { name: "ID", type: 'numeric' },
  { name: "User", type: 'text' },
  { name: "Role", type: 'select', selectOptions: ['Admin', 'User'] },
  { name: "Active", type: 'checkbox' }
];
const data = [
  [101, "Neo", "Admin", true],
  [102, "Trinity", "Admin", true],
  [103, "Morpheus", "User", false],
  [104, "Cypher", "User", false],
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
    <SciGridVue :provider="provider" :config="{ ...gridConfig, rowHeight: 40, showRowNumbers: true }" />
  </div>
</template>

<style scoped>
.demo-container { height: 300px; width: 100%; border: 1px solid var(--vp-c-divider); border-radius: 8px; margin: 1rem 0; }
</style>
