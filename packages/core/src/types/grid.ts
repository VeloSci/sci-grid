export type GridDataValue = string | number | boolean | number[] | null | undefined;

export type ColumnType = 'text' | 'numeric' | 'date' | 'checkbox' | 'select' | 'progress' | 'sparkline';

export interface ColumnHeaderInfo {
    name: string;
    units?: string;
    description?: string;
    type?: ColumnType;
    selectOptions?: string[]; // For 'select' type
    isEditable?: boolean;
    isResizable?: boolean;
    isSortable?: boolean;
    sortOrder?: 'asc' | 'desc' | null;
    markIcon?: string; // Character, Emoji or Symbol to show in top-right
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
    onRowsNeeded?(start: number, end: number): void; // Hook for infinite loading
}

export interface HeaderLineStyle {
    font?: string;
    color?: string;
    alpha?: number;
}

export interface GridStyle {
    backgroundColor: string;
    gridLineColor: string;
    textColor: string;
    font: string;
    headerBackground: string;
    headerTextColor: string;
    headerFont: string;
    // Specialized Header Styling
    headerTitleStyle?: HeaderLineStyle;
    headerUnitsStyle?: HeaderLineStyle;
    headerDescriptionStyle?: HeaderLineStyle;
    headerDividerColor?: string;
    headerDividerAlpha?: number;

    selectionColor: string;
    selectedTextColor: string;
    alternateRowColor?: string;
    cellPadding: number;
    // New Styles
    rowNumberBackground: string;
    rowNumberTextColor: string;
    scrollbarColor?: string;
    scrollbarThumbColor?: string;
    dragHandleColor?: string;
    emptyStateColor?: string;
}

export interface SelectionRange {
    startRow: number;
    endRow: number;
    startCol: number;
    endCol: number;
}

export interface SelectionInfo {
    mode: SelectionMode;
    ranges: SelectionRange[];
    anchorRow: number | null;
    anchorCol: number | null;
}

export interface ContextMenuItem {
    id?: string;
    label: string;
    action: () => void;
    icon?: string;
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
    onHeaderContextMenu?: ((col: number, e: MouseEvent) => void) | undefined;
    onSort?: ((col: number, order: 'asc' | 'desc' | null) => void) | undefined;
    getContextMenuItems?: (defaultItems: (ContextMenuItem | 'divider')[]) => (ContextMenuItem | 'divider')[];
    onSelectionChange?: ((info: SelectionInfo) => void) | undefined;
    emptyStateText?: string;
    persistenceKey?: string;      // Key to save/load state from localStorage
    maskNumericValues?: boolean;  // If true, show #### when number doesn't fit
    maskTextValues?: boolean;     // If true, apply a mask when text doesn't fit
    textMaskString?: string;      // The string to use for text masking (default "...")
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
    columnOffsets: number[]; // Cumulative offsets for binary search optimization
    selectedRows: Set<number>;
    selectedCols: Set<number>;
    selectionRanges: SelectionRange[];
    anchorRow: number | null;
    anchorCol: number | null;
    resizingCol: number | null;
    reorderingCol: number | null;
    reorderingTarget: number | null;
    reorderingX: number | null;
    hoveredCol: number | null;
    selectionMode: SelectionMode;
}
