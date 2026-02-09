import type { GridDataValue } from "../types/grid.js";

export interface UndoAction {
    type: 'cell' | 'paste';
    changes: { row: number; col: number; oldValue: GridDataValue; newValue: GridDataValue }[];
}

export class UndoManager {
    private undoStack: UndoAction[] = [];
    private redoStack: UndoAction[] = [];
    private maxSize: number;

    constructor(maxSize = 100) {
        this.maxSize = maxSize;
    }

    public push(action: UndoAction) {
        this.undoStack.push(action);
        if (this.undoStack.length > this.maxSize) this.undoStack.shift();
        this.redoStack = []; // Clear redo on new action
    }

    public undo(): UndoAction | null {
        const action = this.undoStack.pop();
        if (!action) return null;
        this.redoStack.push(action);
        return action;
    }

    public redo(): UndoAction | null {
        const action = this.redoStack.pop();
        if (!action) return null;
        this.undoStack.push(action);
        return action;
    }

    public canUndo(): boolean { return this.undoStack.length > 0; }
    public canRedo(): boolean { return this.redoStack.length > 0; }
    public clear() { this.undoStack = []; this.redoStack = []; }
}
