import type { ViewportState, GridConfig, IDataGridProvider } from "../types/grid.ts";
import * as Coord from "./coord-helper.js";

export class DragManager {
    constructor(
        private canvas: HTMLCanvasElement,
        private state: ViewportState,
        private provider: IDataGridProvider,
        private config: GridConfig,
        private actions: {
            invalidate: () => void;
            updateSelection: (mode: any, r: number | null, c: number | null, ctrl: boolean, shift: boolean) => void;
            updateVirtualSize: () => void;
            saveState: () => void;
        }
    ) {}

    public startResizing(col: number, e: MouseEvent): void {
        this.state.resizingCol = col;
        const startX = e.clientX;
        const startWidth = Coord.getColumnWidth(this.state, this.config, col);
        const onMove = (me: MouseEvent) => {
            const nw = Math.max(30, startWidth + (me.clientX - startX));
            if (col === -1) this.config.rowNumbersWidth = nw;
            else this.state.columnWidths[col] = nw;
            this.actions.updateVirtualSize(); this.actions.invalidate();
        };
        const onUp = () => { this.state.resizingCol = null; window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); this.actions.saveState(); };
        window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    }

    public startReordering(colIndex: number, e: MouseEvent): void {
        const startX = e.clientX;
        let isStarted = false;
        const onMove = (me: MouseEvent) => {
            if (!isStarted && Math.abs(me.clientX - startX) > 3) { isStarted = true; this.state.reorderingCol = colIndex; }
            if (!isStarted) return;
            const rect = this.canvas.getBoundingClientRect();
            const x = me.clientX - rect.left;
            this.state.reorderingX = x;
            const target = Coord.getColumnAt(this.state, x - (this.config.showRowNumbers ? this.config.rowNumbersWidth : 0) + this.state.scrollX);
            if (target !== -1) this.state.reorderingTarget = target;
            this.actions.invalidate();
        };
        const onUp = () => {
            if (!isStarted) this.handleHeaderClick(colIndex);
            else if (this.state.reorderingTarget !== null && this.state.reorderingCol !== null) this.commitReorder();
            this.state.reorderingCol = this.state.reorderingTarget = this.state.reorderingX = null;
            window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); this.actions.saveState();
        };
        window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp);
    }

    private handleHeaderClick(colIdx: number) {
        const actual = this.state.columnOrder[colIdx] ?? colIdx;
        const h = this.provider.getHeader(actual);
        if (h.isSortable !== false && this.config.onSort) {
            const next = h.sortOrder === 'asc' ? 'desc' : (h.sortOrder === 'desc' ? null : 'asc');
            this.config.onSort(actual, next);
        }
    }

    private commitReorder() {
        const order = [...this.state.columnOrder];
        if (order.length === 0) for (let i = 0; i < this.provider.getColumnCount(); i++) order.push(i);
        const moved = order.splice(this.state.reorderingCol!, 1)[0]!;
        let target = this.state.reorderingTarget!;
        if (target > this.state.reorderingCol!) target--;
        order.splice(target, 0, moved);
        this.state.columnOrder = order;
        this.actions.updateSelection('column', null, moved, false, false);
    }
}
