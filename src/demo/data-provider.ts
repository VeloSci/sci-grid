
import type { IDataGridProvider, ColumnHeaderInfo } from '../types/grid.ts';

export class ExcelDataProvider implements IDataGridProvider {
    rows: number;
    cols: number;
    data: Float64Array;
    headerMap: Map<number, ColumnHeaderInfo>;
    stringData: Map<string, string>;

    constructor(rows: number, cols: number) {
        this.rows = rows;
        this.cols = cols;
        this.data = new Float64Array(rows * cols);
        this.headerMap = new Map();
        this.stringData = new Map();
        
        for (let i = 0; i < this.rows; i++) {
            const baseIndex = i * this.cols;
            
            // Col 0: ID
            this.data[baseIndex] = i + 1;
            
            // Col 1: Time
            this.data[baseIndex + 1] = Date.now() / 1000 + i;

            // Col 2: Power (Progress 0-100)
            this.data[baseIndex + 2] = Math.floor(Math.random() * 100);

            // Col 3: Status (Checkbox 0 or 1)
            this.data[baseIndex + 3] = Math.random() > 0.5 ? 1 : 0;

            // Fill random for others
            for(let j=5; j<this.cols; j++) {
                this.data[baseIndex + j] = Math.floor(Math.random() * 10000) / 100;
            }

            // Region (Select) - Store in sparse map for strings
            const regions = ['EU-West', 'US-East', 'Asia-Pac'];
            const rIndex = Math.floor(Math.random() * regions.length);
            this.stringData.set(`${i}:4`, regions[rIndex]);
        }
    }

    getRowCount(): number { return this.rows; }
    getColumnCount(): number { return this.cols; }
    
    getCellData(row: number, col: number): any {
        if (col === 4) return this.stringData.get(`${row}:${col}`);
        return this.data[row * this.cols + col];
    }
    
    setCellData(row: number, col: number, value: any): void {
        if (col === 4) {
            this.stringData.set(`${row}:${col}`, value as string);
            return;
        }
        const numericValue = parseFloat(value as string);
        if (!isNaN(numericValue)) {
            this.data[row * this.cols + col] = numericValue;
        }
    }
    
    getHeader(col: number): ColumnHeaderInfo {
        if (this.headerMap.has(col)) return this.headerMap.get(col)!;

        let header: ColumnHeaderInfo;
        if (col === 0) header = { name: "ID", type: 'numeric', description: "Auto-inc" };
        else if (col === 1) header = { name: "TIME", units: "s", description: "Primary", type: 'numeric', markIcon: '⭐' };
        else if (col === 2) header = { name: "POWER", units: "mW", description: "Sensor A", type: 'progress' };
        else if (col === 3) header = { name: "STATUS", type: 'checkbox', description: "Active" };
        else if (col === 4) header = { name: "REGION", type: 'select', selectOptions: ['EU-West', 'US-East', 'Asia-Pac'], description: "Zone" };
        else if (col === 5) header = { name: "SIGNAL", units: "V", description: "Raw input", type: 'numeric', markIcon: '🚩' };
        else {
            let label = "";
            let n = col;
            while (n >= 0) {
                label = String.fromCharCode((n % 26) + 65) + label;
                n = Math.floor(n / 26) - 1;
            }
            header = { name: label };
        }
        return header;
    }

    setHeader(col: number, header: ColumnHeaderInfo): void {
        this.headerMap.set(col, header);
    }
}
