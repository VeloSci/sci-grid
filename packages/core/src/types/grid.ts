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
