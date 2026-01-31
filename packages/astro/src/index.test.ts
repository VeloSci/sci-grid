import { describe, it, expect, beforeEach } from 'vitest';
import { SciGrid } from '@sci-grid/core';

// Behavioral test for Astro integration pattern
describe('SciGrid Astro Integration Pattern', () => {
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
        window.addEventListener('scigrid-init-' + id, (e: any) => {
            const { provider } = e.detail;
            const el = document.getElementById(id);
            if (el && provider) {
                new SciGrid(el, provider, {});
            }
        });

        // Dispatch the event
        window.dispatchEvent(new CustomEvent('scigrid-init-' + id, {
            detail: { provider: mockProvider }
        }));

        // Check if SciGrid initialized (it should have created a canvas)
        const canvas = container.querySelector('canvas');
        expect(canvas).toBeTruthy();
    });
});
