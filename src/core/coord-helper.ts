import type { ViewportState, GridConfig } from "../types/grid.ts";

export function getColumnWidth(state: ViewportState, config: GridConfig, col: number): number {
    if (col === -1) return config.rowNumbersWidth;
    return state.columnWidths[col] ?? config.columnWidth;
}

export function getColumnOffset(state: ViewportState, colIndex: number): number {
    return state.columnOffsets[colIndex] ?? state.columnOffsets[state.columnOffsets.length - 1] ?? 0;
}

export function getColumnAt(state: ViewportState, x: number): number {
    const offsets = state.columnOffsets;
    if (!offsets || offsets.length === 0) return -1;
    
    let low = 0;
    let high = offsets.length - 2;

    while (low <= high) {
        const mid = (low + high) >> 1;
        const start = offsets[mid]!;
        const end = offsets[mid + 1]!;
        
        if (x >= start && x < end) return mid;
        if (x < start) high = mid - 1;
        else low = mid + 1;
    }
    
    const totalWidth = offsets[offsets.length - 1] || 0;
    if (x >= totalWidth) return Math.max(0, offsets.length - 2);
    return -1;
}
