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
            startReordering: (colIdx: number, e: MouseEvent) => void;
            openEditor: (r: number, c: number) => void;
            openHeaderEditor: (c: number, sub: number) => void;
            closeEditor: () => void;
            setSelecting: (val: boolean) => void;
        }
    ) {}

    public handleHit(e: MouseEvent, isDoubleClick: boolean): void {
        this.actions.closeEditor();
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const rowNumWidth = this.config.showRowNumbers ? this.config.rowNumbersWidth : 0;
        const isCtrl = e.ctrlKey || e.metaKey;
        const isShift = e.shiftKey;

        if (this.config.showRowNumbers && Math.abs(x - rowNumWidth) < 5) {
            e.preventDefault(); this.actions.startResizing(-1, e); return;
        }

        if (x < rowNumWidth && y < this.state.headerHeight) {
            this.actions.updateSelection('all', null, null, false, false);
        } else if (y < this.state.headerHeight && x >= rowNumWidth) {
            this.handleHeaderHit(x - rowNumWidth + this.state.scrollX, y, isDoubleClick, isCtrl, isShift, e);
        } else if (x < rowNumWidth && y >= this.state.headerHeight) {
            const row = Math.floor((y - this.state.headerHeight + this.state.scrollY) / this.config.rowHeight);
            if (row >= 0 && row < this.provider.getRowCount()) this.actions.updateSelection('row', row, null, isCtrl, isShift);
        } else {
            this.handleCellHit(x, y, rowNumWidth, isDoubleClick, isCtrl, isShift);
        }
        this.actions.render();
    }

    private handleHeaderHit(relX: number, y: number, isDBL: boolean, isCtrl: boolean, isShift: boolean, e: MouseEvent) {
        const hit = this.getHeaderHit(relX, y);
        if (hit.colIndex === -1) return;
        const actualCol = this.state.columnOrder[hit.colIndex] ?? hit.colIndex;
        const header = this.provider.getHeader(actualCol);

        if (hit.type === 'edge' && (header.isResizable !== false && this.config.allowResizing)) {
            e.preventDefault(); this.actions.startResizing(actualCol, e);
        } else if (hit.type === 'handle') {
            if (isDBL) { e.preventDefault(); this.actions.openHeaderEditor(actualCol, hit.subIndex || 0); }
            else {
                this.actions.updateSelection('column', null, actualCol, isCtrl, isShift);
                e.preventDefault(); this.actions.startReordering(hit.colIndex, e);
            }
        }
    }

    private handleCellHit(x: number, y: number, rnw: number, isDBL: boolean, isCtrl: boolean, isShift: boolean) {
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
            this.actions.setSelecting(true);
            this.actions.updateSelection('cell', row, act, isCtrl, isShift);
            const onUp = () => { this.actions.setSelecting(false); window.removeEventListener('mouseup', onUp); };
            window.addEventListener('mouseup', onUp);
        }
    }

    private getHeaderHit(x: number, y: number) {
        let curX = 0; const h = this.state.headerHeight;
        const { titleH, subH } = this.getHeaderHeights(h);
        for (let i = 0; i < this.state.columnOrder.length; i++) {
            const w = Coord.getColumnWidth(this.state, this.config, this.state.columnOrder[i]!);
            if (x >= curX && x <= curX + w) {
                if (x >= curX + w - 5) return { type: 'edge' as const, colIndex: i };
                if (i > 0 && x <= curX + 5) return { type: 'edge' as const, colIndex: i - 1 };
                let sub = 0; if (y > titleH) sub = y < titleH + subH ? 1 : 2;
                return { type: 'handle' as const, colIndex: i, subIndex: sub };
            }
            curX += w;
        }
        return { type: 'handle' as const, colIndex: -1 };
    }

    private getHeaderHeights(h: number) {
        if (this.config.headerSubTextCount === 1) return { titleH: h * 0.75, subH: h * 0.25 };
        if (this.config.headerSubTextCount === 2) return { titleH: h * 0.50, subH: h * 0.25 };
        return { titleH: h, subH: 0 };
    }
}
