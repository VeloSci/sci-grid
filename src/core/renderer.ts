import type { GridConfig, IDataGridProvider, ViewportState } from "../types/grid.ts";

export class GridRenderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private dpr: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = canvas.getContext("2d", { alpha: false });
        if (!ctx) throw new Error("Could not get 2d context");
        this.ctx = ctx;
        this.dpr = window.devicePixelRatio || 1;
    }

    public resize(width: number, height: number): void {
        this.canvas.width = width * this.dpr;
        this.canvas.height = height * this.dpr;
        this.canvas.style.width = `${width}px`;
        this.canvas.style.height = `${height}px`;
        this.ctx.scale(this.dpr, this.dpr);
    }

    public render(
        state: ViewportState,
        config: GridConfig,
        provider: IDataGridProvider
    ): void {
        const { ctx } = this;
        const { width, height, scrollX, scrollY, selectedRow, selectedCol, selectionMode } = state;

        // Clear background
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(0, 0, width, height);

        const rowNumWidth = config.showRowNumbers ? config.rowNumbersWidth : 0;

        // Calculate visible range
        const startRow = Math.floor(scrollY / config.rowHeight);
        const endRow = Math.min(
            provider.getRowCount() - 1,
            Math.ceil((scrollY + height) / config.rowHeight)
        );

        const startCol = Math.floor(scrollX / config.columnWidth);
        const endCol = Math.min(
            provider.getColumnCount() - 1,
            Math.ceil((scrollX + width) / config.columnWidth)
        );

        ctx.font = config.font;
        ctx.textBaseline = "middle";

        // 1. Draw Cell Data
        ctx.save();
        // Clip to data area (exclude header and row numbers)
        ctx.beginPath();
        ctx.rect(rowNumWidth, config.headerHeight, width - rowNumWidth, height - config.headerHeight);
        ctx.clip();

        for (let r = startRow; r <= endRow; r++) {
            const y = r * config.rowHeight - scrollY + config.headerHeight;

            // Alternate row color
            if (config.alternateRowColor && r % 2 === 1) {
                ctx.fillStyle = config.alternateRowColor;
                ctx.fillRect(rowNumWidth, y, width - rowNumWidth, config.rowHeight);
            }

            for (let c = startCol; c <= endCol; c++) {
                const x = c * config.columnWidth - scrollX + rowNumWidth;

                let isSelected = false;
                if (selectionMode === 'cell') isSelected = r === selectedRow && c === selectedCol;
                else if (selectionMode === 'row') isSelected = r === selectedRow;
                else if (selectionMode === 'column') isSelected = c === selectedCol;
                else if (selectionMode === 'all') isSelected = true;

                // Selection background
                if (isSelected) {
                    ctx.fillStyle = config.selectionColor;
                    ctx.fillRect(x, y, config.columnWidth, config.rowHeight);
                }

                // Cell content
                const data = provider.getCellData(r, c);
                if (data !== null && data !== undefined) {
                    ctx.fillStyle = isSelected && selectionMode === 'cell' ? config.selectedTextColor : config.textColor;
                    ctx.fillText(
                        data.toString(),
                        x + config.cellPadding,
                        y + config.rowHeight / 2
                    );
                }

                // Grid lines
                ctx.strokeStyle = config.gridLineColor;
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, config.columnWidth, config.rowHeight);
            }
        }
        ctx.restore();

        // 2. Draw Fixed Row Numbers
        if (config.showRowNumbers) {
            ctx.fillStyle = config.rowNumberBackground;
            ctx.fillRect(0, config.headerHeight, rowNumWidth, height);

            ctx.fillStyle = config.rowNumberTextColor;
            ctx.strokeStyle = config.gridLineColor;
            for (let r = startRow; r <= endRow; r++) {
                const y = r * config.rowHeight - scrollY + config.headerHeight;

                // Highlight selected row number
                if (r === selectedRow && (selectionMode === 'row' || selectionMode === 'cell')) {
                    ctx.fillStyle = config.selectionColor;
                    ctx.fillRect(0, y, rowNumWidth, config.rowHeight);
                }

                ctx.strokeRect(0, y, rowNumWidth, config.rowHeight);
                ctx.fillStyle = config.rowNumberTextColor;
                ctx.fillText((r + 1).toString(), 5, y + config.rowHeight / 2);
            }
        }

        // 3. Draw Fixed Header
        this.renderHeader(state, config, provider, startCol, endCol, rowNumWidth);

        // 4. Draw Top-Left Corner
        if (config.showRowNumbers) {
            ctx.fillStyle = config.headerBackground;
            ctx.fillRect(0, 0, rowNumWidth, config.headerHeight);
            ctx.strokeStyle = config.gridLineColor;
            ctx.strokeRect(0, 0, rowNumWidth, config.headerHeight);
        }
    }

    private renderHeader(
        state: ViewportState,
        config: GridConfig,
        provider: IDataGridProvider,
        startCol: number,
        endCol: number,
        rowNumOffset: number
    ): void {
        const { ctx } = this;
        const { width, scrollX } = state;

        ctx.fillStyle = config.headerBackground;
        ctx.fillRect(rowNumOffset, 0, width - rowNumOffset, config.headerHeight);

        ctx.fillStyle = config.headerTextColor;
        ctx.font = config.headerFont;
        ctx.strokeStyle = config.gridLineColor;

        for (let c = startCol; c <= endCol; c++) {
            const x = c * config.columnWidth - scrollX + rowNumOffset;

            // Highlight selected column header
            if (c === state.selectedCol && (state.selectionMode === 'column' || state.selectionMode === 'cell')) {
                ctx.fillStyle = config.selectionColor;
                ctx.fillRect(x, 0, config.columnWidth, config.headerHeight);
            }

            ctx.strokeRect(x, 0, config.columnWidth, config.headerHeight);
            ctx.fillStyle = config.headerTextColor;
            ctx.fillText(
                provider.getColumnHeader(c),
                x + config.cellPadding,
                config.headerHeight / 2
            );
        }
    }
}
