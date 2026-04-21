import { ref, onMounted, onUnmounted, watch, defineComponent, h, type PropType } from 'vue';
import { VeloGrid } from '@velosci-grid/core';
import type { GridConfig, IDataGridProvider } from '@velosci-grid/core';

/**
 * VeloGrid Vue 3 Adapter
 * Premium data grid integration for Vue applications.
 */
export const VeloGridVue = defineComponent({
  name: 'VeloGridVue',
  props: {
    provider: {
      type: Object as PropType<IDataGridProvider>,
      required: true
    },
    config: {
      type: Object as PropType<Partial<GridConfig>>,
      default: () => ({})
    }
  },
  setup(props: { provider: IDataGridProvider; config: Partial<GridConfig> }) {
    const containerRef = ref<HTMLElement | null>(null);
    let grid: VeloGrid | null = null;

    onMounted(() => {
      if (containerRef.value) {
        grid = new VeloGrid(containerRef.value, props.provider, props.config);
      }
    });

    onUnmounted(() => {
      grid?.destroy();
      grid = null;
    });

    watch(() => props.provider, (newProvider: IDataGridProvider) => {
      grid?.updateProvider(newProvider);
    });

    watch(() => props.config, (newConfig: Partial<GridConfig>) => {
      grid?.updateConfig(newConfig);
    }, { deep: true });

    return () => h('div', {
      ref: containerRef,
      style: { width: '100%', height: '100%' }
    });
  }
});
