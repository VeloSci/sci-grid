import type { ViewportState, GridConfig, IDataGridProvider } from "../types/grid.ts";

export class KeyboardHandler {
    constructor(
        private state: ViewportState,
        private provider: IDataGridProvider,
        private config: GridConfig,
        private actions: {
            updateSelection: (mode: any, r: number, c: number, ctrl: boolean, shift: boolean) => void;
            scrollToCell: (r: number, c: number) => void;
            copyToClipboard: () => void;
            render: () => void;
        }
    ) {}

    public handleKeyDown(e: KeyboardEvent, hasEditor: boolean): void {
        if (hasEditor) return;

        let row = this.state.anchorRow ?? 0;
        let col = this.state.anchorCol ?? 0;
        const rowCount = this.provider.getRowCount();
        const colCount = this.provider.getColumnCount();

        let colIndex = this.state.columnOrder.indexOf(col);
        if (colIndex === -1) colIndex = col;

        switch (e.key) {
            case "ArrowUp": row = Math.max(0, row - 1); break;
            case "ArrowDown": row = Math.min(rowCount - 1, row + 1); break;
            case "ArrowLeft": colIndex = Math.max(0, colIndex - 1); break;
            case "ArrowRight": colIndex = Math.min(colCount - 1, colIndex + 1); break;
            case "PageUp": row = Math.max(0, row - Math.floor(this.state.height / this.config.rowHeight)); break;
            case "PageDown": row = Math.min(rowCount - 1, row + Math.floor(this.state.height / this.config.rowHeight)); break;
            case "Home": colIndex = 0; if (e.ctrlKey) row = 0; break;
            case "End": colIndex = colCount - 1; if (e.ctrlKey) row = rowCount - 1; break;
            case "c":
                if (e.ctrlKey || e.metaKey) {
                    this.actions.copyToClipboard();
                    return;
                }
                return;
            default: return;
        }

        col = this.state.columnOrder[colIndex] ?? colIndex;
        e.preventDefault();
        this.actions.updateSelection('cell', row, col, e.ctrlKey, e.shiftKey);
        this.actions.scrollToCell(row, col);
        this.actions.render();
    }
}
