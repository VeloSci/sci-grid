<script setup lang="ts">
import { SciGridVue } from '@velo-sci/vue';
import { shallowRef } from 'vue';

const headers = [
  { name: "Task", type: 'text' },
  { name: "Status", type: 'checkbox' },
  { name: "Progress", type: 'progress' },
  { name: "Priority", type: 'select', selectOptions: ['Low', 'Medium', 'High'] }
];
const data = [
  ["Fix Bugs", true, 100, "High"],
  ["Write Docs", false, 45, "Medium"],
  ["Release v1", false, 10, "High"],
  ["Refactor", true, 80, "Low"]
];

const provider = shallowRef({
  getRowCount: () => data.length,
  getColumnCount: () => headers.length,
  getCellData: (r, c) => data[r][c],
  getHeader: (c) => headers[c],
  setCellData: (r, c, val) => { data[r][c] = val; }
});
</script>

<template>
  <div class="demo-container">
    <SciGridVue :provider="provider" :config="{ rowHeight: 35 }" />
  </div>
</template>

<style scoped>
.demo-container { height: 300px; width: 100%; border: 1px solid var(--vp-c-divider); border-radius: 8px; margin: 1rem 0; }
</style>
