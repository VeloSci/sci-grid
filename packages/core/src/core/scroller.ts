import type { ViewportState } from "../types/grid.js";

export class Scroller {
    private container: HTMLElement;
    private shadow: HTMLElement;
    private onScroll: (state: Partial<ViewportState>) => void;
    private onMouseDown: (e: MouseEvent) => void;
    private onDoubleClick: (e: MouseEvent) => void;

    constructor(
        container: HTMLElement,
        onScroll: (state: Partial<ViewportState>) => void,
        onMouseDown: (e: MouseEvent) => void,
        onDoubleClick: (e: MouseEvent) => void
    ) {
        this.container = container;
        this.onScroll = onScroll;
        this.onMouseDown = onMouseDown;
        this.onDoubleClick = onDoubleClick;

        // Create shadow element for real scrollbars
        this.shadow = document.createElement("div");
        this.shadow.style.position = "absolute";
        this.shadow.style.top = "0";
        this.shadow.style.left = "0";
        this.shadow.style.width = "1px";
        this.shadow.style.height = "1px";
        this.shadow.style.pointerEvents = "none";

        this.container.style.overflow = "auto";
        this.container.style.position = "relative";
        this.container.appendChild(this.shadow);

        this.setupEvents();
        this.injectScrollStyle();
    }

    private styleId: string = 'scigrid-scroll-style-' + Math.random().toString(36).substr(2, 9);

    private injectScrollStyle() {
        // Unique class for this scroller instance to avoid global pollution
        this.container.classList.add(this.styleId);
        
        const style = document.createElement('style');
        style.id = this.styleId;
        // Default minimalist style
        style.innerHTML = `
            .${this.styleId} {
                scrollbar-width: thin;
                scrollbar-color: rgba(155, 155, 155, 0.5) transparent;
            }
            .${this.styleId}::-webkit-scrollbar {
                width: 10px;
                height: 10px;
            }
            .${this.styleId}::-webkit-scrollbar-track {
                background: transparent;
            }
            .${this.styleId}::-webkit-scrollbar-thumb {
                background-color: rgba(155, 155, 155, 0.5);
                border-radius: 6px;
                border: 2px solid transparent;
                background-clip: content-box;
            }
            .${this.styleId}::-webkit-scrollbar-thumb:hover {
                background-color: rgba(155, 155, 155, 0.8);
            }
            .${this.styleId}::-webkit-scrollbar-corner {
                background: transparent;
            }
        `;
        document.head.appendChild(style);
    }

    public updateScrollStyle(thumbColor?: string, trackColor?: string) {
        const style = document.getElementById(this.styleId);
        if (style && (thumbColor || trackColor)) {
             const tData = thumbColor || 'rgba(155, 155, 155, 0.5)';
             const trData = trackColor || 'transparent';
             
             style.innerHTML = `
                .${this.styleId} {
                    scrollbar-width: thin;
                    scrollbar-color: ${tData} ${trData};
                }
                .${this.styleId}::-webkit-scrollbar {
                    width: 10px;
                    height: 10px;
                }
                .${this.styleId}::-webkit-scrollbar-track {
                    background: ${trData};
                }
                .${this.styleId}::-webkit-scrollbar-thumb {
                    background-color: ${tData};
                    border-radius: 6px;
                    border: 2px solid ${trData === 'transparent' ? 'transparent' : trData};
                    background-clip: content-box;
                }
                .${this.styleId}::-webkit-scrollbar-thumb:hover {
                    opacity: 0.8;
                }
                .${this.styleId}::-webkit-scrollbar-corner {
                    background: ${trData};
                }
            `;
        }
    }

    private readonly MAX_BROWSER_SIZE = 15_000_000;
    private scaleX = 1;
    private scaleY = 1;

    public updateVirtualSize(width: number, height: number): void {
        const viewportWidth = this.container.clientWidth || 100;
        const viewportHeight = this.container.clientHeight || 100;

        const physicalWidth = Math.min(width, this.MAX_BROWSER_SIZE);
        const physicalHeight = Math.min(height, this.MAX_BROWSER_SIZE);

        // Correct scale formula for scroll range mapping
        this.scaleX = (width - viewportWidth) / Math.max(1, physicalWidth - viewportWidth);
        this.scaleY = (height - viewportHeight) / Math.max(1, physicalHeight - viewportHeight);

        this.shadow.style.width = `${physicalWidth}px`;
        this.shadow.style.height = `${physicalHeight}px`;
    }

    public setScroll(x: number, y: number): void {
        this.container.scrollLeft = x / (this.scaleX || 1);
        this.container.scrollTop = y / (this.scaleY || 1);
    }

    public scrollToCell(x: number, y: number, width: number, height: number): void {
        const left = this.container.scrollLeft * this.scaleX;
        const top = this.container.scrollTop * this.scaleY;
        const viewportWidth = this.container.clientWidth;
        const viewportHeight = this.container.clientHeight;

        let newX = left;
        let newY = top;

        if (x < left) newX = x;
        else if (x + width > left + viewportWidth) newX = x + width - viewportWidth;

        if (y < top) newY = y;
        else if (y + height > top + viewportHeight) newY = y + height - viewportHeight;

        if (newX !== left || newY !== top) {
            this.setScroll(newX, newY);
        }
    }

    private setupEvents(): void {
        let lastX = 0;
        let lastY = 0;

        this.container.addEventListener("scroll", () => {
            const currentX = Math.round(this.container.scrollLeft * this.scaleX);
            const currentY = Math.round(this.container.scrollTop * this.scaleY);

            if (currentX !== lastX || currentY !== lastY) {
                lastX = currentX;
                lastY = currentY;
                this.onScroll({
                    scrollX: currentX,
                    scrollY: currentY,
                });
            }
        }, { passive: true });

        this.container.addEventListener("mousedown", (e) => {
            this.onMouseDown(e);
        });

        this.container.addEventListener("dblclick", (e) => {
            this.onDoubleClick(e);
        });
    }
}
