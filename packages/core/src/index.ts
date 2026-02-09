import type { GridConfig, IDataGridProvider, ViewportState} from "./types/grid.js";
import { GridRenderer } from "./core/renderer.js";
import { Scroller } from "./core/scroller.js";
import { SelectionManager } from "./core/selection-manager.js";
import { KeyboardHandler } from "./core/keyboard-handler.js";
import { EditorManager } from "./core/editor-manager.js";
import { MouseHandler } from "./core/mouse-handler.js";
import { DragManager } from "./core/drag-manager.js";
import { DataManager } from "./core/data-manager.js";
import { ContextMenuManager } from "./core/context-menu.js";
import { UndoManager } from "./core/undo-manager.js";
import { FilterEngine } from "./core/filter-engine.js";
import type { DataView } from "./core/filter-engine.js";
import * as Coord from "./core/coord-helper.js";
import { formatScientificValue } from "./core/units.js";

export type { GridConfig, IDataGridProvider, ViewportState, SelectionInfo, SelectionMode, SelectionRange, ColumnHeaderInfo, GridDataValue, ColumnType, ContextMenuItem, ContextMenuSection, ContextMenuZone, ContextMenuContext, KeyboardShortcut, KeyboardShortcuts, CellEditEvent, CellValidator, CellFormattingRule, ColumnFilter, FilterOperator, SortState, AggregationType, GroupConfig, FooterRow, PinnedRow } from "./types/grid.js";
export { DEFAULT_SHORTCUTS } from "./core/keyboard-handler.js";
export { FilterEngine } from "./core/filter-engine.js";
export { UndoManager } from "./core/undo-manager.js";

export class SciGrid {
    private canvas!: HTMLCanvasElement;
    private renderer!: GridRenderer;
    private scroller!: Scroller;
    private selection!: SelectionManager;
    private keyboard!: KeyboardHandler;
    private editors!: EditorManager;
    private mouse!: MouseHandler;
    private drags!: DragManager;
    private data!: DataManager;
    private contextMenu!: ContextMenuManager;
    private undoMgr!: UndoManager;
    private filterEngine!: FilterEngine;
    private dataView: DataView = { rowMap: [], visibleRowCount: 0, groups: [] };
    private formulaBar: HTMLElement | null = null;
    private quickFilterBar: HTMLElement | null = null;
    private uiLayer!: HTMLElement;
    private config: GridConfig;
    private state: ViewportState = {
        scrollX: 0, scrollY: 0, width: 0, height: 0, headerHeight: 60,
        columnWidths: {}, columnOrder: [], columnOffsets: [0],
        selectedRows: new Set(), selectedCols: new Set(), selectionRanges: [],
        anchorRow: null, anchorCol: null, resizingCol: null, reorderingCol: null,
        reorderingTarget: null, reorderingX: null, hoveredCol: null, selectionMode: 'cell',
    };
    private lastRange = { start: -1, end: -1 };
    private isDirty = false;
    private isSelecting = false;

    constructor(private container: HTMLElement, private provider: IDataGridProvider, config: Partial<GridConfig> = {}) {
        this.config = {
            rowHeight: 25, columnWidth: 100, headerHeight: 30, showRowNumbers: true,
            rowNumbersWidth: 40, headerSubTextCount: 0, headerPlaceholder: '-',
            allowResizing: true, allowFiltering: true, backgroundColor: "#ffffff",
            gridLineColor: "#e0e0e0", textColor: "#333333", font: "12px Inter, sans-serif",
            headerBackground: "#f3f3f3", headerTextColor: "#333333", headerFont: "bold 12px Inter, sans-serif",
            rowNumberBackground: "#f9f9f9", rowNumberTextColor: "#666666",
            selectionColor: "rgba(0, 120, 215, 0.3)", selectedTextColor: "#000000", cellPadding: 5,
            emptyStateText: "No data available", emptyStateColor: "#999999", 
            maskNumericValues: false, maskTextValues: false, textMaskString: "...", ...config,
        };
        this.state.headerHeight = this.config.headerHeight;
        this.initDOM();
        this.renderer = new GridRenderer(this.canvas);
        this.initManagers();
        this.scroller = new Scroller(this.container, (d) => this.updateScroll(d), (e) => this.mouse.handleHit(e, false), (e) => this.mouse.handleHit(e, true));
        this.init();
    }

    private initDOM() {
        Object.assign(this.container.style, {
            overflow: 'auto', position: 'relative', outline: 'none',
            userSelect: 'none', webkitUserSelect: 'none'
        });
        this.container.tabIndex = 0;
        this.container.setAttribute('role', 'grid');
        this.container.setAttribute('aria-label', 'Data Grid');
        this.updateAriaCounts();
        
        const wrap = document.createElement("div");
        Object.assign(wrap.style, { position: 'sticky', top: '0', left: '0', width: '100%', height: '100%', zIndex: '10' });
        this.container.appendChild(wrap);
        this.canvas = document.createElement("canvas");
        Object.assign(this.canvas.style, { position: 'absolute', top: '0', left: '0', display: 'block', zIndex: '1' });
        wrap.appendChild(this.canvas);
        this.uiLayer = document.createElement("div");
        Object.assign(this.uiLayer.style, { position: 'absolute', top: '0', left: '0', width: '100%', height: '100%', zIndex: '2', pointerEvents: 'none' });
        wrap.appendChild(this.uiLayer);
    }
    
    private updateAriaCounts() {
        this.container.setAttribute('aria-rowcount', (this.provider.getRowCount() + 1).toString());
        this.container.setAttribute('aria-colcount', this.provider.getColumnCount().toString());
    }

    private initManagers() {
        this.selection = new SelectionManager(this.state, this.provider, this.config, () => this.invalidate());
        this.data = new DataManager(this.state, this.provider, this.config);
        const helpers = {
            getColumnWidth: (c: number) => Coord.getColumnWidth(this.state, this.config, c),
            getColumnOffset: (c: number) => Coord.getColumnOffset(this.state, c),
            invalidate: () => this.invalidate()
        };
        this.editors = new EditorManager(this.uiLayer, this.provider, this.config, this.state, helpers);
        this.drags = new DragManager(this.canvas, this.state, this.provider, this.config, {
            invalidate: () => this.invalidate(), updateSelection: (m, r, c, ct, s) => this.selection.updateSelection(m, r, c, ct, s),
            updateVirtualSize: () => this.updateVirtualSize(), saveState: () => this.data.saveState()
        });
        this.mouse = new MouseHandler(this.canvas, this.state, this.provider, this.config, {
            updateSelection: (m, r, c, ct, s) => this.selection.updateSelection(m, r, c, ct, s), invalidate: () => this.invalidate(), render: () => this.render(),
            startResizing: (c, e) => this.drags.startResizing(c, e), startReordering: (i, e) => this.drags.startReordering(i, e),
            autoResize: (c) => this.autoResizeColumn(c),
            openEditor: (r, c) => this.editors.openCellEditor(r, c), openHeaderEditor: (c, s) => this.editors.openHeaderEditor(c, s),
            closeEditor: () => this.editors.closeEditor(), setSelecting: (v) => this.isSelecting = v
        });
        this.undoMgr = new UndoManager(this.config.undoHistorySize ?? 100);
        this.filterEngine = new FilterEngine();
        this.keyboard = new KeyboardHandler(this.state, this.provider, this.config, {
            updateSelection: (m, r, c, ct, s) => this.selection.updateSelection(m, r, c, ct, s), scrollToCell: (r, c) => this.scrollToCell(r, c),
            copyToClipboard: () => this.data.copyToClipboard(), render: () => this.render(),
            openContextMenuAt: (x, y) => this.contextMenu.openAt(x, y),
            pasteFromClipboard: () => this.pasteFromClipboard(),
            undo: () => this.performUndo(),
            redo: () => this.performRedo(),
            openEditor: (r, c) => this.editors.openCellEditor(r, c),
            deleteCells: () => this.deleteSelectedCells(),
        });
        this.contextMenu = new ContextMenuManager(this.container, this.config, {
            copyToClipboard: () => this.data.copyToClipboard(),
            exportToCsv: () => this.data.downloadAsCsv(),
            invalidate: () => this.invalidate(),
            resolveHit: (e: MouseEvent) => {
                const { x, y, rnw } = this.mouse.getMousePos(e);

                // Header zone
                if (y < this.state.headerHeight && x >= rnw) {
                    const relX = x - rnw + this.state.scrollX;
                    const idx = Coord.getColumnAt(this.state, relX);
                    const col = idx === -1 ? -1 : (this.state.columnOrder[idx] ?? idx);
                    return { zone: 'header', row: -1, col };
                }

                // Row-number zone
                if (x < rnw && y >= this.state.headerHeight) {
                    const row = Math.floor((y - this.state.headerHeight + this.state.scrollY) / this.config.rowHeight);
                    if (row >= 0 && row < this.provider.getRowCount()) {
                        return { zone: 'rowNumber', row, col: -1 };
                    }
                    return { zone: 'outside', row: -1, col: -1 };
                }

                // Cell zone
                if (y >= this.state.headerHeight && x >= rnw) {
                    const row = Math.floor((y - this.state.headerHeight + this.state.scrollY) / this.config.rowHeight);
                    const relX = x - rnw + this.state.scrollX;
                    const idx = Coord.getColumnAt(this.state, relX);
                    const col = idx === -1 ? -1 : (this.state.columnOrder[idx] ?? idx);
                    if (row >= 0 && row < this.provider.getRowCount() && col >= 0) {
                        return { zone: 'cell', row, col };
                    }
                }

                return { zone: 'outside', row: -1, col: -1 };
            },
            getSelectionState: () => {
                const ranges = this.state.selectionRanges;
                let cellCount = 0;
                for (const r of ranges) {
                    cellCount += (r.endRow - r.startRow + 1) * (r.endCol - r.startCol + 1);
                }
                // Also count full-column and full-row selections
                if (this.state.selectionMode === 'column') {
                    cellCount = Math.max(cellCount, this.state.selectedCols.size * this.provider.getRowCount());
                } else if (this.state.selectionMode === 'row') {
                    cellCount = Math.max(cellCount, this.state.selectedRows.size * this.provider.getColumnCount());
                }
                return {
                    selectedRows: Array.from(this.state.selectedRows),
                    selectedCols: Array.from(this.state.selectedCols),
                    selectionRanges: ranges,
                    selectionMode: this.state.selectionMode,
                    cellCount,
                };
            }
        });
    }

    private init() {
        const loaded = this.data.loadState();
        if (loaded) { this.state.columnOrder = loaded.columnOrder || []; this.state.columnWidths = loaded.columnWidths || {}; }
        if (this.state.columnOrder.length === 0) for (let i = 0; i < this.provider.getColumnCount(); i++) this.state.columnOrder.push(i);
        new ResizeObserver(es => es.forEach(e => this.resize(Math.floor(e.contentRect.width), Math.floor(e.contentRect.height)))).observe(this.container);
        this.container.addEventListener("keydown", e => this.keyboard.handleKeyDown(e, !!this.editors.activeEditor));
        this.container.addEventListener("mousemove", e => this.handleMouseMove(e));
        window.addEventListener("mousedown", e => { if (this.editors.activeEditor && !this.editors.activeEditor.contains(e.target as Node) && !this.container.contains(e.target as Node)) this.editors.closeEditor(); });
        window.addEventListener("mousemove", e => this.handleWindowMouseMove(e));
        window.addEventListener("mouseup", () => this.handleWindowMouseUp());
        this.updateVirtualSize(); this.requestAnimationFrame();
        if (this.config.showFormulaBar) this.createFormulaBar();
        if (this.config.showQuickFilter) this.createQuickFilterBar();
        if (this.config.filters?.length || this.config.sortState?.length || this.config.groupBy || this.config.quickFilterText) {
            this.rebuildDataView();
        }
    }

    private resize(w: number, h: number) { this.state.width = w; this.state.height = h; this.renderer.resize(w, h); this.invalidate(); }
    private updateVirtualSize() {
        const colCount = this.provider.getColumnCount();
        const offsets = new Array(colCount + 1); let cur = 0; offsets[0] = 0;
        for (let i = 0; i < colCount; i++) { cur += Coord.getColumnWidth(this.state, this.config, this.state.columnOrder[i] ?? i); offsets[i + 1] = cur; }
        this.state.columnOffsets = offsets;
        this.scroller.updateVirtualSize((this.config.showRowNumbers ? this.config.rowNumbersWidth : 0) + cur, this.provider.getRowCount() * this.config.rowHeight + this.state.headerHeight);
    }

    private handleMouseMove(e: MouseEvent) {
        if (this.state.resizingCol !== null || this.state.reorderingCol !== null) {
            this.container.style.cursor = this.state.resizingCol !== null ? 'col-resize' : 'grabbing';
            return;
        }

        const cursor = this.mouse.getCursor(e);
        this.container.style.cursor = cursor;

        const rvw = this.config.showRowNumbers ? this.config.rowNumbersWidth : 0;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left; const y = e.clientY - rect.top;
        const relX = x - rvw + this.state.scrollX;

        if (y < this.state.headerHeight && x >= rvw) {
            const idx = Coord.getColumnAt(this.state, relX);
            const act = this.state.columnOrder[idx] ?? idx;
            if (this.state.hoveredCol !== act) {
                this.state.hoveredCol = act;
                this.render();
            }
        } else {
            if (this.state.hoveredCol !== null) {
                this.state.hoveredCol = null;
                this.render();
            }
        }
    }

    private handleWindowMouseMove(e: MouseEvent) {
        if (this.isSelecting) {
            // Prevent default selection behavior
            e.preventDefault();

            const rvw = this.config.showRowNumbers ? this.config.rowNumbersWidth : 0;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left; const y = e.clientY - rect.top;
            const relX = x - rvw + this.state.scrollX;
            
            // Clamp coordinates to prevent out-of-bounds selection issues
            const dr = Math.max(0, Math.min(this.provider.getRowCount() - 1, Math.floor((y - this.state.headerHeight + this.state.scrollY) / this.config.rowHeight)));
            
            // Fix: ensure we always get a valid column even if dragging outside bounds
            let dcIdx = Coord.getColumnAt(this.state, relX);
            if (dcIdx === -1) {
                const totalWidth = this.state.columnOffsets[this.state.columnOffsets.length - 1] ?? 0;
                if (relX < 0) dcIdx = 0;
                else if (relX >= totalWidth) dcIdx = this.provider.getColumnCount() - 1;
            }

            if (dcIdx !== -1) { 
                this.selection.updateSelection('cell', dr, this.state.columnOrder[dcIdx] ?? dcIdx, e.ctrlKey, true); 
                this.render(); 
            }
        }
    }

    private handleWindowMouseUp() {
        if (this.isSelecting) {
            this.isSelecting = false;
            this.render();
        }
    }

    public getColumnAt(x: number) { return Coord.getColumnAt(this.state, x); }
    public getColumnOffset(idx: number) { return Coord.getColumnOffset(this.state, idx); }
    public getColumnWidth(col: number) { return Coord.getColumnWidth(this.state, this.config, col); }
    public saveState() { this.data.saveState(); }

    private scrollToCell(r: number, c: number) {
        const actIdx = this.state.columnOrder.indexOf(c);
        this.scroller.scrollToCell(this.getColumnOffset(actIdx === -1 ? c : actIdx) + (this.config.showRowNumbers ? this.config.rowNumbersWidth : 0), r * this.config.rowHeight + this.state.headerHeight, this.getColumnWidth(c), this.config.rowHeight);
    }
    private autoResizeColumn(col: number) {
        let maxWidth = 40; // Minimum width
        const ctx = this.canvas.getContext('2d');
        if (!ctx) return;
        
        const rows = Math.min(this.provider.getRowCount(), 100); // Check first 100 rows for performance
        
        // 1. Measure Header (considering potential subtexts like Units and Description)
        const header = this.provider.getHeader(col);
        if (header) {
            ctx.font = this.config.headerFont;
            const titleW = ctx.measureText(header.name || "").width;
            maxWidth = Math.max(maxWidth, titleW + 20);

            // Also measure subtexts if detailed headers are enabled
            if (this.config.headerSubTextCount > 0) {
                // Use a smaller font approximation as in renderer (italic height/6)
                const subFontSize = Math.max(6, Math.floor(this.config.headerHeight / 6));
                ctx.font = `italic ${subFontSize}px Inter, sans-serif`;
                
                if (header.units) {
                    const unitW = ctx.measureText(header.units).width;
                    maxWidth = Math.max(maxWidth, unitW + 20);
                }
                
                if (this.config.headerSubTextCount === 2 && header.description) {
                    const descW = ctx.measureText(header.description).width;
                    maxWidth = Math.max(maxWidth, descW + 20);
                }
            }
        }

        // 2. Measure Data
        ctx.font = this.config.font;
        const type = header?.type || 'text';
        
        for (let r = 0; r < rows; r++) {
            const val = this.provider.getCellData(r, col);
            if (val !== null && val !== undefined) {
                let text = val.toString();
                // Apply same formatting as Renderer if numeric and units exist
                if (type === 'numeric' && header?.units && typeof val === 'number') {
                    text = formatScientificValue(val, header.units);
                }
                
                const w = ctx.measureText(text).width + (this.config.cellPadding * 2) + 12;
                maxWidth = Math.max(maxWidth, w);
            }
        }

        this.state.columnWidths[col] = Math.min(maxWidth, 500); // Max width cap
        this.updateVirtualSize();
        this.invalidate();
    }

    public invalidate() { this.isDirty = true; }
    private render() {
        if (this.provider.onRowsNeeded) {
            const start = Math.floor(this.state.scrollY / this.config.rowHeight);
            const end = Math.ceil((this.state.scrollY + this.state.height) / this.config.rowHeight);
            if (Math.abs(start - this.lastRange.start) > 5 || Math.abs(end - this.lastRange.end) > 5) {
                this.lastRange = { start, end }; this.provider.onRowsNeeded(Math.max(0, start - 50), Math.min(this.provider.getRowCount() - 1, end + 50));
            }
        }
        this.renderer.render(this.state, this.config, this.provider); this.isDirty = false;
        this.updateFormulaBar();
    }
    public renderNow() { this.render(); }
    private requestAnimationFrame() { const loop = () => { if (this.isDirty) this.render(); requestAnimationFrame(loop); }; requestAnimationFrame(loop); }
    public updateProvider(p: IDataGridProvider) { 
        this.provider = p; 
        this.state.columnOrder = []; 
        for (let i = 0; i < p.getColumnCount(); i++) this.state.columnOrder.push(i); 
        this.updateVirtualSize(); 
        this.updateAriaCounts();
        this.invalidate(); 
    }
    public updateConfig(c: Partial<GridConfig>) { 
        this.config = { ...this.config, ...c }; 
        
        // Dynamically adjust header height if not explicitly overridden but detail level changed
        const subCount = this.config.headerSubTextCount;
        if (subCount === 1) {
            this.config.headerHeight = Math.max(this.config.headerHeight, 50);
        } else if (subCount === 2) {
            this.config.headerHeight = Math.max(this.config.headerHeight, 70);
        } else {
             // Reset to default compact height if going back to simple mode, 
             // unless user explicitly passed a custom height in 'c'
             if (!c.headerHeight) {
                 this.config.headerHeight = 40;
             }
        }

        this.state.headerHeight = this.config.headerHeight; 
        this.editors.closeEditor(); 
        
        // Update Context Menu config so it sees new items
        this.contextMenu.updateConfig(this.config);
        
        this.scroller.updateScrollStyle(this.config.scrollbarThumbColor, this.config.scrollbarColor); 
        this.updateVirtualSize(); 
        this.invalidate(); 
    }
    private updateScroll(d: any) { 
        if (d.scrollX !== undefined) this.state.scrollX = d.scrollX; 
        if (d.scrollY !== undefined) this.state.scrollY = d.scrollY; 
        this.editors.closeEditor(); 
        this.contextMenu.close(); // Close context menu on scroll
        this.render(); 
    }
    // ── v1.2: Undo / Redo ────────────────────────────────────────────

    public editCell(row: number, col: number, newValue: any) {
        if (!this.provider.setCellData) return;
        const oldValue = this.provider.getCellData(row, col);

        // Validate
        const validator = this.config.validators?.[col];
        if (validator) {
            const result = validator(newValue, row, col);
            if (result !== true) return; // validation failed
        }

        this.provider.setCellData(row, col, newValue);
        this.undoMgr.push({ type: 'cell', changes: [{ row, col, oldValue, newValue }] });
        this.config.onCellEdit?.({ row, col, oldValue, newValue });
        this.invalidate();
    }

    private performUndo() {
        const action = this.undoMgr.undo();
        if (!action || !this.provider.setCellData) return;
        for (const c of action.changes) {
            this.provider.setCellData(c.row, c.col, c.oldValue);
        }
        this.invalidate();
    }

    private performRedo() {
        const action = this.undoMgr.redo();
        if (!action || !this.provider.setCellData) return;
        for (const c of action.changes) {
            this.provider.setCellData(c.row, c.col, c.newValue);
        }
        this.invalidate();
    }

    // ── v1.2: Paste from clipboard ──────────────────────────────────

    private async pasteFromClipboard() {
        if (!this.provider.setCellData) return;
        try {
            const text = await navigator.clipboard.readText();
            if (!text) return;
            const rows = text.split('\n').filter(r => r.length > 0);
            const startRow = this.state.anchorRow ?? 0;
            const startCol = this.state.anchorCol ?? 0;
            const startColIdx = this.state.columnOrder.indexOf(startCol);
            const changes: { row: number; col: number; oldValue: any; newValue: any }[] = [];

            for (let r = 0; r < rows.length; r++) {
                const cells = rows[r].split('\t');
                for (let c = 0; c < cells.length; c++) {
                    const targetRow = startRow + r;
                    const targetColIdx = (startColIdx === -1 ? startCol : startColIdx) + c;
                    const targetCol = this.state.columnOrder[targetColIdx] ?? targetColIdx;
                    if (targetRow >= this.provider.getRowCount() || targetColIdx >= this.provider.getColumnCount()) continue;

                    const oldValue = this.provider.getCellData(targetRow, targetCol);
                    let newValue: any = cells[c];
                    const header = this.provider.getHeader(targetCol);
                    if (header.type === 'numeric') {
                        const parsed = parseFloat(newValue);
                        if (!isNaN(parsed)) newValue = parsed;
                    }

                    const validator = this.config.validators?.[targetCol];
                    if (validator && validator(newValue, targetRow, targetCol) !== true) continue;

                    this.provider.setCellData(targetRow, targetCol, newValue);
                    changes.push({ row: targetRow, col: targetCol, oldValue, newValue });
                }
            }

            if (changes.length > 0) {
                this.undoMgr.push({ type: 'paste', changes });
                this.invalidate();
            }
        } catch { /* clipboard access denied */ }
    }

    // ── v1.2: Delete selected cells ─────────────────────────────────

    private deleteSelectedCells() {
        if (!this.provider.setCellData) return;
        const changes: { row: number; col: number; oldValue: any; newValue: any }[] = [];
        for (const range of this.state.selectionRanges) {
            for (let r = range.startRow; r <= range.endRow; r++) {
                for (let c = range.startCol; c <= range.endCol; c++) {
                    const oldValue = this.provider.getCellData(r, c);
                    if (oldValue !== null && oldValue !== undefined && oldValue !== '') {
                        this.provider.setCellData(r, c, null);
                        changes.push({ row: r, col: c, oldValue, newValue: null });
                    }
                }
            }
        }
        if (changes.length > 0) {
            this.undoMgr.push({ type: 'cell', changes });
            this.invalidate();
        }
    }

    // ── v1.2: Formula bar ───────────────────────────────────────────

    private createFormulaBar() {
        if (this.formulaBar) return;
        const bar = document.createElement('div');
        Object.assign(bar.style, {
            position: 'absolute', top: '0', left: '0', width: '100%', height: '28px',
            backgroundColor: this.config.headerBackground, borderBottom: `1px solid ${this.config.gridLineColor}`,
            display: 'flex', alignItems: 'center', padding: '0 8px', gap: '8px',
            font: this.config.font, color: this.config.textColor, zIndex: '20',
            boxSizing: 'border-box',
        });

        const cellRef = document.createElement('span');
        cellRef.style.fontWeight = 'bold';
        cellRef.style.minWidth = '60px';
        cellRef.textContent = '';
        bar.appendChild(cellRef);

        const sep = document.createElement('div');
        Object.assign(sep.style, { width: '1px', height: '16px', backgroundColor: this.config.gridLineColor });
        bar.appendChild(sep);

        const valueDisplay = document.createElement('span');
        valueDisplay.style.flex = '1';
        valueDisplay.style.overflow = 'hidden';
        valueDisplay.style.textOverflow = 'ellipsis';
        valueDisplay.style.whiteSpace = 'nowrap';
        bar.appendChild(valueDisplay);

        this.formulaBar = bar;
        (bar as any)._cellRef = cellRef;
        (bar as any)._valueDisplay = valueDisplay;
        this.uiLayer.parentElement?.insertBefore(bar, this.uiLayer.parentElement.firstChild);
    }

    private updateFormulaBar() {
        if (!this.formulaBar) return;
        const row = this.state.anchorRow;
        const col = this.state.anchorCol;
        const cellRef = (this.formulaBar as any)._cellRef as HTMLElement;
        const valueDisplay = (this.formulaBar as any)._valueDisplay as HTMLElement;

        if (row !== null && col !== null && row >= 0 && col >= 0) {
            const header = this.provider.getHeader(col);
            cellRef.textContent = `${header.name || `Col${col}`}:${row + 1}`;
            const val = this.provider.getCellData(row, col);
            valueDisplay.textContent = val !== null && val !== undefined ? String(val) : '';
        } else {
            cellRef.textContent = '';
            valueDisplay.textContent = '';
        }
    }

    // ── v1.3: Quick filter bar ──────────────────────────────────────

    private createQuickFilterBar() {
        if (this.quickFilterBar) return;
        const bar = document.createElement('div');
        Object.assign(bar.style, {
            position: 'absolute', top: this.config.showFormulaBar ? '28px' : '0', left: '0', width: '100%', height: '32px',
            backgroundColor: this.config.headerBackground, borderBottom: `1px solid ${this.config.gridLineColor}`,
            display: 'flex', alignItems: 'center', padding: '0 8px', gap: '8px',
            font: this.config.font, zIndex: '20', boxSizing: 'border-box',
        });

        const icon = document.createElement('span');
        icon.textContent = '🔍';
        icon.style.fontSize = '14px';
        bar.appendChild(icon);

        const input = document.createElement('input');
        input.placeholder = 'Quick filter...';
        input.value = this.config.quickFilterText || '';
        Object.assign(input.style, {
            flex: '1', border: 'none', outline: 'none', backgroundColor: 'transparent',
            color: this.config.textColor, font: this.config.font, pointerEvents: 'auto',
        });
        input.oninput = () => {
            this.config.quickFilterText = input.value;
            this.config.onQuickFilterChange?.(input.value);
            this.rebuildDataView();
            this.invalidate();
        };
        bar.appendChild(input);

        this.quickFilterBar = bar;
        this.uiLayer.parentElement?.insertBefore(bar, this.uiLayer.parentElement.firstChild);
    }

    // ── v1.3/v1.4: Data view (filter + sort + group) ────────────────

    public rebuildDataView() {
        this.dataView = this.filterEngine.buildView(
            this.provider,
            this.config.filters || [],
            this.config.sortState || [],
            this.config.quickFilterText || '',
            this.config.groupBy
        );
        this.updateVirtualSize();
    }

    /** Get the real row index for a virtual (displayed) row */
    public getRealRow(virtualRow: number): number {
        if (this.dataView.rowMap.length === 0) return virtualRow;
        return this.dataView.rowMap[virtualRow] ?? virtualRow;
    }

    /** Get visible row count (filtered) */
    public getVisibleRowCount(): number {
        if (this.dataView.rowMap.length > 0) return this.dataView.visibleRowCount;
        return this.provider.getRowCount();
    }

    // ── v1.3: Sort API ──────────────────────────────────────────────

    public addSort(col: number, order: 'asc' | 'desc') {
        const sorts = [...(this.config.sortState || [])];
        const existing = sorts.findIndex(s => s.col === col);
        if (existing >= 0) sorts[existing] = { col, order };
        else sorts.push({ col, order });
        this.config.sortState = sorts;
        this.config.onSortChange?.(sorts);
        this.rebuildDataView();
        this.invalidate();
    }

    public clearSort() {
        this.config.sortState = [];
        this.config.onSortChange?.([]);
        this.rebuildDataView();
        this.invalidate();
    }

    // ── v1.3: Filter API ────────────────────────────────────────────

    public addFilter(filter: import("./types/grid.js").ColumnFilter) {
        const filters = [...(this.config.filters || [])];
        const existing = filters.findIndex(f => f.col === filter.col);
        if (existing >= 0) filters[existing] = filter;
        else filters.push(filter);
        this.config.filters = filters;
        this.config.onFilterChange?.(filters);
        this.rebuildDataView();
        this.invalidate();
    }

    public removeFilter(col: number) {
        const filters = (this.config.filters || []).filter(f => f.col !== col);
        this.config.filters = filters;
        this.config.onFilterChange?.(filters);
        this.rebuildDataView();
        this.invalidate();
    }

    public clearFilters() {
        this.config.filters = [];
        this.config.onFilterChange?.([]);
        this.rebuildDataView();
        this.invalidate();
    }

    // ── v1.4: Group API ─────────────────────────────────────────────

    public setGroupBy(col: number, aggregations?: Record<number, import("./types/grid.js").AggregationType>) {
        this.config.groupBy = { col, aggregations };
        this.rebuildDataView();
        this.invalidate();
    }

    public clearGroupBy() {
        this.config.groupBy = undefined;
        this.rebuildDataView();
        this.invalidate();
    }

    public toggleGroup(groupValue: string) {
        this.filterEngine.toggleGroup(groupValue);
        this.rebuildDataView();
        this.invalidate();
    }

    // ── v1.4: Aggregation helper ────────────────────────────────────

    public getAggregation(col: number, type: import("./types/grid.js").AggregationType): any {
        const rows = this.dataView.rowMap.length > 0 ? this.dataView.rowMap : Array.from({ length: this.provider.getRowCount() }, (_, i) => i);
        return FilterEngine.aggregate(this.provider, rows, col, type);
    }

    public getSelection() {
        return {
            mode: this.state.selectionMode,
            ranges: this.state.selectionRanges,
            anchorRow: this.state.anchorRow,
            anchorCol: this.state.anchorCol,
        };
    }

    public destroy() { this.contextMenu.destroy(); this.container.innerHTML = ""; }
}
