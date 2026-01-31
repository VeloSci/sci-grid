import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/vue';
import { SciGridVue } from './index.js';

describe('SciGrid Vue Adapter', () => {
    const mockProvider = {
        getRowCount: () => 10,
        getColumnCount: () => 5,
        getCellData: (r: number, c: number) => `Data ${r},${c}`,
        getHeader: (c: number) => ({ name: `Col ${c}` })
    };

    it('should render successfully', () => {
        const { container } = render(SciGridVue, {
            props: {
                provider: mockProvider
            }
        });
        expect(container.querySelector('canvas')).toBeDefined();
    });
});
