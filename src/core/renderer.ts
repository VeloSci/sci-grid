import type { GridConfig, IDataGridProvider, ViewportState, ColumnHeaderInfo } from "../types/grid.ts";

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
        const { width, height, scrollX, scrollY, selectedRows, selectedCols, selectionMode, headerHeight } = state;

        // Clear background
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(0, 0, width, height);

        const rowNumWidth = config.showRowNumbers ? config.rowNumbersWidth : 0;

        // Calculate visible range
        const startRow = Math.max(0, Math.floor(scrollY / config.rowHeight));
        const endRow = Math.min(
            provider.getRowCount() - 1,
            Math.ceil((scrollY + height) / config.rowHeight)
        );

        // Map column indices to their actual order and positions
        const colCount = provider.getColumnCount();
        const visibleCols: { index: number; x: number; width: number }[] = [];
        let currentX = rowNumWidth - scrollX;

        for (let i = 0; i < colCount; i++) {
            const actualCol = state.columnOrder[i] ?? i;
            const colWidth = state.columnWidths[actualCol] ?? config.columnWidth;
            
            if (currentX + colWidth > rowNumWidth && currentX < width) {
                visibleCols.push({ index: actualCol, x: currentX, width: colWidth });
            }
            currentX += colWidth;
            if (currentX > width) break;
        }

        ctx.font = config.font;
        ctx.textBaseline = "middle";

        // 1. Draw Cell Data
        ctx.save();
        ctx.beginPath();
        ctx.rect(rowNumWidth, headerHeight, width - rowNumWidth, height - headerHeight);
        ctx.clip();

        for (let r = startRow; r <= endRow; r++) {
            const y = Math.floor(r * config.rowHeight - scrollY + headerHeight);

            if (config.alternateRowColor && r % 2 === 1) {
                ctx.fillStyle = config.alternateRowColor;
                ctx.fillRect(rowNumWidth, y, width - rowNumWidth, config.rowHeight);
            }

            for (const col of visibleCols) {
                const { index: c, x, width: cWidth } = col;

                // Dim cells if the column is being reordered
                const isBeingReordered = state.reorderingCol !== null && state.columnOrder[state.reorderingCol] === c;
                if (isBeingReordered) ctx.globalAlpha = 0.2;

                let isSelected = false;
                if (selectionMode === 'cell') isSelected = selectedRows.has(r) && selectedCols.has(c);
                else if (selectionMode === 'row') isSelected = selectedRows.has(r);
                else if (selectionMode === 'column') isSelected = selectedCols.has(c);
                else if (selectionMode === 'all') isSelected = true;

                if (isSelected) {
                    ctx.fillStyle = config.selectionColor;
                    ctx.fillRect(x, y, cWidth, config.rowHeight);
                }

                const data = provider.getCellData(r, c);
                if (data !== null && data !== undefined) {
                    ctx.fillStyle = isSelected && selectionMode === 'cell' ? config.selectedTextColor : config.textColor;
                    ctx.fillText(
                        data.toString(),
                        x + config.cellPadding,
                        y + config.rowHeight / 2
                    );
                }

                ctx.strokeStyle = config.gridLineColor;
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, cWidth, config.rowHeight);

                if (isBeingReordered) ctx.globalAlpha = 1.0;
            }
        }
        ctx.restore();

        // 2. Draw Fixed Row Numbers
        if (config.showRowNumbers) {
            ctx.fillStyle = config.rowNumberBackground;
            ctx.fillRect(0, headerHeight, rowNumWidth, height);

            ctx.fillStyle = config.rowNumberTextColor;
            ctx.strokeStyle = config.gridLineColor;
            for (let r = startRow; r <= endRow; r++) {
                const y = Math.floor(r * config.rowHeight - scrollY + headerHeight);

                if (selectedRows.has(r) && (selectionMode === 'row' || selectionMode === 'cell')) {
                    ctx.fillStyle = config.selectionColor;
                    ctx.fillRect(0, y, rowNumWidth, config.rowHeight);
                }

                ctx.strokeRect(0, y, rowNumWidth, config.rowHeight);
                ctx.fillStyle = config.rowNumberTextColor;
                ctx.fillText((r + 1).toString(), rowNumWidth / 2, y + config.rowHeight / 2);
            }
        }

        // 3. Draw Fixed Header
        this.renderHeader(state, config, provider, rowNumWidth);

        // 4. Draw Top-Left Corner
        if (config.showRowNumbers) {
            ctx.fillStyle = config.headerBackground;
            ctx.fillRect(0, 0, rowNumWidth, headerHeight);
            ctx.strokeStyle = config.gridLineColor;
            ctx.strokeRect(0, 0, rowNumWidth, headerHeight);
        }

        // 5. Draw Reordering Overlay (Full Height Insertion Line & Ghost Column)
        this.renderReorderingOverlay(state, config, provider, rowNumWidth);
    }

    private renderHeader(state: ViewportState, config: GridConfig, provider: IDataGridProvider, rowNumOffset: number): void {
        const { width, headerHeight, scrollX, columnOrder, hoveredCol, reorderingCol } = state;
        const ctx = this.ctx;

        ctx.fillStyle = config.headerBackground;
        ctx.fillRect(rowNumOffset, 0, width - rowNumOffset, headerHeight);

        let currentX = rowNumOffset - scrollX;
        const colCount = provider.getColumnCount();
        for (let i = 0; i < colCount; i++) {
            const col = columnOrder[i] ?? i;
            const cWidth = state.columnWidths[col] ?? config.columnWidth;

            if (currentX + cWidth > rowNumOffset && currentX < width) {
                const header = provider.getHeader(col);
                const isBeingReordered = reorderingCol === i;
                const isHovered = hoveredCol === col;

                if (isBeingReordered) {
                    ctx.globalAlpha = 0.2;
                }

                ctx.strokeStyle = config.gridLineColor;
                ctx.strokeRect(currentX, 0, cWidth, headerHeight);

                this.drawHeaderContent(header, currentX, 0, cWidth, headerHeight, config, isHovered);

                if (isBeingReordered) {
                    ctx.globalAlpha = 1.0;
                }
            }
            currentX += cWidth;
        }
    }

    private drawHeaderContent(header: ColumnHeaderInfo, x: number, y: number, width: number, height: number, config: GridConfig, isHovered: boolean): void {
        const ctx = this.ctx;
        const lineCount = 1 + config.headerSubTextCount;
        const lineHeight = height / lineCount;
        const filterSize = 20;

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.clip();

        // 1. Draw Handle (only on hover)
        if (isHovered) {
            ctx.fillStyle = config.headerTextColor;
            ctx.globalAlpha = 0.3;
            for (let i = 0; i < 2; i++) {
                for (let j = 0; j < 3; j++) {
                    ctx.beginPath();
                    ctx.arc(x + 6 + i * 4, y + 6 + j * 4, 1, 0, Math.PI * 2);
                    ctx.fill();
                }
            }
            ctx.globalAlpha = 1.0;
        }

        // 2. Draw Filter Button (only on hover, if allowed)
        if (isHovered && config.allowFiltering && header.isFilterable !== false) {
            const fx = x + width - filterSize - 5;
            const fy = y + 5;
            ctx.fillStyle = config.headerTextColor;
            ctx.globalAlpha = 0.6;
            ctx.beginPath();
            ctx.moveTo(fx + 4, fy + 4);
            ctx.lineTo(fx + 16, fy + 4);
            ctx.lineTo(fx + 11, fy + 10);
            ctx.lineTo(fx + 11, fy + 16);
            ctx.lineTo(fx + 9, fy + 16);
            ctx.lineTo(fx + 9, fy + 10);
            ctx.closePath();
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }

        // 3. Draw Text Layers
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = config.headerTextColor;

        // Name (Top Line)
        ctx.font = config.headerFont;
        ctx.fillText(header.name, x + width / 2, y + lineHeight / 2);

        // Sub-texts
        if (config.headerSubTextCount >= 1) {
            ctx.font = config.font;
            ctx.globalAlpha = 0.6;
            const text = header.units || config.headerPlaceholder;
            ctx.fillText(text, x + width / 2, y + lineHeight * 1.5);
        }

        if (config.headerSubTextCount >= 2) {
            ctx.font = config.font;
            ctx.globalAlpha = 0.6;
            const text = header.description || config.headerPlaceholder;
            ctx.fillText(text, x + width / 2, y + lineHeight * 2.5);
        }

        ctx.restore();
    }

    private renderReorderingOverlay(
        state: ViewportState,
        config: GridConfig,
        provider: IDataGridProvider,
        rowNumOffset: number
    ): void {
        const { ctx } = this;
        const { width, height, headerHeight, scrollX, scrollY } = state;

        // 1. Draw Insertion Indicator (Full Height)
        if (state.reorderingTarget !== null) {
            let currentX = rowNumOffset - scrollX;
            for (let i = 0; i < state.reorderingTarget; i++) {
                const colId = state.columnOrder[i];
                if (colId !== undefined) {
                    currentX += state.columnWidths[colId] ?? config.columnWidth;
                } else {
                    currentX += config.columnWidth;
                }
            }

            ctx.save();
            ctx.strokeStyle = "#4facfe";
            ctx.lineWidth = 4;
            ctx.shadowBlur = 10;
            ctx.shadowColor = "#4facfe";
            ctx.beginPath();
            ctx.moveTo(currentX, 0);
            ctx.lineTo(currentX, height);
            ctx.stroke();
            ctx.restore();
        }

        // 2. Draw Full Ghost Column
        if (state.reorderingCol !== null && state.reorderingX !== null) {
            const actualCol = state.columnOrder[state.reorderingCol] ?? state.reorderingCol;
            const cWidth = state.columnWidths[actualCol] ?? config.columnWidth;
            const ghostX = state.reorderingX - cWidth / 2;

            ctx.save();
            ctx.globalAlpha = 0.6;
            
            // Draw Ghost Header
            ctx.fillStyle = config.headerBackground;
            ctx.fillRect(ghostX, 0, cWidth, headerHeight);
            ctx.strokeStyle = "#4facfe";
            ctx.strokeRect(ghostX, 0, cWidth, headerHeight);
            const header = provider.getHeader(actualCol);
            this.drawHeaderContent(header, ghostX, 0, cWidth, headerHeight, config, false);

            // Draw Ghost Cells
            const startRow = Math.max(0, Math.floor(scrollY / config.rowHeight));
            const endRow = Math.min(
                provider.getRowCount() - 1,
                Math.ceil((scrollY + height) / config.rowHeight)
            );

            ctx.fillStyle = "rgba(18, 18, 20, 0.8)";
            ctx.fillRect(ghostX, headerHeight, cWidth, height - headerHeight);

            for (let r = startRow; r <= endRow; r++) {
                const y = Math.floor(r * config.rowHeight - scrollY + headerHeight);
                const data = provider.getCellData(r, actualCol);
                if (data !== null && data !== undefined) {
                    ctx.fillStyle = config.textColor;
                    ctx.font = config.font;
                    ctx.fillText(data.toString(), ghostX + config.cellPadding, y + config.rowHeight / 2);
                }
                ctx.strokeStyle = "rgba(79, 172, 254, 0.3)";
                ctx.strokeRect(ghostX, y, cWidth, config.rowHeight);
            }

            ctx.restore();
        }
    }
}
