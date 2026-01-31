<script setup lang="ts">
import { SciGridVue } from '@sci-grid/vue';
import { shallowRef } from 'vue';

const headers = [
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
  getCellData: (r, c) => data[r][c],
  getHeader: (c) => headers[c]
});

const config = {
  rowHeight: 40,
  selectionColor: 'rgba(0, 255, 65, 0.2)',
  selectedTextColor: '#000',
  backgroundColor: '#000000',
  gridLineColor: '#003b00',
  textColor: '#00ff41',
  headerBackground: '#001a00',
  headerTextColor: '#00ff41',
  font: '14px "Courier New", monospace',
  showRowNumbers: true,
  rowNumberBackground: '#001a00',
  rowNumberTextColor: '#008F11'
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
