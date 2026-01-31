import type { GridConfig, IDataGridProvider, ViewportState, SelectionMode, ColumnHeaderInfo } from "./types/grid.js";
export type { GridConfig, IDataGridProvider, ViewportState, SelectionMode, ColumnHeaderInfo } from "./types/grid.js";
import { GridRenderer } from "./core/renderer.js";
import { Scroller } from "./core/scroller.js";
import { SelectionManager } from "./core/selection-manager.js";
import { KeyboardHandler } from "./core/keyboard-handler.js";
import { EditorManager } from "./core/editor-manager.js";
import { MouseHandler } from "./core/mouse-handler.js";
import { DragManager } from "./core/drag-manager.js";
import { DataManager } from "./core/data-manager.js";
import * as Coord from "./core/coord-helper.js";

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
            selectionColor: "rgba(0, 120, 215, 0.3)", selectedTextColor: "#000000", cellPadding: 5, ...config,
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
            openEditor: (r, c) => this.editors.openCellEditor(r, c), openHeaderEditor: (c, s) => this.editors.openHeaderEditor(c, s),
            closeEditor: () => this.editors.closeEditor(), setSelecting: (v) => this.isSelecting = v
        });
        this.keyboard = new KeyboardHandler(this.state, this.provider, this.config, {
            updateSelection: (m, r, c, ct, s) => this.selection.updateSelection(m, r, c, ct, s), scrollToCell: (r, c) => this.scrollToCell(r, c),
            copyToClipboard: () => this.data.copyToClipboard(), render: () => this.render()
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
        window.addEventListener("mouseup", e => this.handleWindowMouseUp(e));
        this.updateVirtualSize(); this.requestAnimationFrame();
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
        const rvw = this.config.showRowNumbers ? this.config.rowNumbersWidth : 0;
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left; const y = e.clientY - rect.top;
        if (this.config.showRowNumbers && y < this.state.headerHeight && Math.abs(x - rvw) < 5) { this.container.style.cursor = 'col-resize'; return; }

        const relX = x - rvw + this.state.scrollX;
        if (y >= this.state.headerHeight || x < rvw) { if (this.state.hoveredCol !== null) { this.state.hoveredCol = null; this.render(); } }
        
        if (y < this.state.headerHeight && x >= rvw) {
            const idx = Coord.getColumnAt(this.state, relX);
            const act = this.state.columnOrder[idx] ?? idx;
            if (this.state.hoveredCol !== act) { this.state.hoveredCol = act; this.render(); }
            this.container.style.cursor = 'grab';
        } else this.container.style.cursor = 'default';
    }

    private handleWindowMouseMove(e: MouseEvent) {
        if (this.isSelecting) {
            const rvw = this.config.showRowNumbers ? this.config.rowNumbersWidth : 0;
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left; const y = e.clientY - rect.top;
            const relX = x - rvw + this.state.scrollX;
            const dr = Math.max(0, Math.min(this.provider.getRowCount() - 1, Math.floor((y - this.state.headerHeight + this.state.scrollY) / this.config.rowHeight)));
            const dcIdx = Coord.getColumnAt(this.state, relX);
            if (dcIdx !== -1) { this.selection.updateSelection('cell', dr, this.state.columnOrder[dcIdx] ?? dcIdx, e.ctrlKey, true); this.render(); }
        }
    }

    private handleWindowMouseUp(e: MouseEvent) {
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
    public updateConfig(c: Partial<GridConfig>) { this.config = { ...this.config, ...c }; this.state.headerHeight = this.config.headerHeight; this.editors.closeEditor(); this.scroller.updateScrollStyle(this.config.scrollbarThumbColor, this.config.scrollbarColor); this.updateVirtualSize(); this.invalidate(); }
    private updateScroll(d: any) { if (d.scrollX !== undefined) this.state.scrollX = d.scrollX; if (d.scrollY !== undefined) this.state.scrollY = d.scrollY; this.editors.closeEditor(); this.render(); }
    public destroy() { this.container.innerHTML = ""; }
}
