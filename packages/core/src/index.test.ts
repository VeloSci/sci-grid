import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SciGrid } from './index.js';
import type { IDataGridProvider } from './types/grid.js';

describe('SciGrid Core', () => {
    let container: HTMLElement;
    let provider: IDataGridProvider;

    beforeEach(() => {
        container = document.createElement('div');
        // Define dimensions for the container so virtualization works
        Object.defineProperty(container, 'clientWidth', { value: 800 });
        Object.defineProperty(container, 'clientHeight', { value: 600 });
        
        provider = {
            getRowCount: vi.fn(() => 100),
            getColumnCount: vi.fn(() => 10),
            getCellData: vi.fn((r, c) => `Cell ${r}:${c}`),
            getHeader: vi.fn((c) => ({ name: `Col ${c}` }))
        };
    });

    it('should select columns based on mouse events', () => {
        new SciGrid(container, provider);
        
        // Mock getBoundingClientRect for position-based events
        container.getBoundingClientRect = vi.fn(() => ({
            left: 0, top: 0, width: 800, height: 600
        } as DOMRect));

        // Simulate click on header of column 0 (width 100)
        const event = new MouseEvent('mousedown', {
            clientX: 50,
            clientY: 10, // In header area (height 30)
            bubbles: true
        });
        
        container.dispatchEvent(event);
        
        // Internally it should update selection (we'd need to expose state or spy on internals)
        // For now, check if it doesn't crash
    });

    it('should merge configuration updates', () => {
        const grid = new SciGrid(container, provider, { rowHeight: 30 });
        grid.updateConfig({ rowHeight: 40, headerHeight: 50 });
        
        // Verify via config access if possible, or check behavior
    });

    it('should handle multi-line headers', () => {
        provider.getHeader = vi.fn((c) => ({
            name: `Title ${c}`,
            units: 'mV',
            description: 'Long description'
        }));
        
        const grid = new SciGrid(container, provider, { 
            headerHeight: 60,
            headerSubTextCount: 2 
        });
        
        // JSDOM ResizeObserver doesn't trigger automatically
        (grid as any).resize(800, 600);
        grid.renderNow();
        expect(provider.getHeader).toHaveBeenCalled();
    });

    it('should handle sorting cycle on header click', () => {
        const onSort = vi.fn();
        new SciGrid(container, provider, { onSort });
        
        container.getBoundingClientRect = vi.fn(() => ({
            left: 0, top: 0, width: 800, height: 600
        } as DOMRect));

        // Column 0 is sortable by default in our mock provider logic if not specified
        provider.getHeader = vi.fn(() => ({ name: 'Col 0', isSortable: true }));

        // Simulate MouseDown
        const down = new MouseEvent('mousedown', { clientX: 50, clientY: 10, bubbles: true });
        container.dispatchEvent(down);
        
        // Simulate MouseUp (immediately, so no drag started)
        const up = new MouseEvent('mouseup', { clientX: 50, clientY: 10, bubbles: true });
        window.dispatchEvent(up);

        expect(onSort).toHaveBeenCalledWith(0, 'asc');
    });
    it('should toggle checkbox value on click', () => {
        const setCellData = vi.fn();
        provider.setCellData = setCellData;
        provider.getCellData = vi.fn(() => false);
        provider.getHeader = vi.fn(() => ({ name: 'Check', type: 'checkbox' }));
        
        const grid = new SciGrid(container, provider);
        (grid as any).resize(800, 600);
        
        container.getBoundingClientRect = vi.fn(() => ({
            left: 0, top: 0, width: 800, height: 600, right: 800, bottom: 600, x: 0, y: 0, toJSON: () => {}
        } as DOMRect));
        
        // Default rowNumWidth is 40. Default headers height is 30.
        // Click at x=60 (inside first column which starts at 40), y=45 (inside first row which starts at 30)
        const event = new MouseEvent('mousedown', {
            clientX: 60, 
            clientY: 45,
            bubbles: true
        });
        
        container.dispatchEvent(event);
        
        expect(setCellData).toHaveBeenCalledWith(0, 0, true);
    });

    it('should persist state to localStorage when configured', () => {
        const persistenceKey = 'test-grid';
        const grid = new SciGrid(container, provider, { persistenceKey });
        
        // Mock resizing a column
        (grid as any).state.columnWidths[0] = 150;
        (grid as any).saveState();

        const saved = JSON.parse(localStorage.getItem(`scigrid_state_${persistenceKey}`)!);
        expect(saved.columnWidths[0]).toBe(150);
    });

    it('should handle keyboard navigation correctly', () => {
        const grid = new SciGrid(container, provider);
        grid.renderNow();
        
        // Focus first
        container.focus();
        
        // Mock anchor selection
        (grid as any).state.anchorRow = 0;
        (grid as any).state.anchorCol = 0;
        (grid as any).state.columnOrder = [0, 1, 2];

        // ArrowDown
        container.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
        expect((grid as any).state.anchorRow).toBe(1);

        // End (go to last column)
        container.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
        expect((grid as any).state.anchorCol).toBe(9); // 10 columns total
    });

    it('should trigger infinite loading when scrolling', () => {
        const onRowsNeeded = vi.fn();
        provider.onRowsNeeded = onRowsNeeded;
        
        const grid = new SciGrid(container, provider, { rowHeight: 20 });
        (grid as any).resize(800, 400); // 20 rows visible approx
        
        // Small scroll shouldn't trigger (buffer is 5)
        (grid as any).updateScroll({ scrollY: 10 });
        (grid as any).renderNow();
        // It's called once initially on setup. Reset mock to check for scroll triggers.
        expect(onRowsNeeded).toHaveBeenCalledTimes(1);
        onRowsNeeded.mockClear();

        (grid as any).updateScroll({ scrollY: 15 });
        (grid as any).renderNow();
        expect(onRowsNeeded).not.toHaveBeenCalled();

        // Large scroll should trigger
        (grid as any).updateScroll({ scrollY: 500 });
        (grid as any).renderNow();
        expect(onRowsNeeded).toHaveBeenCalled();
    });

    it('should select a range on drag', () => {
        const onSelectionChange = vi.fn();
        const grid = new SciGrid(container, provider, { onSelectionChange });
        (grid as any).resize(800, 600);
        
        const rect = { left: 0, top: 0, width: 800, height: 600 } as DOMRect;
        container.getBoundingClientRect = vi.fn(() => rect);
        (grid as any).canvas.getBoundingClientRect = vi.fn(() => rect);

        // Start drag at cell 0,0 (mapped to x=60, y=45)
        container.dispatchEvent(new MouseEvent('mousedown', { clientX: 60, clientY: 45, bubbles: true }));
        
        // Move to cell 2,2 (mapped to x=260, y=85 if width=100, height=20?) 
        // Default configs: colWidth: 100, rowHeight: 25. rowNumWidth: 40, headerHeight: 30.
        // Cell 2,2 starts at x = 40 + 2*100 = 240. y = 30 + 2*25 = 80.
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 250, clientY: 90, bubbles: true }));
        
        expect(onSelectionChange).toHaveBeenCalled();
        const calls = onSelectionChange.mock.calls;
        const lastSelection = calls[calls.length - 1]![0];
        expect(lastSelection.ranges.length).toBeGreaterThan(0);
        const range = lastSelection.ranges[0]!;
        expect(range.endRow).toBe(2);
        expect(range.endCol).toBe(2);
    });
    it('should use binary search to find columns in a large grid', () => {
        provider.getColumnCount = vi.fn(() => 10000);
        const grid = new SciGrid(container, provider, { columnWidth: 100 });
        
        // At x=500040 (rowNumWidth=40), col index should be 5000
        const colIndex = (grid as any).getColumnAt(500000);
        expect(colIndex).toBe(5000);
    });
});
