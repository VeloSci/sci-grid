<script setup lang="ts">
import { SciGridVue } from '@sci-grid/vue';
import { shallowRef, ref } from 'vue';

const headers = [
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
  getCellData: (r, c) => data.value[r][c],
  getHeader: (c) => headers[c]
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
    // Provoke reactivity update if needed, though SciGrid usually needs explicit invalidate.
    // In Vue wrapper, prop change might not trigger deep invalidate unless provider ref changes or we call method.
    // For simplicity in this demo, let's just force update via re-creating provider wrapper or similar hack,
    // or ideally the wrapper exposes an 'invalidate' method. The current Vue wrapper doesn't expose methods easily.
    // We'll rely on key-changing the component or updating the provider reference.
    provider.value = { ...provider.value }; 
    updateTrigger.value++;
};
const updateTrigger = ref(0);
</script>

<template>
  <div class="demo-container">
    <SciGridVue :provider="provider" :config="{ onSort }" :key="updateTrigger" />
  </div>
</template>

<style scoped>
.demo-container { height: 300px; width: 100%; border: 1px solid var(--vp-c-divider); border-radius: 8px; margin: 1rem 0; }
</style>
