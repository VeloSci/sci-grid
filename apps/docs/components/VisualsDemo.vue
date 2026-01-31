<script setup lang="ts">
import { SciGridVue } from '@velo-sci/vue';
import { shallowRef } from 'vue';

const headers = [
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
  getCellData: (r, c) => data[r][c],
  getHeader: (c) => headers[c]
});

const config = {
  headerHeight: 50,
  headerSubTextCount: 1
};
</script>

<template>
  <div class="demo-container">
    <SciGridVue :provider="provider" :config="config" />
  </div>
</template>

<style scoped>
.demo-container { height: 300px; width: 100%; border: 1px solid var(--vp-c-divider); border-radius: 8px; margin: 1rem 0; }
</style>
