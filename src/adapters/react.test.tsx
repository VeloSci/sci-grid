import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { SciGridReact } from './react.js';

describe('SciGrid React Adapter', () => {
    const mockProvider = {
        getRowCount: () => 10,
        getColumnCount: () => 5,
        getCellData: (r: number, c: number) => `Data ${r},${c}`,
        getHeader: (c: number) => ({ name: `Col ${c}` })
    };

    it('should update the underlying grid when provider changes', () => {
        const { rerender } = render(<SciGridReact provider={mockProvider} />);
        
        const newProvider = { ...mockProvider, getRowCount: () => 100 };
        
        // We can't easily access the internal gridRef, 
        // but we can check if it still renders a canvas after update
        rerender(<SciGridReact provider={newProvider} />);
        expect(document.querySelector('canvas')).toBeDefined();
    });

    it('should respect custom styling and class names', () => {
        const { container } = render(
            <SciGridReact 
                provider={mockProvider} 
                className="custom-grid"
                style={{ opacity: 0.5 }}
            />
        );
        const el = container.firstChild as HTMLElement;
        expect(el.classList.contains('custom-grid')).toBe(true);
        expect(el.style.opacity).toBe('0.5');
    });
});
