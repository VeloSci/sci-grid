<script setup lang="ts">
import { SciGridVue } from '@velo-sci/vue';
import { shallowRef } from 'vue';

const headers = [
  { name: "Voltage", units: "mV", description: "Input range" },
  { name: "Current", units: "mA", description: "Peak load" },
  { name: "Phase", units: "deg", description: "Angle" }
];
const data = Array.from({length: 20}, (_, i) => [i * 10, i * 5, i * 2]);

const provider = shallowRef({
  getRowCount: () => data.length,
  getColumnCount: () => headers.length,
  getCellData: (r, c) => data[r][c],
  getHeader: (c) => headers[c]
});

const config = {
  headerHeight: 65,
  headerSubTextCount: 2,
  headerTitleStyle: { color: '#58a6ff', font: 'bold 12px Inter' },
  headerUnitsStyle: { color: '#8b949e', font: '10px Inter' },
  headerDescriptionStyle: { color: '#444c56', font: 'italic 10px Inter' }
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
