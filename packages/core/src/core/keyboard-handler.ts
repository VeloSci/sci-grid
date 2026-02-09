import type { ViewportState, GridConfig, IDataGridProvider, KeyboardShortcut } from "../types/grid.js";

/** Default keyboard shortcuts — users can override any of these */
const DEFAULT_SHORTCUTS: Record<string, KeyboardShortcut> = {
    copy:        { key: 'c', ctrl: true },
    selectAll:   { key: 'a', ctrl: true },
    moveUp:      { key: 'ArrowUp' },
    moveDown:    { key: 'ArrowDown' },
    moveLeft:    { key: 'ArrowLeft' },
    moveRight:   { key: 'ArrowRight' },
    pageUp:      { key: 'PageUp' },
    pageDown:    { key: 'PageDown' },
    moveToStart: { key: 'Home' },
    moveToEnd:   { key: 'End' },
    contextMenu: { key: 'F10', shift: true },
};

export class KeyboardHandler {
    constructor(
        private state: ViewportState,
        private provider: IDataGridProvider,
        private config: GridConfig,
        private actions: {
            updateSelection: (mode: any, r: number | null, c: number | null, ctrl: boolean, shift: boolean) => void;
            scrollToCell: (r: number, c: number) => void;
            copyToClipboard: () => void;
            render: () => void;
            openContextMenuAt: (x: number, y: number) => void;
        }
    ) {}

    private getShortcut(action: string): KeyboardShortcut | null {
        const userShortcuts = this.config.keyboardShortcuts;
        if (userShortcuts && action in userShortcuts) {
            return userShortcuts[action] ?? null; // null = disabled
        }
        return DEFAULT_SHORTCUTS[action] ?? null;
    }

    private matchesShortcut(e: KeyboardEvent, sc: KeyboardShortcut): boolean {
        if (e.key !== sc.key && e.key.toLowerCase() !== sc.key.toLowerCase()) return false;
        if (!!sc.ctrl !== (e.ctrlKey || e.metaKey)) return false;
        if (!!sc.shift !== e.shiftKey) return false;
        if (!!sc.alt !== e.altKey) return false;
        return true;
    }

    private matchAction(e: KeyboardEvent): string | null {
        // Check user-defined custom shortcuts first
        const userShortcuts = this.config.keyboardShortcuts;
        if (userShortcuts) {
            for (const action of Object.keys(userShortcuts)) {
                if (action in DEFAULT_SHORTCUTS) continue; // handled below
                const sc = userShortcuts[action];
                if (sc && this.matchesShortcut(e, sc)) return action;
            }
        }

        // Check built-in actions
        for (const action of Object.keys(DEFAULT_SHORTCUTS)) {
            const sc = this.getShortcut(action);
            if (sc && this.matchesShortcut(e, sc)) return action;
        }

        return null;
    }

    public handleKeyDown(e: KeyboardEvent, hasEditor: boolean): void {
        if (hasEditor) return;

        const action = this.matchAction(e);
        if (!action) return;

        // Dispatch custom shortcuts to onShortcut callback
        if (!(action in DEFAULT_SHORTCUTS)) {
            e.preventDefault();
            this.config.onShortcut?.(action, e);
            return;
        }

        let row = this.state.anchorRow ?? 0;
        let col = this.state.anchorCol ?? 0;
        const rowCount = this.provider.getRowCount();
        const colCount = this.provider.getColumnCount();

        let colIndex = this.state.columnOrder.indexOf(col);
        if (colIndex === -1) colIndex = col;

        switch (action) {
            case 'copy':
                this.actions.copyToClipboard();
                return;

            case 'selectAll':
                e.preventDefault();
                this.actions.updateSelection('all', null, null, false, false);
                this.actions.render();
                return;

            case 'contextMenu': {
                e.preventDefault();
                // Open context menu at the anchor cell position
                const rnw = this.config.showRowNumbers ? this.config.rowNumbersWidth : 0;
                const cellX = rnw + (this.state.columnOffsets[colIndex] ?? 0) - this.state.scrollX + 20;
                const cellY = this.state.headerHeight + (row * this.config.rowHeight) - this.state.scrollY + 10;
                this.actions.openContextMenuAt(cellX, cellY);
                return;
            }

            case 'moveUp': row = Math.max(0, row - 1); break;
            case 'moveDown': row = Math.min(rowCount - 1, row + 1); break;
            case 'moveLeft': colIndex = Math.max(0, colIndex - 1); break;
            case 'moveRight': colIndex = Math.min(colCount - 1, colIndex + 1); break;
            case 'pageUp': row = Math.max(0, row - Math.floor(this.state.height / this.config.rowHeight)); break;
            case 'pageDown': row = Math.min(rowCount - 1, row + Math.floor(this.state.height / this.config.rowHeight)); break;
            case 'moveToStart': colIndex = 0; if (e.ctrlKey) row = 0; break;
            case 'moveToEnd': colIndex = colCount - 1; if (e.ctrlKey) row = rowCount - 1; break;
            default: return;
        }

        col = this.state.columnOrder[colIndex] ?? colIndex;
        e.preventDefault();
        this.actions.updateSelection('cell', row, col, e.ctrlKey, e.shiftKey);
        this.actions.scrollToCell(row, col);
        this.actions.render();
    }
}
