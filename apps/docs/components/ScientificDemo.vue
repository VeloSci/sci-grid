<script setup lang="ts">
import { SciGridVue } from '@sci-grid/vue';
import type { ColumnHeaderInfo, IDataGridProvider } from '@sci-grid/core';
import { shallowRef, onMounted, onUnmounted } from 'vue';
import { useGridTheme } from '../src/composables/useGridTheme';

const { gridConfig } = useGridTheme();

const headers: ColumnHeaderInfo[] = [
  { name: "Sensor", type: 'text' },
  { name: "Current", type: 'numeric', units: 'A', description: 'Real-time Ampere' },
  { name: "Voltage", type: 'numeric', units: 'V', description: 'Bus Voltage' },
  { name: "Stability", type: 'sparkline', description: 'Last 20 readings' }
];

const sensorData = shallowRef([
  { name: "Probe A", current: 0.00523, voltage: 12500, history: [0.005, 0.0051, 0.0052, 0.0053, 0.0052, 0.00523] },
  { name: "Probe B", current: 1.25e-6, voltage: 0.00045, history: [1e-6, 1.1e-6, 1.2e-6, 1.3e-6, 1.25e-6] },
  { name: "Main Bus", current: 450.5, voltage: 48, history: [440, 445, 450, 455, 452, 450.5] }
]);

const provider = shallowRef<IDataGridProvider>({
  getRowCount: () => sensorData.value.length,
  getColumnCount: () => headers.length,
  getCellData: (r: number, c: number) => {
    const item = sensorData.value[r];
    if (c === 0) return item.name;
    if (c === 1) return item.current;
    if (c === 2) return item.voltage;
    if (c === 3) return item.history;
    return null;
  },
  getHeader: (c: number) => headers[c]
});

let interval: any;
onMounted(() => {
  interval = setInterval(() => {
    sensorData.value = sensorData.value.map(s => {
      const nextVal = s.current * (0.95 + Math.random() * 0.1);
      const nextHistory = [...s.history.slice(-19), nextVal];
      return { ...s, current: nextVal, history: nextHistory };
    });
  }, 1000);
});

onUnmounted(() => clearInterval(interval));
</script>

<template>
  <div class="scientific-demo">
    <div class="demo-header">
      <h3>Automatic Scientific Scaling</h3>
      <p>Values are automatically formatted with SI prefixes based on their magnitude.</p>
    </div>
    <div class="grid-wrapper">
      <SciGridVue 
        :provider="provider" 
        :config="{ 
          ...gridConfig, 
          headerHeight: 60, 
          headerSubTextCount: 1,
          alternateRowColor: 'rgba(255,255,255,0.03)'
        }" 
      />
    </div>
  </div>
</template>

<style scoped>
.scientific-demo {
  margin: 2rem 0;
  border: 1px solid var(--sci-glass-border);
  border-radius: 16px;
  overflow: hidden;
  background: var(--sci-surface-2);
}

.demo-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--sci-glass-border);
}

.demo-header h3 {
  margin: 0;
  color: var(--sci-accent-neon);
  font-size: 1.2rem;
}

.demo-header p {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: var(--sci-text-secondary);
}

.grid-wrapper {
  height: 350px;
  width: 100%;
}
</style>
