<script setup lang="ts">
import { SciGridVue } from '@sci-grid/vue';
import { shallowRef } from 'vue';
import { useGridTheme } from '../src/composables/useGridTheme';

const { gridConfig } = useGridTheme();
const provider = shallowRef({
  getRowCount: () => 1_000_000,
  getColumnCount: () => 1000,
  getCellData: (r: number, c: number) => (Math.sin(r / 100) * Math.cos(c / 50)).toFixed(4),
  getHeader: (c: number) => ({ name: `Col ${c}` })
});
</script>

<template>
  <div class="demo-container">
    <SciGridVue 
      :provider="provider"
      :config="{ 
        ...gridConfig,
        rowHeight: 32, 
        showRowNumbers: true, 
        columnWidth: 120
      }"
    />
  </div>
</template>

<style scoped>
.demo-container {
  height: 400px;
  width: 100%;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  margin: 0;
}
</style>
