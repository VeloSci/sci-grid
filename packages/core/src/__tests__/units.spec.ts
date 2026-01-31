import { describe, it, expect } from 'vitest';
import { parseScientificValue, formatScientificValue } from '../core/units.js';

describe('Scientific Units Logic', () => {
    describe('parseScientificValue', () => {
        it('should parse simple numbers', () => {
            expect(parseScientificValue('125')).toBe(125);
            expect(parseScientificValue('12.5')).toBe(12.5);
            expect(parseScientificValue('-1.2')).toBe(-1.2);
        });

        it('should parse values with SI prefixes', () => {
            expect(parseScientificValue('1k')).toBe(1000);
            expect(parseScientificValue('1.5M')).toBe(1500000);
            expect(parseScientificValue('10m')).toBe(0.01);
            expect(parseScientificValue('1u')).toBe(0.000001);
            expect(parseScientificValue('1n')).toBe(0.000000001);
        });

        it('should parse values with prefixes and units', () => {
            expect(parseScientificValue('10mA')).toBe(0.01);
            expect(parseScientificValue('5kV')).toBe(5000);
            expect(parseScientificValue('2.2uF')).toBe(0.0000022);
        });

        it('should handle whitespace', () => {
            expect(parseScientificValue(' 10 m ')).toBe(0.01);
        });

        it('should return NaN for invalid strings', () => {
            expect(parseScientificValue('abc')).toBeNaN();
            expect(parseScientificValue('')).toBeNaN();
        });
    });

    describe('formatScientificValue', () => {
        it('should format zero correctly', () => {
            expect(formatScientificValue(0, 'V')).toBe('0V');
        });

        it('should format large values with prefixes', () => {
            expect(formatScientificValue(1500, 'V')).toBe('1.5kV');
            expect(formatScientificValue(1000000, 'A')).toBe('1MA');
            expect(formatScientificValue(1e9, 'Hz')).toBe('1GHz');
        });

        it('should format small values with prefixes', () => {
            expect(formatScientificValue(0.001, 'A')).toBe('1mA');
            expect(formatScientificValue(0.000001, 'V')).toBe('1uV');
            expect(formatScientificValue(1.5e-9, 's')).toBe('1.5ns');
        });

        it('should handle negative values', () => {
            expect(formatScientificValue(-5000, 'V')).toBe('-5kV');
            expect(formatScientificValue(-0.02, 'A')).toBe('-20mA');
        });

        it('should use exponential for extremely small values', () => {
            expect(formatScientificValue(1e-25, 'V')).toBe('1.00e-25V');
        });

        it('should return "-" for non-finite values', () => {
            expect(formatScientificValue(NaN)).toBe('-');
            expect(formatScientificValue(Infinity)).toBe('-');
        });
    });
});
