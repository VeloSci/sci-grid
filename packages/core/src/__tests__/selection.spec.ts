import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SelectionManager } from '../core/selection-manager.js';
import type { ViewportState, GridConfig, IDataGridProvider, SelectionMode } from '../types/grid.js';

describe('SelectionManager', () => {
    let state: ViewportState;
    let provider: IDataGridProvider;
    let config: GridConfig;
    let invalidate: any;
    let manager: SelectionManager;

    beforeEach(() => {
        state = {
            selectionRanges: [],
            selectedRows: new Set(),
            selectedCols: new Set(),
            anchorRow: null,
            anchorCol: null,
            selectionMode: 'cell',
            // Default other fields
            scrollX: 0, scrollY: 0, width: 800, height: 600, headerHeight: 30,
            columnWidths: {}, columnOrder: [], columnOffsets: [],
            resizingCol: null, reorderingCol: null, reorderingTarget: null, reorderingX: null, hoveredCol: null
        };

        provider = {
            getRowCount: () => 10,
            getColumnCount: () => 10,
            getCellData: () => '',
            getHeader: (c) => ({ name: `Col ${c}` })
        };

        invalidate = vi.fn();
        config = {} as any; // Mock logic handles undefineds mostly, or we set minimal

        manager = new SelectionManager(state, provider, config, invalidate);
    });

    it('should select a single cell', () => {
        manager.updateSelection('cell', 1, 1, false, false);
        expect(state.selectionRanges).toHaveLength(1);
        expect(state.selectionRanges[0]).toEqual({ startRow: 1, endRow: 1, startCol: 1, endCol: 1 });
        expect(state.anchorRow).toBe(1);
        expect(state.anchorCol).toBe(1);
    });

    it('should select a row', () => {
        manager.updateSelection('row', 2, null, false, false);
        expect(state.selectionRanges).toHaveLength(1);
        expect(state.selectionRanges[0]).toEqual({ startRow: 2, endRow: 2, startCol: 0, endCol: 9 });
    });

    it('should select a column', () => {
        manager.updateSelection('column', null, 3, false, false);
        expect(state.selectionRanges).toHaveLength(1);
        expect(state.selectionRanges[0]).toEqual({ startRow: 0, endRow: 9, startCol: 3, endCol: 3 });
    });

    it('should handle multi-selection with CTRL', () => {
        // Select 0,0
        manager.updateSelection('cell', 0, 0, false, false);
        // Select 2,2 joining
        manager.updateSelection('cell', 2, 2, true, false);
        
        expect(state.selectionRanges).toHaveLength(2);
        expect(state.selectionRanges[0]).toEqual({ startRow: 0, endRow: 0, startCol: 0, endCol: 0 });
        expect(state.selectionRanges[1]).toEqual({ startRow: 2, endRow: 2, startCol: 2, endCol: 2 });
    });

    it('should handle toggle selection with CTRL', () => {
        // Select 0,0
        manager.updateSelection('cell', 0, 0, false, false);
        // Select 0,0 again with CTRL
        manager.updateSelection('cell', 0, 0, true, false);
        
        expect(state.selectionRanges).toHaveLength(0);
    });

    it('should handle range selection with SHIFT', () => {
        // Anchor at 0,0
        manager.updateSelection('cell', 0, 0, false, false);
        // Shift select to 2,2
        manager.updateSelection('cell', 2, 2, false, true); // isCtrl=false, isShift=true

        expect(state.selectionRanges).toHaveLength(1);
        expect(state.selectionRanges[0]).toEqual({ startRow: 0, endRow: 2, startCol: 0, endCol: 2 });
    });

    it('should select all', () => {
        manager.updateSelection('all', null, null, false, false);
        expect(state.selectionRanges).toHaveLength(1);
        expect(state.selectionRanges[0]).toEqual({ startRow: 0, endRow: 9, startCol: 0, endCol: 9 });
    });

    it('should populate lookup sets for efficient rendering', () => {
        manager.updateSelection('cell', 1, 1, false, false);
        // Range 1,1 to 1,1
        expect(state.selectedRows.has(1)).toBe(true);
        expect(state.selectedCols.has(1)).toBe(true);
        expect(state.selectedRows.size).toBe(1);

        manager.updateSelection('cell', 2, 2, true, false);
        expect(state.selectedRows.has(2)).toBe(true);
        expect(state.selectedRows.size).toBe(2);
    });

    it('should trigger onSelectionChange callback', () => {
        const cb = vi.fn();
        config.onSelectionChange = cb;
        manager.updateSelection('cell', 5, 5, false, false);
        expect(cb).toHaveBeenCalled();
        expect(cb.mock.calls[0][0].anchorRow).toBe(5);
    });
});
