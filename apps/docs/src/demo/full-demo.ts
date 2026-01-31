import {SciGrid, type SelectionInfo} from '@sci-grid/core';
import { ExcelDataProvider } from './data-provider.js';

export function runFullDemo(element: HTMLElement) {
    // Clear previous if any
    element.innerHTML = `
        <div style="height: 100%; position: relative;">
            <div id="grid-full-demo" style="width: 100%; height: 100%;"></div>
            <div id="overlay-demo" style="position: absolute; top: 10px; right: 20px; background: rgba(18, 18, 20, 0.85); backdrop-filter: blur(10px); color: #fff; padding: 15px; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.1); pointer-events: none; z-index: 100;">
                <h3 style="margin: 0 0 10px 0; color: #4facfe;">1 Million Rows</h3>
                <div class="stat" id="stat-cells">Cells: 0</div>
                <div class="stat" id="stat-mem">Memory: 0 MB</div>
                <div class="stat" id="stat-cols">Columns: 0</div>
                <div class="stat" id="stat-selection">Selection: [-]</div>
                <button id="theme-btn-demo" style="margin-top: 10px; padding: 6px 12px; background: #4facfe; border: none; border-radius: 4px; color: white; cursor: pointer; pointer-events: auto;">Toggle Theme</button>
            </div>
        </div>
    `;

    const container = document.getElementById('grid-full-demo');
    if (!container) return; // Null check

    const provider = new ExcelDataProvider(1000000, 200);

    // Update stats
    const totalCells = provider.getRowCount() * provider.getColumnCount();
    const memMB = (totalCells * 8) / (1024 * 1024);
    
    const statCells = document.getElementById('stat-cells');
    if (statCells) statCells.textContent = `Cells: ${totalCells.toLocaleString()}`;
    
    const statMem = document.getElementById('stat-mem');
    if (statMem) statMem.textContent = `Memory: ${memMB.toFixed(2)} MB (Float64Array)`;
    
    const statCols = document.getElementById('stat-cols');
    if (statCols) statCols.textContent = `Columns: ${provider.getColumnCount()}`;

    const darkConfig = {
        backgroundColor: '#0a0a0b',
        gridLineColor: '#1e1e20',
        textColor: '#94a3b8',
        font: '13px "JetBrains Mono", monospace',
        headerHeight: 65,
        headerSubTextCount: 2 as 0 | 1 | 2,
        headerBackground: '#121214',
        headerTextColor: '#4facfe',
        headerFont: 'bold 13px "Inter", sans-serif',
        headerTitleStyle: { color: '#58a6ff', font: 'bold 12px Inter' },
        headerUnitsStyle: { color: '#8b949e', font: '10px Inter' },
        headerDescriptionStyle: { color: '#444c56', font: 'italic 10px Inter' },
        rowNumberBackground: '#121214',
        rowNumberTextColor: '#666666',
        selectionColor: 'rgba(79, 172, 254, 0.2)',
        selectedTextColor: '#ffffff',
        alternateRowColor: '#0c0c0e',
        cellPadding: 10,
        rowHeight: 30,
        columnWidth: 120,
        showRowNumbers: true,
        rowNumbersWidth: 60,
        scrollbarColor: 'transparent',
        scrollbarThumbColor: '#30363d'
    };

    const lightConfig = {
        ...darkConfig,
        backgroundColor: '#ffffff',
        gridLineColor: '#e2e8f0',
        textColor: '#334155',
        headerBackground: '#f8fafc',
        headerTextColor: '#0f172a',
        rowNumberBackground: '#f1f5f9',
        rowNumberTextColor: '#64748b',
        selectionColor: 'rgba(59, 130, 246, 0.2)',
        selectedTextColor: '#000000',
        alternateRowColor: '#f8fafc',
        scrollbarColor: 'transparent',
        scrollbarThumbColor: '#cbd5e1'
    };

    const grid = new SciGrid(container, provider, {
        ...darkConfig,
        onSelectionChange: (info: SelectionInfo) => {
            const statSelection = document.getElementById('stat-selection');
            if(statSelection) {
                let selText = '[-]';
                if (info.mode === 'all') {
                    selText = '[∞, ∞]';
                } else if (info.anchorRow !== null || info.anchorCol !== null) {
                    const r = info.mode === 'column' ? '∞' : (info.anchorRow !== null ? info.anchorRow + 1 : '∞');
                    const c = info.mode === 'row' ? '∞' : (info.anchorCol !== null ? info.anchorCol + 1 : '∞');
                    selText = `[${r}, ${c}]`;
                }
                statSelection.textContent = `Selection: ${selText}`;
            }
        }
    });

    // Theme Toggle
    const themeBtn = document.getElementById('theme-btn-demo');
    if (themeBtn) {
        let isDark = true;
        themeBtn.addEventListener('click', () => {
            isDark = !isDark;
            if (isDark) {
                grid.updateConfig(darkConfig);
            } else {
                grid.updateConfig(lightConfig);
            }
        });
    }
}
