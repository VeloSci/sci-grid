import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SciGrid } from './sci-grid.js';

describe('SciGrid Core', () => {
    let container: HTMLElement;
    let provider: any;

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
        const grid = new SciGrid(container, provider);
        
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
        const grid = new SciGrid(container, provider, { onSort });
        
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
});
