import type { ViewportState, GridConfig, IDataGridProvider, SelectionMode, SelectionRange } from "../types/grid.ts";

export class SelectionManager {
    constructor(
        private state: ViewportState,
        private provider: IDataGridProvider,
        private config: GridConfig,
        private invalidate: () => void
    ) {}

    public updateSelection(mode: SelectionMode, row: number | null, col: number | null, isCtrl: boolean, isShift: boolean): void {
        this.state.selectionMode = mode;

        if (mode === 'all') {
            this.state.selectionRanges = [{
                startRow: 0, endRow: this.provider.getRowCount() - 1,
                startCol: 0, endCol: this.provider.getColumnCount() - 1
            }];
            this.state.anchorRow = 0;
            this.state.anchorCol = 0;
            this.populateLookupSets();
            this.invalidate();
            this.notifySelectionChange();
            return;
        }

        if (row === null && mode !== 'column') return;
        if (col === null && mode !== 'row') return;

        const effectiveRow = row ?? 0;
        const effectiveCol = col ?? 0;

        if (!isCtrl && !isShift) {
            this.state.selectionRanges = [];
        }

        if (isShift && this.state.anchorRow !== null && this.state.anchorCol !== null) {
            this.handleRangeSelection(mode, effectiveRow, effectiveCol, isCtrl);
        } else {
            this.handlePivotSelection(mode, effectiveRow, effectiveCol, isCtrl);
        }

        this.populateLookupSets();
        this.notifySelectionChange();
    }

    private handleRangeSelection(mode: SelectionMode, row: number, col: number, isCtrl: boolean) {
        const startR = mode === 'column' ? 0 : Math.min(row, this.state.anchorRow!);
        const endR = mode === 'column' ? this.provider.getRowCount() - 1 : Math.max(row, this.state.anchorRow!);
        const startC = mode === 'row' ? 0 : Math.min(col, this.state.anchorCol!);
        const endC = mode === 'row' ? this.provider.getColumnCount() - 1 : Math.max(col, this.state.anchorCol!);

        const newRange = { startRow: startR, endRow: endR, startCol: startC, endCol: endC };

        if (!isCtrl) {
            this.state.selectionRanges = [newRange];
        } else if (this.state.selectionRanges.length > 0) {
            this.state.selectionRanges[this.state.selectionRanges.length - 1] = newRange;
        } else {
            this.state.selectionRanges.push(newRange);
        }
    }

    private handlePivotSelection(mode: SelectionMode, row: number, col: number, isCtrl: boolean) {
        const newRange = { 
            startRow: mode === 'column' ? 0 : row, 
            endRow: mode === 'column' ? this.provider.getRowCount() - 1 : row, 
            startCol: mode === 'row' ? 0 : col, 
            endCol: mode === 'row' ? this.provider.getColumnCount() - 1 : col 
        };

        if (isCtrl) {
            const idx = this.state.selectionRanges.findIndex(r => 
                r.startRow === newRange.startRow && r.endRow === newRange.endRow &&
                r.startCol === newRange.startCol && r.endCol === newRange.endCol
            );
            if (idx !== -1) this.state.selectionRanges.splice(idx, 1);
            else this.state.selectionRanges.push(newRange);
        } else {
            this.state.selectionRanges = [newRange];
        }
        
        this.state.anchorRow = row;
        this.state.anchorCol = col;
    }

    public populateLookupSets(): void {
        this.state.selectedRows.clear();
        this.state.selectedCols.clear();
        for (const range of this.state.selectionRanges) {
            for (let r = range.startRow; r <= range.endRow; r++) this.state.selectedRows.add(r);
            for (let c = range.startCol; c <= range.endCol; c++) this.state.selectedCols.add(c);
        }
    }

    private notifySelectionChange(): void {
        if (this.config.onSelectionChange) {
            this.config.onSelectionChange({
                mode: this.state.selectionMode,
                ranges: [...this.state.selectionRanges],
                anchorRow: this.state.anchorRow,
                anchorCol: this.state.anchorCol
            });
        }
    }
}
