<script setup lang="ts">
import { useData } from 'vitepress';
import NeonGridDemo from './NeonGridDemo.vue';

const { isDark } = useData();
</script>

<template>
  <div class="neon-landing min-h-screen transition-colors duration-500"
       :class="isDark ? 'bg-[#050505] text-white selection:bg-[#00f2ff]/30 selection:text-white' : 'bg-slate-50 text-slate-900 selection:bg-blue-500/30 selection:text-slate-900'">
    <!-- Navigation / Ecosystem Header -->
    <nav class="sticky top-0 z-50 border-b backdrop-blur-xl transition-colors duration-300"
         :class="isDark ? 'border-white/5 bg-[#050505]/80' : 'border-black/5 bg-white/80'">
      <div class="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div class="flex items-center gap-2">
          <svg class="h-8 w-8" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:#00f2ff"/>
                <stop offset="50%" style="stop-color:#66b3ff"/>
                <stop offset="100%" style="stop-color:#a855f7"/>
              </linearGradient>
            </defs>
            <path d="M32 4L56 18V46L32 60L8 46V18L32 4Z" stroke="url(#logoGrad)" stroke-width="2.5" fill="none"/>
            <path d="M22 24 H42 M22 32 H42 M22 40 H42 M28 20 V44 M36 20 V44" stroke="url(#logoGrad)" stroke-width="2" stroke-linecap="round" opacity="0.8"/>
            <circle cx="32" cy="32" r="3" fill="#66b3ff"/>
          </svg>
          <span class="text-lg font-bold tracking-tighter uppercase">Sci-<span :class="isDark ? 'text-[#00f2ff]' : 'text-blue-600'">Grid</span></span>
        </div>
        <div class="flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest transition-colors"
             :class="isDark ? 'text-white/50' : 'text-slate-400'">
          <a href="#" class="transition-colors hover:text-[#00f2ff]">Engine</a>
          <a href="#" class="transition-colors hover:text-[#00f2ff]">Components</a>
          <a href="#" class="transition-colors hover:text-[#00f2ff]">Docs</a>
          <div class="h-4 w-[1px]" :class="isDark ? 'bg-white/10' : 'bg-black/10'"></div>
          <a href="#" class="rounded px-3 py-1.5 transition-all"
             :class="isDark ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-black/5 text-slate-900 hover:bg-black/10'">SciChart Eco</a>
        </div>
      </div>
    </nav>

    <!-- Hero Section -->
    <header class="relative overflow-hidden pt-24 pb-16">
      <div class="absolute -top-24 -left-24 h-[600px] w-[600px] rounded-full blur-[120px]"
           :class="isDark ? 'bg-violet-600/10' : 'bg-blue-600/5'"></div>
      <div class="absolute top-0 right-0 h-[400px] w-[400px] rounded-full blur-[120px]"
           :class="isDark ? 'bg-cyan-600/10' : 'bg-cyan-600/5'"></div>
      
      <div class="relative mx-auto max-w-5xl px-6 text-center">
        <div class="mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 transition-colors"
             :class="isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'">
          <span class="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
          <span class="text-[10px] font-bold uppercase tracking-widest"
                :class="isDark ? 'text-white/60' : 'text-slate-500'">New Release: Ecosistema Sci v2.0</span>
        </div>
        
        <h1 class="mb-8 text-6xl font-black tracking-tight lg:text-8xl">
          Visualiza lo <span class="bg-gradient-to-r from-[#00f2ff] to-[#7d00ff] bg-clip-text text-transparent italic">Invisible</span>.
        </h1>
        
        <p class="mx-auto mb-12 max-w-2xl text-lg leading-relaxed font-light transition-colors"
           :class="isDark ? 'text-white/60' : 'text-slate-600'">
          Sci-Grid combina el ADN visual de <span class="border-b transition-colors" :class="isDark ? 'text-white border-white/20' : 'text-slate-900 border-black/20'">SciChart</span> con un motor de renderizado ortogonal optimizado para millones de datos por segundo.
        </p>

        <div class="flex items-center justify-center gap-6">
          <button class="group relative rounded-lg px-8 py-4 font-bold transition-all"
                  :class="isDark ? 'bg-[#00f2ff] text-black hover:shadow-[0_0_30px_#00f2ff66]' : 'bg-blue-600 text-white hover:shadow-[0_0_30px_rgba(37,99,235,0.4)]'">
            Explorar Sci-Grid
          </button>
          <button class="rounded-lg border backdrop-blur-sm transition-all"
                  :class="isDark ? 'border-white/10 bg-white/5 hover:bg-white/10' : 'border-black/10 bg-black/5 hover:bg-black/10'">
            Documentación
          </button>
        </div>
      </div>
    </header>

    <!-- Main Live Demo Section -->
    <section class="max-w-7xl mx-auto px-6 py-12">
      <div class="relative rounded-2xl border p-1 shadow-2xl transition-all duration-500"
           :class="isDark ? 'border-white/5 bg-[#080808]' : 'border-black/5 bg-slate-100'">
        <div class="absolute -inset-[1px] rounded-2xl pointer-events-none"
             :class="isDark ? 'bg-gradient-to-br from-[#00f2ff]/20 via-transparent to-[#7d00ff]/20' : 'bg-gradient-to-br from-blue-500/10 via-transparent to-indigo-500/10'"></div>
        <div class="relative rounded-[15px] p-6 lg:p-12 overflow-hidden transition-colors"
             :class="isDark ? 'bg-[#050505]' : 'bg-white'">
           <div class="mb-8 flex items-end justify-between">
              <div>
                <h2 class="text-3xl font-black tracking-tight mb-2 uppercase">Precisión Ortogonal</h2>
                <p class="text-sm max-w-md transition-colors"
                   :class="isDark ? 'text-white/40' : 'text-slate-400'">Renderizado basado en el motor SciChart v4, adaptado para estructuras de datos masivas con latencia cero.</p>
              </div>
           </div>
           
           <NeonGridDemo />

           <div class="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div v-for="stat in [
                { label: 'Data Throughput', value: '4.8 GB/s', color: 'blue' },
                { label: 'Latency', value: '0.12 ms', color: 'violet' },
                { label: 'Max Rows', value: '∞ Dynamic', color: 'blue' },
                { label: 'Shaders', value: 'GLSL v3.0', color: 'violet' }
              ]" :key="stat.label"
              class="rounded-xl border p-4 group transition-all"
              :class="isDark ? 'border-white/5 bg-white/[0.02] hover:border-[#00f2ff]/30' : 'border-black/5 bg-black/[0.01] hover:border-blue-500/30'">
                <div class="text-[10px] uppercase tracking-widest mb-1 group-hover:text-blue-500 transition-colors"
                     :class="isDark ? 'text-white/30' : 'text-slate-400'">{{ stat.label }}</div>
                <div class="text-2xl font-mono font-bold tracking-tighter">{{ stat.value.split(' ')[0] }} <span class="text-sm opacity-30">{{ stat.value.split(' ')[1] }}</span></div>
              </div>
           </div>
        </div>
      </div>
    </section>

    <!-- Footer Technical Info -->
    <footer class="py-24 border-t transition-colors"
            :class="isDark ? 'border-white/5' : 'border-black/5'">
       <div class="max-w-7xl mx-auto px-6 flex flex-col items-center">
          <div class="text-[10px] uppercase tracking-widest mb-4 transition-colors"
               :class="isDark ? 'text-white/20' : 'text-slate-400'">Integrado Bajo el ADN Sci</div>
          <div class="flex gap-12 items-center grayscale opacity-30 hover:grayscale-0 hover:opacity-80 transition-all duration-500">
             <span class="text-xl font-black italic tracking-tighter uppercase">SciChart</span>
             <span class="text-xl font-black italic tracking-tighter uppercase">SciGrid</span>
             <span class="text-xl font-black italic tracking-tighter uppercase">SciWork</span>
          </div>
          <p class="mt-12 text-[10px] font-mono tracking-widest transition-colors"
             :class="isDark ? 'text-white/20' : 'text-slate-400'">© 2026 VELOSCI INSTRUMENTATION SERVICES / ALL DATA IS SIMULATED</p>
       </div>
    </footer>
  </div>
</template>

<style>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');

.neon-landing {
  font-family: 'Inter', sans-serif;
}
.font-mono {
  font-family: 'JetBrains Mono', monospace !important;
}

@keyframes glow {
  from { opacity: 0.5; }
  to { opacity: 1; }
}
</style>
