<script setup lang="ts">
import { SciGridVue } from '@velo-sci/vue';
import { shallowRef } from 'vue';

const provider = shallowRef({
  getRowCount: () => 1000,
  getColumnCount: () => 20,
  getCellData: (r: number, c: number) => `Val ${r}-${c}`,
  getHeader: (c: number) => ({ name: `Col ${c}` })
});
</script>

<template>
  <div class="demo-container">
    <SciGridVue 
      :provider="provider"
      :config="{ 
        rowHeight: 35, 
        showRowNumbers: true,
        backgroundColor: '#0f172a',
        gridLineColor: '#334155',
        textColor: '#f8fafc',
        headerBackground: '#1e293b',
        headerTextColor: '#93c5fd',
        rowNumberBackground: '#1e293b',
        rowNumberTextColor: '#64748b'
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
  margin: 1rem 0;
}
</style>
