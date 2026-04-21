import type { GridConfig, IDataGridProvider, ViewportState, ColumnHeaderInfo } from "../types/grid.js";
import { formatScientificValue } from "./units.js";

export class GridRenderer {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private dpr: number;

    constructor(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        const ctx = canvas.getContext("2d", { alpha: true });
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
        const { width, height, scrollX, scrollY, selectedRows, selectionMode, headerHeight } = state;

        // Clear background
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = config.backgroundColor;
        ctx.fillRect(0, 0, width, height);

        const rowNumWidth = config.showRowNumbers ? config.rowNumbersWidth : 0;

        // Calculate visible range
        const rowCount = provider.getRowCount();
        if (rowCount === 0) {
            ctx.fillStyle = config.emptyStateColor || "#999999";
            ctx.textAlign = "center";
            ctx.font = config.font;
            ctx.fillText(config.emptyStateText || "No data available", width / 2, height / 2);
            
            // Draw Fixed Header
            this.renderHeader(state, config, provider, rowNumWidth);
            
            // Draw Top-Left Corner
            if (config.showRowNumbers) {
                ctx.fillStyle = config.headerBackground;
                ctx.fillRect(0, 0, rowNumWidth, headerHeight);
                ctx.strokeStyle = config.gridLineColor;
                ctx.strokeRect(0, 0, rowNumWidth, headerHeight);
            }
            return;
        }

        const startRow = Math.max(0, Math.floor(scrollY / config.rowHeight));
        const endRow = Math.min(
            rowCount - 1,
            Math.ceil((scrollY + height) / config.rowHeight)
        );

        // Efficiently find visible columns using binary search on offsets
        const visibleCols: { index: number; x: number; width: number }[] = [];
        const offsets = state.columnOffsets;
        
        // Find first column that ends after scrollX
        let low = 0;
        let high = offsets.length - 2;
        let startIndex = 0;

        while (low <= high) {
            const mid = (low + high) >> 1;
            if (offsets[mid + 1]! > scrollX) {
                startIndex = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }

        for (let i = startIndex; i < provider.getColumnCount(); i++) {
            const actualCol = state.columnOrder[i] ?? i;
            const colWidth = state.columnWidths[actualCol] ?? config.columnWidth;
            const currentX = rowNumWidth - scrollX + offsets[i]!;
            
            if (currentX < width) {
                visibleCols.push({ index: actualCol, x: currentX, width: colWidth });
            } else {
                break;
            }
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
                if (selectionMode === 'all') {
                    isSelected = true;
                } else {
                    for (const range of state.selectionRanges) {
                        if (r >= range.startRow && r <= range.endRow && 
                            c >= range.startCol && c <= range.endCol) {
                            isSelected = true;
                            break;
                        }
                    }
                }

                if (isSelected) {
                    ctx.fillStyle = config.selectionColor;
                    ctx.fillRect(x, y, cWidth, config.rowHeight);
                }

                const data = provider.getCellData(r, c);
                const header = provider.getHeader(c);
                this.drawCellContent(ctx, data, header, x, y, cWidth, config.rowHeight, config, isSelected && selectionMode === 'cell');

                ctx.strokeStyle = config.gridLineColor;
                ctx.lineWidth = 1;
                ctx.strokeRect(x, y, cWidth, config.rowHeight);

                if (isBeingReordered) ctx.globalAlpha = 1.0;
            }
        }
        ctx.restore();

        // 2. Draw Fixed Row Numbers
        if (config.showRowNumbers) {
            ctx.save();
            ctx.beginPath();
            ctx.rect(0, headerHeight, rowNumWidth, height - headerHeight);
            ctx.clip();

            ctx.fillStyle = config.rowNumberBackground;
            ctx.fillRect(0, headerHeight, rowNumWidth, height);

            ctx.fillStyle = config.rowNumberTextColor;
            ctx.strokeStyle = config.gridLineColor;
            ctx.textAlign = 'left';
            for (let r = startRow; r <= endRow; r++) {
                const y = Math.floor(r * config.rowHeight - scrollY + headerHeight);

                if (selectedRows.has(r) && (selectionMode === 'row' || selectionMode === 'cell')) {
                    ctx.fillStyle = config.selectionColor;
                    ctx.fillRect(0, y, rowNumWidth, config.rowHeight);
                }

                ctx.strokeRect(0, y, rowNumWidth, config.rowHeight);
                ctx.fillStyle = config.rowNumberTextColor;
                ctx.fillText((r + 1).toString(), config.cellPadding, y + config.rowHeight / 2);
            }
            ctx.restore();
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
        const { width, headerHeight, scrollX, columnOrder, reorderingCol } = state;
        const ctx = this.ctx;

        ctx.save();
        // Clip headers to stay within their area
        ctx.beginPath();
        ctx.rect(rowNumOffset, 0, width - rowNumOffset, headerHeight);
        ctx.clip();

        ctx.fillStyle = config.headerBackground;
        ctx.fillRect(rowNumOffset, 0, width - rowNumOffset, headerHeight);

        // Efficiently find visible columns using binary search on offsets
        const offsets = state.columnOffsets;
        let low = 0;
        let high = offsets.length - 2;
        let startIndex = 0;

        while (low <= high) {
            const mid = (low + high) >> 1;
            if (offsets[mid + 1]! > scrollX) {
                startIndex = mid;
                high = mid - 1;
            } else {
                low = mid + 1;
            }
        }

        const colCount = provider.getColumnCount();
        for (let i = startIndex; i < colCount; i++) {
            const col = columnOrder[i] ?? i;
            const cWidth = state.columnWidths[col] ?? config.columnWidth;
            const currentX = rowNumOffset - scrollX + offsets[i]!;

            if (currentX < width) {
                const header = provider.getHeader(col);
                const isBeingReordered = reorderingCol === i;

                if (isBeingReordered) {
                    ctx.globalAlpha = 0.2;
                }

                ctx.strokeStyle = config.gridLineColor;
                ctx.strokeRect(currentX, 0, cWidth, headerHeight);

                this.drawHeaderContent(header, currentX, 0, cWidth, headerHeight, config);

                if (isBeingReordered) {
                    ctx.globalAlpha = 1.0;
                }
            } else {
                break;
            }
        }
        ctx.restore();
    }

    private drawHeaderContent(header: ColumnHeaderInfo, x: number, y: number, width: number, height: number, config: GridConfig): void {
        const ctx = this.ctx;
        
        // Dynamic Height Distribution
        const subCount = config.headerSubTextCount;
        let titleH = height;
        let subH = 0;
        
        if (subCount === 1) {
            titleH = height * 0.75;
            subH = height * 0.25;
        } else if (subCount === 2) {
            titleH = height * 0.50;
            subH = height * 0.25;
        }

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.clip();

        // 1. Draw Dividers
        if (subCount > 0) {
            ctx.strokeStyle = config.headerDividerColor || config.gridLineColor;
            ctx.lineWidth = 1;
            ctx.globalAlpha = config.headerDividerAlpha ?? 0.2;
            
            // First divider (after title)
            ctx.beginPath();
            ctx.moveTo(x, y + titleH);
            ctx.lineTo(x + width, y + titleH);
            ctx.stroke();

            // Second divider (if 3 lines total)
            if (subCount === 2) {
                ctx.beginPath();
                ctx.moveTo(x, y + titleH + subH);
                ctx.lineTo(x + width, y + titleH + subH);
                ctx.stroke();
            }
            ctx.globalAlpha = 1.0;
        }

        // 2. Draw Mark Icon
        if (header.markIcon) {
            ctx.fillStyle = config.headerTitleStyle?.color || config.headerTextColor;
            ctx.font = "bold 14px sans-serif";
            ctx.textAlign = 'right';
            ctx.textBaseline = 'top';
            ctx.fillText(header.markIcon, x + width - 5, y + 4);
        }
        
        // 3. Draw Sort Icon
        if (header.sortOrder) {
            ctx.fillStyle = config.headerTextColor;
            ctx.font = "10px sans-serif";
            ctx.textAlign = 'right';
            ctx.textBaseline = 'middle';
            const arrow = header.sortOrder === 'asc' ? '▲' : '▼';
            ctx.fillText(arrow, x + width - (header.markIcon ? 20 : 8), y + (subCount === 0 ? height/2 : titleH/2));
        }

        // 3. Draw Text Layers
        const padding = config.cellPadding;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';

        // --- Title ---
        const tStyle = config.headerTitleStyle;
        ctx.font = tStyle?.font || config.headerFont;
        ctx.fillStyle = tStyle?.color || config.headerTextColor;
        ctx.globalAlpha = tStyle?.alpha ?? 1.0;
        ctx.fillText(header.name || "", x + padding, y + titleH / 2);

        // --- Sub-texts ---
        if (subCount >= 1) {
            const uStyle = config.headerUnitsStyle;
            ctx.font = uStyle?.font || `italic ${Math.max(6, Math.floor(height/6))}px Inter, sans-serif`;
            ctx.fillStyle = uStyle?.color || config.headerTextColor;
            ctx.globalAlpha = uStyle?.alpha ?? 0.6;
            const text = header.units || config.headerPlaceholder;
            ctx.fillText(text, x + padding, y + titleH + subH / 2);
        }

        if (subCount === 2) {
            const dStyle = config.headerDescriptionStyle;
            ctx.font = dStyle?.font || `italic ${Math.max(6, Math.floor(height/8))}px Inter, sans-serif`;
            ctx.fillStyle = dStyle?.color || config.headerTextColor;
            ctx.globalAlpha = dStyle?.alpha ?? 0.6;
            const text = header.description || config.headerPlaceholder;
            ctx.fillText(text, x + padding, y + titleH + subH + subH / 2);
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
        const { height, headerHeight, scrollX, scrollY } = state;

        // 1. Draw Insertion Indicator (Full Height)
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

            // Calculate height limit
            const totalContentHeight = provider.getRowCount() * config.rowHeight + headerHeight - scrollY;
            const indicatorHeight = Math.min(height, Math.max(headerHeight, totalContentHeight));

            const drawColor = config.dragHandleColor || "#4facfe";

            ctx.save();
            ctx.strokeStyle = drawColor;
            ctx.lineWidth = 4;
            // Removed shadow to avoid visual artifacts
            ctx.beginPath();
            ctx.moveTo(currentX, 0);
            ctx.lineTo(currentX, indicatorHeight);
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
            this.drawHeaderContent(header, ghostX, 0, cWidth, headerHeight, config);

            // Draw Ghost Cells
            const startRow = Math.max(0, Math.floor(scrollY / config.rowHeight));
            const endRow = Math.min(
                provider.getRowCount() - 1,
                Math.ceil((scrollY + height) / config.rowHeight)
            );

            // Limit ghost background to content height
            const contentHeight = provider.getRowCount() * config.rowHeight;
            const ghostBodyHeight = Math.min(height - headerHeight, contentHeight - scrollY);

            if (ghostBodyHeight > 0) {
                ctx.fillStyle = "rgba(18, 18, 20, 0.8)";
                ctx.fillRect(ghostX, headerHeight, cWidth, ghostBodyHeight);
            }

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

    private drawCellContent(
        ctx: CanvasRenderingContext2D,
        data: any,
        header: ColumnHeaderInfo,
        x: number,
        y: number,
        width: number,
        height: number,
        config: GridConfig,
        isSelected: boolean
    ): void {
        const type = header.type || 'text';
        const padding = config.cellPadding;
        const textColor = isSelected ? config.selectedTextColor : config.textColor;

        ctx.save();
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.clip();

        if (type === 'checkbox') {
            const boxSize = 14;
            const bx = x + (width - boxSize) / 2;
            const by = y + (height - boxSize) / 2;
            const isChecked = !!data;

            ctx.beginPath();
            ctx.rect(bx, by, boxSize, boxSize);
            ctx.strokeStyle = '#999';
            ctx.stroke();

            if (isChecked) {
                ctx.fillStyle = '#4facfe';
                ctx.fillRect(bx + 2, by + 2, boxSize - 4, boxSize - 4);
            }
            return;
        }

        if (type === 'progress') {
            const val = typeof data === 'number' ? Math.min(100, Math.max(0, data)) : 0;
            const barHeight = height * 0.6;
            const barY = y + (height - barHeight) / 2;
            const barWidth = width - padding * 2;
            const barX = x + padding;

            // Background
            ctx.fillStyle = config.alternateRowColor || "#e0e0e033";
            ctx.fillRect(barX, barY, barWidth, barHeight);

            // Fill
            ctx.fillStyle = "#4facfe";
            ctx.fillRect(barX, barY, barWidth * (val / 100), barHeight);
            
            // Text overlay
            ctx.fillStyle = textColor;
            ctx.font = "10px sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(`${val}%`, x + width / 2, y + height / 2);
            return;
        }

        if (type === 'sparkline' && Array.isArray(data)) {
            const points = data as number[];
            if (points.length > 1) {
                const sw = width - padding * 2;
                const sh = height * 0.6;
                const sx = x + padding;
                const sy = y + (height - sh) / 2;

                const min = Math.min(...points);
                const max = Math.max(...points);
                const range = max - min || 1;

                ctx.save();
                ctx.beginPath();
                ctx.strokeStyle = "#4facfe";
                ctx.lineWidth = 1.5;
                points.forEach((p, i) => {
                    const px = sx + (i / (points.length - 1)) * sw;
                    const py = sy + sh - ((p - min) / range) * sh;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                });
                ctx.stroke();
                ctx.restore();
            }
            return;
        }

        // Default Text or Select
        if (data !== null && data !== undefined) {
            ctx.fillStyle = textColor;
            const alignment = header.align || (type === 'numeric' ? 'right' : 'left');
            ctx.textAlign = alignment;
            ctx.font = config.font;
            
            let text = data.toString();
            if (type === 'numeric' && header.units && typeof data === 'number') {
                text = formatScientificValue(data, header.units);
            }
            
            const measuredWidth = ctx.measureText(text).width;
            const availableWidth = width - (padding * 2);

            // 1. Optional Masking
            if (type === 'numeric' && config.maskNumericValues && measuredWidth > availableWidth) {
                text = "####";
            } else if (config.maskTextValues && type !== 'numeric' && measuredWidth > availableWidth) {
                text = config.textMaskString || "...";
            }

            // 2. Alignment Logic
            // If text is too long for the cell, always align LEFT to show the start of the value
            if (measuredWidth > availableWidth) {
                ctx.textAlign = 'left';
                ctx.fillText(text, x + padding, y + height / 2);
            } else {
                ctx.textAlign = alignment;
                let textX = x + padding;
                if (alignment === 'right') {
                    textX = x + width - padding;
                } else if (alignment === 'center') {
                    textX = x + width / 2;
                }
                ctx.fillText(text, textX, y + height / 2);
            }
        }

        if (type === 'select') {
             // Draw small arrow
             ctx.fillStyle = textColor;
             ctx.globalAlpha = 0.5;
             ctx.beginPath();
             const ax = x + width - 15;
             const ay = y + height / 2 - 2;
             ctx.moveTo(ax, ay);
             ctx.lineTo(ax + 8, ay);
             ctx.lineTo(ax + 4, ay + 5);
             ctx.fill();
             ctx.globalAlpha = 1.0;
        }

        ctx.restore();
    }
}
