<script setup lang="ts">
import { SciGridVue } from '@sci-grid/vue';
import type { ColumnHeaderInfo } from '@sci-grid/core';
import { shallowRef, onMounted, onUnmounted, ref } from 'vue';
import { useGridTheme } from '../src/composables/useGridTheme';

const { gridConfig } = useGridTheme();
const headers: ColumnHeaderInfo[] = [
  { name: "Sensor", type: 'text' },
  { name: "Value", type: 'numeric' },
  { name: "Activity", type: 'progress' }
];
const data = ref([
  ["Alpha", 45, 10],
  ["Beta", 88, 50],
  ["Gamma", 12, 90]
]);

const provider = shallowRef({
  getRowCount: () => data.value.length,
  getColumnCount: () => headers.length,
  getCellData: (r: number, c: number) => data.value[r][c],
  getHeader: (c: number) => headers[c]
});

let interval: any;
onMounted(() => {
    interval = setInterval(() => {
        data.value.forEach(row => {
            row[1] = Math.floor(Math.random() * 100);
            row[2] = Math.floor(Math.random() * 100);
        });
        provider.value = { ...provider.value }; 
    }, 100);
});

onUnmounted(() => clearInterval(interval));
</script>

<template>
  <div class="demo-container">
    <SciGridVue :provider="provider" :config="gridConfig" />
  </div>
</template>

<style scoped>
.demo-container { height: 300px; width: 100%; border: 1px solid var(--vp-c-divider); border-radius: 8px; margin: 1rem 0; }
</style>
