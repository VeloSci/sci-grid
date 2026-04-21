import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Scroller } from '../core/scroller.js';

describe('Scroller', () => {
    let container: HTMLElement;
    let onScroll: any;
    let onMouseDown: any;
    let onDoubleClick: any;
    let scroller: Scroller;

    beforeEach(() => {
        container = document.createElement('div');
        // Define viewport dimensions
        Object.defineProperty(container, 'clientWidth', { value: 800 });
        Object.defineProperty(container, 'clientHeight', { value: 600 });
        // Mock scroll property mutators since JSDOM doesn't handle layout/scroll natively
        let scrollLeft = 0;
        let scrollTop = 0;
        Object.defineProperty(container, 'scrollLeft', {
            get: () => scrollLeft,
            set: (v) => { scrollLeft = v; container.dispatchEvent(new Event('scroll')); }
        });
        Object.defineProperty(container, 'scrollTop', {
            get: () => scrollTop,
            set: (v) => { scrollTop = v; container.dispatchEvent(new Event('scroll')); }
        });

        onScroll = vi.fn();
        onMouseDown = vi.fn();
        onDoubleClick = vi.fn();

        scroller = new Scroller(container, onScroll, onMouseDown, onDoubleClick);
    });

    it('should initialize structure correctly', () => {
        expect(container.style.overflow).toBe('auto');
        expect(container.style.position).toBe('relative');
        expect(container.querySelector('div')).toBeDefined(); // The shadow element
    });

    it('should handle updates to virtual size and scaling', () => {
        // Large content causing > 15M pixels might trigger scaling limits, 
        // but let's test basic scaling calculation first.
        scroller.updateVirtualSize(2000, 2000);
        
        // 2000 > 800 viewport. Scale should be close to 1 because 2000 < MAX_BROWSER_SIZE
        // MAX_BROWSER_SIZE is 15M.
        
        // Trigger scroll
        container.scrollLeft = 100;
        expect(onScroll).toHaveBeenCalled();
        const state = onScroll.mock.calls[0][0];
        // Expect direct mapping since no extreme scaling
        expect(state.scrollX).toBe(100);
    });

    it('should map scroll events specifically', () => {
        scroller.updateVirtualSize(2000, 2000);
        container.scrollTop = 50;
        expect(onScroll).toHaveBeenCalledWith(expect.objectContaining({ scrollY: 50 }));
    });

    it('should scroll to specific cell coordinates', () => {
        scroller.updateVirtualSize(2000, 2000);
        // Cell at 900, 0. Viewport 800. Should scroll to 100 to make it visible
        // (900 + 100 - 800) = 200 if scrolling to right edge?
        // Logic: if x + width > left + viewportWidth -> newX = x + width - viewportWidth
        
        // Let's test basic visibility requirement
        // Current scroll 0. Cell at 1000. Width 100.
        // 1000 + 100 > 0 + 800 (800). 
        // newX = 1100 - 800 = 300.
        
        scroller.scrollToCell(1000, 0, 100, 20);
        expect(container.scrollLeft).toBe(300);
    });

    it('should inject custom scroll styles', () => {
        scroller.updateScrollStyle('red', 'blue');
        const styleTag = document.getElementById((scroller as any).styleId);
        expect(styleTag).toBeDefined();
        expect(styleTag?.innerHTML).toContain('scrollbar-color: red blue');
    });
});
