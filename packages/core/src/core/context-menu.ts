import type { GridConfig, ContextMenuItem } from "../types/grid.js";

// Internal type to include divider
type MenuEntry = ContextMenuItem | 'divider';


export class ContextMenuManager {
    private menu: HTMLElement | null = null;

    constructor(
        private container: HTMLElement,
        private config: GridConfig,
        private actions: {
            copyToClipboard: () => void;
            exportToCsv: () => void;
            invalidate: () => void;
            resolveCoords: (e: MouseEvent) => { row: number; col: number } | null;
        }
    ) {
        this.container.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
        window.addEventListener('mousedown', (e) => {
            if (this.menu && !this.menu.contains(e.target as Node)) {
                this.closeMenu();
            }
        });
    }

    private handleContextMenu(e: MouseEvent) {
        const coords = this.actions.resolveCoords(e);
        
        if (this.config.onContextMenu && coords) {
            this.config.onContextMenu(coords.row, coords.col, e);
            if (e.defaultPrevented) return;
        }

        e.preventDefault();
        this.closeMenu();

        const defaultItems: MenuEntry[] = [
            { id: 'copy', label: 'Copy Selected', action: () => this.actions.copyToClipboard() },
            { id: 'export-csv', label: 'Export as CSV', action: () => this.actions.exportToCsv() },
            'divider',
            { id: 'refresh', label: 'Refresh Grid', action: () => this.actions.invalidate() }
        ];

        let items: MenuEntry[] = defaultItems;
        if (this.config.getContextMenuItems) {
            items = this.config.getContextMenuItems(defaultItems);
        }

        if (items.length > 0) {
            this.renderMenu(e.clientX, e.clientY, items);
        }
    }

    private renderMenu(x: number, y: number, items: MenuEntry[]) {
        const menu = document.createElement('div');
        this.menu = menu;
        Object.assign(menu.style, {
            position: 'fixed', left: `${x}px`, top: `${y}px`,
            backgroundColor: this.config.headerBackground || '#ffffff',
            color: this.config.headerTextColor || '#333333',
            border: `1px solid ${this.config.gridLineColor}`,
            boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
            borderRadius: '6px', padding: '4px 0', zIndex: '2000',
            minWidth: '160px', font: this.config.font || '12px Inter, sans-serif'
        });

        items.forEach(item => {
            if (item === 'divider') {
                const div = document.createElement('div');
                div.style.height = '1px';
                div.style.backgroundColor = this.config.gridLineColor;
                div.style.margin = '4px 0';
                menu.appendChild(div);
                return;
            }

            const el = document.createElement('div');
            el.textContent = item.label;
            Object.assign(el.style, {
                padding: '8px 16px', cursor: 'pointer',
                transition: 'background 0.2s'
            });

            el.onmouseenter = () => el.style.backgroundColor = 'rgba(79, 172, 254, 0.2)';
            el.onmouseleave = () => el.style.backgroundColor = 'transparent';
            el.onclick = () => {
                item.action();
                this.closeMenu();
            };

            menu.appendChild(el);
        });

        document.body.appendChild(menu);

        // Adjust position if it goes off screen
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) menu.style.left = `${x - rect.width}px`;
        if (rect.bottom > window.innerHeight) menu.style.top = `${y - rect.height}px`;
    }

    private closeMenu() {
        if (this.menu) {
            this.menu.remove();
            this.menu = null;
        }
    }

    public updateConfig(config: GridConfig) {
        this.config = config;
    }

    public close() {
        this.closeMenu();
    }

    public destroy() {
        this.closeMenu();
        // Event listeners on window need to be named to be removed, but for now we'll just close it
    }
}
