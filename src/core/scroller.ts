import type { ViewportState } from "../types/grid.ts";

export class Scroller {
    private container: HTMLElement;
    private shadow: HTMLElement;
    private onScroll: (state: Partial<ViewportState>) => void;
    private onClick: (x: number, y: number) => void;
    private onDoubleClick: (x: number, y: number) => void;

    constructor(
        container: HTMLElement,
        onScroll: (state: Partial<ViewportState>) => void,
        onClick: (x: number, y: number) => void,
        onDoubleClick: (x: number, y: number) => void
    ) {
        this.container = container;
        this.onScroll = onScroll;
        this.onClick = onClick;
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

        this.container.addEventListener("click", (e) => {
            this.onClick(e.clientX, e.clientY);
        });

        this.container.addEventListener("dblclick", (e) => {
            this.onDoubleClick(e.clientX, e.clientY);
        });
    }
}
