<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useData } from 'vitepress';

const { isDark } = useData();

// Mock data generator
const generateData = (count: number) => {
  return Array.from({ length: count }, (_, i) => ({
    id: `SCI-${1024 + i}`,
    timestamp: new Date(Date.now() - i * 1000).toISOString().split('T')[1].split('.')[0],
    sensor: `SNR-${Math.floor(Math.random() * 99)}`,
    value: (Math.random() * 100).toFixed(4),
    status: Math.random() > 0.8 ? 'ALERT' : 'STABLE',
    trend: Array.from({ length: 15 }, () => Math.random() * 20)
  }));
};

const rows = ref(generateData(10));

// Real-time update simulation
onMounted(() => {
  const interval = setInterval(() => {
    rows.value = [
      {
        ...generateData(1)[0],
        timestamp: new Date().toISOString().split('T')[1].split('.')[0]
      },
      ...rows.value.slice(0, 9)
    ];
  }, 2000);
  return () => clearInterval(interval);
});
</script>

<template>
  <div class="neon-grid-wrapper font-mono overflow-hidden rounded-lg border transition-colors duration-300"
       :class="isDark ? 'border-white/5 bg-[#050505] shadow-2xl' : 'border-black/5 bg-white shadow-xl'">
    <!-- Header / Control Panel -->
    <div class="flex items-center justify-between border-b px-4 py-3 transition-colors duration-300"
         :class="isDark ? 'border-white/10 bg-[#0a0a0a]' : 'border-black/10 bg-slate-50'">
      <div class="flex items-center gap-3">
        <div class="h-2 w-2 animate-pulse rounded-full shadow-[0_0_8px_#00f2ff]"
             :class="isDark ? 'bg-[#00f2ff]' : 'bg-blue-500'"></div>
        <span class="text-xs font-bold uppercase tracking-widest transition-colors"
              :class="isDark ? 'text-[#00f2ff]' : 'text-blue-600'">Sci-Grid Live Stream</span>
      </div>
      <div class="flex gap-4">
        <div class="text-[10px] uppercase" :class="isDark ? 'text-white/40' : 'text-slate-400'">Buffer: <span :class="isDark ? 'text-white/80' : 'text-slate-700'">9.2 GB</span></div>
        <div class="text-[10px] uppercase" :class="isDark ? 'text-white/40' : 'text-slate-400'">Rate: <span :class="isDark ? 'text-white/80' : 'text-slate-700'">1.2M msg/s</span></div>
      </div>
    </div>

    <!-- Grid Layout -->
    <div class="w-full overflow-x-auto">
      <table class="w-full text-left text-[11px] leading-none transition-colors"
             :class="isDark ? 'text-white/70' : 'text-slate-600'">
        <thead class="border-b transition-colors"
               :class="isDark ? 'bg-[#080808] border-white/5' : 'bg-slate-100 border-black/5'">
          <tr>
            <th class="px-4 py-3 uppercase tracking-wider font-semibold border-r"
                :class="isDark ? 'text-white/40 border-white/5' : 'text-slate-400 border-black/5'">ID</th>
            <th class="px-4 py-3 uppercase tracking-wider font-semibold border-r text-center"
                :class="isDark ? 'text-white/40 border-white/5' : 'text-slate-400 border-black/5'">Time</th>
            <th class="px-4 py-3 uppercase tracking-wider font-semibold border-r"
                :class="isDark ? 'text-white/40 border-white/5' : 'text-slate-400 border-black/5'">Source</th>
            <th class="px-4 py-3 uppercase tracking-wider font-semibold border-r text-right"
                :class="isDark ? 'text-[#00f2ff] border-white/5' : 'text-blue-600 border-black/5'">Magnitude</th>
            <th class="px-4 py-3 uppercase tracking-wider font-semibold border-r"
                :class="isDark ? 'text-white/40 border-white/5' : 'text-slate-400 border-black/5'">Trend (15s)</th>
            <th class="px-4 py-3 uppercase tracking-wider font-semibold"
                :class="isDark ? 'text-white/40' : 'text-slate-400'">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in rows" :key="row.id" 
              class="group border-b transition-colors"
              :class="isDark ? 'border-white/[0.03] hover:bg-white/[0.02]' : 'border-black/[0.03] hover:bg-black/[0.01]'">
            <td class="px-4 py-2 font-bold border-r"
                :class="isDark ? 'text-[#7d00ff] border-white/5' : 'text-indigo-600 border-black/5'">{{ row.id }}</td>
            <td class="px-4 py-2 border-r text-center"
                :class="isDark ? 'text-white/50 border-white/5' : 'text-slate-400 border-black/5'">{{ row.timestamp }}</td>
            <td class="px-4 py-2 border-r"
                :class="isDark ? 'border-white/5' : 'border-black/5'">{{ row.sensor }}</td>
            <td class="px-4 py-2 text-right font-bold border-r"
                :class="isDark ? 'text-white border-white/5' : 'text-slate-900 border-black/5'">
              {{ row.value }} <span class="text-[9px] ml-0.5" :class="isDark ? 'text-white/30' : 'text-slate-400'">μV</span>
            </td>
            <td class="px-4 py-2 border-r" :class="isDark ? 'border-white/5' : 'border-black/5'">
              <svg class="h-4 w-24 overflow-visible" viewBox="0 0 100 20">
                <path :d="`M 0 ${20 - row.trend[0]} ` + row.trend.map((v, i) => `L ${i * (100/14)} ${20 - v}`).join(' ')"
                      fill="none" 
                      :stroke="isDark ? '#00f2ff' : '#3b82f6'" 
                      stroke-width="1.5"
                      class="drop-shadow-[0_0_2px_#00f2ff]" />
              </svg>
            </td>
            <td class="px-4 py-2">
              <span :class="row.status === 'ALERT' ? 'bg-red-500/20 text-red-500 border-red-500/50' : 'bg-emerald-500/20 text-emerald-500 border-emerald-500/50'"
                    class="rounded px-1.5 py-0.5 text-[9px] font-bold border">
                {{ row.status }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Technical Scrollbar Fake -->
    <div class="flex h-1.5 w-full" :class="isDark ? 'bg-white/5' : 'bg-black/5'">
      <div class="h-full w-1/4 transition-all duration-500"
           :class="isDark ? 'bg-violet-600/50 shadow-[0_0_8px_rgba(124,58,237,0.5)]' : 'bg-blue-600/50 shadow-[0_0_4px_rgba(37,99,235,0.3)]'"></div>
    </div>
  </div>
</template>

<style scoped>
.neon-grid-wrapper {
  background-image: 
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
