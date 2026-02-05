import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SciGrid } from '../index.js';
import { MouseHandler } from '../core/mouse-handler.js';
import type { GridConfig, IDataGridProvider, ViewportState } from '../types/grid.js';

// Mock Canvas getContext for AutoResize testing
HTMLCanvasElement.prototype.getContext = vi.fn((contextId: string) => {
    if (contextId === '2d') {
        return {
            font: '',
            measureText: (text: string) => ({ width: text.length * 10 }), // Simple mock: 10px per char
            scale: vi.fn(),
            save: vi.fn(),
            restore: vi.fn(),
            beginPath: vi.fn(),
            rect: vi.fn(),
            clip: vi.fn(),
            fillStyle: '',
            strokeStyle: '',
            fillRect: vi.fn(),
            strokeRect: vi.fn(),
            fillText: vi.fn(),
            moveTo: vi.fn(),
            lineTo: vi.fn(),
            stroke: vi.fn(),
            translate: vi.fn(),
            setLineDash: vi.fn(),
            clearRect: vi.fn()
        } as unknown as CanvasRenderingContext2D;
    }
    return null;
}) as any;

describe('Interactivity & UX Fixes', () => {
    let container: HTMLElement;
    let provider: IDataGridProvider;
    let grid: SciGrid;

    beforeEach(() => {
        container = document.createElement('div');
        // Need to attach to body for window event listeners to potentially work if dispatched
        document.body.appendChild(container);

        provider = {
            getRowCount: () => 100,
            getColumnCount: () => 10,
            getCellData: (r, c) => {
                if(c === 0 && r === 0) return "Short";
                if(c === 0 && r === 1) return "A very long value string"; // 24 chars * 10 = 240px
                return `R${r}C${c}`;
            },
            getHeader: (c) => ({ 
                name: `Column ${c}`, // 8 chars * 10 = 80px
                units: c === 0 ? 'verylongunit' : 'm', // 12 chars * 10 = 120px
                description: 'detailed description' // 20 chars * 10 = 200px
            })
        };
        grid = new SciGrid(container, provider);
    });

    afterEach(() => {
        grid.destroy();
        document.body.removeChild(container);
    });

    describe('Dynamic Header Height', () => {
        it('should default to 40px height for simple headers', () => {
            // Default setup
            // Access private state via any for testing purposes
            const state = (grid as any).state;
            expect(state.headerHeight).toBe(30); // Constructor default is 30, but we set logic to 40 based on updateConfig. Wait, check code.
            // In constructor config has defaults. updateConfig has the logic.
            // Let's trigger update.
            grid.updateConfig({ headerSubTextCount: 0 });
            expect(state.headerHeight).toBe(40); // User requested fix to 40
        });

        it('should expand to at least 50px for Detailed mode (1)', () => {
            grid.updateConfig({ headerSubTextCount: 1 });
            const state = (grid as any).state;
            expect(state.headerHeight).toBeGreaterThanOrEqual(50);
        });

        it('should expand to at least 70px for Rich mode (2)', () => {
            grid.updateConfig({ headerSubTextCount: 2 });
            const state = (grid as any).state;
            expect(state.headerHeight).toBeGreaterThanOrEqual(70);
        });

        it('should respect manual override', () => {
            grid.updateConfig({ headerSubTextCount: 2, headerHeight: 120 });
            const state = (grid as any).state;
            expect(state.headerHeight).toBe(120);
        });
    });

    describe('Auto Resizing Logic', () => {
        it('should resize column based on content width (standard)', () => {
            // Col 0 has "A very long value string" (approx 240px in mock)
            // Header is "Column 0" (80px)
            // Units: "verylongunit" (120px) - ONLY if enabled
            
            // 1. Simple mode
            grid.updateConfig({ headerSubTextCount: 0 });
            // Manually trigger autoResize (private method, accessible via mouse handler actions or casting)
            // or we can test the logic via a public method if exposed? No public autoResize.
            // However, MouseHandler calls it. 
            // Better to use the private method via casting for precise unit test
            (grid as any).autoResizeColumn(0);
            
            const state = (grid as any).state;
            // Expected: Max of Header(80) and Data(240). 
            // Plus padding (10) + extra (2)
            expect(state.columnWidths[0]).toBeGreaterThan(200); 
        });

        it('should account for Units width in Detailed mode', () => {
            // If data was short but unit was long.
            // Let's modify provider for col 1
            provider.getCellData = () => "Short"; // 50px
            provider.getHeader = (_c) => ({ name: "H", units: "SuperLongUnitString" }); // 190px
            
            grid.updateConfig({ headerSubTextCount: 1 });
            (grid as any).autoResizeColumn(1);
            
            const state = (grid as any).state;
            expect(state.columnWidths[1]).toBeGreaterThan(150);
        });
    });

    describe('Right Click Selection Preservation', () => {
        it('should NOT clear selection if right-clicking inside an existing selection (Row Mode)', () => {
            // Set mode directly on state as it's not in Config
            const state = (grid as any).state as ViewportState;
            state.selectionMode = 'row';
            
            // 1. Select Row 5
            state.selectedRows.add(5);
            state.selectionRanges = [{ startRow: 5, endRow: 5, startCol: 0, endCol: 9 }];
            
            const updateSelectionSpy = vi.spyOn((grid as any).selection, 'updateSelection');
            
            // 2. Simulate Right Click in Body (should be preserved because isCellSelected checks ranges)
            const evt = new MouseEvent('mousedown', {
                button: 2, // Right click
                clientY: (grid as any).state.headerHeight + 5 * 25 + 10,
                clientX: 50, // Body
                bubbles: true
            });
             
            (grid as any).canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600 } as DOMRect);
            const handler = (grid as any).mouse as MouseHandler;
            handler.handleHit(evt, false);

            expect(updateSelectionSpy).not.toHaveBeenCalled();
        });

        it('should update selection if right-clicking OUTSIDE existing selection (Row Mode)', () => {
             const state = (grid as any).state as ViewportState;
             state.selectionMode = 'row';
             state.selectedRows.add(5);
             state.selectionRanges = [{ startRow: 5, endRow: 5, startCol: 0, endCol: 9 }];
             
             const updateSelectionSpy = vi.spyOn((grid as any).selection, 'updateSelection');
             
             // Right Click on Row 6 in Row Header (X=20 < 40)
             const evt = new MouseEvent('mousedown', {
                 button: 2,
                 clientY: (grid as any).state.headerHeight + 6 * 25 + 10,
                 clientX: 20, // Row Header
                 bubbles: true
             });
             
             (grid as any).canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600 } as DOMRect);
             const handler = (grid as any).mouse as MouseHandler;
             
             handler.handleHit(evt, false);
             
             // Should select Row 6
             expect(updateSelectionSpy).toHaveBeenCalledWith('row', 6, null, false, false);
        });

        it('should NOT clear selection if right-clicking inside existing selection (Column Mode)', () => {
            const state = (grid as any).state as ViewportState;
            state.selectionMode = 'column';
            // Select Col 1
            state.selectedCols.add(1);
            state.selectionRanges = [{ startRow: 0, endRow: 99, startCol: 1, endCol: 1 }];
            
            const updateSelectionSpy = vi.spyOn((grid as any).selection, 'updateSelection');
            
            // Right Click on Column 1 Header
            // We need to calculate Header Height. Default 40.
            const evt = new MouseEvent('mousedown', {
                button: 2,
                clientY: 10, 
                clientX: 40 + 100 + 10, // RowNum(40) + Col0(100) + offset(10) -> Col 1
                bubbles: true
            });

            // Mock column widths/offsets if needed, but defaults are usually 100.
            // Setup minimal column structure if not fully initialized by mock provider
            state.columnOrder = [0, 1, 2];
            state.columnWidths = { 0: 100, 1: 100, 2: 100 };
            
            (grid as any).canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 800, height: 600 } as DOMRect);
            const handler = (grid as any).mouse as MouseHandler;
            
            handler.handleHit(evt, false);
            
            expect(updateSelectionSpy).not.toHaveBeenCalled();
        });
    });
    
    describe('Context Menu Customization', () => {
        it('should update context menu config when grid config updates', () => {
            const spy = vi.spyOn((grid as any).contextMenu, 'updateConfig');
            const newConfig: Partial<GridConfig> = { headerHeight: 50 };
            grid.updateConfig(newConfig);
            expect(spy).toHaveBeenCalled();
        });
    });
});
