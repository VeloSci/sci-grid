import type { ViewportState, GridConfig, IDataGridProvider } from "../types/grid.js";

export class DataManager {
    constructor(
        private state: ViewportState,
        private provider: IDataGridProvider,
        private config: GridConfig
    ) {}

    public saveState(): void {
        if (!this.config.persistenceKey) return;
        const data = { columnOrder: this.state.columnOrder, columnWidths: this.state.columnWidths };
        localStorage.setItem(`scigrid_state_${this.config.persistenceKey}`, JSON.stringify(data));
    }

    public loadState(): any {
        if (!this.config.persistenceKey) return null;
        const raw = localStorage.getItem(`scigrid_state_${this.config.persistenceKey}`);
        try { return raw ? JSON.parse(raw) : null; } catch { return null; }
    }

    public async copyToClipboard(): Promise<void> {
        const ranges = this.state.selectionRanges;
        if (ranges.length === 0) return;

        let minR = Infinity, maxR = -Infinity, minC = Infinity, maxC = -Infinity;
        for (const r of ranges) {
            minR = Math.min(minR, r.startRow); maxR = Math.max(maxR, r.endRow);
            minC = Math.min(minC, r.startCol); maxC = Math.max(maxC, r.endCol);
        }

        let csv = "";
        for (let r = minR; r <= maxR; r++) {
            const line: string[] = [];
            for (let c = minC; c <= maxC; c++) {
                let sel = false;
                for (const range of ranges) if (r >= range.startRow && r <= range.endRow && c >= range.startCol && c <= range.endCol) { sel = true; break; }
                const val = sel ? this.provider.getCellData(r, c) : "";
                line.push(val !== null && val !== undefined ? `"${val.toString().replace(/"/g, '""')}"` : "");
            }
            csv += line.join("\t") + "\n";
        }
        await navigator.clipboard.writeText(csv).catch(err => console.error('Copy failed:', err));
    }

    public getCsvData(delimiter = ","): string {
        const rows = this.provider.getRowCount();
        let csv = "";

        // Headers
        const headerCounts = this.state.columnOrder.map(c => this.provider.getHeader(c).name).length;
        if (headerCounts > 0) {
           const headers = this.state.columnOrder.map(c => `"${(this.provider.getHeader(c).name || "").replace(/"/g, '""')}"`);
           csv += headers.join(delimiter) + "\n";
        }

        // Data
        for (let r = 0; r < rows; r++) {
            const line: string[] = [];
            for (let c of this.state.columnOrder) {
                const val = this.provider.getCellData(r, c);
                 line.push(val !== null && val !== undefined ? `"${val.toString().replace(/"/g, '""')}"` : "");
            }
            csv += line.join(delimiter) + "\n";
        }
        return csv;
    }

    public downloadAsCsv(filename = "export.csv"): void {
        const csv = this.getCsvData();
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }
}
