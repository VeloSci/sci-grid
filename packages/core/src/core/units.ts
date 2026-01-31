export const SI_PREFIXES: Record<string, number> = {
    'Y': 1e24, 'Z': 1e21, 'E': 1e18, 'P': 1e15, 'T': 1e12, 'G': 1e9, 'M': 1e6, 'k': 1e3,
    'h': 1e2, 'da': 1e1, 'd': 1e-1, 'c': 1e-2, 'm': 1e-3, 'u': 1e-6, 'μ': 1e-6, 'n': 1e-9,
    'p': 1e-12, 'f': 1e-15, 'a': 1e-18, 'z': 1e-21, 'y': 1e-24
};

/**
 * Parses a scientific value string like "10mA", "5.5kV", or "2u" into a number.
 */
export function parseScientificValue(val: string): number {
    if (typeof val !== 'string') return parseFloat(val);
    const trimmed = val.trim();
    if (!trimmed) return NaN;

    // Match Number + Optional Prefix + Optional Unit
    const regex = /^([+-]?\d*\.?\d+(?:[eE][+-]?\d+)?)\s*([YZEPTGMkhdacmuμnpfaz y]?)([a-zA-Z]*)$/;
    const match = trimmed.match(regex);

    if (!match) return parseFloat(trimmed);

    const [_, numStr, prefix] = match;
    let num = parseFloat(numStr!);
    
    if (prefix && SI_PREFIXES[prefix]) {
        num *= SI_PREFIXES[prefix]!;
    }

    return num;
}

/**
 * Formats a number into a scientific string with appropriate prefix.
 */
export function formatScientificValue(val: number, unit: string = ''): string {
    if (isNaN(val) || !isFinite(val)) return '-';
    if (val === 0) return `0${unit}`;

    const absVal = Math.abs(val);
    let bestPrefix = '';
    let bestFactor = 1;

    // Standard engineering prefixes (powers of 1000) are preferred
    const engineeringPrefixes = ['Y', 'Z', 'E', 'P', 'T', 'G', 'M', 'k', 'm', 'u', 'μ', 'n', 'p', 'f', 'a', 'z', 'y'];

    for (const prefix of engineeringPrefixes) {
        const factor = SI_PREFIXES[prefix]!;
        if (absVal >= factor && (bestFactor === 1 || factor > bestFactor)) {
            bestPrefix = prefix;
            bestFactor = factor;
        }
    }

    // Fallback to other SI prefixes if value is still not well represented (e.g., between 1 and 1000)
    if (bestFactor === 1) {
        for (const [prefix, factor] of Object.entries(SI_PREFIXES)) {
            if (absVal >= factor && (bestFactor === 1 || factor > bestFactor)) {
                bestPrefix = prefix;
                bestFactor = factor;
            }
        }
    }

    // Handle small values below 'y'
    if (absVal < 1e-24 && absVal > 0) {
        return val.toExponential(2) + unit;
    }

    const scaled = val / bestFactor;
    // Limit decimals for readability
    const formatted = Number(scaled.toFixed(3)).toString();
    return `${formatted}${bestPrefix}${unit}`;
}
