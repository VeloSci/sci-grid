import { describe, it, expect, beforeEach } from 'vitest';
import { VeloGrid } from '@velosci-grid/core';

// Behavioral test for Astro integration pattern
describe('VeloGrid Astro Integration Pattern', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
        container = document.createElement('div');
        container.id = 'astro-grid';
        document.body.appendChild(container);
    });

    it('should initialize when the custom event is dispatched', () => {
        const id = 'astro-grid';
        const mockProvider = {
            getRowCount: () => 0,
            getColumnCount: () => 0,
            getCellData: () => '',
            getHeader: () => ({ name: 'Test' })
        };

        // Simulate the logic inside the Astro <script> tag
        window.addEventListener('velogrid-init-' + id, (e: any) => {
            const { provider } = e.detail;
            const el = document.getElementById(id);
            if (el && provider) {
                new VeloGrid(el, provider, {});
            }
        });

        // Dispatch the event
        window.dispatchEvent(new CustomEvent('velogrid-init-' + id, {
            detail: { provider: mockProvider }
        }));

        // Check if VeloGrid initialized (it should have created a canvas)
        const canvas = container.querySelector('canvas');
        expect(canvas).toBeTruthy();
    });
});
