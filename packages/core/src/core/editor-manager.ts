import type { ViewportState, GridConfig, IDataGridProvider } from "../types/grid.js";
import { parseScientificValue } from "./units.js";

export class EditorManager {
    private editor: HTMLInputElement | HTMLElement | null = null;

    constructor(
        private uiLayer: HTMLElement,
        private provider: IDataGridProvider,
        private config: GridConfig,
        private state: ViewportState,
        private helpers: {
            getColumnWidth: (c: number) => number;
            getColumnOffset: (c: number) => number;
            invalidate: () => void;
        }
    ) {}

    public get activeEditor() { return this.editor; }

    public closeEditor(): void {
        if (this.editor) {
            const el = this.editor;
            this.editor = null;
            el.remove();
        }
    }

    public openHeaderEditor(col: number, subIndex: number): void {
        const header = this.provider.getHeader(col);
        const value = subIndex === 0 ? (header.name || "") : (subIndex === 1 ? (header.units || "") : (header.description || ""));
        const colIndex = this.state.columnOrder.indexOf(col);
        const actualIdx = colIndex === -1 ? col : colIndex;
        const x = this.helpers.getColumnOffset(actualIdx) - this.state.scrollX + (this.config.showRowNumbers ? this.config.rowNumbersWidth : 0);
        
        const { titleH, subH } = this.getHeaderHeights();
        const editY = subIndex === 0 ? 0 : (subIndex === 1 ? titleH : titleH + subH);
        const editH = subIndex === 0 ? titleH : subH;
        
        const input = document.createElement("input");
        this.editor = input;
        input.type = "text";
        input.value = value;
        Object.assign(input.style, {
            position: 'absolute', left: `${x}px`, top: `${editY}px`,
            width: `${this.helpers.getColumnWidth(col)}px`, height: `${editH}px`,
            boxSizing: 'border-box', border: '2px solid #4facfe', outline: 'none',
            zIndex: '100', pointerEvents: 'auto', backgroundColor: this.config.headerBackground,
            color: this.config.headerTextColor, font: this.config.headerFont,
            padding: `0 ${this.config.cellPadding}px`,
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
            borderRadius: '2px'
        });

        const save = () => {
            if (!this.editor) return;
            const newHeader = { ...header };
            if (subIndex === 0) newHeader.name = input.value;
            else if (subIndex === 1) newHeader.units = input.value;
            else newHeader.description = input.value;
            this.provider.setHeader?.(col, newHeader);
            this.closeEditor();
            this.helpers.invalidate();
        };

        input.onblur = save;
        input.onkeydown = (e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') this.closeEditor(); };
        this.uiLayer.appendChild(input);
        setTimeout(() => { if (this.editor === input) { input.focus(); input.select(); } }, 0);
    }

    private getHeaderHeights() {
        const h = this.state.headerHeight;
        if (this.config.headerSubTextCount === 1) return { titleH: h * 0.75, subH: h * 0.25 };
        if (this.config.headerSubTextCount === 2) return { titleH: h * 0.50, subH: h * 0.25 };
        return { titleH: h, subH: 0 };
    }

    public openCellEditor(row: number, col: number): void {
        if (!this.provider.setCellData) return;
        const colIndex = this.state.columnOrder.indexOf(col);
        const actualIdx = colIndex === -1 ? col : colIndex;
        const x = this.helpers.getColumnOffset(actualIdx) - this.state.scrollX + (this.config.showRowNumbers ? this.config.rowNumbersWidth : 0);
        const y = row * this.config.rowHeight - this.state.scrollY + this.state.headerHeight;
        
        const header = this.provider.getHeader(col);
        if (header.type === 'select') this.renderSelectEditor(row, col, x, y);
        else this.renderTextEditor(row, col, x, y);
    }

    private renderTextEditor(row: number, col: number, x: number, y: number) {
        const input = document.createElement("input");
        this.editor = input;
        input.value = this.provider.getCellData(row, col)?.toString() || "";
        Object.assign(input.style, {
            position: 'absolute', left: `${x}px`, top: `${y}px`, zIndex: '10',
            width: `${this.helpers.getColumnWidth(col)}px`, height: `${this.config.rowHeight}px`,
            boxSizing: 'border-box', border: '2px solid #4facfe', outline: 'none',
            padding: `${this.config.cellPadding}px`, pointerEvents: 'auto',
            backgroundColor: this.config.backgroundColor, color: this.config.textColor,
            font: this.config.font, boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            borderRadius: '2px'
        });

        const save = () => {
            if (this.editor) {
                let value: any = input.value;
                const header = this.provider.getHeader(col);
                if (header.type === 'numeric') {
                    const parsed = parseScientificValue(input.value);
                    if (!isNaN(parsed)) value = parsed;
                }
                this.provider.setCellData!(row, col, value);
                this.closeEditor();
                this.helpers.invalidate();
            }
        };
        input.onkeydown = (e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') this.closeEditor(); };
        input.onblur = save;
        this.uiLayer.appendChild(input);
        setTimeout(() => { input.focus(); input.select(); }, 0);
    }

    private renderSelectEditor(row: number, col: number, x: number, y: number) {
        // Dropdown implementation... keeping it compact for now
        const container = document.createElement("div");
        this.editor = container;
        const initial = this.provider.getCellData(row, col)?.toString() || "";
        container.setAttribute('data-value', initial);
        Object.assign(container.style, {
            position: 'absolute', left: `${x}px`, top: `${y}px`, zIndex: '1000',
            width: `${this.helpers.getColumnWidth(col)}px`, height: `${this.config.rowHeight}px`,
            pointerEvents: 'auto'
        });
        
        const list = document.createElement("ul");
        Object.assign(list.style, {
            position: 'absolute', top: '100%', left: '0', width: '100%', maxHeight: '200px',
            overflowY: 'auto', margin: '4px 0 0 0', padding: '4px 0', listStyle: 'none',
            backgroundColor: this.config.headerBackground, border: `1px solid ${this.config.gridLineColor}`,
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)', borderRadius: '4px', zIndex: '1001'
        });
        
        (this.provider.getHeader(col).selectOptions || []).forEach(opt => {
            const li = document.createElement("li");
            li.textContent = opt;
            li.style.padding = "6px 10px"; li.style.cursor = "pointer";
            li.onclick = (e) => { e.stopPropagation(); this.provider.setCellData!(row, col, opt); this.closeEditor(); this.helpers.invalidate(); };
            list.appendChild(li);
        });
        
        container.appendChild(list);
        this.uiLayer.appendChild(container);
        container.tabIndex = 0;
        container.onkeydown = (e) => { if (e.key === 'Escape') this.closeEditor(); };
        setTimeout(() => container.focus(), 0);
    }
}
