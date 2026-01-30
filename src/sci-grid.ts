import type { GridConfig, IDataGridProvider, ViewportState, SelectionMode } from "./types/grid.ts";
import { GridRenderer } from "./core/renderer";
import { Scroller } from "./core/scroller";

export class SciGrid {
    private container: HTMLElement;
    private canvas: HTMLCanvasElement;
    private renderer: GridRenderer;
    private scroller: Scroller;
    private uiLayer: HTMLElement;
    private provider: IDataGridProvider;
    private config: GridConfig;
    private editor: HTMLInputElement | null = null;

    private state: ViewportState = {
        scrollX: 0,
        scrollY: 0,
        width: 0,
        height: 0,
        headerHeight: 60, // Default for advanced headers
        columnWidths: {},
        columnOrder: [],
        selectedRows: new Set(),
        selectedCols: new Set(),
        anchorRow: null,
        anchorCol: null,
        resizingCol: null,
        reorderingCol: null,
        reorderingTarget: null,
        reorderingX: null,
        hoveredCol: null,
        selectionMode: 'cell',
    };

    private isDirty: boolean = false;

    private getColumnWidth(col: number): number {
        return this.state.columnWidths[col] ?? this.config.columnWidth;
    }

    private getColumnOffset(colIndex: number): number {
        let offset = 0;
        for (let i = 0; i < colIndex; i++) {
            const actualCol = this.state.columnOrder[i] ?? i;
            offset += this.getColumnWidth(actualCol);
        }
        return offset;
    }

    private getColumnAt(x: number): number {
        let currentX = 0;
        const colCount = this.provider.getColumnCount();
        for (let i = 0; i < colCount; i++) {
            const actualCol = this.state.columnOrder[i] ?? i;
            const width = this.getColumnWidth(actualCol);
            if (x >= currentX && x < currentX + width) return i;
            currentX += width;
        }
        if (x >= currentX) return colCount;
        return -1;
    }

    constructor(
        container: HTMLElement,
        provider: IDataGridProvider,
        config: Partial<GridConfig> = {}
    ) {
        this.container = container;
        this.provider = provider;

        this.config = {
            rowHeight: 25,
            columnWidth: 100,
            headerHeight: 30,
            showRowNumbers: true,
            rowNumbersWidth: 40,
            headerSubTextCount: 0,
            headerPlaceholder: '-',
            allowResizing: true,
            allowFiltering: true,
            backgroundColor: "#ffffff",
            gridLineColor: "#e0e0e0",
            textColor: "#333333",
            font: "12px Inter, sans-serif",
            headerBackground: "#f3f3f3",
            headerTextColor: "#333333",
            headerFont: "bold 12px Inter, sans-serif",
            rowNumberBackground: "#f9f9f9",
            rowNumberTextColor: "#666666",
            selectionColor: "rgba(0, 120, 215, 0.3)",
            selectedTextColor: "#000000",
            cellPadding: 5,
            ...config,
        };

        this.state.headerHeight = this.config.headerHeight;

        // Sticky Viewport Wrapper
        const viewportWrapper = document.createElement("div");
        viewportWrapper.style.position = "sticky";
        viewportWrapper.style.top = "0";
        viewportWrapper.style.left = "0";
        viewportWrapper.style.width = "100%";
        viewportWrapper.style.height = "100%";
        viewportWrapper.style.zIndex = "10";
        this.container.appendChild(viewportWrapper);

        this.canvas = document.createElement("canvas");
        this.canvas.style.position = "absolute";
        this.canvas.style.top = "0";
        this.canvas.style.left = "0";
        this.canvas.style.display = "block";
        this.canvas.style.zIndex = "1";
        viewportWrapper.appendChild(this.canvas);

        // UI Layer for overlays (editor, etc)
        const uiLayer = document.createElement("div");
        uiLayer.style.position = "absolute";
        uiLayer.style.top = "0";
        uiLayer.style.left = "0";
        uiLayer.style.width = "100%";
        uiLayer.style.height = "100%";
        uiLayer.style.zIndex = "2";
        uiLayer.style.pointerEvents = "none";
        viewportWrapper.appendChild(uiLayer);
        this.uiLayer = uiLayer;

        this.renderer = new GridRenderer(this.canvas);

        // Update container styles for scrollbars
        this.container.style.overflow = "auto";
        this.container.style.position = "relative";
        this.container.tabIndex = 0; // Make focusable
        this.container.style.outline = "none";

        this.scroller = new Scroller(
            this.container,
            (delta: Partial<ViewportState>) => this.updateScroll(delta),
            (e: MouseEvent) => this.handleHit(e, false),
            (e: MouseEvent) => this.handleHit(e, true)
        );

        this.initColumnOrder();
        this.updateVirtualSize();
        this.init();
    }

    private initColumnOrder(): void {
        if (this.state.columnOrder.length === 0) {
            const colCount = this.provider.getColumnCount();
            for (let i = 0; i < colCount; i++) {
                this.state.columnOrder.push(i);
            }
        }
    }

    private init(): void {
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                this.resize(Math.floor(width), Math.floor(height));
            }
        });

        resizeObserver.observe(this.container);

        this.container.addEventListener("keydown", (e) => this.handleKeyDown(e));
        this.container.addEventListener("mousemove", (e) => this.handleMouseMove(e));

        this.updateVirtualSize();
        this.requestAnimationFrame();
    }

    private updateVirtualSize(): void {
        const rowNumWidth = this.config.showRowNumbers ? this.config.rowNumbersWidth : 0;
        let totalWidth = rowNumWidth;
        const colCount = this.provider.getColumnCount();
        for (let i = 0; i < colCount; i++) {
            totalWidth += this.getColumnWidth(i);
        }
        const totalHeight = this.provider.getRowCount() * this.config.rowHeight + this.state.headerHeight;
        this.scroller.updateVirtualSize(totalWidth, totalHeight);
    }

    private resize(width: number, height: number): void {
        this.state.width = width;
        this.state.height = height;
        this.renderer.resize(width, height);
        this.invalidate();
    }

    private getHeaderHit(x: number, y: number): { type: 'edge' | 'handle' | 'text' | 'filter'; colIndex: number; subIndex?: number } {
        let currentX = 0;
        const edgeThreshold = 5;
        const handleSize = 20;
        const filterSize = 20;

        for (let i = 0; i < this.state.columnOrder.length; i++) {
            const col = this.state.columnOrder[i];
            if (col === undefined) continue;
            const width = this.getColumnWidth(col);

            if (x >= currentX && x <= currentX + width) {
                // Check right edge
                if (x >= currentX + width - edgeThreshold) {
                    return { type: 'edge', colIndex: i };
                }
                // Check left edge (except first column)
                if (i > 0 && x <= currentX + edgeThreshold) {
                    return { type: 'edge', colIndex: i - 1 };
                }

                // Check reorder handle (top left)
                if (x <= currentX + handleSize && y <= handleSize) {
                    return { type: 'handle', colIndex: i };
                }

                // Check filter button (top right)
                if (this.config.allowFiltering && x >= currentX + width - filterSize - 5 && y <= filterSize) {
                    return { type: 'filter', colIndex: i };
                }

                // Check text areas (multi-line)
                const lineCount = 1 + this.config.headerSubTextCount;
                const lineHeight = this.state.headerHeight / lineCount;
                const subIndex = Math.max(0, Math.min(lineCount - 1, Math.floor(y / lineHeight)));

                return { type: 'text', colIndex: i, subIndex };
            }
            currentX += width;
        }

        return { type: 'text', colIndex: -1 };
    }

    private handleHit(e: MouseEvent, isDoubleClick: boolean = false): void {
        this.closeEditor();

        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rowNumWidth = this.config.showRowNumbers ? this.config.rowNumbersWidth : 0;
        let changed = false;

        const isCtrl = e.ctrlKey || e.metaKey;
        const isShift = e.shiftKey;

        // Click on top-left corner
        if (x < rowNumWidth && y < this.state.headerHeight) {
            this.state.selectionMode = 'all';
            changed = true;
        }
        // Click on Header
        else if (y < this.state.headerHeight && x >= rowNumWidth) {
            const relativeX = x - rowNumWidth + this.state.scrollX;
            const hit = this.getHeaderHit(relativeX, y);

            if (hit.colIndex !== -1) {
                const actualCol = this.state.columnOrder[hit.colIndex] ?? hit.colIndex;
                const header = this.provider.getHeader(actualCol);
                
                if (hit.type === 'edge' && (header.isResizable !== false && this.config.allowResizing)) {
                    e.preventDefault();
                    this.startResizing(actualCol, e);
                } else if (hit.type === 'handle') {
                    e.preventDefault();
                    this.startReordering(hit.colIndex, e);
                } else if (hit.type === 'filter' && (header.isFilterable !== false && this.config.allowFiltering)) {
                    e.preventDefault();
                    // TODO: Implement filter menu
                    console.log('Filter clicked for col', actualCol);
                } else {
                    this.updateSelection('column', null, actualCol, isCtrl, isShift);
                    changed = true;
                    if (isDoubleClick) {
                        this.openHeaderEditor(actualCol, hit.subIndex || 0);
                    }
                }
            }
        }
        // Click on Row Numbers
        else if (x < rowNumWidth && y >= this.state.headerHeight) {
            const row = Math.floor((y - this.state.headerHeight + this.state.scrollY) / this.config.rowHeight);
            if (row >= 0 && row < this.provider.getRowCount()) {
                this.updateSelection('row', row, null, isCtrl, isShift);
                changed = true;
            }
        }
        // Click on Cells
        else if (x >= rowNumWidth && y >= this.state.headerHeight) {
            const row = Math.floor((y - this.state.headerHeight + this.state.scrollY) / this.config.rowHeight);
            const relativeX = x - rowNumWidth + this.state.scrollX;
            const colIndex = this.getColumnAt(relativeX);
            const actualCol = this.state.columnOrder[colIndex] ?? colIndex;

            if (row >= 0 && row < this.provider.getRowCount() && colIndex !== -1) {
                this.updateSelection('cell', row, actualCol, isCtrl, isShift);
                changed = true;

                if (isDoubleClick) {
                    this.openEditor(row, actualCol);
                }
            }
        }

        if (changed) {
            this.render();
        }
    }

    private updateSelection(mode: SelectionMode, row: number | null, col: number | null, isCtrl: boolean, isShift: boolean): void {
        this.state.selectionMode = mode;

        if (!isCtrl && !isShift) {
            this.state.selectedRows.clear();
            this.state.selectedCols.clear();
        }

        if (mode === 'cell' || mode === 'row') {
            if (row !== null) {
                if (isShift && this.state.anchorRow !== null) {
                    const start = Math.min(row, this.state.anchorRow);
                    const end = Math.max(row, this.state.anchorRow);
                    for (let i = start; i <= end; i++) this.state.selectedRows.add(i);
                } else {
                    if (isCtrl && this.state.selectedRows.has(row)) {
                        this.state.selectedRows.delete(row);
                    } else {
                        this.state.selectedRows.add(row);
                        this.state.anchorRow = row;
                    }
                }
            }
        }

        if (mode === 'cell' || mode === 'column') {
            if (col !== null) {
                if (isShift && this.state.anchorCol !== null) {
                    // Find visual indices for anchor and current col
                    const anchorVisualIndex = this.state.columnOrder.indexOf(this.state.anchorCol);
                    const currentVisualIndex = this.state.columnOrder.indexOf(col);
                    
                    if (anchorVisualIndex !== -1 && currentVisualIndex !== -1) {
                        const start = Math.min(anchorVisualIndex, currentVisualIndex);
                        const end = Math.max(anchorVisualIndex, currentVisualIndex);
                        
                        this.state.selectedCols.clear(); // Clear previous selection in this mode usually? 
                        // Actually, shift-click usually extends, but for simple range we re-calculate
                        // If ctrl is held, we might want to keep others, but standard shift-click behavior usually replaces selection with range
                        // relative to anchor.
                        // Let's stick to standard range selection behavior (clear and add range)
                        
                         if (!isCtrl) {
                            this.state.selectedCols.clear();
                        }

                        for (let i = start; i <= end; i++) {
                            const colId = this.state.columnOrder[i];
                            if (colId !== undefined) {
                                this.state.selectedCols.add(colId);
                            }
                        }
                    }
                } else {
                    if (isCtrl && this.state.selectedCols.has(col)) {
                        this.state.selectedCols.delete(col);
                    } else {
                        // If not ctrl/shift, validation cleared everything above
                        this.state.selectedCols.add(col);
                        this.state.anchorCol = col;
                    }
                }
            }
        }
    }

    private handleKeyDown(e: KeyboardEvent): void {
        if (this.editor) return;

        let row = this.state.anchorRow ?? 0;
        let col = this.state.anchorCol ?? 0;
        const rowCount = this.provider.getRowCount();
        const colCount = this.provider.getColumnCount();

        // Get current column index in order
        let colIndex = this.state.columnOrder.indexOf(col);
        if (colIndex === -1) colIndex = col;

        switch (e.key) {
            case "ArrowUp": row = Math.max(0, row - 1); break;
            case "ArrowDown": row = Math.min(rowCount - 1, row + 1); break;
            case "ArrowLeft": colIndex = Math.max(0, colIndex - 1); break;
            case "ArrowRight": colIndex = Math.min(colCount - 1, colIndex + 1); break;
            case "PageUp": row = Math.max(0, row - Math.floor(this.state.height / this.config.rowHeight)); break;
            case "PageDown": row = Math.min(rowCount - 1, row + Math.floor(this.state.height / this.config.rowHeight)); break;
            default: return;
        }

        col = this.state.columnOrder[colIndex] ?? colIndex;

        e.preventDefault();
        this.updateSelection('cell', row, col, e.ctrlKey, e.shiftKey);
        this.scrollToCell(row, col);
        this.render();
    }

    private handleMouseMove(e: MouseEvent): void {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.state.resizingCol !== null) {
            this.container.style.cursor = 'col-resize';
            return;
        }
        if (this.state.reorderingCol !== null) {
            this.container.style.cursor = 'grabbing';
            return;
        }

        const rowNumWidth = this.config.showRowNumbers ? this.config.rowNumbersWidth : 0;
        const relativeX = x - rowNumWidth + this.state.scrollX;

        // Reset hoveredCol if not in header
        if (y >= this.state.headerHeight || x < rowNumWidth) {
            if (this.state.hoveredCol !== null) {
                this.state.hoveredCol = null;
                this.render();
            }
        }

        if (y < this.state.headerHeight && x >= rowNumWidth) {
            const hit = this.getHeaderHit(relativeX, y);
            const actualColIndex = this.getColumnAt(relativeX);
            const actualCol = this.state.columnOrder[actualColIndex] ?? actualColIndex;

            if (this.state.hoveredCol !== actualCol) {
                this.state.hoveredCol = actualCol;
                this.render();
            }

            const header = this.provider.getHeader(actualCol);

            if (hit.type === 'edge' && (header.isResizable !== false && this.config.allowResizing)) {
                this.container.style.cursor = 'col-resize';
            } else if (hit.type === 'handle') {
                this.container.style.cursor = 'grab';
            } else if (hit.type === 'filter' && (header.isFilterable !== false && this.config.allowFiltering)) {
                this.container.style.cursor = 'pointer';
            } else {
                this.container.style.cursor = 'default';
            }
        } else {
            this.container.style.cursor = 'default';
        }
    }

    private scrollToCell(row: number, col: number): void {
        const rowNumWidth = this.config.showRowNumbers ? this.config.rowNumbersWidth : 0;
        const colIndex = this.state.columnOrder.indexOf(col);
        const actualColIndex = colIndex === -1 ? col : colIndex;
        const x = this.getColumnOffset(actualColIndex) + rowNumWidth;
        const y = row * this.config.rowHeight + this.state.headerHeight;
        this.scroller.scrollToCell(x, y, this.getColumnWidth(col), this.config.rowHeight);
    }

    private startReordering(colIndex: number, e: MouseEvent): void {
        this.state.reorderingCol = colIndex;
        this.container.style.cursor = 'grabbing';
        
        const onMouseMove = (moveEvent: MouseEvent) => {
            const rect = this.canvas.getBoundingClientRect();
            const x = moveEvent.clientX - rect.left;
            const relativeX = x - (this.config.showRowNumbers ? this.config.rowNumbersWidth : 0) + this.state.scrollX;
            this.state.reorderingX = x;

            const targetIndex = this.getColumnAt(relativeX);
            if (targetIndex !== -1) {
                this.state.reorderingTarget = targetIndex;
            }
            this.invalidate();
        };

        const onMouseUp = () => {
            if (this.state.reorderingTarget !== null && this.state.reorderingCol !== null) {
                const order = [...this.state.columnOrder];
                if (order.length === 0) {
                    for (let i = 0; i < this.provider.getColumnCount(); i++) order.push(i);
                }
                const movedIndex = this.state.reorderingCol;
                let targetIndex = this.state.reorderingTarget;
                
                if (targetIndex > movedIndex) targetIndex--;
                
                const spliced = order.splice(movedIndex, 1);
                const moved = spliced[0];
                if (moved !== undefined) {
                    order.splice(targetIndex, 0, moved);
                    this.state.columnOrder = order;
                    this.updateSelection('column', null, moved, false, false);
                }
            }
            this.state.reorderingCol = null;
            this.state.reorderingTarget = null;
            this.state.reorderingX = null;
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            this.invalidate();
        };

        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }

    private startResizing(col: number, e: MouseEvent): void {
        this.state.resizingCol = col;
        const startX = e.clientX;
        const startWidth = this.getColumnWidth(col);

        const onMouseMove = (moveEvent: MouseEvent) => {
            const delta = moveEvent.clientX - startX;
            this.state.columnWidths[col] = Math.max(30, startWidth + delta);
            this.updateVirtualSize();
            this.invalidate();
        };

        const onMouseUp = () => {
            this.state.resizingCol = null;
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            this.container.style.cursor = 'default';
        };

        this.container.style.cursor = 'col-resize';
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    }

    private openHeaderEditor(col: number, subIndex: number): void {
        const header = this.provider.getHeader(col);
        let value = "";
        if (subIndex === 0) value = header.name;
        else if (subIndex === 1) value = header.units || "";
        else if (subIndex === 2) value = header.description || "";

        const colIndex = this.state.columnOrder.indexOf(col);
        const actualColIndex = colIndex === -1 ? col : colIndex;
        const rowNumWidth = this.config.showRowNumbers ? this.config.rowNumbersWidth : 0;
        const x = this.getColumnOffset(actualColIndex) - this.state.scrollX + rowNumWidth;
        
        const lineCount = 1 + this.config.headerSubTextCount;
        const lineHeight = this.state.headerHeight / lineCount;
        const y = subIndex * lineHeight;

        const input = document.createElement("input");
        input.type = "text";
        input.value = value;
        input.placeholder = subIndex > 0 ? this.config.headerPlaceholder : "";
        input.style.position = "absolute";
        input.style.left = `${x}px`;
        input.style.top = `${y}px`;
        input.style.width = `${this.getColumnWidth(col)}px`;
        input.style.height = `${lineHeight}px`;
        input.style.boxSizing = "border-box";
        input.style.border = "2px solid #4facfe";
        input.style.outline = "none";
        input.style.font = this.config.headerFont;
        input.style.zIndex = "100";
        input.style.pointerEvents = "auto";

        const save = () => {
            const newHeader = { ...header };
            if (subIndex === 0) newHeader.name = input.value;
            else if (subIndex === 1) newHeader.units = input.value;
            else if (subIndex === 2) newHeader.description = input.value;
            
            if (this.provider.setHeader) {
                this.provider.setHeader(col, newHeader);
            }
            input.remove();
            this.invalidate();
        };

        input.onblur = save;
        input.onkeydown = (e) => {
            if (e.key === 'Enter') save();
            if (e.key === 'Escape') input.remove();
        };

        this.uiLayer.appendChild(input);
        setTimeout(() => {
            input.focus();
            input.select();
        }, 0);
    }

    private openEditor(row: number, col: number): void {
        if (!this.provider.setCellData) return;

        const rowNumWidth = this.config.showRowNumbers ? this.config.rowNumbersWidth : 0;
        
        let colIndex = this.state.columnOrder.indexOf(col);
        if (colIndex === -1 && this.state.columnOrder.length > 0) {
            // If we have an order but col not found, fallback to it as index? 
            // Better to stay safe.
        }
        if (colIndex === -1) colIndex = col;
        
        const offset = this.getColumnOffset(colIndex);
        const x = offset - this.state.scrollX + rowNumWidth;
        const y = row * this.config.rowHeight - this.state.scrollY + this.state.headerHeight;
        const colWidth = this.getColumnWidth(col);

        this.editor = document.createElement("input");
        this.editor.type = "text";
        this.editor.value = this.provider.getCellData(row, col)?.toString() || "";
        this.editor.style.position = "absolute";
        this.editor.style.left = `${x}px`;
        this.editor.style.top = `${y}px`;
        this.editor.style.width = `${colWidth}px`;
        this.editor.style.height = `${this.config.rowHeight}px`;
        this.editor.style.boxSizing = "border-box";
        this.editor.style.border = "2px solid #4facfe";
        this.editor.style.outline = "none";
        this.editor.style.font = this.config.font;
        this.editor.style.padding = `${this.config.cellPadding}px`;
        this.editor.style.zIndex = "10";

        this.editor.addEventListener("keydown", (e) => {
            if (e.key === "Enter") this.saveEditor(row, col);
            if (e.key === "Escape") this.closeEditor();
        });

        this.editor.addEventListener("blur", () => this.saveEditor(row, col));

        this.editor.style.pointerEvents = "auto";
        this.uiLayer.appendChild(this.editor);

        // Delay focus to ensure DOM insertion is complete and prevent event raciness
        setTimeout(() => {
            if (this.editor) {
                this.editor.focus();
                this.editor.select();
            }
        }, 0);
    }

    private saveEditor(row: number, col: number): void {
        if (this.editor && this.provider.setCellData) {
            this.provider.setCellData(row, col, this.editor.value);
            this.closeEditor();
            this.invalidate();
        }
    }

    private closeEditor(): void {
        const editor = this.editor;
        if (editor) {
            this.editor = null; // Clear immediately to prevent re-entrancy
            if (editor.parentNode) {
                editor.remove();
            }
        }
    }

    private updateScroll(delta: Partial<ViewportState>): void {
        if (delta.scrollX !== undefined) this.state.scrollX = delta.scrollX;
        if (delta.scrollY !== undefined) this.state.scrollY = delta.scrollY;

        this.closeEditor();
        this.render(); // Immediate render during scroll event
    }

    private invalidate(): void {
        this.isDirty = true;
    }

    private render(): void {
        this.renderer.render(this.state, this.config, this.provider);
        this.isDirty = false;
    }

    private requestAnimationFrame(): void {
        const loop = () => {
            if (this.isDirty) {
                this.render();
            }
            requestAnimationFrame(loop);
        };
        requestAnimationFrame(loop);
    }

    public updateProvider(newProvider: IDataGridProvider): void {
        this.provider = newProvider;
        this.state.columnOrder = []; // Reset order for new provider
        this.initColumnOrder();
        this.updateVirtualSize();
        this.invalidate();
    }

    public updateConfig(newConfig: Partial<GridConfig>): void {
        this.config = { ...this.config, ...newConfig };
        this.state.headerHeight = this.config.headerHeight;
        this.closeEditor(); // Close editor to avoid styling conflicts
        this.updateVirtualSize(); // In case row height/col width changed
        this.invalidate();
    }
}
