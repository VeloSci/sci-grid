<script setup lang="ts">
import { SciGridVue } from '@sci-grid/vue';
import { ref, reactive, computed } from 'vue';
import type { GridConfig } from '@sci-grid/core';
import { useGridTheme } from '../src/composables/useGridTheme';

const { gridConfig } = useGridTheme();

// --- 1. State ---
const activeTab = ref<'preview' | 'code'>('preview');

// Configuration Controls
const controls = reactive({
  rowHeight: 35,
  showRowNumbers: true,
  allowResizing: true,
  headerSubTextCount: 0 as 0 | 1 | 2,
  includeCustomMenu: false,
  themeColor: '#4facfe',
  columnCount: 20
});

// --- 2. Data Provider ---
const rowCount = 1000;
const provider = computed(() => {
  const cols = controls.columnCount;
  return {
    getRowCount: () => rowCount,
    getColumnCount: () => cols,
    getCellData: (r: number, c: number) => {
      if (c === 0) return r + 1; // ID
      if (c === 1) return ['Alice', 'Bob', 'Charlie', 'David', 'Eve'][r % 5];
      // Deterministic "random" logic for Ages and Metrics to prevent flickering
      if (c === 2) return 20 + ((r * 13) % 40); // Age between 20-60
      return ((r * c * 137.5) % 1000).toFixed(2); // Random-looking float
    },
    getHeader: (c: number) => {
      const base = {
        name: c === 0 ? 'ID' : c === 1 ? 'Name' : c === 2 ? 'Age' : `Metric ${c}`,
        type: (c === 2 ? 'numeric' : 'text') as 'numeric' | 'text',
        isResizable: true
      };
      
      if (controls.headerSubTextCount >= 1) {
        Object.assign(base, { units: c === 2 ? 'yrs' : c > 2 ? 'm/s' : '' });
      }
      if (controls.headerSubTextCount >= 2) {
        Object.assign(base, { description: 'Measured value' });
      }
      return base;
    }
  };
});

// --- 3. Dynamic Config ---
const computedConfig = computed<Partial<GridConfig>>(() => {
  const base: Partial<GridConfig> = {
    ...gridConfig.value,
    rowHeight: controls.rowHeight,
    showRowNumbers: controls.showRowNumbers,
    allowResizing: controls.allowResizing,
    headerSubTextCount: controls.headerSubTextCount,
    selectionColor: `${controls.themeColor}4D`, // 30% alpha
    dragHandleColor: controls.themeColor,
  };

  if (controls.includeCustomMenu) {
    base.getContextMenuItems = (defaultItems) => {
      // Example: Filter out 'export-csv' and modify 'refresh'
      const items = defaultItems.map(item => {
        if (typeof item !== 'string' && item.id === 'refresh') {
          return { ...item, label: '🔄 Reload Data', icon: '🔄' };
        }
        return item;
      });

      return [
        ...items,
        'divider',
        { label: '🚀 Custom Action', action: () => alert('Rocket launch initiated!'), icon: '🚀' },
        { label: '🎨 Colorize', action: () => alert('Colorizing cells... (demo)'), icon: '🎨' }
      ];
    };
  }

  return base;
});

// --- 4. Code Generation ---
const generatedCode = computed(() => {
  let menuCode = '';
  if (controls.includeCustomMenu) {
    menuCode = `
  getContextMenuItems: (items) => {
    // Modify existing items by ID
    const newItems = items.map(i => {
      if (typeof i !== 'string' && i.id === 'refresh') {
        return { ...i, label: '🔄 Reload Data', icon: '🔄' };
      }
      return i;
    });

    return [
      ...newItems,
      'divider',
      { label: '🚀 Custom Action', action: () => alert('Launch!'), icon: '🚀' }
    ];
  },`;
  }

  return `const grid = new SciGrid(container, provider, {
  rowHeight: ${controls.rowHeight},
  showRowNumbers: ${controls.showRowNumbers},
  allowResizing: ${controls.allowResizing},
  headerSubTextCount: ${controls.headerSubTextCount},
  selectionColor: '${controls.themeColor}4D',
  dragHandleColor: '${controls.themeColor}',${menuCode}
});`;
});

function copyCode() {
  navigator.clipboard.writeText(generatedCode.value);
  alert('Code copied to clipboard!');
}
</script>

<template>
  <div class="playground-wrapper">
    <!-- Header / Tabs -->
    <div class="playground-header">
      <div class="title">Grid Playground</div>
      <div class="tabs">
        <button 
          :class="{ active: activeTab === 'preview' }" 
          @click="activeTab = 'preview'"
        >Preview</button>
        <button 
          :class="{ active: activeTab === 'code' }" 
          @click="activeTab = 'code'"
        >Code</button>
      </div>
    </div>

    <div class="playground-body">
      <!-- Sidebar Controls -->
      <div class="controls-sidebar">
        <div class="control-group">
          <h3>Appearance</h3>
          <label>
            <span>Row Height (px)</span>
            <input type="range" min="20" max="60" v-model.number="controls.rowHeight" />
            <span class="val">{{ controls.rowHeight }}</span>
          </label>
          <label>
            <span>Theme Color</span>
            <input type="color" v-model="controls.themeColor" />
          </label>
          <label class="checkbox">
            <input type="checkbox" v-model="controls.showRowNumbers" />
            <span>Show Row Numbers</span>
          </label>
        </div>

        <div class="control-group">
          <h3>Headers</h3>
          <label>
            <span>Header Detail Level</span>
            <select v-model.number="controls.headerSubTextCount">
              <option :value="0">Simple (Name Only)</option>
              <option :value="1">Detailed (+ Units)</option>
              <option :value="2">Rich (+ Desc)</option>
            </select>
          </label>
          <label class="checkbox">
            <input type="checkbox" v-model="controls.allowResizing" />
            <span>Allow Resizing</span>
          </label>
        </div>

        <div class="control-group">
          <h3>Interaction</h3>
          <label class="checkbox">
            <input type="checkbox" v-model="controls.includeCustomMenu" />
            <span>Custom Context Menu</span>
          </label>
          <p class="hint" v-if="controls.includeCustomMenu">
            Right-click the grid to see "Rocket Launch" action!
          </p>
        </div>
      </div>

      <!-- Main Content Area -->
      <div class="preview-area">
        <div v-show="activeTab === 'preview'" class="grid-container">
          <SciGridVue :provider="provider" :config="computedConfig" />
        </div>
        
        <div v-show="activeTab === 'code'" class="code-container">
          <div class="code-actions">
            <button @click="copyCode">Copy</button>
          </div>
          <pre><code>{{ generatedCode }}</code></pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.playground-wrapper {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--vp-c-bg);
  margin: 2rem 0;
  display: flex;
  flex-direction: column;
}

.playground-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background-color: var(--vp-c-bg-soft);
  border-bottom: 1px solid var(--vp-c-divider);
}

.title {
  font-weight: 600;
  color: var(--vp-c-text-1);
}

.tabs {
  display: flex;
  gap: 0.5rem;
}

.tabs button {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  background: transparent;
  color: var(--vp-c-text-2);
  border: 1px solid transparent;
  transition: all 0.2s;
}

.tabs button:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg-mute);
}

.tabs button.active {
  background-color: var(--vp-c-brand);
  color: white;
}

.playground-body {
  display: flex;
  height: 500px;
}

/* Sidebar */
.controls-sidebar {
  width: 250px;
  background-color: var(--vp-c-bg-soft);
  border-right: 1px solid var(--vp-c-divider);
  padding: 1rem;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  flex-shrink: 0;
}

.control-group h3 {
  font-size: 0.85rem;
  text-transform: uppercase;
  color: var(--vp-c-text-2);
  margin-bottom: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.control-group label {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  margin-bottom: 0.75rem;
  font-size: 0.9rem;
}

.control-group label.checkbox {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.control-group input[type="range"] {
  width: 100%;
}

.control-group input[type="color"] {
  width: 100%;
  height: 30px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 4px;
  padding: 0;
}

.control-group select {
  padding: 0.4rem;
  border-radius: 4px;
  border: 1px solid var(--vp-c-divider);
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
}

.val {
  font-size: 0.8rem;
  color: var(--vp-c-text-2);
  align-self: flex-end;
}

.hint {
  font-size: 0.8rem;
  color: var(--vp-c-brand);
  margin-top: -0.25rem;
}

/* Main Area */
.preview-area {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.grid-container {
  width: 100%;
  height: 100%;
}

.code-container {
  padding: 1rem;
  height: 100%;
  overflow: auto;
  background-color: var(--vp-code-block-bg);
  font-family: var(--vp-font-family-mono);
  font-size: 0.9rem;
  position: relative;
}

.code-actions {
  position: absolute;
  top: 1rem;
  right: 1rem;
}

.code-actions button {
  padding: 0.25rem 0.5rem;
  background: var(--vp-c-brand);
  color: white;
  border-radius: 4px;
  font-size: 0.8rem;
}
</style>
