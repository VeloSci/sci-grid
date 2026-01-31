
import { SciGrid } from '@sci-grid/core';
import type { IDataGridProvider, ColumnHeaderInfo, GridConfig } from '../types/grid.js';

// Simple helper for mini providers
export class SimpleDemoProvider implements IDataGridProvider {
    data: any[][];
    headers: ColumnHeaderInfo[];

    constructor(data: any[][], headers: ColumnHeaderInfo[]) {
        this.data = data;
        this.headers = headers;
    }

    getRowCount() { return this.data.length; }
    getColumnCount() { return this.headers.length; }
    getCellData(row: number, col: number) { return this.data[row]?.[col] ?? ""; }
    getHeader(col: number) { return this.headers[col]!; }
    setCellData(row: number, col: number, value: any) {
        if (this.data[row]) {
            this.data[row][col] = value;
        }
    }
}

export function initMiniDemos() {
    const commonConfig: Partial<GridConfig> = {
        rowHeight: 35,
        headerHeight: 35,
        showRowNumbers: false,
        backgroundColor: '#0d1117',
        headerBackground: '#161b22',
        headerTextColor: '#c9d1d9',
        textColor: '#c9d1d9',
        gridLineColor: '#30363d',
        font: '13px Inter',
        selectionColor: 'rgba(88, 166, 255, 0.1)',
        selectedTextColor: '#ffffff'
    };

    // 1. Column Types Demo
    const typesContainer = document.getElementById('demo-columns');
    if (typesContainer) {
        typesContainer.innerHTML = '';
        const headers: ColumnHeaderInfo[] = [
            { name: "Task", type: 'text' },
            { name: "Status", type: 'checkbox' },
            { name: "Progress", type: 'progress' },
            { name: "Priority", type: 'select', selectOptions: ['Low', 'Medium', 'High'] }
        ];
        const data = [
            ["Fix Bugs", true, 100, "High"],
            ["Write Docs", false, 45, "Medium"],
            ["Release v1", false, 10, "High"],
            ["Refactor", true, 80, "Low"]
        ];
        const provider = new SimpleDemoProvider(data, headers);
        new SciGrid(typesContainer, provider, {
            rowHeight: 35,
            headerHeight: 35,
            showRowNumbers: false,
            backgroundColor: '#0d1117',
            headerBackground: '#161b22',
            headerTextColor: '#c9d1d9',
            textColor: '#c9d1d9',
            gridLineColor: '#30363d',
            font: '13px Inter',
            selectionColor: 'rgba(88, 166, 255, 0.1)',
            selectedTextColor: '#ffffff'
        });
    }

    // 2. Theming Demo (Bright/Cyberpunk)
    const themeContainer = document.getElementById('demo-theming');
    if (themeContainer) {
        themeContainer.innerHTML = '';
        const headers: ColumnHeaderInfo[] = [
            { name: "ID", type: 'numeric' },
            { name: "User", type: 'text' },
            { name: "Role", type: 'select', selectOptions: ['Admin', 'User'] },
             { name: "Active", type: 'checkbox' }
        ];
        const data = [
            [101, "Neo", "Admin", true],
            [102, "Trinity", "Admin", true],
            [103, "Morpheus", "User", false],
            [104, "Cypher", "User", false],
        ];
        const provider = new SimpleDemoProvider(data, headers);
        new SciGrid(themeContainer, provider, {
            rowHeight: 40,
            selectionColor: 'rgba(0, 255, 65, 0.2)',
            selectedTextColor: '#000',
            backgroundColor: '#000000',
            gridLineColor: '#003b00',
            textColor: '#00ff41',
            headerBackground: '#001a00',
            headerTextColor: '#00ff41',
            font: '14px "Courier New", monospace',
            showRowNumbers: true,
            rowNumberBackground: '#001a00',
            rowNumberTextColor: '#008F11',
            dragHandleColor: '#00ff41'
        });
    }

    // 3. Sorting Demo
    const sortingContainer = document.getElementById('demo-sorting');
    if (sortingContainer) {
        sortingContainer.innerHTML = '';
        const headers: ColumnHeaderInfo[] = [
            { name: "Country", type: 'text', isSortable: true },
            { name: "Population", type: 'numeric', isSortable: true },
            { name: "Growth", type: 'progress', isSortable: true }
        ];
        let data = [
            ["China", 1411, 0.4],
            ["India", 1380, 1.2],
            ["USA", 331, 0.6],
            ["Brazil", 212, 0.8]
        ];
        const provider = new SimpleDemoProvider([...data], headers);
        const grid = new SciGrid(sortingContainer, provider, {
            ...commonConfig,
            onSort: (col, order) => {
                const multiplier = order === 'asc' ? 1 : -1;
                data.sort((a, b) => {
                    const valA = a[col] ?? "";
                    const valB = b[col] ?? "";
                    if (valA < valB) return -1 * multiplier;
                    if (valA > valB) return 1 * multiplier;
                    return 0;
                });
                if (order === null) data = [["China", 1411, 0.4], ["India", 1380, 1.2], ["USA", 331, 0.6], ["Brazil", 212, 0.8]];
                provider.data = [...data];
                grid.invalidate();
            }
        });
    }

    // 4. Editing Demo
    const editingContainer = document.getElementById('demo-editing');
    if (editingContainer) {
        editingContainer.innerHTML = '';
        const headers: ColumnHeaderInfo[] = [
            { name: "Product", type: 'text', isEditable: true },
            { name: "Category", type: 'select', selectOptions: ['Electronics', 'Food', 'Books'], isEditable: true },
            { name: "Stock", type: 'numeric', isEditable: true },
            { name: "Available", type: 'checkbox', isEditable: true }
        ];
        const data = [
            ["Laptop", "Electronics", 50, true],
            ["Apple", "Food", 200, true],
            ["JS Guide", "Books", 30, false]
        ];
        const provider = new SimpleDemoProvider(data, headers);
        new SciGrid(editingContainer, provider, commonConfig);
    }

    // 5. Advanced Headers Demo
    const headersContainer = document.getElementById('demo-headers');
    if (headersContainer) {
        headersContainer.innerHTML = '';
        const headers: ColumnHeaderInfo[] = [
            { name: "Voltage", units: "mV", description: "Input range" },
            { name: "Current", units: "mA", description: "Peak load" },
            { name: "Phase", units: "deg", description: "Angle" }
        ];
        const data = Array.from({length: 10}, (_, i) => [i * 10, i * 5, i * 2]);
        const provider = new SimpleDemoProvider(data, headers);
        new SciGrid(headersContainer, provider, {
            ...commonConfig,
            headerHeight: 65,
            headerSubTextCount: 2,
            headerTitleStyle: { color: '#58a6ff', font: 'bold 12px Inter' },
            headerUnitsStyle: { color: '#8b949e', font: '10px Inter' },
            headerDescriptionStyle: { color: '#444c56', font: 'italic 10px Inter' }
        });
    }

    // 6. Real-time Streaming Demo
    const streamContainer = document.getElementById('demo-streaming');
    if (streamContainer) {
        streamContainer.innerHTML = '';
        const headers: ColumnHeaderInfo[] = [
            { name: "Sensor", type: 'text' },
            { name: "Value", type: 'numeric' },
            { name: "Activity", type: 'progress' }
        ];
        const data = [
            ["Alpha", 45, 10],
            ["Beta", 88, 50],
            ["Gamma", 12, 90]
        ];
        const provider = new SimpleDemoProvider(data, headers);
        const grid = new SciGrid(streamContainer, provider, commonConfig);

        setInterval(() => {
            data.forEach(row => {
               row[1] = Math.floor(Math.random() * 100);
               row[2] = Math.floor(Math.random() * 100);
            });
            grid.invalidate();
        }, 500);
    }

    // 7. Selection Modes Demo
    const selectionContainer = document.getElementById('demo-selection');
    if (selectionContainer) {
        selectionContainer.innerHTML = '';
        const headers: ColumnHeaderInfo[] = [
            { name: "First Name", type: 'text' },
            { name: "Last Name", type: 'text' },
            { name: "Points", type: 'numeric' }
        ];
        const data = [
            ["John", "Doe", 120],
            ["Jane", "Smith", 450],
            ["Bob", "Johnson", 300],
            ["Alice", "Williams", 250]
        ];
        const provider = new SimpleDemoProvider(data, headers);
        const log = document.createElement('div');
        log.style.fontSize = '12px';
        log.style.padding = '10px';
        log.style.color = '#8b949e';
        log.textContent = 'Select cells, rows or columns...';

        const wrapper = document.createElement('div');
        wrapper.style.height = '100%';
        wrapper.style.display = 'flex';
        wrapper.style.flexDirection = 'column';
        
        const gridDiv = document.createElement('div');
        gridDiv.style.flex = '1';
        
        wrapper.appendChild(gridDiv);
        wrapper.appendChild(log);
        selectionContainer.appendChild(wrapper);

        new SciGrid(gridDiv, provider, {
            ...commonConfig,
            showRowNumbers: true,
            onSelectionChange: (info) => {
                log.textContent = `Selection: ${info.mode} mode, ${info.ranges.length} range(s) selected. Anchor: [${info.anchorRow}, ${info.anchorCol}]`;
            }
        });
    }

    // 8. Sparklines & Icons Demo
    const visualizationContainer = document.getElementById('demo-visuals');
    if (visualizationContainer) {
        visualizationContainer.innerHTML = '';
        const headers: ColumnHeaderInfo[] = [
            { name: "CPU", type: 'text', markIcon: '💻' },
            { name: "Usage", type: 'progress' },
            { name: "History", type: 'sparkline', description: 'Last 10s' },
            { name: "Temp", type: 'numeric', units: '°C', markIcon: '🔥' }
        ];
        const data = [
            ["Core 0", 45, [10, 20, 45, 30, 60, 45], 55.4],
            ["Core 1", 88, [80, 85, 90, 82, 88, 88], 62.1],
            ["GPU", 12, [5, 8, 12, 10, 15, 12], 42.0]
        ];
        const provider = new SimpleDemoProvider(data, headers);
        new SciGrid(visualizationContainer, provider, {
            ...commonConfig,
            headerHeight: 50,
            headerSubTextCount: 1
        });
    }

    // 9. Simple Grid (Quickstart)
    const quickContainer = document.getElementById('demo-quickstart');
    if (quickContainer) {
        quickContainer.innerHTML = '';
        const headers: ColumnHeaderInfo[] = [
            { name: "A", type: 'text' },
            { name: "B", type: 'numeric' },
            { name: "C", type: 'text' }
        ];
        const data = Array.from({length: 50}, (_, i) => [`Item ${i+1}`, i * 10, `Detail ${i}`]);
        const provider = new SimpleDemoProvider(data, headers);
        new SciGrid(quickContainer, provider, commonConfig);
    }
}
