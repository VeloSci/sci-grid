import type { ViewportState, GridConfig, IDataGridProvider } from "../types/grid.js";
import * as Coord from "./coord-helper.js";

export class MouseHandler {
    constructor(
        private canvas: HTMLCanvasElement,
        private state: ViewportState,
        private provider: IDataGridProvider,
        private config: GridConfig,
        private actions: {
            updateSelection: (mode: any, r: number | null, c: number | null, ctrl: boolean, shift: boolean) => void;
            invalidate: () => void;
            render: () => void;
            startResizing: (col: number, e: MouseEvent) => void;
            autoResize?: (col: number) => void; 
            startReordering: (colIdx: number, e: MouseEvent) => void;
            openEditor: (r: number, c: number) => void;
            openHeaderEditor: (c: number, sub: number) => void;
            closeEditor: () => void;
            setSelecting: (val: boolean) => void;
        }
    ) {}

    public getMousePos(e: MouseEvent) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
            rnw: this.config.showRowNumbers ? this.config.rowNumbersWidth : 0
        };
    }

    public handleHit(e: MouseEvent, isDoubleClick: boolean): void {
        this.actions.closeEditor();
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rowNumWidth = this.config.showRowNumbers ? this.config.rowNumbersWidth : 0;
        const isCtrl = e.ctrlKey || e.metaKey;
        const isShift = e.shiftKey;
        const isRightClick = e.button === 2;

        if (this.config.showRowNumbers && Math.abs(x - rowNumWidth) < 5) {
            e.preventDefault(); this.actions.startResizing(-1, e); return;
        }

        if (x < rowNumWidth && y < this.state.headerHeight) {
            this.actions.updateSelection('all', null, null, false, false);
        } else if (y < this.state.headerHeight && x >= rowNumWidth) {
            this.handleHeaderHit(x - rowNumWidth + this.state.scrollX, y, isDoubleClick, isCtrl, isShift, e, isRightClick);
        } else if (x < rowNumWidth && y >= this.state.headerHeight) {
            const row = Math.floor((y - this.state.headerHeight + this.state.scrollY) / this.config.rowHeight);
            if (row >= 0 && row < this.provider.getRowCount()) {
                if (isRightClick && this.state.selectedRows.has(row) && this.state.selectionMode === 'row') return;
                this.actions.updateSelection('row', row, null, isCtrl, isShift);
            }
        } else {
            this.handleCellHit(x, y, rowNumWidth, isDoubleClick, isCtrl, isShift, isRightClick);
        }
        this.actions.render();
    }

    private handleHeaderHit(relX: number, y: number, isDBL: boolean, isCtrl: boolean, isShift: boolean, e: MouseEvent, isRightClick: boolean) {
        const hit = this.getHeaderHit(relX, y);
        if (hit.colIndex === -1) return;
        const actualCol = this.state.columnOrder[hit.colIndex] ?? hit.colIndex;
        const header = this.provider.getHeader(actualCol);

        if (hit.type === 'edge' && (header.isResizable !== false && this.config.allowResizing)) {
            if (isDBL && this.actions.autoResize) {
                e.preventDefault(); 
                this.actions.autoResize(actualCol);
            } else {
                e.preventDefault(); 
                this.actions.startResizing(actualCol, e);
            }
        } else if (hit.type === 'handle') {
            if (isDBL) { e.preventDefault(); this.actions.openHeaderEditor(actualCol, hit.subIndex || 0); }
            else {
                if (isRightClick && this.state.selectedCols.has(actualCol) && this.state.selectionMode === 'column') return;
                this.actions.updateSelection('column', null, actualCol, isCtrl, isShift);
                e.preventDefault(); this.actions.startReordering(hit.colIndex, e);
            }
        }
    }

    private handleCellHit(x: number, y: number, rnw: number, isDBL: boolean, isCtrl: boolean, isShift: boolean, isRightClick: boolean) {
        const row = Math.floor((y - this.state.headerHeight + this.state.scrollY) / this.config.rowHeight);
        const relX = x - rnw + this.state.scrollX;
        const idx = Coord.getColumnAt(this.state, relX);
        const act = this.state.columnOrder[idx] ?? idx;
        if (row < 0 || row >= this.provider.getRowCount() || idx === -1) return;
        const h = this.provider.getHeader(act);

        if (h.type === 'checkbox' && !isDBL && this.provider.setCellData) {
            this.provider.setCellData(row, act, !this.provider.getCellData(row, act));
            this.actions.invalidate();
        }

        if (isShift) { this.actions.updateSelection('cell', row, act, isCtrl, isShift); }
        else if (isDBL) { if (h.type !== 'progress' && h.type !== 'checkbox') this.actions.openEditor(row, act); }
        else {
            // Generalize: if the cell is part of ANY selection (row, col, or cell block), preserve it on right click
            if (isRightClick && this.isCellSelected(row, act)) return;

            this.actions.setSelecting(true);
            this.actions.updateSelection('cell', row, act, isCtrl, isShift);
            const onUp = () => { this.actions.setSelecting(false); window.removeEventListener('mouseup', onUp); };
            window.addEventListener('mouseup', onUp);
        }
    }

    private isCellSelected(row: number, col: number): boolean {
        for (const r of this.state.selectionRanges) {
            if (row >= r.startRow && row <= r.endRow && col >= r.startCol && col <= r.endCol) return true;
        }
        return false;
    }

    public getCursor(e: MouseEvent): string {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rnw = this.config.showRowNumbers ? this.config.rowNumbersWidth : 0;

        if (this.config.showRowNumbers && y < this.state.headerHeight && Math.abs(x - rnw) < 5) {
            return 'col-resize';
        }

        if (y < this.state.headerHeight && x >= rnw) {
            const relX = x - rnw + this.state.scrollX;
            const hit = this.getHeaderHit(relX, y);
            if (hit.colIndex !== -1) {
                const act = this.state.columnOrder[hit.colIndex] ?? hit.colIndex;
                const header = this.provider.getHeader(act);
                if (hit.type === 'edge' && (header.isResizable !== false && this.config.allowResizing)) {
                    return 'col-resize';
                }
                return 'grab';
            }
        }
        return 'default';
    }

    public getHeaderHit(x: number, y: number) {
        const { titleH, subH } = this.getHeaderHeights(this.state.headerHeight);
        
        // Use binary search to find values O(log N) instead of O(N)
        const colIndex = Coord.getColumnAt(this.state, x);
        if (colIndex === -1) return { type: 'handle' as const, colIndex: -1 };

        const start = this.state.columnOffsets[colIndex]!;
        const end = this.state.columnOffsets[colIndex + 1]!;
        
        // Edge detection (resize handles)
        if (x >= end - 5) return { type: 'edge' as const, colIndex: colIndex };
        if (x <= start + 5 && colIndex > 0) return { type: 'edge' as const, colIndex: colIndex - 1 };

        let sub = 0; if (y > titleH) sub = y < titleH + subH ? 1 : 2;
        return { type: 'handle' as const, colIndex: colIndex, subIndex: sub };
    }

    private getHeaderHeights(h: number) {
        if (this.config.headerSubTextCount === 1) return { titleH: h * 0.75, subH: h * 0.25 };
        if (this.config.headerSubTextCount === 2) return { titleH: h * 0.50, subH: h * 0.25 };
        return { titleH: h, subH: 0 };
    }
}
