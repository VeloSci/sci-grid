import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataManager } from '../core/data-manager.js';
import type { ViewportState, GridConfig, IDataGridProvider } from '../types/grid.js';

// Mock Clipboard API
const clipboardMock = {
    writeText: vi.fn().mockResolvedValue(undefined)
};
Object.assign(navigator, { clipboard: clipboardMock });

describe('DataManager', () => {
    let state: ViewportState;
    let provider: IDataGridProvider;
    let config: GridConfig;
    let manager: DataManager;

    beforeEach(() => {
        // Reset mocks
        clipboardMock.writeText.mockClear();
        localStorage.clear();

        state = {
            columnOrder: [0, 1, 2],
            columnWidths: {},
            selectionRanges: [],
            // Other state properties irrelevant for these tests but required by type
            scrollX: 0, scrollY: 0, width: 800, height: 600, headerHeight: 30,
            columnOffsets: [], selectedRows: new Set(), selectedCols: new Set(),
            anchorRow: null, anchorCol: null, resizingCol: null, reorderingCol: null,
            reorderingTarget: null, reorderingX: null, hoveredCol: null, selectionMode: 'cell'
        };

        provider = {
            getRowCount: () => 10,
            getColumnCount: () => 5,
            getCellData: (r, c) => `${r}-${c}`,
            getHeader: (c) => ({ name: `Col ${c}` })
        };

        config = {
            persistenceKey: undefined,
            // Minimal config
            rowHeight: 20, columnWidth: 100, headerHeight: 30, showRowNumbers: true, rowNumbersWidth: 40,
            headerSubTextCount: 0, headerPlaceholder: '', allowResizing: true, allowFiltering: false,
            backgroundColor: '#000', gridLineColor: '#333', textColor: '#fff', font: '12px sans-serif',
            headerBackground: '#222', headerTextColor: '#fff', headerFont: 'bold 12px sans-serif',
            selectionColor: 'blue', selectedTextColor: 'white', cellPadding: 8,
            rowNumberBackground: '#111', rowNumberTextColor: '#ccc'
        };

        manager = new DataManager(state, provider, config);
    });

    it('should save state to localStorage if persistenceKey is set', () => {
        config.persistenceKey = 'test';
        state.columnWidths[0] = 123;
        state.columnOrder = [2, 1, 0];
        
        manager.saveState();
        
        const raw = localStorage.getItem('scigrid_state_test');
        expect(raw).toBeTruthy();
        const saved = JSON.parse(raw!);
        expect(saved.columnWidths[0]).toBe(123);
        expect(saved.columnOrder).toEqual([2, 1, 0]);
    });

    it('should not save state if persistenceKey is missing', () => {
        state.columnWidths[0] = 123;
        manager.saveState();
        expect(localStorage.length).toBe(0);
    });

    it('should load state from localStorage', () => {
        config.persistenceKey = 'test';
        localStorage.setItem('scigrid_state_test', JSON.stringify({
            columnWidths: { 1: 50 },
            columnOrder: [1, 0, 2]
        }));

        const loaded = manager.loadState();
        expect(loaded).toBeTruthy();
        expect(loaded.columnWidths[1]).toBe(50);
        expect(loaded.columnOrder).toEqual([1, 0, 2]);
    });

    it('should copy selected range as CSV/TSV to clipboard', () => {
        state.selectionRanges = [{ startRow: 0, endRow: 1, startCol: 0, endCol: 1 }];
        // Cells: 0-0, 0-1
        //        1-0, 1-1
        
        manager.copyToClipboard();
        
        expect(clipboardMock.writeText).toHaveBeenCalledTimes(1);
        const text = clipboardMock.writeText.mock.calls[0][0];
        
        // Tab separated logic in implementation
        const rows = text.trim().split('\n');
        expect(rows.length).toBe(2);
        expect(rows[0]).toContain('"0-0"');
        expect(rows[0]).toContain('"0-1"');
        expect(rows[1]).toContain('"1-0"');
    });

    it('should ignore non-selected cells in generating copy text logic', () => {
        // Range covers 0,0 to 0,2. But let's say we have complex logic logic or just check general bounds
        // The implementation iterates minR to maxR and minC to maxC and checks if cell is in ANY range.
        
        state.selectionRanges = [
            { startRow: 0, endRow: 0, startCol: 0, endCol: 0 }, // 0,0
            { startRow: 0, endRow: 0, startCol: 2, endCol: 2 }  // 0,2
        ];
        
        // 0,1 is NOT selected. Should be empty string in output?
        manager.copyToClipboard();
        const text = clipboardMock.writeText.mock.calls[0][0];
        const parts = text.trim().split('\t');
        
        // Should be: "0-0" \t "" \t "0-2"
        expect(parts[0]).toBe('"0-0"');
        expect(parts[1]).toBe('""');
        expect(parts[2]).toBe('"0-2"');
    });
});
