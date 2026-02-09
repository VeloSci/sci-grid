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
    align?: 'left' | 'right' | 'center';
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

export type ContextMenuZone = 'header' | 'rowNumber' | 'cell' | 'multiCell';

export interface ContextMenuContext {
    zone: ContextMenuZone;
    row?: number;
    col?: number;
    /** Selected rows (for rowNumber zone or multi-selection) */
    selectedRows?: number[];
    /** Selected columns (for header zone) */
    selectedCols?: number[];
    /** All current selection ranges */
    selectionRanges?: SelectionRange[];
}

export interface ContextMenuItem {
    id?: string;
    label: string;
    action: () => void;
    icon?: string;
    disabled?: boolean;
    /** If true, shows a checkmark indicator */
    checked?: boolean;
    /** Keyboard shortcut hint displayed on the right (e.g. 'Ctrl+C') */
    shortcut?: string;
    /** Sub-items for nested menus */
    children?: (ContextMenuItem | 'divider' | ContextMenuSection)[];
}

/** A labeled section header inside a context menu */
export interface ContextMenuSection {
    type: 'section';
    label: string;
}

// ── v1.2: Cell Editing & Validation ─────────────────────────────

/** Cell edit event passed to onCellEdit */
export interface CellEditEvent {
    row: number;
    col: number;
    oldValue: GridDataValue;
    newValue: GridDataValue;
}

/** Validator function: return true if valid, or a string error message */
export type CellValidator = (value: GridDataValue, row: number, col: number) => true | string;

/** Conditional formatting rule */
export interface CellFormattingRule {
    /** Which columns this rule applies to (omit for all) */
    columns?: number[];
    /** Condition function */
    condition: (value: GridDataValue, row: number, col: number) => boolean;
    /** Style to apply when condition is true */
    style: {
        backgroundColor?: string;
        textColor?: string;
        fontWeight?: string;
        icon?: string;
    };
}

// ── v1.3: Filtering & Sorting ───────────────────────────────────

export type FilterOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'between' | 'empty' | 'notEmpty';

export interface ColumnFilter {
    col: number;
    operator: FilterOperator;
    value: GridDataValue;
    /** Second value for 'between' operator */
    valueTo?: GridDataValue;
}

export interface SortState {
    col: number;
    order: 'asc' | 'desc';
}

// ── v1.4: Grouping & Aggregation ────────────────────────────────

export type AggregationType = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'none';

export interface GroupConfig {
    /** Column index to group by */
    col: number;
    /** Aggregations to show for each group */
    aggregations?: Record<number, AggregationType>;
}

export interface FooterRow {
    /** Aggregation per column */
    aggregations: Record<number, AggregationType>;
    /** Custom label for the footer (default: 'Total') */
    label?: string;
}

export interface PinnedRow {
    position: 'top' | 'bottom';
    data: Record<number, GridDataValue>;
    style?: {
        backgroundColor?: string;
        textColor?: string;
        fontWeight?: string;
    };
}

/** Describes a keyboard shortcut binding */
export interface KeyboardShortcut {
    key: string;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
}

/** User-configurable keyboard shortcuts for all grid actions */
export interface KeyboardShortcuts {
    copy?: KeyboardShortcut | null;
    selectAll?: KeyboardShortcut | null;
    moveUp?: KeyboardShortcut | null;
    moveDown?: KeyboardShortcut | null;
    moveLeft?: KeyboardShortcut | null;
    moveRight?: KeyboardShortcut | null;
    pageUp?: KeyboardShortcut | null;
    pageDown?: KeyboardShortcut | null;
    moveToStart?: KeyboardShortcut | null;
    moveToEnd?: KeyboardShortcut | null;
    contextMenu?: KeyboardShortcut | null;
    undo?: KeyboardShortcut | null;
    redo?: KeyboardShortcut | null;
    paste?: KeyboardShortcut | null;
    edit?: KeyboardShortcut | null;
    delete?: KeyboardShortcut | null;
    /** Custom user-defined shortcuts */
    [action: string]: KeyboardShortcut | null | undefined;
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
    onRowNumberContextMenu?: ((row: number, e: MouseEvent) => void) | undefined;
    onContextMenu?: ((row: number, col: number, e: MouseEvent) => void) | undefined;
    onSort?: ((col: number, order: 'asc' | 'desc' | null) => void) | undefined;
    /** @deprecated Use getContextMenuItems with context parameter instead */
    getContextMenuItems?: (defaultItems: (ContextMenuItem | 'divider' | ContextMenuSection)[], context?: ContextMenuContext) => (ContextMenuItem | 'divider' | ContextMenuSection)[];
    onSelectionChange?: ((info: SelectionInfo) => void) | undefined;
    /** Configurable keyboard shortcuts. Set an action to null to disable it. */
    keyboardShortcuts?: Partial<KeyboardShortcuts>;
    /** Callback for custom keyboard shortcut actions */
    onShortcut?: ((action: string, e: KeyboardEvent) => void) | undefined;
    emptyStateText?: string;
    persistenceKey?: string;      // Key to save/load state from localStorage
    maskNumericValues?: boolean;  // If true, show #### when number doesn't fit
    maskTextValues?: boolean;     // If true, apply a mask when text doesn't fit
    textMaskString?: string;      // The string to use for text masking (default "...")

    // ── v1.2: Cell Editing & Validation ──
    /** Per-column validators */
    validators?: Record<number, CellValidator>;
    /** Called after a cell is edited */
    onCellEdit?: (event: CellEditEvent) => void;
    /** Conditional formatting rules */
    formattingRules?: CellFormattingRule[];
    /** Max undo history size (default: 100) */
    undoHistorySize?: number;
    /** Show formula bar above the grid */
    showFormulaBar?: boolean;

    // ── v1.3: Filtering & Sorting ──
    /** Active column filters */
    filters?: ColumnFilter[];
    /** Called when filters change via the UI */
    onFilterChange?: (filters: ColumnFilter[]) => void;
    /** Multi-column sort state */
    sortState?: SortState[];
    /** Called when sort changes */
    onSortChange?: (sorts: SortState[]) => void;
    /** Show quick filter bar */
    showQuickFilter?: boolean;
    /** Quick filter text */
    quickFilterText?: string;
    /** Called when quick filter text changes */
    onQuickFilterChange?: (text: string) => void;

    // ── v1.4: Grouping & Aggregation ──
    /** Group configuration */
    groupBy?: GroupConfig;
    /** Footer row configuration */
    footerRow?: FooterRow;
    /** Pinned rows (top/bottom) */
    pinnedRows?: PinnedRow[];
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
