<script setup lang="ts">
import { SciGridVue } from '@sci-grid/vue';
import { shallowRef, onMounted, onUnmounted, ref } from 'vue';

const headers = [
  { name: "Sensor", type: 'text' },
  { name: "Value", type: 'numeric' },
  { name: "Activity", type: 'progress' }
];
const data = ref([
  ["Alpha", 45, 10],
  ["Beta", 88, 50],
  ["Gamma", 12, 90]
]);

const provider = shallowRef({
  getRowCount: () => data.value.length,
  getColumnCount: () => headers.length,
  getCellData: (r, c) => data.value[r][c],
  getHeader: (c) => headers[c]
});

// Hack to force update since we are mutating data inside reactive array but not replacing provider
// Ideally use a trigger ref or key
const updateTrigger = ref(0);

let interval: any;
onMounted(() => {
    interval = setInterval(() => {
        data.value.forEach(row => {
            row[1] = Math.floor(Math.random() * 100);
            row[2] = Math.floor(Math.random() * 100);
        });
        updateTrigger.value++; 
    }, 100);
});

onUnmounted(() => clearInterval(interval));
</script>

<template>
  <div class="demo-container">
    <SciGridVue :provider="provider" :key="updateTrigger" />
  </div>
</template>

<style scoped>
.demo-container { height: 300px; width: 100%; border: 1px solid var(--vp-c-divider); border-radius: 8px; margin: 1rem 0; }
</style>
