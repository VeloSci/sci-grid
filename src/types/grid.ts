export type GridDataValue = string | number | null | undefined;

export interface ColumnHeaderInfo {
    name: string;
    units?: string;
    description?: string;
    variant?: 'numeric' | 'text' | 'date';
    isEditable?: boolean;
    isResizable?: boolean;
    isSortable?: boolean;
    isFilterable?: boolean;
}

export interface IDataGridProvider {
    getRowCount(): number;
    getColumnCount(): number;
    getCellData(row: number, col: number): GridDataValue;
    getHeader(col: number): ColumnHeaderInfo;
    // Optional: direct access to typed arrays for performance
    getRawData?(): Float32Array | Float64Array | null;
    setCellData?(row: number, col: number, value: any): void;
    setHeader?(col: number, header: ColumnHeaderInfo): void;
}

export interface GridStyle {
    backgroundColor: string;
    gridLineColor: string;
    textColor: string;
    font: string;
    headerBackground: string;
    headerTextColor: string;
    headerFont: string;
    selectionColor: string;
    selectedTextColor: string;
    alternateRowColor?: string;
    cellPadding: number;
    // New Styles
    rowNumberBackground: string;
    rowNumberTextColor: string;
    scrollbarColor?: string;
    scrollbarThumbColor?: string;
}

export interface GridConfig extends GridStyle {
    rowHeight: number;
    columnWidth: number;
    headerHeight: number;
    showRowNumbers: boolean;
    rowNumbersWidth: number;
    // Header Configuration
    headerSubTextCount: 0 | 1 | 2; // Number of optional sub-fields (units, description)
    headerPlaceholder: string;    // Global placeholder for empty sub-fields
    allowResizing: boolean;      // Global toggle
    allowFiltering: boolean;     // Global toggle
}

export type SelectionMode = 'cell' | 'row' | 'column' | 'all';

export interface ViewportState {
    scrollX: number;
    scrollY: number;
    width: number;
    height: number;
    headerHeight: number;
    columnWidths: Record<number, number>;
    columnOrder: number[];
    selectedRows: Set<number>;
    selectedCols: Set<number>;
    anchorRow: number | null;
    anchorCol: number | null;
    resizingCol: number | null;
    reorderingCol: number | null;
    reorderingTarget: number | null;
    reorderingX: number | null;
    hoveredCol: number | null;
    selectionMode: SelectionMode;
}
