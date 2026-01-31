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

const gridRef = ref<any>(null);

let interval: any;
onMounted(() => {
    interval = setInterval(() => {
        data.value.forEach(row => {
            row[1] = Math.floor(Math.random() * 100);
            row[2] = Math.floor(Math.random() * 100);
        });
        // Access internal grid instance if exposed, otherwise provoke provider update
        // With SciGridVue, if we can't access instance easily, we might need a better wrapper.
        // But assuming we can get the component ref or just update provider shallow ref.
        provider.value = { ...provider.value }; 
    }, 100);
});

onUnmounted(() => clearInterval(interval));
</script>

<template>
  <div class="demo-container">
    <SciGridVue :provider="provider" />
  </div>
</template>

<style scoped>
.demo-container { height: 300px; width: 100%; border: 1px solid var(--vp-c-divider); border-radius: 8px; margin: 1rem 0; }
</style>
