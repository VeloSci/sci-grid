import type { GridConfig, ContextMenuItem, ContextMenuContext, ContextMenuZone, ContextMenuSection, SelectionRange } from "../types/grid.js";

// Internal type to include divider and section headers
type MenuEntry = ContextMenuItem | 'divider' | ContextMenuSection;

export interface HitInfo {
    zone: 'header' | 'rowNumber' | 'cell' | 'outside';
    row: number;
    col: number;
}

export class ContextMenuManager {
    private menu: HTMLElement | null = null;
    private subMenu: HTMLElement | null = null;
    private boundWindowMouseDown: (e: MouseEvent) => void;

    constructor(
        private container: HTMLElement,
        private config: GridConfig,
        private actions: {
            copyToClipboard: () => void;
            exportToCsv: () => void;
            invalidate: () => void;
            resolveHit: (e: MouseEvent) => HitInfo;
            getSelectionState: () => {
                selectedRows: number[];
                selectedCols: number[];
                selectionRanges: SelectionRange[];
                selectionMode: string;
                cellCount: number;
            };
        }
    ) {
        this.container.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
        this.boundWindowMouseDown = (e: MouseEvent) => {
            if (this.menu && !this.menu.contains(e.target as Node)) {
                this.closeMenu();
            }
        };
        window.addEventListener('mousedown', this.boundWindowMouseDown);
    }

    // ── Zone detection ──────────────────────────────────────────────

    private buildContext(hit: HitInfo): ContextMenuContext {
        const sel = this.actions.getSelectionState();
        let zone: ContextMenuZone;

        if (hit.zone === 'header') {
            zone = 'header';
        } else if (hit.zone === 'rowNumber') {
            zone = 'rowNumber';
        } else {
            // cell zone — distinguish single vs multi
            zone = sel.cellCount > 1 ? 'multiCell' : 'cell';
        }

        return {
            zone,
            row: hit.row >= 0 ? hit.row : undefined,
            col: hit.col >= 0 ? hit.col : undefined,
            selectedRows: sel.selectedRows,
            selectedCols: sel.selectedCols,
            selectionRanges: sel.selectionRanges,
        };
    }

    // ── Default items per zone ──────────────────────────────────────

    private getDefaultItems(ctx: ContextMenuContext): MenuEntry[] {
        const common: MenuEntry[] = [
            { id: 'copy', label: 'Copy Selected', action: () => this.actions.copyToClipboard() },
            { id: 'export-csv', label: 'Export as CSV', action: () => this.actions.exportToCsv() },
        ];

        switch (ctx.zone) {
            case 'header':
                return [
                    ...common,
                    'divider',
                    { id: 'refresh', label: 'Refresh Grid', action: () => this.actions.invalidate() },
                ];

            case 'rowNumber':
                return [
                    ...common,
                    'divider',
                    { id: 'refresh', label: 'Refresh Grid', action: () => this.actions.invalidate() },
                ];

            case 'cell':
                return [
                    ...common,
                    'divider',
                    { id: 'refresh', label: 'Refresh Grid', action: () => this.actions.invalidate() },
                ];

            case 'multiCell':
                return [
                    ...common,
                    'divider',
                    { id: 'refresh', label: 'Refresh Grid', action: () => this.actions.invalidate() },
                ];

            default:
                return common;
        }
    }

    // ── Main handler ────────────────────────────────────────────────

    private handleContextMenu(e: MouseEvent) {
        const hit = this.actions.resolveHit(e);

        // Outside grid bounds — suppress
        if (hit.zone === 'outside') {
            e.preventDefault();
            return;
        }

        const ctx = this.buildContext(hit);

        // Delegate to zone-specific external callbacks first
        if (ctx.zone === 'header' && this.config.onHeaderContextMenu) {
            e.preventDefault();
            this.config.onHeaderContextMenu(hit.col, e);
            return;
        }

        if (ctx.zone === 'rowNumber' && this.config.onRowNumberContextMenu) {
            e.preventDefault();
            this.config.onRowNumberContextMenu(hit.row, e);
            return;
        }

        if ((ctx.zone === 'cell' || ctx.zone === 'multiCell') && this.config.onContextMenu) {
            this.config.onContextMenu(hit.row, hit.col, e);
            if (e.defaultPrevented) return;
        }

        // Show built-in context menu
        e.preventDefault();
        this.closeMenu();

        let items = this.getDefaultItems(ctx);
        if (this.config.getContextMenuItems) {
            items = this.config.getContextMenuItems(items, ctx);
        }

        if (items.length > 0) {
            this.renderMenu(e.clientX, e.clientY, items);
        }
    }

    // ── Rendering ───────────────────────────────────────────────────

    private renderMenu(x: number, y: number, items: MenuEntry[]) {
        this.closeMenu();
        const menu = this.createMenuElement(items);
        this.menu = menu;
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
        document.body.appendChild(menu);

        // Adjust position if it goes off screen
        const rect = menu.getBoundingClientRect();
        if (rect.right > window.innerWidth) menu.style.left = `${x - rect.width}px`;
        if (rect.bottom > window.innerHeight) menu.style.top = `${y - rect.height}px`;
    }

    private isSection(item: MenuEntry): item is ContextMenuSection {
        return typeof item === 'object' && 'type' in item && item.type === 'section';
    }

    private createMenuElement(items: MenuEntry[]): HTMLElement {
        const menu = document.createElement('div');
        menu.setAttribute('role', 'menu');
        Object.assign(menu.style, {
            position: 'fixed',
            backgroundColor: this.config.headerBackground || '#ffffff',
            color: this.config.headerTextColor || '#333333',
            border: `1px solid ${this.config.gridLineColor}`,
            boxShadow: '0 4px 15px rgba(0,0,0,0.25)',
            borderRadius: '6px', padding: '4px 0', zIndex: '2000',
            minWidth: '160px', font: this.config.font || '12px Inter, sans-serif',
            outline: 'none',
        });
        menu.tabIndex = -1;

        const menuItems: HTMLElement[] = [];
        let focusedIndex = -1;

        items.forEach(item => {
            // Divider
            if (item === 'divider') {
                const div = document.createElement('div');
                div.setAttribute('role', 'separator');
                div.style.height = '1px';
                div.style.backgroundColor = this.config.gridLineColor;
                div.style.margin = '4px 0';
                menu.appendChild(div);
                return;
            }

            // Section header
            if (this.isSection(item)) {
                const sec = document.createElement('div');
                sec.setAttribute('role', 'presentation');
                sec.textContent = item.label;
                Object.assign(sec.style, {
                    padding: '6px 16px 2px', fontSize: '0.75em',
                    fontWeight: 'bold', textTransform: 'uppercase',
                    opacity: '0.5', letterSpacing: '0.05em',
                    userSelect: 'none', cursor: 'default',
                });
                menu.appendChild(sec);
                return;
            }

            // Regular menu item
            const mi = item; // narrowed to ContextMenuItem
            const el = document.createElement('div');
            el.setAttribute('role', mi.checked !== undefined ? 'menuitemcheckbox' : 'menuitem');
            if (mi.checked !== undefined) el.setAttribute('aria-checked', String(mi.checked));
            if (mi.disabled) el.setAttribute('aria-disabled', 'true');
            el.tabIndex = -1;

            Object.assign(el.style, {
                padding: '8px 16px', cursor: mi.disabled ? 'default' : 'pointer',
                transition: 'background 0.15s', display: 'flex', alignItems: 'center',
                gap: '8px', opacity: mi.disabled ? '0.4' : '1',
                position: 'relative',
            });

            // Checkbox / check indicator
            if (mi.checked !== undefined) {
                const check = document.createElement('span');
                check.textContent = mi.checked ? '✓' : '';
                Object.assign(check.style, { width: '16px', textAlign: 'center', fontWeight: 'bold' });
                el.appendChild(check);
            }

            // Icon
            if (mi.icon) {
                const iconSpan = document.createElement('span');
                iconSpan.textContent = mi.icon;
                iconSpan.style.width = '16px';
                iconSpan.style.textAlign = 'center';
                el.appendChild(iconSpan);
            }

            // Label
            const labelSpan = document.createElement('span');
            labelSpan.textContent = mi.label;
            labelSpan.style.flex = '1';
            el.appendChild(labelSpan);

            // Shortcut hint
            if (mi.shortcut) {
                const shortcutSpan = document.createElement('span');
                shortcutSpan.textContent = mi.shortcut;
                Object.assign(shortcutSpan.style, {
                    fontSize: '0.8em', opacity: '0.5', marginLeft: '16px',
                });
                el.appendChild(shortcutSpan);
            }

            // Sub-menu arrow
            if (mi.children && mi.children.length > 0) {
                el.setAttribute('aria-haspopup', 'true');
                const arrow = document.createElement('span');
                arrow.textContent = '▸';
                arrow.style.marginLeft = '8px';
                arrow.style.opacity = '0.6';
                el.appendChild(arrow);
            }

            if (!mi.disabled) {
                el.onmouseenter = () => {
                    el.style.backgroundColor = 'rgba(79, 172, 254, 0.2)';
                    if (mi.children && mi.children.length > 0) {
                        this.showSubMenu(el, mi.children);
                    }
                };
                el.onmouseleave = () => {
                    el.style.backgroundColor = 'transparent';
                };

                if (mi.children && mi.children.length > 0) {
                    el.onclick = (ev) => ev.stopPropagation();
                } else {
                    el.onclick = () => {
                        mi.action();
                        this.closeMenu();
                    };
                }
            }

            menu.appendChild(el);
            menuItems.push(el);
        });

        // Keyboard navigation within the menu
        menu.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                focusedIndex = Math.min(focusedIndex + 1, menuItems.length - 1);
                menuItems[focusedIndex]?.focus();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                focusedIndex = Math.max(focusedIndex - 1, 0);
                menuItems[focusedIndex]?.focus();
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (focusedIndex >= 0) menuItems[focusedIndex]?.click();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                this.closeMenu();
            } else if (e.key === 'ArrowRight' && focusedIndex >= 0) {
                // Open sub-menu if present
                const el = menuItems[focusedIndex];
                if (el?.getAttribute('aria-haspopup') === 'true') {
                    el.dispatchEvent(new MouseEvent('mouseenter'));
                }
            }
        });

        return menu;
    }

    private showSubMenu(parentEl: HTMLElement, items: MenuEntry[]) {
        this.closeSubMenu();
        const sub = this.createMenuElement(items);
        this.subMenu = sub;

        const parentRect = parentEl.getBoundingClientRect();
        sub.style.left = `${parentRect.right + 2}px`;
        sub.style.top = `${parentRect.top}px`;
        document.body.appendChild(sub);

        // Adjust if off-screen
        const rect = sub.getBoundingClientRect();
        if (rect.right > window.innerWidth) {
            sub.style.left = `${parentRect.left - rect.width - 2}px`;
        }
        if (rect.bottom > window.innerHeight) {
            sub.style.top = `${parentRect.bottom - rect.height}px`;
        }

        // Keep sub-menu open while hovering it
        sub.onmouseenter = () => { /* keep alive */ };
        sub.onmouseleave = () => this.closeSubMenu();
        parentEl.addEventListener('mouseleave', () => {
            // Small delay to allow moving to sub-menu
            setTimeout(() => {
                if (this.subMenu && !this.subMenu.matches(':hover')) {
                    this.closeSubMenu();
                }
            }, 100);
        }, { once: true });
    }

    private closeSubMenu() {
        if (this.subMenu) {
            this.subMenu.remove();
            this.subMenu = null;
        }
    }

    private closeMenu() {
        this.closeSubMenu();
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

    /** Open the built-in context menu programmatically at canvas-relative coordinates */
    public openAt(canvasX: number, canvasY: number) {
        const containerRect = this.container.getBoundingClientRect();
        const clientX = containerRect.left + canvasX;
        const clientY = containerRect.top + canvasY;

        // Synthesize a hit at the given position
        const syntheticEvent = new MouseEvent('contextmenu', {
            clientX, clientY, bubbles: true, cancelable: true,
        });
        this.container.dispatchEvent(syntheticEvent);
    }

    public destroy() {
        this.closeMenu();
        window.removeEventListener('mousedown', this.boundWindowMouseDown);
    }
}
