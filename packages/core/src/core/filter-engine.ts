import type { GridDataValue, ColumnFilter, SortState, IDataGridProvider, GroupConfig } from "../types/grid.js";

/** Result of filtering + sorting + grouping: maps virtual row index → real row index */
export interface DataView {
    /** Mapped row indices (virtual → real) */
    rowMap: number[];
    /** Total visible rows */
    visibleRowCount: number;
    /** Group boundaries: { groupValue, startIndex, endIndex, collapsed } */
    groups: GroupInfo[];
}

export interface GroupInfo {
    value: GridDataValue;
    startIndex: number; // in rowMap
    endIndex: number;   // in rowMap (inclusive)
    collapsed: boolean;
    rowCount: number;
}

export class FilterEngine {
    private collapsedGroups = new Set<string>();

    /** Apply filters, then sort, then group. Returns a DataView. */
    public buildView(
        provider: IDataGridProvider,
        filters: ColumnFilter[],
        sorts: SortState[],
        quickFilterText: string,
        groupBy?: GroupConfig
    ): DataView {
        const totalRows = provider.getRowCount();
        const colCount = provider.getColumnCount();

        // 1. Filter
        let rows: number[] = [];
        for (let r = 0; r < totalRows; r++) {
            if (this.matchesFilters(provider, r, filters, colCount) &&
                this.matchesQuickFilter(provider, r, quickFilterText, colCount)) {
                rows.push(r);
            }
        }

        // 2. Sort
        if (sorts.length > 0) {
            rows.sort((a, b) => {
                for (const s of sorts) {
                    const va = provider.getCellData(a, s.col);
                    const vb = provider.getCellData(b, s.col);
                    const cmp = this.compare(va, vb);
                    if (cmp !== 0) return s.order === 'asc' ? cmp : -cmp;
                }
                return a - b; // stable: preserve original order
            });
        }

        // 3. Group
        let groups: GroupInfo[] = [];
        if (groupBy) {
            const groupMap = new Map<string, number[]>();
            const groupOrder: string[] = [];
            for (const r of rows) {
                const val = provider.getCellData(r, groupBy.col);
                const key = String(val ?? '');
                if (!groupMap.has(key)) {
                    groupMap.set(key, []);
                    groupOrder.push(key);
                }
                groupMap.get(key)!.push(r);
            }

            const finalRows: number[] = [];
            for (const key of groupOrder) {
                const groupRows = groupMap.get(key)!;
                const collapsed = this.collapsedGroups.has(key);
                const start = finalRows.length;
                if (!collapsed) {
                    finalRows.push(...groupRows);
                }
                groups.push({
                    value: key,
                    startIndex: start,
                    endIndex: collapsed ? start - 1 : start + groupRows.length - 1,
                    collapsed,
                    rowCount: groupRows.length,
                });
            }
            rows = finalRows;
        }

        return { rowMap: rows, visibleRowCount: rows.length, groups };
    }

    public toggleGroup(groupValue: string) {
        const key = String(groupValue);
        if (this.collapsedGroups.has(key)) {
            this.collapsedGroups.delete(key);
        } else {
            this.collapsedGroups.add(key);
        }
    }

    public isGroupCollapsed(groupValue: string): boolean {
        return this.collapsedGroups.has(String(groupValue));
    }

    // ── Filter matching ─────────────────────────────────────────────

    private matchesFilters(provider: IDataGridProvider, row: number, filters: ColumnFilter[], _colCount: number): boolean {
        for (const f of filters) {
            const val = provider.getCellData(row, f.col);
            if (!this.matchFilter(val, f)) return false;
        }
        return true;
    }

    private matchFilter(val: GridDataValue, f: ColumnFilter): boolean {
        switch (f.operator) {
            case 'empty': return val === null || val === undefined || val === '';
            case 'notEmpty': return val !== null && val !== undefined && val !== '';
            case 'eq': return val == f.value;
            case 'neq': return val != f.value;
            case 'gt': return this.compare(val, f.value) > 0;
            case 'gte': return this.compare(val, f.value) >= 0;
            case 'lt': return this.compare(val, f.value) < 0;
            case 'lte': return this.compare(val, f.value) <= 0;
            case 'contains': return String(val ?? '').toLowerCase().includes(String(f.value ?? '').toLowerCase());
            case 'notContains': return !String(val ?? '').toLowerCase().includes(String(f.value ?? '').toLowerCase());
            case 'startsWith': return String(val ?? '').toLowerCase().startsWith(String(f.value ?? '').toLowerCase());
            case 'endsWith': return String(val ?? '').toLowerCase().endsWith(String(f.value ?? '').toLowerCase());
            case 'between': return this.compare(val, f.value) >= 0 && this.compare(val, f.valueTo) <= 0;
            default: return true;
        }
    }

    private matchesQuickFilter(provider: IDataGridProvider, row: number, text: string, colCount: number): boolean {
        if (!text) return true;
        const lower = text.toLowerCase();
        for (let c = 0; c < colCount; c++) {
            const val = provider.getCellData(row, c);
            if (val !== null && val !== undefined && String(val).toLowerCase().includes(lower)) return true;
        }
        return false;
    }

    // ── Comparison ──────────────────────────────────────────────────

    private compare(a: GridDataValue, b: GridDataValue): number {
        if (a === b) return 0;
        if (a === null || a === undefined) return -1;
        if (b === null || b === undefined) return 1;
        if (typeof a === 'number' && typeof b === 'number') return a - b;
        return String(a).localeCompare(String(b), undefined, { numeric: true, sensitivity: 'base' });
    }

    // ── Aggregation ─────────────────────────────────────────────────

    public static aggregate(provider: IDataGridProvider, rows: number[], col: number, type: string): GridDataValue {
        if (rows.length === 0) return null;
        switch (type) {
            case 'count': return rows.length;
            case 'sum': {
                let s = 0;
                for (const r of rows) { const v = provider.getCellData(r, col); if (typeof v === 'number') s += v; }
                return s;
            }
            case 'avg': {
                let s = 0, n = 0;
                for (const r of rows) { const v = provider.getCellData(r, col); if (typeof v === 'number') { s += v; n++; } }
                return n > 0 ? s / n : null;
            }
            case 'min': {
                let m = Infinity;
                for (const r of rows) { const v = provider.getCellData(r, col); if (typeof v === 'number' && v < m) m = v; }
                return m === Infinity ? null : m;
            }
            case 'max': {
                let m = -Infinity;
                for (const r of rows) { const v = provider.getCellData(r, col); if (typeof v === 'number' && v > m) m = v; }
                return m === -Infinity ? null : m;
            }
            default: return null;
        }
    }
}
