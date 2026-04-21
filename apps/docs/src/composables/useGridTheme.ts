import { computed } from 'vue';
import { useData } from 'vitepress';

export function useGridTheme() {
  const { isDark } = useData();

  const gridConfig = computed(() => {
    if (isDark.value) {
      return {
        backgroundColor: '#05080f',
        gridLineColor: '#1e293b',
        textColor: '#f1f5f9',
        headerBackground: '#0a0f1c',
        headerTextColor: '#60a5fa',
        rowNumberBackground: '#0a0f1c',
        rowNumberTextColor: '#64748b',
        selectionColor: 'rgba(59, 130, 246, 0.3)',
        borderColor: '#1e293b'
      };
    } else {
      return {
        backgroundColor: '#ffffff',
        gridLineColor: '#e2e8f0',
        textColor: '#0f172a',
        headerBackground: '#f8fafc',
        headerTextColor: '#3b82f6',
        rowNumberBackground: '#f8fafc',
        rowNumberTextColor: '#94a3b8',
        selectionColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#e2e8f0'
      };
    }
  });

  return {
    gridConfig
  };
}
