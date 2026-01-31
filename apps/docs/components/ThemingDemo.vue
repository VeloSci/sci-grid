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
  // VeloSci / Docs Theme (Slate & Blue)
  backgroundColor: '#0f172a',      // Slate 900
  gridLineColor: '#334155',        // Slate 700
  textColor: '#f8fafc',            // Slate 50
  headerBackground: '#1e293b',     // Slate 800
  headerTextColor: '#93c5fd',      // Blue 300
  font: '13px Inter, sans-serif',
  selectionColor: 'rgba(59, 130, 246, 0.3)', // Blue 500 with opacity
  selectedTextColor: '#ffffff',
  showRowNumbers: true,
  rowNumberBackground: '#1e293b',
  rowNumberTextColor: '#64748b'    // Slate 500
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
