// Example of how to add custom visualization inside a canvas cell
export const customSparklineRenderer = (
    ctx: CanvasRenderingContext2D,
    row: number,
    col: number,
    x: number,
    y: number,
    width: number,
    height: number,
    value: any
) => {
    // Basic text fallback
    if (!Array.isArray(value)) {
        ctx.fillStyle = "#ffffff";
        ctx.fillText(String(value), x + 10, y + (height / 2) + 4);
        return;
    }

    // Custom Sparkline Drawing
    const dataPoints = value as number[];
    if (dataPoints.length === 0) return;

    const maxVal = Math.max(...dataPoints);
    const minVal = Math.min(...dataPoints);
    const range = maxVal - minVal || 1;
    
    const stepX = width / (dataPoints.length - 1);
    
    ctx.beginPath();
    ctx.strokeStyle = "#00ffcc";
    ctx.lineWidth = 1.5;

    dataPoints.forEach((pt, index) => {
        const ptX = x + (index * stepX);
        const normalizedY = (pt - minVal) / range;
        // Invert Y axis for canvas (0 is top)
        const ptY = y + height - (normalizedY * (height - 10)) - 5;
        
        if (index === 0) ctx.moveTo(ptX, ptY);
        else ctx.lineTo(ptX, ptY);
    });

    ctx.stroke();
};
