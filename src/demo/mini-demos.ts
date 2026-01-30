
import { SciGrid } from '../sci-grid.js';
import type { IDataGridProvider, ColumnHeaderInfo } from '../types/grid.js';

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
}

export function initMiniDemos() {
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
            selectionColor: '#00ff41',
            selectedTextColor: '#000',
            backgroundColor: '#000000',
            gridLineColor: '#003b00',
            textColor: '#00ff41',
            headerBackground: '#001a00',
            headerTextColor: '#00ff41',
            font: '14px "Courier New", monospace',
            showRowNumbers: true,
            rowNumberBackground: '#001a00',
            rowNumberTextColor: '#008F11'
        });
    }

    // 3. Simple Grid for Quickstart or Overview
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
        new SciGrid(quickContainer, provider, {
             backgroundColor: '#0d1117',
             headerBackground: '#161b22',
             textColor: '#c9d1d9',
             gridLineColor: '#30363d',
             showRowNumbers: true
        });
    }
}
