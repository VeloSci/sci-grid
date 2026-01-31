<script setup lang="ts">
import { SciGridVue } from '@sci-grid/vue';
import type { ColumnHeaderInfo } from '@sci-grid/core';
import { shallowRef, computed } from 'vue';
import { useGridTheme } from '../src/composables/useGridTheme';

const { gridConfig } = useGridTheme();
const headers: ColumnHeaderInfo[] = [
  { name: "Voltage", units: "mV", description: "Input range" },
  { name: "Current", units: "mA", description: "Peak load" },
  { name: "Phase", units: "deg", description: "Angle" }
];
const data = Array.from({length: 20}, (_, i) => [i * 10, i * 5, i * 2]);

const provider = shallowRef({
  getRowCount: () => data.length,
  getColumnCount: () => headers.length,
  getCellData: (r: number, c: number) => data[r][c],
  getHeader: (c: number) => headers[c]
});

const config = computed(() => ({
  ...gridConfig.value,
  headerHeight: 65,
  headerSubTextCount: 2 as 0 | 1 | 2,
  headerTitleStyle: { color: gridConfig.value.headerTextColor, font: 'bold 12px Inter' },
  headerUnitsStyle: { color: gridConfig.value.rowNumberTextColor, font: '10px Inter' },
  headerDescriptionStyle: { color: gridConfig.value.rowNumberTextColor, font: 'italic 9px Inter' }
}));
</script>

<template>
  <div class="demo-container">
    <SciGridVue :provider="provider" :config="config" />
  </div>
</template>

<style scoped>
.demo-container { height: 300px; width: 100%; border: 1px solid var(--vp-c-divider); border-radius: 8px; margin: 1rem 0; }
</style>
