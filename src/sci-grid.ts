import type { GridConfig, IDataGridProvider, ViewportState, SelectionMode } from "./types/grid.ts";
import { GridRenderer } from "./core/renderer.ts";
import { Scroller } from "./core/scroller.ts";

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
        selectedRow: null,
        selectedCol: null,
        selectionMode: 'cell',
    };

    private isDirty: boolean = false;

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
            rowNumbersWidth: 50,
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

        this.scroller = new Scroller(
            this.container,
            (delta: Partial<ViewportState>) => this.updateScroll(delta),
            (x: number, y: number) => this.handleHit(x, y, false),
            (x: number, y: number) => this.handleHit(x, y, true)
        );

        this.updateVirtualSize();
        this.init();
    }

    private init(): void {
        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                this.resize(width, height);
            }
        });

        resizeObserver.observe(this.container);
        this.updateVirtualSize();
        this.requestAnimationFrame();
    }

    private updateVirtualSize(): void {
        const rowNumWidth = this.config.showRowNumbers ? this.config.rowNumbersWidth : 0;
        const totalWidth = this.provider.getColumnCount() * this.config.columnWidth + rowNumWidth;
        const totalHeight = this.provider.getRowCount() * this.config.rowHeight + this.config.headerHeight;
        this.scroller.updateVirtualSize(totalWidth, totalHeight);
    }

    private resize(width: number, height: number): void {
        this.state.width = width;
        this.state.height = height;
        this.renderer.resize(width, height);
        this.invalidate();
    }

    private handleHit(clientX: number, clientY: number, isDoubleClick: boolean = false): void {
        this.closeEditor();

        const rect = this.canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const rowNumWidth = this.config.showRowNumbers ? this.config.rowNumbersWidth : 0;

        // Reset selection if clicking elsewhere (optional, but good for UX)
        let changed = false;

        // Click on top-left corner
        if (x < rowNumWidth && y < this.config.headerHeight) {
            this.state.selectionMode = 'all';
            changed = true;
        }
        // Click on Header (Column Selection)
        else if (y < this.config.headerHeight && x >= rowNumWidth) {
            const col = Math.floor((x - rowNumWidth + this.state.scrollX) / this.config.columnWidth);
            if (col >= 0 && col < this.provider.getColumnCount()) {
                this.state.selectedCol = col;
                this.state.selectionMode = 'column';
                changed = true;
            }
        }
        // Click on Row Numbers (Row Selection)
        else if (x < rowNumWidth && y >= this.config.headerHeight) {
            const row = Math.floor((y - this.config.headerHeight + this.state.scrollY) / this.config.rowHeight);
            if (row >= 0 && row < this.provider.getRowCount()) {
                this.state.selectedRow = row;
                this.state.selectionMode = 'row';
                changed = true;
            }
        }
        // Click on Cells
        else if (x >= rowNumWidth && y >= this.config.headerHeight) {
            const row = Math.floor((y - this.config.headerHeight + this.state.scrollY) / this.config.rowHeight);
            const col = Math.floor((x - rowNumWidth + this.state.scrollX) / this.config.columnWidth);

            if (row >= 0 && row < this.provider.getRowCount() && col >= 0 && col < this.provider.getColumnCount()) {
                this.state.selectedRow = row;
                this.state.selectedCol = col;
                this.state.selectionMode = 'cell';
                changed = true;

                if (isDoubleClick) {
                    this.openEditor(row, col);
                }
            }
        }

        if (changed) {
            this.render();
        }
    }

    private openEditor(row: number, col: number): void {
        if (!this.provider.setCellData) return;

        const rowNumWidth = this.config.showRowNumbers ? this.config.rowNumbersWidth : 0;
        const x = col * this.config.columnWidth - this.state.scrollX + rowNumWidth;
        const y = row * this.config.rowHeight - this.state.scrollY + this.config.headerHeight;

        this.editor = document.createElement("input");
        this.editor.type = "text";
        this.editor.value = this.provider.getCellData(row, col)?.toString() || "";
        this.editor.style.position = "absolute";
        this.editor.style.left = `${x}px`;
        this.editor.style.top = `${y}px`;
        this.editor.style.width = `${this.config.columnWidth}px`;
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
        this.updateVirtualSize();
        this.invalidate();
    }

    public updateConfig(newConfig: Partial<GridConfig>): void {
        this.config = { ...this.config, ...newConfig };
        this.closeEditor(); // Close editor to avoid styling conflicts
        this.updateVirtualSize(); // In case row height/col width changed
        this.invalidate();
    }
}
