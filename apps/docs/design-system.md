---
layout: false
---

<script setup>
import NeonLanding from './components/NeonLanding.vue'
</script>

<div class="custom-layout">
  <NeonLanding />
</div>

<style>
/* Remove VitePress default padding/margins for this page */
.custom-layout {
  margin: 0;
  padding: 0;
  width: 100vw;
  min-height: 100vh;
  background: #050505;
}

:root {
  --vp-screen-max-width: 100%;
}

.custom-layout :deep(.VPDoc) {
  padding: 0 !important;
  max-width: 100% !important;
}
</style>
