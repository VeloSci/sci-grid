<script setup lang="ts">
import { SciGridVue } from '@sci-grid/vue';
import type { ColumnHeaderInfo } from '@sci-grid/core';
import { shallowRef, ref } from 'vue';
import { useGridTheme } from '../src/composables/useGridTheme';

const { gridConfig } = useGridTheme();
const headers: ColumnHeaderInfo[] = [
  { name: "Country", type: 'text', isSortable: true },
  { name: "Population (M)", type: 'numeric', isSortable: true },
  { name: "Growth %", type: 'progress', isSortable: true }
];
// Use ref for reactive data array so we can trigger updates
const data = ref([
  ["China", 1411, 0.4],
  ["India", 1380, 1.2],
  ["USA", 331, 0.6],
  ["Brazil", 212, 0.8]
]);
const originalData = [...data.value];

const provider = shallowRef({
  getRowCount: () => data.value.length,
  getColumnCount: () => headers.length,
  getCellData: (r: number, c: number) => data.value[r][c],
  getHeader: (c: number) => headers[c]
});

const onSort = (col: number, order: 'asc' | 'desc' | null) => {
    if (order === null) {
        data.value = [...originalData];
    } else {
        const multiplier = order === 'asc' ? 1 : -1;
        data.value.sort((a, b) => {
            const valA = a[col];
            const valB = b[col];
            if (valA < valB) return -1 * multiplier;
            if (valA > valB) return 1 * multiplier;
            return 0;
        });
    }
    provider.value = { ...provider.value }; 
    updateTrigger.value++;
};
const updateTrigger = ref(0);
</script>

<template>
  <div class="demo-container">
    <SciGridVue :provider="provider" :config="{ ...gridConfig, onSort }" :key="updateTrigger" />
  </div>
</template>

<style scoped>
.demo-container { height: 300px; width: 100%; border: 1px solid var(--vp-c-divider); border-radius: 8px; margin: 1rem 0; }
</style>
