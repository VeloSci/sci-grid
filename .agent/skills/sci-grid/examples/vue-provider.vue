<script setup lang="ts">
import { VeloGridVue } from '@velosci-grid/vue';
import type { IDataGridProvider, GridConfig } from '@velosci-grid/core';

// Static provider definition
const provider: IDataGridProvider = {
  getRowCount: () => 1000,
  getColumnCount: () => 50,
  getCellData: (row, col) => `Vue ${row}x${col}`,
  getHeader: (col) => ({ name: `C${col}` })
};

const config: GridConfig = {
  headerHeight: 50,
  rowHeight: 30
};
</script>

<template>
  <div style="height: 600px; width: 100%;">
    <VeloGridVue :provider="provider" :config="config" />
  </div>
</template>
